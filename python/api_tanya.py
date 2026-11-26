"""
Logika endpoint Teman AI `POST /api/tanya` yang DIPAKAI BERSAMA oleh:
- python/serve.py  (server lokal di laptop), dan
- api/tanya.py     (fungsi Python di Vercel).

Isi permintaan: {"pertanyaan": "...", "konteks": "...", "riwayat": [{"peran": "siswa"|"ai", "teks": "..."}]}
(konteks & riwayat opsional) → {"jawaban": "..."} atau {"galat": "..."}.

Keamanan: cek asal (Origin), JSON wajib, batas 16 KB, rate limit per IP & total, validasi isi.
Gemini dipanggil di server (gemini.py); API key tidak pernah dikirim ke browser, dan data pribadi
siswa tidak dikirim ke Gemini. Hanya pustaka standar.
"""

from __future__ import annotations

import json
import threading
import time
from collections import deque
from urllib.parse import urlsplit

import gemini

MAKS_BYTE_PERMINTAAN = 16384  # isi JSON maksimal 16 KB (pertanyaan + konteks + riwayat 8 pesan)
MAKS_PER_IP = 6               # permintaan per perangkat per JENDELA_LAJU
MAKS_TOTAL = 30               # permintaan seluruh server per JENDELA_LAJU (melindungi kuota)
JENDELA_LAJU = 60.0           # detik


class PembatasLaju:
    """Rate limit sederhana (jendela geser) per IP dan total. Aman untuk banyak thread.

    Catatan Vercel: setiap instance fungsi punya memorinya sendiri, jadi batas ini berlaku
    per instance (tetap membatasi, tetapi tidak seketat di satu server).
    """

    def __init__(self, maks_per_ip: int, maks_total: int, jendela: float = JENDELA_LAJU, jam=time.monotonic):
        self.maks_per_ip = maks_per_ip
        self.maks_total = maks_total
        self.jendela = jendela
        self._jam = jam
        self._kunci = threading.Lock()
        self._per_ip: dict[str, deque] = {}
        self._total: deque = deque()

    def _buang_lama(self, antrean: deque, sekarang: float) -> None:
        while antrean and sekarang - antrean[0] >= self.jendela:
            antrean.popleft()

    def izinkan(self, ip: str) -> float:
        """0 bila diizinkan (dan dicatat); selain itu jumlah detik yang harus ditunggu."""
        sekarang = self._jam()
        with self._kunci:
            self._buang_lama(self._total, sekarang)
            q = self._per_ip.setdefault(ip, deque())
            self._buang_lama(q, sekarang)
            if len(q) >= self.maks_per_ip:
                return max(1.0, self.jendela - (sekarang - q[0]))
            if len(self._total) >= self.maks_total:
                return max(1.0, self.jendela - (sekarang - self._total[0]))
            q.append(sekarang)
            self._total.append(sekarang)
            if len(self._per_ip) > 1000:  # cegah memori membengkak oleh banyak IP lama
                for k in [k for k, v in self._per_ip.items() if not v or sekarang - v[-1] >= self.jendela]:
                    del self._per_ip[k]
            return 0.0


PEMBATAS = PembatasLaju(MAKS_PER_IP, MAKS_TOTAL)


class GalatApi(Exception):
    def __init__(self, kode: int, pesan: str, header: dict | None = None):
        super().__init__(pesan)
        self.kode, self.pesan, self.header = kode, pesan, header or {}


