# CLAUDE.md — Panduan Proyek DeretKu

Berkas ini dibaca oleh Claude Code (AI asisten) dan pengembang lain sebelum
mengubah kode. Ikuti aturan di sini agar aplikasi tetap konsisten dengan tujuan
penelitian: **mengurangi beban kognitif siswa** dan **menumbuhkan literasi matematika**.

## Ringkasan Proyek

DeretKu adalah PWA (Progressive Web App) untuk siswa SMP yang membahas barisan dan
deret aritmatika: materi, latihan, kuis, dan literasi matematika, dilengkapi
musik latar, efek suara, dan narasi. Aplikasi dibuka di browser dan dapat dipasang
di Android/iOS tanpa Play Store/App Store.

- **JavaScript** (vanilla, ES modules, tanpa *build step*) untuk seluruh aplikasi web (`app/`).
- **Python** (standar library, matplotlib opsional) untuk data dan statistik (`python/`):
  bank soal, ikon, server lokal, dan analisis statistik hasil belajar serta beban kognitif.

Aturan pembagian bahasa: **data statistik → Python; logika umum/antarmuka → JavaScript.**

## Struktur Folder

```
PRD.md                  Kebutuhan produk (baca dulu)
CLAUDE.md               Berkas ini
docs/                   Dokumen perencanaan (analisis, desain, arsitektur, uji, deploy)
app/                    ROOT WEB: semua yang di-deploy ada di sini
  index.html            Kerangka halaman (topbar, <main id="app">, tabbar)
  manifest.webmanifest  Metadata PWA
  sw.js                 Service worker (cache offline). NAIKKAN VERSI CACHE bila mengubah aset
  css/style.css         Semua gaya; token warna di :root; mode gelap
  js/app.js             Router hash + inisialisasi
  js/state.js           Penyimpanan (localStorage) + ekspor data
  js/audio.js           Musik latar generatif, efek suara, narasi (TTS)
  js/ui.js              Helper DOM, toast, modal skala beban kognitif, visual SVG
  js/maskot.js          Maskot 4 siswa (SVG buatan sendiri) + animasi CSS, disentuh → melompat
  js/ilustrasi.js       Ilustrasi "3D" SVG: adegan hero, poster episode/misi/games, maskot Ari
  js/dunia.js           Komponen Dunia Belajar: banner halaman, baris kartu geser, poster, kartu lebar
  fonts/                Fredoka (OFL, lihat OFL.txt) untuk judul & tombol
  js/games/*.js         Games: balon (Balon Pola), katak (Lompat Katak), susun (Menara Angka), umum
  js/generator.js       Pembuat soal latihan acak
  js/data/materi.js     Konten materi per unit (kartu)
  js/data/literasi.js   Masalah literasi matematika
  js/views/*.js         Satu file per halaman (beranda, materi, latihan, kuis, literasi, games, saya)
  data/bank-soal.json   DIBUAT OLEH python/generate_bank_soal.py (jangan edit manual)
  icons/                DIBUAT OLEH python/buat_ikon.py
python/
  serve.py              Server lokal (MIME benar untuk .js/.webmanifest), tampilkan IP LAN
  generate_bank_soal.py Bank soal kuis + verifikasi kunci jawaban dengan rumus
  buat_ikon.py          Membuat ikon PNG tanpa library eksternal
  buat_data_contoh.py   Data simulasi siswa untuk mencoba analisis
  analisis_statistik.py Analisis statistik data ekspor siswa
  tests/                unittest
.github/workflows/      Deploy otomatis folder app/ ke GitHub Pages
```

## Perintah

```bash
python python/serve.py                 # jalankan di http://localhost:8000
python python/generate_bank_soal.py    # buat ulang app/data/bank-soal.json
python python/buat_ikon.py             # buat ulang ikon
python python/buat_data_contoh.py      # buat 30 data siswa simulasi -> python/data_siswa/
python python/analisis_statistik.py    # analisis -> python/hasil/
python -m unittest discover python/tests
```

Tidak ada `npm`/Node.js. Jangan menambahkan *bundler* atau *framework*.

## Aturan Desain Wajib (Teori Beban Kognitif)

Setiap fitur atau konten baru harus lolos daftar periksa ini:

1. **Segmentasi**: satu kartu/layar = satu ide. Teks kartu ≤ ±60 kata.
2. **Pra-latihan (pre-training)**: istilah dikenalkan sebelum dipakai dalam rumus.
3. **Contoh terselesaikan**: rumus baru selalu diikuti contoh langkah demi langkah.
4. **Fading**: bantuan berkurang seiring level naik (Mudah → Sulit).
5. **Signaling**: warna konsisten: `--c-a` (suku pertama a), `--c-b` (beda b), `--c-n` (n), `--c-u` (Uₙ/Sₙ).
6. **Hindari split-attention**: label langsung di visual, bukan di legenda terpisah.
7. **Hindari redundansi**: narasi membacakan teks kartu; jangan tambah teks lain yang mengulang.
8. **Modalitas**: narasi suara tersedia, tetapi tidak dipaksa.
9. **Tanpa batas waktu** di kuis/latihan. Animasi dekoratif (maskot, Ari, hero, banner dunia,
   konfeti) **hanya** di Beranda, banner halaman daftar, Games, dan layar selesai. **Jangan** di
   kartu materi atau soal. Animasi di dalam poster hanya berjalan saat disorot (hemat CPU HP). Animasi bisa dimatikan
   (Saya → Animasi maskot) dan otomatis mati bila `prefers-reduced-motion`.
