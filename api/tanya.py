"""
Fungsi Python Vercel untuk Teman AI: melayani `POST /api/tanya` di domain yang sama dengan
aplikasi (tanpa CORS). Logikanya SAMA PERSIS dengan server lokal (python/api_tanya.py);
Gemini & rantai model cadangan ada di python/gemini.py. Hanya pustaka standar.

Format sesuai dokumentasi Vercel: kelas bernama `handler` turunan BaseHTTPRequestHandler.
GEMINI_API_KEY (dan opsional GEMINI_MODEL, GEMINI_MODEL_CADANGAN) diisi di
Vercel → Project → Settings → Environment Variables. JANGAN di berkas ini atau di repositori.
"""

import logging
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "python"))

from api_tanya import ApiTanyaMixin  # noqa: E402

# Catatan Teman AI (model cadangan, kuota) masuk ke log Vercel; tanpa kunci & isi pesan siswa.
logging.basicConfig(level=logging.INFO, format="[Teman AI] %(message)s")


class handler(ApiTanyaMixin, BaseHTTPRequestHandler):  # noqa: N801 (nama wajib dari Vercel)
    def _ip_klien(self) -> str:
        # Vercel menimpa X-Forwarded-For dengan IP klien asli (tidak bisa dipalsukan klien).
        return (self.headers.get("X-Forwarded-For") or self.client_address[0]).split(",")[0].strip()

    def do_POST(self) -> None:
        self.layani_tanya()

    def do_GET(self) -> None:
        self.tolak_metode()

    def do_HEAD(self) -> None:
        self.tolak_metode()
