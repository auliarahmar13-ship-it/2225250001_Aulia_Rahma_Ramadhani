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
  js/ai.js              Teman AI: panel tanya di Latihan → POST api/tanya (server). Tanpa API key
  js/teman.js           Teman Belajar: 4 ilustrasi siswa (img/teman/), rotasi per fitur, gelembung dialog
  img/teman/            Aset karakter dari pengguna (JANGAN diganti/diedit/digabung)
  js/ilustrasi.js       Ilustrasi "3D" SVG: adegan hero, poster episode/misi/games, maskot Ari
  js/dunia.js           Komponen Dunia Belajar: banner halaman, baris kartu geser, poster, kartu lebar
  fonts/                Fredoka (OFL, lihat OFL.txt) untuk judul & tombol
  js/games/*.js         Games: balon (Balon Pola), katak (Lompat Katak), susun (Menara Angka), umum
  js/generator.js       Pembuat soal latihan acak
  js/data/materi.js     Konten materi per unit (kartu)
  js/data/literasi.js   Masalah literasi matematika
  js/data/rmt.js        Fondasi RMT: 24 fungsi kognitif, konsep inti, fase, makna per unit
  js/data/pemanasan.js  RMT Fase I: 6 tugas pola nonangka (Pemanasan Berpikir, #/pemanasan)
  js/views/*.js         Satu file per halaman (beranda, pretes, pemanasan, materi, latihan, kuis, literasi, games, saya)
  data/bank-soal.json   DIBUAT OLEH python/generate_bank_soal.py (jangan edit manual)
  icons/                DIBUAT OLEH python/buat_ikon.py
api/tanya.py            Fungsi Python Vercel untuk Teman AI (kelas `handler`), memakai python/api_tanya.py
vercel.json             Konfigurasi Vercel: app/ statis, fungsi api/tanya.py, header (sw.js tanpa cache)
python/
  serve.py              Server lokal (MIME benar untuk .js/.webmanifest), tampilkan IP LAN
  api_tanya.py          Logika POST /api/tanya BERSAMA (dipakai serve.py & api/tanya.py)
  gemini.py             Penghubung Gemini API (backend, pustaka standar). Kunci dari .env
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
python python/gemini.py --cek          # cek GEMINI_API_KEY di .env (isi kunci tidak dicetak)
python python/gemini.py "pertanyaan"   # uji satu pertanyaan ke Gemini
```

Tidak ada `npm`/Node.js. Jangan menambahkan *bundler* atau *framework*.

## Gemini API (Teman AI)

- API key HANYA di `.env` (root proyek, variabel `GEMINI_API_KEY`); `.env` ada di `.gitignore`.
  Contoh tanpa kunci: `.env.example`. Jangan pernah menaruh kunci di `app/` (JS/HTML) atau mencetaknya.
- Gemini hanya dipanggil dari backend Python (`python/gemini.py`), tidak dari browser.
- **Hosting (docs/09)**: Vercel menyajikan `app/` dan menjalankan `api/tanya.py`. Logika endpoint
  HANYA di `python/api_tanya.py`; jangan menduplikasi di `serve.py` atau `api/tanya.py`. Di Vercel,
  rate limit memakai `X-Forwarded-For` (ditimpa Vercel). Kunci di Environment Variables Vercel.
  Tes `TestApiVercel` menjalankan semua uji endpoint terhadap handler Vercel.
- Batas waktu Gemini: 12 dtk per model yang masih punya cadangan, 20 dtk untuk model terakhir
  (kasus terburuk 56 dtk < `maxDuration` 60 di `vercel.json` < 70 dtk tunggu browser).
- Endpoint: `POST /api/tanya` di `python/serve.py`, isi `{"pertanyaan", "konteks"?, "riwayat"?}`
  → `{"jawaban"}` atau `{"galat"}`.
  - `riwayat`: maksimal 8 pesan `{peran: "siswa"|"ai", teks}`, bergantian, diawali "siswa",
    diakhiri "ai". Divalidasi di `gemini.periksa_riwayat` dan TIDAK disimpan di server.
  - Batas 16 KB, rate limit (6/menit per IP, 30/menit total), dan penolakan Origin situs lain.
  - GitHub Pages TIDAK menjalankan endpoint ini (hanya statis).
- **Teman AI = mediator RMT** (Tahap 1, docs/08). Pola mediasi ada di `INSTRUKSI_DASAR`
  (`python/gemini.py`):
  - tidak memberi jawaban akhir;
  - tepat satu pertanyaan balik;
  - parafrasa + minta bukti logis;
  - sebut bagian yang benar & alasannya;
  - mengapa langkah perlu;
  - jembatan ke aturan umum;
  - baris akhir `Fungsi berpikir: <namaSiswa>`.
  Daftar nama fungsi dibaca dari `app/js/data/rmt.js` (jangan diketik ulang di Python).
  Ubah instruksi ini hanya bersama tesnya (`TestInstruksiMediator`).
- **Kuota gratis dihitung per model, per proyek, per hari** (bukan per API key). Contohnya
  `gemini-3.5-flash` = 20 permintaan/hari, direset tengah malam waktu Pasifik (≈ 15.00 WIB).
  Cara kerja di `gemini.py`:
  - **Rantai model** `daftar_model()`: `GEMINI_MODEL` lalu `GEMINI_MODEL_CADANGAN` (bawaan:
    `gemini-flash-lite-latest, gemini-3.5-flash-lite, gemini-3.1-flash-lite`; isi `tidak` untuk mematikan).
  - Model berikutnya dicoba bila terjadi 429 (kuota), 503/500 (sibuk), 404 (model dipensiunkan),
    atau batas waktu habis. 401/403, tanpa internet, dan 400 TIDAK memicu cadangan.
  - Model yang kuotanya habis diingat di memori sampai `retryDelay` dari Google, jadi tidak
    dipanggil lagi.
  - Rincian 429 (`QuotaFailure`, `RetryInfo`) hanya untuk log `[Teman AI]`. Siswa melihat pesan
    ramah: kuota harian ("bisa dipakai lagi dalam sekitar N jam") atau per menit ("coba lagi dalam N detik").
  - Server mengembalikan **503 + `Retry-After`**. `js/ai.js` menampilkan hitung mundur di tombol
    Kirim bila waktu tunggunya ≤ 120 detik.
  - Instruksi mediator RMT sama untuk semua model.
  - JANGAN mengaktifkan layanan/penagihan berbayar tanpa izin pengguna.
- Model Gemini 3.x memakai token "berpikir" di dalam `maxOutputTokens`: dipakai
  `thinkingLevel: "low"` + batas 4096 (otomatis dicoba tanpa `thinkingConfig` bila model menolak, 400).
  Jawaban terpotong (`MAX_TOKENS`) ditolak, tidak ditampilkan setengah jadi.
- Frontend `js/ai.js` (`panelTanyaAI`) dipakai di Latihan:
  - Tombol hanya muncul bila server AI tersedia.
  - Percakapan per soal (riwayat direset saat soal berganti atau "Mulai ulang").
  - Konteks = teks soal + status jawaban yang sudah diperiksa. JANGAN sertakan kunci jawaban.
  - Jawaban AI ditampilkan dengan `textContent` (bukan `html`).
  - Label fungsi berpikir hanya tampil bila namanya ada di kamus RMT.
- Jangan kirim data pribadi siswa (nama, kelas, idPerangkat) ke Gemini; kirim teks pertanyaan/soal saja.
- Tes `python/tests/test_gemini.py` memakai respons tiruan: tidak butuh internet atau kunci asli.

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
- Gambar baru harus buatan sendiri atau berlisensi jelas. Pengecualian: 4 gambar di `img/teman/`
  adalah aset pilihan pengguna dan dipakai apa adanya (status lisensinya tanggung jawab pengguna).

## Gaya "Dunia Belajar" (v1.2)

- Beranda bergaya layanan streaming: banner hero sinematik (mode gelap `body.mode-sinema`),
  baris poster horizontal (`barisKartu`, `poster`, `kartuLebar` di `js/dunia.js`).
- Setiap halaman daftar diawali `bannerDunia(tema, …)`: materi = Perpustakaan Ajaib,
  latihan = Hutan Latihan, literasi = Kota Cerita, kuis = Arena Juara, games = Taman Bermain.
- **Ari** (`ari()` di `js/ilustrasi.js`) HANYA pemandu di Beranda: menyambut dan memperkenalkan teman.
- **Teman Belajar** (`temanBelajar(fitur, pesan)` di `js/teman.js`) menemani di Pemanasan, Materi, Latihan, Kuis,
  Literasi, Games, dan banner halaman. Rotasi per fitur di `ROTASI`. Ukuran kecil (±72 px di halaman
  belajar, ±82 px di banner). Di halaman belajar pakai `{ tenang: true }` (tanpa melayang) dan letakkan
  di bawah kartu/navigasi, jangan menutupi rumus, teks, atau tombol. Gambar tidak boleh diubah bentuknya.
- Transisi halaman memakai View Transitions API **dengan pengaman 400 ms** di `app.js`
  (jangan hapus: di sebagian browser callback transisi tidak dijalankan).
- Hindari nama variabel yang menimpa variabel luar (mis. `m` untuk maskot di dalam fungsi yang
  sudah memakai `m`). Bug ini pernah membuat misi literasi gagal tersimpan.

## Aturan Literasi Matematika

Setiap masalah literasi memiliki 4 tahap (kerangka PISA):
**Memahami** (informasi apa yang diketahui) → **Merumuskan** (model/rumus) →
**Menghitung** (menerapkan) → **Menafsirkan** (makna jawaban dalam konteks).
Konteks harus dekat dengan kehidupan siswa Indonesia.

## Aturan RMT (Rigorous Mathematical Thinking)

Model pembelajaran wajib dari dosen. Analisis, rujukan halaman, dan rencana bertahap:
[docs/08-analisis-rmt.md](docs/08-analisis-rmt.md). Buku sumber ada di `docs/rmt/` (diabaikan git,
JANGAN di-commit). Rujukan "hlm." = halaman cetak buku (halaman PDF = hlm + 8).

**Daftar periksa RMT.** Setiap fitur/konten belajar baru harus memenuhi KETIGA syarat aktivitas
belajar matematika (hlm. 2–3, 124):

1. **Perubahan struktural**: membuat siswa memahami lebih dalam, bukan sekadar mengulang prosedur.
2. **Bagian dari proses membangun konsep**: jelas posisinya di salah satu fase:
   - Fase I Pengembangan Kognitif (Pemanasan);
   - Fase II Konten sebagai Proses (Materi);
   - Fase III Praktik Konstruksi (Latihan, Literasi, Games).
3. **Bahasa & aturan matematika**: memakai istilah dan notasi baku (a, b, n, Uₙ, Sₙ).

Ditambah, bila relevan:

- **Mediasi MLE** di umpan balik, petunjuk, Teman AI, dan Teman Belajar (hlm. 77–81):
  - *intensionalitas–resiprositas*: ajak siswa menjawab, bukan hanya diberi tahu;
  - *makna*: jelaskan mengapa;
  - *transendensi*: hubungkan ke prinsip umum;
  - *rasa mampu*: sebut bagian yang sudah benar dan alasannya.
- **Alat, bukan hanya tampilan** (hlm. 58, 107–109): utamakan siswa memakai atau menyusun tabel
  dan garis bilangan sendiri, daripada hanya melihat hasil jadi.
- **Bukti logis & refleksi** (hlm. 8, 87–88, 166): minta alasan ("mengapa?"), dan bila sesuai,
  sebutkan fungsi kognitif yang dipakai.
- Nama fungsi kognitif, konsep inti, fase, dan makna unit **hanya** diambil dari `js/data/rmt.js`.
  Antarmuka memakai `namaSiswa`.
- **Jangan menyalin** materi *Instrumental Enrichment* (Feuerstein) (hlm. 9). Semua tugas buatan sendiri.
- Buku tidak membahas AI: Teman AI = **alat bantu mediasi**, guru tetap mediator utama (hlm. 160, 195).

**Selaras dengan Teori Beban Kognitif.**
- *Kurangi* beban yang tidak perlu: teks berlebih, split-attention, tekanan waktu. Aturan
  beban kognitif di atas tetap berlaku.
- *Pertahankan* tantangan bermakna: mendefinisikan masalah, menyusun alat, bukti logis, refleksi.
- Langkah RMT tambahan tetap satu ide per layar dan tanpa batas waktu.

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
  "aplikasi": "DeretKu", "versiData": 3, "diekspor": "ISO-8601",
  "idPerangkat": "string", "profil": {"nama": "", "kelas": ""},
  "materiSelesai": ["u1", "u2"],
  "pretes": [{"waktu": "", "skor": 60, "benar": 3, "total": 5, "durasiDetik": 120,
              "jawaban": [{"id": "K02", "benar": true, "miskonsepsi": null, "durasiDetik": 20}]}],
  "pemanasan": [{"waktu": "", "id": "P1", "definisi": true, "benar": true, "fungsiTepat": false}],
  "latihan": [{"waktu": "", "jenis": "suku-n", "level": 1, "benar": true, "petunjuk": 0, "durasiDetik": 30,
               "definisiMasalah": true, "bukti": true, "contoh": false, "aiPesan": 0, "lapisanBantuan": 0}],
  "kuis": [{"waktu": "", "skor": 80, "benar": 12, "total": 15, "durasiDetik": 600,
            "jawaban": [{"id": "K01", "benar": true, "miskonsepsi": null, "durasiDetik": 20}]}],
  "literasi": [{"waktu": "", "id": "L1", "tahap": "Menafsirkan", "benar": true, "percobaan": 1, "tafsiran": "..."}],
  "jurnal": [{"waktu": "", "konteks": "games:balon", "fungsiKognitif": ["A2", "B1"], "refleksi": "..."}],
  "bebanKognitif": [{"waktu": "", "konteks": "materi:u2", "nilai": 4}]
}
```

Jika mengubah format ini, perbarui kedua sisi dan naikkan `versiData`.

Riwayat versi:
- **v1**: format awal.
- **v2** (RMT Tahap 2): `latihan[].definisiMasalah` (bool) dan `latihan[].bukti` (bool, atau `null`
  bila tidak diminta karena jawaban angka salah dua kali atau sesi ditinggalkan sebelum membuktikan).
  Python membaca v1 dan v2. Entri tanpa field ini dilewati saat menghitung persentase, bukan
  dianggap salah.
- **v3** (RMT Tahap 4–7):
  - `pretes` (Tes Awal; butirnya = `pretes` di `bank-soal.json`, juga ada di kuis → gain "sandwich");
  - `pemanasan`;
  - `jurnal` (Jurnal RMT; `fungsiKognitif` = kode `rmt.js`);
  - `latihan[].contoh`, `aiPesan`, `lapisanBantuan` (bantuan sebelum jawaban diperiksa);
  - `literasi[].tafsiran` (hanya tahap Menafsirkan).

  Python membaca v1–v3; laporan §8 "Indikator RMT" ditambah CSV rubrik (`tafsiran_rubrik.csv`,
  `jurnal_rubrik.csv`, `pretes_postes.csv`). `tafsiran` dan `refleksi` adalah **tulisan bebas
  siswa**: hanya dikirim ke Gemini bila siswa sendiri bertanya (konteks Teman AI di Literasi).

## Pengujian

- Python: `python -m unittest discover python/tests`.
- Manual: ikuti daftar uji di [docs/06-rencana-pengujian.md](docs/06-rencana-pengujian.md), utamakan layar HP (DevTools → Toggle device, 360×740).
