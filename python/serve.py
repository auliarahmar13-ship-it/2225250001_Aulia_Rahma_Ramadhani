"""
Server lokal untuk menjalankan DeretKu saat pengembangan.

- Melayani folder app/ dengan tipe MIME yang benar (penting di Windows, karena
  .js kadang dikenali sebagai text/plain sehingga modul JS gagal dimuat).
- Menampilkan alamat IP LAN agar bisa dicoba dari HP pada Wi-Fi yang sama.

Jalankan:  python python/serve.py            (port 8000)
           python python/serve.py --port 5500
"""

from __future__ import annotations

import argparse
import functools
import socket
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

APP = Path(__file__).resolve().parent.parent / "app"


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".html": "text/html",
    }

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def ip_lan() -> str | None:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))  # tidak mengirim paket apa pun
            return s.getsockname()[0]
    except OSError:
        return None


def main() -> None:
    parser = argparse.ArgumentParser(description="Server lokal DeretKu")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--tanpa-browser", action="store_true", help="jangan buka browser otomatis")
    args = parser.parse_args()

    handler = functools.partial(Handler, directory=str(APP))
    server = ThreadingHTTPServer(("0.0.0.0", args.port), handler)
    lokal = f"http://localhost:{args.port}"
    print("DeretKu berjalan:")
    print(f"  Komputer : {lokal}")
    ip = ip_lan()
    if ip:
        print(f"  HP (Wi-Fi sama): http://{ip}:{args.port}  (instal/offline hanya aktif di HTTPS/localhost)")
    print("Tekan Ctrl+C untuk berhenti.")
    if not args.tanpa_browser:
        webbrowser.open(lokal)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer dihentikan.")


if __name__ == "__main__":
    main()
