"""
Penghubung DeretKu ke Gemini API (hanya pustaka standar Python).

Modul ini dipakai oleh BACKEND (python/serve.py, langkah berikutnya). Browser tidak
pernah melihat API key: frontend hanya mengirim pertanyaan ke server, lalu server
yang memanggil Gemini.

Keamanan:
- API key dibaca dari variabel lingkungan GEMINI_API_KEY atau dari berkas .env di
  root proyek (.env tercantum di .gitignore, jadi tidak ikut ke GitHub).
- Kunci dikirim lewat header "x-goog-api-key", BUKAN di URL, sehingga tidak muncul
  di log atau pesan galat.
- Kunci tidak pernah dicetak. Pesan galat tidak memuat kunci.
- Yang dikirim ke Gemini hanya teks pertanyaan, tanpa nama, kelas, atau id
  perangkat siswa.

Coba dari terminal (di root proyek):
    python python/gemini.py --cek                         # cek kunci & konfigurasi (tanpa internet)
    python python/gemini.py "Apa itu beda pada barisan?"  # kirim satu pertanyaan
"""

from __future__ import annotations

import copy
import json
import logging
import math
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BERKAS_ENV = ROOT / ".env"
_log = logging.getLogger("deretku.gemini")  # hanya nama model & jenis galat; TIDAK PERNAH kunci/isi pesan

# gemini-2.5-flash sudah tidak tersedia untuk API key baru (404), jadi dipakai 3.5-flash.
MODEL_BAWAAN = "gemini-3.5-flash"  # bisa diganti lewat GEMINI_MODEL di .env
# Kuota gratis dihitung PER MODEL per proyek per hari (mis. gemini-3.5-flash: 20/hari, reset
# tengah malam waktu Pasifik). Bila model utama habis kuota (429), sibuk (503), atau dipensiunkan
# (404), model cadangan dicoba berurutan. Ubah lewat GEMINI_MODEL_CADANGAN di .env
# (dipisah koma; isi "tidak" untuk mematikan). Semuanya model gratis (Flash-Lite), diuji 2026-11-25.
MODEL_CADANGAN_BAWAAN = "gemini-flash-lite-latest,gemini-3.5-flash-lite,gemini-3.1-flash-lite"
URL_API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
BATAS_TOTAL = 45         # detik; jangan mencoba model cadangan lagi bila waktu sudah lewat (browser menunggu 70 dtk)

MAKS_PERTANYAAN = 500    # karakter; mencegah input berlebihan yang menghabiskan kuota
MAKS_KONTEKS = 800       # karakter; konteks soal dari aplikasi (opsional)
MAKS_RIWAYAT = 8         # pesan sebelumnya (4 giliran siswa + 4 jawaban AI) yang ikut dikirim
MAKS_TEKS_AI = 1500      # karakter per jawaban AI di riwayat
BATAS_WAKTU = 20         # detik menunggu jawaban dari model TERAKHIR di rantai
BATAS_MODEL_AWAL = 12    # detik untuk model yang masih punya cadangan → cepat pindah bila lambat
# Kasus terburuk: 3 × 12 + 20 = 56 dtk < maxDuration fungsi Vercel (60) < tunggu browser (70).
JEDA_ULANG = 2.0         # detik sebelum mencoba ulang sekali saat server Gemini sibuk (500/503)

BERKAS_RMT = ROOT / "app" / "js" / "data" / "rmt.js"  # sumber tunggal nama fungsi kognitif
LABEL_FUNGSI = "Fungsi berpikir:"                      # baris penanda yang dibaca app/js/ai.js


def daftar_fungsi(path: Path = BERKAS_RMT) -> list[tuple[str, str]]:
    """(kode, namaSiswa) dari kamus RMT di app/js/data/rmt.js. Kosong bila berkas tidak terbaca."""
    try:
        isi = path.read_text(encoding="utf-8").split("export const FUNGSI = [", 1)[1].split("\n];", 1)[0]
    except (OSError, IndexError):
        return []
    return re.findall(r"kode: '([ABC]\d+)'.*?namaSiswa: '([^']+)'", isi, re.S)


def _susun_instruksi() -> str:
    fungsi = daftar_fungsi()
    daftar = "\n".join(f"- {nama}" for _, nama in fungsi) or "- Membandingkan\n- Memberi bukti\n- Memahami apa yang ditanyakan"
    return INSTRUKSI_DASAR.replace("{DAFTAR_FUNGSI}", daftar)


