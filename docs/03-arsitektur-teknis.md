# 03 — Arsitektur Teknis

## 1. Gambaran Umum

```
┌──────────────────────── Perangkat siswa (browser / PWA terpasang) ───────────────────────┐
│  index.html ── js/app.js (router hash) ──┬── views/beranda.js                            │
│                                          ├── views/materi.js    ← data/materi.js         │
│                                          ├── views/latihan.js   ← generator.js           │
│                                          ├── views/kuis.js      ← data/bank-soal.json ◄──┼── dibuat Python
│                                          ├── views/literasi.js  ← data/literasi.js       │
│                                          └── views/saya.js      → ekspor JSON ───────────┼──┐
│  js/audio.js (Web Audio + SpeechSynthesis)   js/state.js (localStorage)                  │  │
│  sw.js (cache offline)                                                                   │  │
└──────────────────────────────────────────────────────────────────────────────────────────┘  │
                                                                                              ▼
┌──────────────────────── Komputer guru/peneliti (Python) ─────────────────────────────────────┐
│  python/analisis_statistik.py  ← data_siswa/*.json  → hasil/laporan.md, *.csv, grafik.png   │
│  python/generate_bank_soal.py  → app/data/bank-soal.json                                     │
│  python/buat_ikon.py           → app/icons/*.png                                             │
│  python/serve.py               → server lokal untuk pengembangan                             │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Mengapa Pembagian JS dan Python Seperti Ini?

| Kebutuhan | Bahasa | Alasan |
|-----------|--------|--------|
| Antarmuka, interaksi, suara, offline | JavaScript | Satu-satunya bahasa yang berjalan langsung di browser dan HP tanpa instalasi |
| Statistik (deskriptif, butir soal, korelasi, reliabilitas) | Python | Pustaka `statistics`, mudah dibaca peneliti, cocok untuk skripsi |
| Bank soal dengan kunci terverifikasi | Python | Kunci dihitung otomatis dari rumus sehingga tidak ada kunci salah |
| Ikon PWA | Python | Dibuat dari kode sehingga mudah diubah warnanya |

## 3. Teknologi

| Lapisan | Teknologi |
|---------|-----------|
| UI | HTML5, CSS3 (custom properties, grid/flex), JavaScript ES2020 modules |
| Routing | Hash router (`#/materi/u2`), kompatibel dengan GitHub Pages |
| Penyimpanan | `localStorage` (kunci `deretku:v1`) |
| Offline/instal | Web App Manifest + Service Worker (cache-first) |
| Audio | Web Audio API (musik & efek dibuat dengan kode), Web Speech API (narasi) |
| Analisis | Python 3.10+ (stdlib), matplotlib opsional |
| Hosting | GitHub Pages lewat GitHub Actions |

## 4. Model Data (localStorage)

```js
{
  versi: 1,
  idPerangkat: "a1b2c3",
  profil: { nama: "", kelas: "" },
  pengaturan: { musik: true, efek: true, volumeMusik: 0.35, narasi: true, ukuranTeks: "normal" },
  materiSelesai: { u1: true },
  posisiKartu: { u2: 3 },
  latihan: [...], kuis: [...], literasi: [...], bebanKognitif: [...]
}
```
Format ekspor: lihat [CLAUDE.md](../CLAUDE.md#format-data-ekspor-kontrak-js--python).

## 5. Format Bank Soal (`app/data/bank-soal.json`)

```json
{
  "versi": 1, "dibuat": "2026-11-11",
  "soal": [{
    "id": "K04", "indikator": "TP3", "level": "sedang",
    "pertanyaan": "Suku ke-15 dari barisan 3, 7, 11, ... adalah ....",
    "opsi": [
      {"teks": "59", "benar": true,  "miskonsepsi": null},
      {"teks": "63", "benar": false, "miskonsepsi": "M-n-bukan-n-1"}
    ],
    "pembahasan": ["a = 3, b = 4, n = 15", "U₁₅ = 3 + (15 − 1) × 4", "= 59"]
  }]
}
```

## 6. Service Worker

- `CACHE_VERSION` dinaikkan setiap rilis, dan cache lama dihapus saat `activate`.
- Strategi: *cache-first* untuk aset; navigasi diarahkan ke `index.html` dari cache.
- Didaftarkan hanya pada konteks aman (HTTPS atau `localhost`).

## 7. Keamanan & Privasi

- Tanpa server dan tanpa pelacakan; data hanya di perangkat.
- Konten HTML hanya berasal dari berkas statis milik aplikasi (bukan input pengguna).
  Input pengguna (nama/kelas) selalu dirender sebagai teks (`textContent`).
