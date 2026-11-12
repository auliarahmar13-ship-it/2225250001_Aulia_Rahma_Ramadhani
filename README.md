# DeretKu 📏: Belajar Barisan & Deret Aritmatika

Aplikasi belajar (PWA) untuk siswa SMP yang dirancang untuk **mengurangi beban kognitif**
dan **menumbuhkan literasi matematika**. Bisa dibuka di browser dan **dipasang di HP
Android/iPhone tanpa Play Store/App Store**.

| Fitur | Keterangan |
|-------|------------|
| 📚 Materi | 4 unit, kartu bersegmen, contoh soal langkah demi langkah, cek pemahaman, narasi suara |
| ✏️ Latihan | 5 jenis soal acak, 3 level adaptif, petunjuk bertahap, contoh terselesaikan |
| 📖 Literasi | 5 masalah kontekstual, 4 tahap (memahami → merumuskan → menghitung → menafsirkan) |
| 🏆 Kuis | 15 soal, pembahasan, deteksi miskonsepsi |
| 🎵 Suara | Musik latar lembut, efek suara, narasi (bisa dimatikan) |
| 🧠 Beban kognitif | Skala Paas 1–9 setelah setiap bagian |
| 📊 Python | Bank soal terverifikasi, analisis statistik (deskriptif, butir, KR-20, korelasi) |

## Bahasa Pemrograman

- **JavaScript** → aplikasi web/HP (`app/`)
- **Python** → data & statistik (`python/`)

## Menjalankan

Butuh **Python 3.10+** (tidak perlu Node.js).

```bash
python python/serve.py
```
Buka <http://localhost:8000>.

## Perintah Python

```bash
python python/generate_bank_soal.py     # membuat bank soal kuis (kunci diverifikasi rumus)
python python/buat_ikon.py              # membuat ikon aplikasi
python python/buat_data_contoh.py       # 30 data siswa simulasi (untuk mencoba)
python python/analisis_statistik.py     # analisis → python/hasil/laporan.md
python -m unittest discover python/tests
pip install -r python/requirements.txt  # opsional: grafik analisis
```

Di VS Code: buka menu **Run and Debug** (Ctrl+Shift+D) lalu pilih konfigurasi yang tersedia.

## Link Permanen & Instalasi

Lihat [docs/07-panduan-deploy.md](docs/07-panduan-deploy.md) (GitHub Pages, gratis, HTTPS).

## Dokumen Perencanaan

- [PRD.md](PRD.md): kebutuhan produk
- [CLAUDE.md](CLAUDE.md): panduan pengembang/AI
- [docs/](docs/): analisis kebutuhan, desain pembelajaran, arsitektur, konten, rencana, pengujian, deploy