# Instruksi sistem: disimpan di server, bukan dikirim dari browser, agar tidak bisa diubah siswa.
# Pola mediator RMT/MLE (docs/08 §5; Kinard & Kozulin hlm. 77–81, 92, 142, 166, 184–185) dan
# aturan beban kognitif CLAUDE.md (singkat, satu ide).
INSTRUKSI_DASAR = """\
Kamu adalah "Teman AI" di aplikasi DeretKu, teman belajar untuk siswa SMP di Indonesia
yang sedang mempelajari barisan dan deret aritmatika. Kamu berperan sebagai MEDIATOR belajar
menurut model Rigorous Mathematical Thinking: tugasmu membantu siswa BERPIKIR, bukan
memberi jawaban. Guru tetap pembimbing utama; kamu hanya membantu.

Cara menjawab setiap giliran:
1. JANGAN PERNAH memberikan jawaban akhir soal atau hasil hitungan akhirnya, walaupun siswa
   memintanya. Beri satu langkah kecil saja, lalu biarkan siswa yang mengerjakan.
2. Sertakan TEPAT SATU pertanyaan untuk dijawab siswa, supaya siswa ikut berpikir.
3. Bila siswa bingung harus mulai dari mana, ajak dulu memahami apa yang ditanyakan soal
   dan informasi apa yang diketahui, sebelum memakai rumus.
4. Bila siswa menulis jawaban, dugaan, atau alasan: ulangi maksudnya dengan kata-katamu
   ("Jadi maksudmu ...?"), lalu minta bukti logisnya ("Bagaimana kamu tahu?" atau
   "Apa buktinya?"). Jangan langsung mengatakan jawabannya benar atau salah sebelum siswa
   memberi alasan, kecuali konteks menyebut jawaban itu sudah diperiksa aplikasi.
5. Bila ada bagian yang sudah benar, sebutkan bagian itu dan MENGAPA benar. Bila ada yang
   keliru, jangan menyalahkan; tunjukkan bagian mana yang perlu diperiksa lagi.
6. Jelaskan secara singkat MENGAPA langkah itu perlu.
7. Bila siswa sudah menemukan jawabannya sendiri dengan alasan yang benar, puji alasannya
   dan hubungkan dengan aturan umum, misalnya bahwa cara itu berlaku untuk semua barisan
   aritmatika. Setelah itu tetap ajukan satu pertanyaan lanjutan yang ringan.
8. Pakai istilah dan rumus aplikasi: suku pertama a, beda b, banyak suku n,
   Un = a + (n - 1)b, Sn = n/2 (2a + (n - 1)b). Jelaskan istilah sebelum memakai rumus.
9. Gunakan contoh dari kehidupan sehari-hari siswa Indonesia bila membantu.

Aturan umum:
- Bahasa Indonesia baku yang ramah, sapa siswa dengan "kamu".
- Singkat: paling banyak sekitar 60 kata di luar baris fungsi berpikir, satu ide utama.
- Jika pertanyaan di luar matematika barisan/deret, tolak dengan sopan dan arahkan kembali.
- Jangan meminta data pribadi siswa.
- Teks biasa tanpa format Markdown (tanpa **, #, atau tabel).

Format jawaban (wajib):
[penjelasan singkat dan satu pertanyaan untuk siswa]
Fungsi berpikir: [SATU nama yang paling sesuai dengan yang sedang dilakukan siswa, ditulis
persis seperti salah satu nama pada daftar berikut]

Daftar fungsi berpikir:
{DAFTAR_FUNGSI}
"""
INSTRUKSI_SISTEM = _susun_instruksi()


class GeminiError(Exception):
    """Galat yang aman ditampilkan (tidak pernah memuat API key).

    jenis : "kuota_harian" | "kuota_menit" | "sibuk" | "kunci" | "model" | "jaringan" | "lain"
    tunggu: detik sampai boleh dicoba lagi (0 bila tidak diketahui), untuk header Retry-After.
    rincian: catatan teknis untuk log server (nama model & penyebab), tanpa kunci.
    """

    def __init__(self, pesan: str, *, jenis: str = "lain", tunggu: float = 0, rincian: str = ""):
        super().__init__(pesan)
        self.jenis, self.tunggu, self.rincian = jenis, tunggu, rincian