class ApiTanyaMixin:
    """Campurkan ke kelas turunan BaseHTTPRequestHandler. Kelas pemakai memanggil
    `layani_tanya()` dari do_POST dan `tolak_metode()` untuk GET/HEAD ke /api/…"""

    def _jalur(self) -> str:
        return urlsplit(self.path).path

    def _ip_klien(self) -> str:
        """IP untuk rate limit. Ditimpa di Vercel (header X-Forwarded-For dari proxy Vercel)."""
        return self.client_address[0]

    def tolak_metode(self) -> None:
        self._kirim_json(405, {"galat": "Gunakan metode POST."}, {"Allow": "POST"})

    def layani_tanya(self) -> None:
        if self._jalur().rstrip("/") != "/api/tanya":
            self._kirim_json(404, {"galat": "Alamat tidak ditemukan."})
            return
        try:
            jawaban = self._tanya()
            self._kirim_json(200, {"jawaban": jawaban})
        except GalatApi as e:
            self._kirim_json(e.kode, {"galat": e.pesan}, e.header)
        except Exception as e:  # jangan sampai server mati; jangan bocorkan detail ke siswa
            self.log_error("Galat tak terduga di /api/tanya: %s", type(e).__name__)
            self._kirim_json(500, {"galat": "Terjadi kesalahan di server. Coba lagi nanti."})

    def _tanya(self) -> str:
        # 1. Hanya dari halaman DeretKu sendiri (browser selalu mengirim Origin untuk POST)
        asal = self.headers.get("Origin")
        if asal and urlsplit(asal).netloc != self.headers.get("Host", ""):
            raise GalatApi(403, "Permintaan dari situs lain tidak diizinkan.")

        # 2. Format & ukuran
        tipe = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if tipe != "application/json":
            raise GalatApi(415, "Kirim data dalam format JSON (Content-Type: application/json).")
        panjang_teks = self.headers.get("Content-Length")
        if panjang_teks is None:
            raise GalatApi(411, "Header Content-Length wajib ada.")
        try:
            panjang = int(panjang_teks)
        except ValueError:
            raise GalatApi(400, "Content-Length tidak valid.") from None
        if panjang < 0:
            raise GalatApi(400, "Content-Length tidak valid.")
        if panjang > MAKS_BYTE_PERMINTAAN:
            self.close_connection = True  # isi tidak dibaca, tutup koneksi
            raise GalatApi(413, f"Data terlalu besar (maksimal {MAKS_BYTE_PERMINTAAN} byte).")

        # 3. Isi JSON
        try:
            data = json.loads(self.rfile.read(panjang).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise GalatApi(400, "Data JSON tidak valid.") from None
        if not isinstance(data, dict):
            raise GalatApi(400, "Data harus berupa objek JSON.")
        pertanyaan = data.get("pertanyaan")
        konteks = data.get("konteks") or ""
        if not isinstance(pertanyaan, str):
            raise GalatApi(400, "Field 'pertanyaan' wajib berupa teks.")
        if not isinstance(konteks, str):
            raise GalatApi(400, "Field 'konteks' harus berupa teks.")
        riwayat = data.get("riwayat")  # percakapan sebelumnya (opsional), divalidasi di gemini.py
        try:
            riwayat = gemini.periksa_riwayat(riwayat)
            gemini.susun_permintaan(pertanyaan, konteks, riwayat)  # cek kosong/terlalu panjang
        except gemini.GeminiError as e:
            raise GalatApi(400, str(e)) from None

        # 4. Kunci tersedia? (isi kunci tidak pernah dikirim ke browser)
        try:
            gemini.ambil_kunci()
        except gemini.GeminiError:
            raise GalatApi(503, "Teman AI belum disiapkan di server.") from None

        # 5. Rate limit, baru panggil Gemini (hanya pertanyaan, konteks soal, dan riwayat
        #    percakapan soal ini; tanpa data siswa; riwayat TIDAK disimpan di server)
        tunggu = PEMBATAS.izinkan(self._ip_klien())
        if tunggu:
            detik = int(tunggu + 0.999)
            raise GalatApi(429, f"Terlalu banyak pertanyaan. Coba lagi dalam {detik} detik.",
                           {"Retry-After": str(detik)})
        try:
            return gemini.tanya_gemini(pertanyaan, konteks, riwayat)
        except gemini.GeminiError as e:
            # Kuota habis/sibuk = gangguan sementara di layanan → 503 + Retry-After agar browser tahu
            # kapan boleh mencoba lagi. Galat lain dari Gemini → 502. Pesan aman ditampilkan ke siswa.
            if e.jenis in ("kuota_harian", "kuota_menit", "sibuk", "lambat"):
                detik = max(1, int(e.tunggu + 0.999)) if e.tunggu else 30
                raise GalatApi(503, str(e), {"Retry-After": str(detik)}) from None
            raise GalatApi(502, str(e)) from None

    def _kirim_json(self, kode: int, data: dict, header: dict | None = None) -> None:
        isi = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(kode)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(isi)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        for k, v in (header or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(isi)
