"""
Fungsi Python Vercel: `GET /api/konfigurasi` → URL + kunci PUBLISHABLE Supabase untuk login siswa
(hosting Tahap 6, docs/13). Logikanya SAMA dengan server lokal (python/api_tanya.py →
konfigurasi_publik). Kunci secret/service_role DITOLAK dan tidak pernah dikirim ke browser.

SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY diisi di Vercel → Project → Settings → Environment
Variables. JANGAN di berkas ini atau di repositori. Hanya pustaka standar.
"""

import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "python"))

from api_tanya import ApiTanyaMixin  # noqa: E402


class handler(ApiTanyaMixin, BaseHTTPRequestHandler):  # noqa: N801 (nama wajib dari Vercel)
    def do_GET(self) -> None:
        self.layani_konfigurasi()

    def do_HEAD(self) -> None:
        self.layani_konfigurasi()

    def do_POST(self) -> None:
        self.layani_konfigurasi()  # → 405