# ---------------------------------------------------------------- konfigurasi

def baca_env(path: Path = BERKAS_ENV) -> dict[str, str]:
    """Membaca berkas .env sederhana (KUNCI=nilai). Baris kosong & komentar (#) dilewati."""
    hasil: dict[str, str] = {}
    try:
        teks = path.read_text(encoding="utf-8-sig")  # -sig: aman bila disimpan dengan BOM
    except (FileNotFoundError, OSError):
        return hasil
    for baris in teks.splitlines():
        baris = baris.strip()
        if not baris or baris.startswith("#") or "=" not in baris:
            continue
        kunci, nilai = baris.split("=", 1)
        kunci = kunci.strip()
        if kunci.startswith("export "):
            kunci = kunci[len("export "):].strip()
        nilai = nilai.strip()
        if len(nilai) >= 2 and nilai[0] == nilai[-1] and nilai[0] in "\"'":
            nilai = nilai[1:-1]
        hasil[kunci] = nilai
    return hasil


def _ambil(nama: str, bawaan: str = "") -> str:
    """Variabel lingkungan sistem diutamakan (untuk hosting), lalu .env (untuk lokal)."""
    nilai = os.environ.get(nama, "").strip()
    if nilai:
        return nilai
    return baca_env().get(nama, "").strip() or bawaan


def ambil_kunci() -> str:
    kunci = _ambil("GEMINI_API_KEY")
    if not kunci:
        raise GeminiError(
            "GEMINI_API_KEY belum diisi. Isi di berkas .env (root proyek) atau sebagai "
            "variabel lingkungan."
        )
    return kunci


def ambil_model() -> str:
    return _ambil("GEMINI_MODEL", MODEL_BAWAAN)


def daftar_model() -> list[str]:
    """Model utama lalu cadangan (tanpa duplikat), sesuai urutan percobaan."""
    cadangan = _ambil("GEMINI_MODEL_CADANGAN", MODEL_CADANGAN_BAWAAN)
    urutan = [ambil_model()]
    if cadangan.strip().lower() not in ("tidak", "none", "-"):
        urutan += [m.strip() for m in cadangan.split(",") if m.strip()]
    return list(dict.fromkeys(urutan))


# ---------------------------------------------------------------- catatan kuota (di memori server)
# Model yang kuotanya habis tidak dicoba lagi sampai waktu pulihnya, agar tidak membuang waktu.
_habis: dict[str, tuple[float, str]] = {}  # model -> (waktu monotonic boleh dicoba lagi, jenis kuota)
_kunci_habis = threading.Lock()


def _tandai_habis(model: str, tunggu: float, jenis: str) -> None:
    with _kunci_habis:
        _habis[model] = (time.monotonic() + max(1.0, min(tunggu, 26 * 3600)), jenis)


def _sisa_tunggu(model: str) -> tuple[float, str]:
    with _kunci_habis:
        sampai, jenis = _habis.get(model, (0.0, ""))
        sisa = sampai - time.monotonic()
        if sisa <= 0:
            _habis.pop(model, None)
            return 0.0, ""
        return sisa, jenis


def status_kuota() -> dict[str, float]:
    """{model: detik sampai bisa dicoba lagi} untuk model yang sedang ditandai habis."""
    return {m: s for m in list(_habis) if (s := _sisa_tunggu(m)[0]) > 0}


def lupakan_kuota() -> None:
    with _kunci_habis:
        _habis.clear()


# ---------------------------------------------------------------- panggilan API