10. **Umpan balik langsung** dan menjelaskan *mengapa*, bukan hanya benar/salah.

## Tema Visual & Suara

- Tema ceria pink–ungu: token `--grad`, `--pink`, `--ungu`, `--primary` di `:root` (`css/style.css`).
  Warna sinyal a/b/n/Uₙ tetap dipertahankan (jangan diganti dengan warna tema).
- Ikon dibuat `python/buat_ikon.py` (gradasi pink → ungu).
- Musik latar ceria (C–G–Am–F, ±116 BPM) dibuat dengan kode di `js/audio.js`. Jangan menambah
  berkas musik berhak cipta.
- Jangan memakai gambar stok bertanda air/berlisensi (mis. Pngtree). Gambar harus buatan sendiri
  atau berlisensi bebas yang jelas.

## Gaya "Dunia Belajar" (v1.2)

- Beranda bergaya layanan streaming: banner hero sinematik (mode gelap `body.mode-sinema`),
  baris poster horizontal (`barisKartu`, `poster`, `kartuLebar` di `js/dunia.js`).
- Setiap halaman daftar diawali `bannerDunia(tema, …)`: materi = Perpustakaan Ajaib,
  latihan = Hutan Latihan, literasi = Kota Cerita, kuis = Arena Juara, games = Taman Bermain.
- Maskot utama **Ari** (makhluk bintang, `ari()` di `js/ilustrasi.js`); 4 siswa tetap ada di
  "Teman Seperjalanan".
- Transisi halaman memakai View Transitions API **dengan pengaman 400 ms** di `app.js`
  (jangan hapus: di sebagian browser callback transisi tidak dijalankan).
- Hindari nama variabel yang menimpa variabel luar (mis. `m` untuk maskot di dalam fungsi yang
  sudah memakai `m`). Bug ini pernah membuat misi literasi gagal tersimpan.

## Aturan Literasi Matematika

Setiap masalah literasi memiliki 4 tahap (kerangka PISA):
**Memahami** (informasi apa yang diketahui) → **Merumuskan** (model/rumus) →
**Menghitung** (menerapkan) → **Menafsirkan** (makna jawaban dalam konteks).
Konteks harus dekat dengan kehidupan siswa Indonesia.

## Konvensi Kode

- Teks antarmuka: Bahasa Indonesia baku tapi ramah siswa ("kamu").
- Nama variabel/fungsi boleh Bahasa Indonesia (mengikuti kode yang ada).
- JS: ES modules, `const`/`let`, tanpa dependensi eksternal. Akses `localStorage`
  hanya lewat `js/state.js` (dibungkus try/catch).
- Notasi matematika di HTML: `U<sub>n</sub>`, `S<sub>n</sub>`, tanda minus `−` di teks tampilan.
- Python: hanya pustaka standar, kecuali `matplotlib` (opsional, dicek dengan try/except).
- Setelah mengubah file di `app/`, **naikkan `CACHE_VERSION` di `app/sw.js`** agar
  pengguna menerima versi terbaru.
- Jika menambah file baru di `app/`, daftarkan juga di `ASET` dalam `app/sw.js`.

## Format Data Ekspor (kontrak JS ↔ Python)

`js/state.js` → `eksporData()` menghasilkan JSON yang dibaca `python/analisis_statistik.py`:

```json
{
  "aplikasi": "DeretKu", "versiData": 1, "diekspor": "ISO-8601",
  "idPerangkat": "string", "profil": {"nama": "", "kelas": ""},
  "materiSelesai": ["u1", "u2"],
  "latihan": [{"waktu": "", "jenis": "suku-n", "level": 1, "benar": true, "petunjuk": 0, "durasiDetik": 30}],
  "kuis": [{"waktu": "", "skor": 80, "benar": 12, "total": 15, "durasiDetik": 600,
            "jawaban": [{"id": "K01", "benar": true, "miskonsepsi": null, "durasiDetik": 20}]}],
  "literasi": [{"waktu": "", "id": "L1", "tahap": "Menafsirkan", "benar": true, "percobaan": 1}],
  "bebanKognitif": [{"waktu": "", "konteks": "materi:u2", "nilai": 4}]
}
```

Jika mengubah format ini, perbarui kedua sisi dan naikkan `versiData`.

## Pengujian

- Python: `python -m unittest discover python/tests`.
- Manual: ikuti daftar uji di [docs/06-rencana-pengujian.md](docs/06-rencana-pengujian.md), utamakan layar HP (DevTools → Toggle device, 360×740).
