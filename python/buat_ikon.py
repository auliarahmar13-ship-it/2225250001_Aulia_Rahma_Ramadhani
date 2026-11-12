"""
Membuat ikon PWA DeretKu (PNG) hanya dengan pustaka standar Python.

Gambar: empat batang yang tingginya naik dengan selisih tetap, yaitu
visualisasi barisan aritmatika. Latar gradasi pink → ungu; batang terakhir kuning ("suku berikutnya").

Jalankan:  python python/buat_ikon.py
Keluaran:  app/icons/icon-192.png, icon-512.png, maskable-512.png
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOLDER = ROOT / "app" / "icons"

ATAS = (255, 79, 163)      # #ff4fa3 pink
BAWAH = (124, 58, 237)     # #7c3aed ungu
PUTIH = (255, 255, 255)
JINGGA = (255, 214, 64)    # kuning cerah


def tulis_png(path: Path, lebar: int, tinggi: int, piksel: list[bytes]) -> None:
    def chunk(jenis: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + jenis + data + struct.pack(">I", zlib.crc32(jenis + data) & 0xFFFFFFFF)

    mentah = b"".join(b"\x00" + baris for baris in piksel)
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", lebar, tinggi, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(mentah, 9))
           + chunk(b"IEND", b""))
    path.write_bytes(png)


def dalam_kotak_bulat(x: float, y: float, x0: float, y0: float, x1: float, y1: float, r: float) -> bool:
    if not (x0 <= x <= x1 and y0 <= y <= y1):
        return False
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def render(ukuran: int, maskable: bool) -> list[bytes]:
    margin = 0.24 if maskable else 0.2
    sudut = 0 if maskable else 0.22 * ukuran
    kotak = ukuran * (1 - 2 * margin)
    x_awal, y_dasar = ukuran * margin, ukuran * (1 - margin)
    k = 4
    lebar_batang = kotak / (k * 1.45)
    jarak = (kotak - k * lebar_batang) / (k - 1)
    tinggi = [kotak * (0.34 + 0.22 * i) for i in range(k)]  # beda tetap
    batang = []
    for i in range(k):
        x0 = x_awal + i * (lebar_batang + jarak)
        batang.append((x0, y_dasar - tinggi[i], x0 + lebar_batang, y_dasar,
                       JINGGA if i == k - 1 else PUTIH))
    r_batang = lebar_batang * 0.28

    sampel = [(0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75)]
    baris_png = []
    for py in range(ukuran):
        t = py / (ukuran - 1)
        latar = tuple(round(ATAS[c] * (1 - t) + BAWAH[c] * t) for c in range(3))
        baris = bytearray()
        for px in range(ukuran):
            acc = [0.0, 0.0, 0.0, 0.0]
            for sx, sy in sampel:
                x, y = px + sx, py + sy
                if sudut and not dalam_kotak_bulat(x, y, 0, 0, ukuran, ukuran, sudut):
                    continue
                warna = latar
                for x0, y0, x1, y1, w in batang:
                    if dalam_kotak_bulat(x, y, x0, y0, x1, y1, r_batang):
                        warna = w
                        break
                for c in range(3):
                    acc[c] += warna[c]
                acc[3] += 255
            n = len(sampel)
            alfa = acc[3] / n
            if alfa:
                rgb = [round(acc[c] / (acc[3] / 255)) for c in range(3)]
            else:
                rgb = [0, 0, 0]
            baris += bytes([*rgb, round(alfa)])
        baris_png.append(bytes(baris))
    return baris_png


def main() -> None:
    FOLDER.mkdir(parents=True, exist_ok=True)
    for nama, ukuran, maskable in [("icon-192.png", 192, False),
                                   ("icon-512.png", 512, False),
                                   ("maskable-512.png", 512, True)]:
        tulis_png(FOLDER / nama, ukuran, ukuran, render(ukuran, maskable))
        print(f"✓ {nama}")


if __name__ == "__main__":
    main()