def periksa_riwayat(riwayat) -> list[dict]:
    """Validasi riwayat percakapan dari browser: [{"peran": "siswa"|"ai", "teks": str}, ...].

    Harus bergantian, diawali "siswa" dan diakhiri "ai" (pesan baru siswa dikirim terpisah).
    """
    if riwayat in (None, []):
        return []
    if not isinstance(riwayat, list):
        raise GeminiError("Riwayat percakapan harus berupa daftar.")
    if len(riwayat) > MAKS_RIWAYAT:
        raise GeminiError(f"Riwayat percakapan terlalu panjang (maksimal {MAKS_RIWAYAT} pesan).")
    bersih = []
    for i, pesan in enumerate(riwayat):
        harap = "siswa" if i % 2 == 0 else "ai"
        if not isinstance(pesan, dict) or pesan.get("peran") != harap or not isinstance(pesan.get("teks"), str):
            raise GeminiError("Format riwayat percakapan tidak valid.")
        teks = pesan["teks"].strip()
        batas = MAKS_PERTANYAAN if harap == "siswa" else MAKS_TEKS_AI
        if not teks or len(teks) > batas:
            raise GeminiError("Isi riwayat percakapan kosong atau terlalu panjang.")
        bersih.append({"peran": harap, "teks": teks})
    if bersih[-1]["peran"] != "ai":
        raise GeminiError("Format riwayat percakapan tidak valid.")
    return bersih


def susun_permintaan(pertanyaan: str, konteks: str = "", riwayat=None) -> dict:
    """Membangun isi JSON untuk endpoint generateContent. Memvalidasi panjang input & riwayat."""
    pertanyaan = (pertanyaan or "").strip()
    konteks = (konteks or "").strip()
    if not pertanyaan:
        raise GeminiError("Pertanyaan masih kosong.")
    if len(pertanyaan) > MAKS_PERTANYAAN:
        raise GeminiError(f"Pertanyaan terlalu panjang (maksimal {MAKS_PERTANYAAN} karakter).")
    if len(konteks) > MAKS_KONTEKS:
        raise GeminiError(f"Konteks terlalu panjang (maksimal {MAKS_KONTEKS} karakter).")

    pesan = periksa_riwayat(riwayat) + [{"peran": "siswa", "teks": pertanyaan}]
    contents = [{"role": "user" if p["peran"] == "siswa" else "model", "parts": [{"text": p["teks"]}]} for p in pesan]
    if konteks:  # konteks soal ditempel di pesan siswa PERTAMA (bukan di instruksi sistem)
        awal = contents[0]["parts"][0]
        awal["text"] = f"Konteks soal di aplikasi:\n{konteks}\n\nPesan siswa:\n{awal['text']}"
    return {
        "system_instruction": {"parts": [{"text": INSTRUKSI_SISTEM}]},
        "contents": contents,
        # Model Gemini 3.x "berpikir" dulu dan token berpikir ikut dihitung di maxOutputTokens.
        # Dengan batas 1024 jawaban sering terpotong, jadi: berpikir "low" + batas 4096.
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 4096,
                             "thinkingConfig": {"thinkingLevel": "low"}},
    }


def ambil_teks(respons: dict) -> str:
    """Mengambil teks jawaban dari respons Gemini, atau GeminiError bila kosong/diblokir."""
    kandidat = respons.get("candidates") or []
    if not kandidat:
        alasan = (respons.get("promptFeedback") or {}).get("blockReason")
        raise GeminiError(
            "Pertanyaan tidak bisa dijawab (diblokir filter keamanan)." if alasan
            else "Gemini tidak memberikan jawaban."
        )
    bagian = (kandidat[0].get("content") or {}).get("parts") or []
    teks = "".join(p.get("text", "") for p in bagian if not p.get("thought")).strip()
    if kandidat[0].get("finishReason") == "MAX_TOKENS":
        # Jawaban setengah jadi (tanpa pertanyaan balik) tidak sesuai pola mediator: jangan ditampilkan.
        raise GeminiError("Jawaban Teman AI terpotong. Coba kirim lagi, ya.")
    if not teks:
        raise GeminiError("Gemini tidak memberikan jawaban.")
    return teks


def tanya_gemini(pertanyaan: str, konteks: str = "", riwayat=None, *, batas_waktu: float = BATAS_WAKTU) -> str:
    """Mengirim pesan siswa (dengan riwayat percakapan opsional) ke Gemini, mengembalikan teks jawaban.

    Melempar GeminiError dengan pesan berbahasa Indonesia yang aman ditampilkan.
    """
    badan = susun_permintaan(pertanyaan, konteks, riwayat)
    kunci = ambil_kunci()
    model_urut = daftar_model()
    mulai = time.monotonic()
    kuota: list[GeminiError] = []      # model yang kuotanya habis (dicoba atau dilewati)
    galat_akhir: GeminiError | None = None

    for i, model in enumerate(model_urut):
        sisa, jenis = _sisa_tunggu(model)
        if sisa > 0:  # sudah diketahui habis: lewati tanpa memanggil Gemini
            kuota.append(GeminiError("", jenis=jenis, tunggu=sisa))
            continue
        if galat_akhir and time.monotonic() - mulai > BATAS_TOTAL:
            break  # waktu habis: jangan coba cadangan lagi
        try:
            terakhir = i == len(model_urut) - 1
            jawab = _coba_model(model, copy.deepcopy(badan), kunci,
                                batas_waktu if terakhir else min(batas_waktu, BATAS_MODEL_AWAL),
                                boleh_ulang=(i == len(model_urut) - 1))
            if i > 0 or kuota or galat_akhir:
                _log.info("Teman AI memakai model cadangan %s", model)
            return jawab
        except GeminiError as e:
            _log.warning("Teman AI: model %s gagal (%s) %s", model, e.jenis, e.rincian)
            if e.jenis in ("kuota_harian", "kuota_menit"):
                _tandai_habis(model, e.tunggu or 60, e.jenis)
                kuota.append(e)
                continue
            if e.jenis in ("sibuk", "model", "lambat"):
                galat_akhir = e
                continue
            raise  # kunci ditolak, tanpa internet, permintaan buruk: model lain tidak akan menolong

    if galat_akhir and galat_akhir.jenis in ("sibuk", "lambat"):
        raise galat_akhir  # gangguan sementara lebih relevan daripada kuota model lain
    if kuota:
        tunggu = min(e.tunggu for e in kuota)
        if all(e.jenis == "kuota_harian" for e in kuota):
            raise GeminiError(
                f"Kuota harian Teman AI sudah habis. Teman AI bisa dipakai lagi dalam {_teks_waktu(tunggu)}. "
                "Sementara itu, kamu tetap bisa belajar dengan petunjuk dan contoh soal.",
                jenis="kuota_harian", tunggu=tunggu, rincian="semua model habis kuota harian")
        raise GeminiError(f"Teman AI sedang menerima banyak pertanyaan. Coba lagi dalam {_teks_waktu(tunggu)}.",
                          jenis="kuota_menit", tunggu=tunggu, rincian="semua model terkena batas per menit")
    if galat_akhir:
        raise galat_akhir
    raise GeminiError("Teman AI sedang sibuk. Coba lagi sebentar lagi.", jenis="sibuk", tunggu=30)


def _coba_model(model: str, badan: dict, kunci: str, batas_waktu: float, *, boleh_ulang: bool) -> str:
    """Satu model: kirim, tangani 400 (thinkingConfig) & 500/503 (ulang sekali bila model terakhir)."""
    def buat_req() -> urllib.request.Request:
        return urllib.request.Request(
            URL_API.format(model=model),
            data=json.dumps(badan).encode("utf-8"),
            method="POST",
            headers={"Content-Type": "application/json", "x-goog-api-key": kunci},
        )

    try:
        try:
            data = _kirim(buat_req(), batas_waktu)
        except urllib.error.HTTPError as e:
            if e.code == 400 and badan["generationConfig"].pop("thinkingConfig", None):
                data = _kirim(buat_req(), batas_waktu)  # model ini tak mengenal thinkingLevel
            elif e.code in (500, 503) and boleh_ulang:
                time.sleep(JEDA_ULANG)  # tidak ada cadangan lagi: coba ulang SEKALI saja
                data = _kirim(buat_req(), batas_waktu)
            else:
                raise
    except urllib.error.HTTPError as e:
        raise _galat_http(e, model) from None
    except urllib.error.URLError as e:
        if isinstance(e.reason, TimeoutError):
            raise GeminiError("Gemini terlalu lama menjawab. Coba lagi sebentar lagi.",
                              jenis="lambat", rincian="batas waktu") from None
        raise GeminiError("Tidak bisa terhubung ke Gemini. Periksa koneksi internet.",
                          jenis="jaringan", rincian="tanpa koneksi") from None
    except TimeoutError:
        raise GeminiError("Gemini terlalu lama menjawab. Coba lagi sebentar lagi.",
                          jenis="lambat", rincian="batas waktu") from None
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise GeminiError("Jawaban Gemini tidak bisa dibaca.", rincian="respons rusak") from None
    return ambil_teks(data)


def _kirim(req: urllib.request.Request, batas_waktu: float) -> dict:
    with urllib.request.urlopen(req, timeout=batas_waktu) as res:
        return json.loads(res.read().decode("utf-8"))


def _teks_waktu(detik: float) -> str:
    if detik >= 3600:
        return f"sekitar {max(1, round(detik / 3600))} jam"
    if detik >= 60:
        return f"sekitar {math.ceil(detik / 60)} menit"
    return f"{max(1, math.ceil(detik))} detik"


def _rincian_kuota(e: urllib.error.HTTPError) -> tuple[str, float, str]:
    """Baca detail galat 429 Google: (jenis kuota, detik tunggu, catatan log). Tanpa kunci/isi permintaan."""
    try:
        galat = json.loads(e.read() or b"{}").get("error", {})
    except Exception:  # isi respons tidak bisa dibaca: anggap batas per menit
        return "kuota_menit", 60.0, "429 tanpa rincian"
    tunggu, ids = 0.0, []
    for d in galat.get("details", []):
        tipe = d.get("@type", "")
        if tipe.endswith("RetryInfo"):
            m = re.match(r"([\d.]+)s", str(d.get("retryDelay", "")))
            tunggu = float(m.group(1)) if m else 0.0
        elif tipe.endswith("QuotaFailure"):
            ids += [f"{v.get('quotaId', '?')} (batas {v.get('quotaValue', '?')})" for v in d.get("violations", [])]
    harian = any("PerDay" in i for i in ids)
    jenis = "kuota_harian" if harian else "kuota_menit"
    return jenis, tunggu or (3600.0 if harian else 60.0), "429 " + (", ".join(ids) or "tanpa rincian")


def _galat_http(e: urllib.error.HTTPError, model: str) -> GeminiError:
    # Pesan untuk siswa tidak memuat isi respons/permintaan; rincian teknis hanya untuk log server.
    kode = e.code
    if kode == 429:
        jenis, tunggu, rincian = _rincian_kuota(e)
        if jenis == "kuota_harian":
            pesan = f"Kuota harian Teman AI sudah habis. Teman AI bisa dipakai lagi dalam {_teks_waktu(tunggu)}."
        else:
            pesan = f"Teman AI sedang menerima banyak pertanyaan. Coba lagi dalam {_teks_waktu(tunggu)}."
        return GeminiError(pesan, jenis=jenis, tunggu=tunggu, rincian=rincian)
    if kode in (401, 403):
        return GeminiError(f"API key ditolak ({kode}). Pastikan GEMINI_API_KEY benar dan aktif.",
                           jenis="kunci", rincian=f"{kode}")
    if kode == 404:
        return GeminiError(f"Model '{model}' tidak ditemukan (404). Ganti GEMINI_MODEL di .env.",
                           jenis="model", rincian="404 model tidak tersedia")
    if kode == 400:
        return GeminiError("Permintaan ditolak Gemini (400). Periksa API key atau isi pertanyaan.",
                           rincian="400")
    if kode >= 500:
        return GeminiError(f"Server Gemini sedang sibuk ({kode}). Coba lagi sebentar lagi.",
                           jenis="sibuk", tunggu=30, rincian=f"{kode}")
    return GeminiError(f"Gemini mengembalikan galat {kode}.", rincian=f"{kode}")


# ---------------------------------------------------------------- terminal

def main(argv: list[str]) -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # agar teks Indonesia tampil benar di Windows
    except (AttributeError, ValueError):
        pass

    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0

    if argv[0] == "--cek":
        ada_env = BERKAS_ENV.exists()
        try:
            ambil_kunci()
            status = "terisi"
        except GeminiError:
            status = "BELUM terisi"
        print(f"Berkas .env      : {'ditemukan' if ada_env else 'tidak ada'}")
        print(f"GEMINI_API_KEY   : {status}")  # isi kunci tidak pernah dicetak
        print(f"Model utama      : {ambil_model()}")
        print(f"Model cadangan   : {', '.join(daftar_model()[1:]) or '(tidak ada)'}")
        print("Kuota gratis     : dihitung per model per hari; lihat https://aistudio.google.com/rate-limit")
        return 0 if status == "terisi" else 1

    try:
        print(tanya_gemini(" ".join(argv)))
        return 0
    except GeminiError as e:
        print(f"Galat: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
