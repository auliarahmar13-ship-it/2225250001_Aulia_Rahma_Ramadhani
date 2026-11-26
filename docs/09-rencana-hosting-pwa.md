# 09 — Rencana Hosting Publik & PWA (Vercel + Supabase, local-first)

Rencana ini disetujui pengguna pada 2026-11-26. Rencana lama (GitHub Pages + Render) diganti
karena Netlify dan GitHub Pages tidak bisa menjalankan backend Python, sedangkan Render tidur
dan butuh sekitar 1 menit untuk bangun.

## 1. Kebutuhan

| No | Kebutuhan | Ukuran berhasil |
|---|---|---|
| K1 | URL publik HTTPS yang stabil | Bisa dibuka siapa saja, kapan saja, tanpa laptop pengembang menyala |
| K2 | PWA di Android, iPhone/iPad, dan Windows | Ikon di layar utama atau Start Menu; terbuka layar penuh |
| K3 | Offline sejauh mungkin | Mode pesawat setelah kunjungan pertama: semua fitur kecuali Teman AI |
| K4 | Teman AI tetap Python + Gemini + model cadangan | `POST /api/tanya` menjawab di versi publik |
| K5 | Data tersimpan dan tersinkron aman | Login Supabase + RLS (Tahap 5–6) |
| K6 | API key dan buku RMT tidak terunggah | Kunci hanya di variabel rahasia Vercel; `docs/rmt/` diabaikan git |
| K7 | Gratis | Hanya paket gratis; tidak menambahkan metode pembayaran |

## 2. Arsitektur

```
Siswa (browser / PWA)  ── offline: semua aset di cache service worker; data di localStorage
   │
   ▼
Vercel (satu domain HTTPS, mis. https://<proyek>.vercel.app)
   ├─ app/          → disajikan statis (CDN), tanpa build
   └─ api/tanya.py  → fungsi Python (Teman AI), memakai python/api_tanya.py + python/gemini.py
                       GEMINI_API_KEY di Environment Variables Vercel
   │
   ├──► Gemini API (model utama + cadangan)
   └──► Supabase (Tahap 5–6): Auth + Postgres + RLS, untuk sinkronisasi local-first
```

| Bagian | Fakta yang diverifikasi (2026-11-26) |
|---|---|
| Vercel Python | Fungsi di `api/*.py` berupa kelas `handler` turunan `BaseHTTPRequestHandler`. `api/tanya.py` melayani `/api/tanya`. Direktori kerja = akar proyek. |
| Vercel Hobby | Gratis; 1 juta pemanggilan fungsi per bulan; durasi maksimal 300 dtk. Syarat penggunaan komersial tidak disebut di halaman paket; baca syarat layanan saat mendaftar. |
| Vercel `X-Forwarded-For` | Ditimpa Vercel (tidak bisa dipalsukan klien) → aman untuk rate limit per IP. |
| Netlify | Dokumentasi Functions hanya menyebut JS/TS/Go; Python tidak disebut → tidak dipilih. |
| Supabase Free | 2 proyek aktif, DB 500 MB, 50.000 MAU; **proyek dijeda setelah 1 minggu tanpa aktivitas** → aplikasi harus tetap berjalan tanpa Supabase (local-first). |

## 3. Evaluasi PWA (diperbarui)

| Berkas | Kondisi |
|---|---|
| `app/manifest.webmanifest` | ✅ `id`/`start_url`/`scope` relatif, ikon 192/512/maskable, `standalone`. ✅ Kunci orientasi potret **dihapus** (Tahap 2) agar laptop bebas. 🟡 Belum ada `screenshots` (opsional). |
| `app/sw.js` | ✅ Offline-first, cache berversi, navigasi ke `index.html`, tidak menyentuh POST Teman AI. ✅ Tes kini memastikan **semua** berkas `app/` (bukan hanya JS) terdaftar, dan tidak ada entri yang hilang. |
| `app/js/pasang.js` | ✅ Tombol pasang di Android/Windows. ✅ **iPad modern** (mengaku Mac) kini dikenali untuk petunjuk "Tambah ke Layar Utama" (Tahap 2). |
| `vercel.json` | `sw.js` tanpa cache browser; MIME manifest; header keamanan dasar. |

## 4. Keamanan

- `GEMINI_API_KEY` hanya di `.env` (lokal, diabaikan git) dan Environment Variables Vercel.
  Tes memastikan tidak ada pola kunci di berkas yang di-deploy.
- Endpoint: cek Origin, JSON, 16 KB, rate limit per IP (per instance di Vercel), validasi isi,
  dan galat aman. Tahap 7: hanya untuk siswa yang login.
- Supabase: kunci **publishable** saja di frontend, dengan RLS `auth.uid() = user_id` dan hak
  bawaan `anon` dicabut. Kunci **secret** tidak pernah di frontend atau repositori.
- Data siswa asli (`python/data_siswa/`) dan buku RMT (`docs/rmt/`) diabaikan git.
- Repositori GitHub akan **publik** atau privat sesuai pilihan pengguna. Vercel bisa deploy dari
  repositori privat.

## 5. Tahapan (berhenti setiap tahap untuk diuji pengguna)

| Tahap | Isi | Status |
|---|---|---|
| 1 | Selesaikan RMT Tahap 7–8 (lokal) | ✅ 2026-11-26 |
| 2 | Backend untuk Vercel (`python/api_tanya.py` bersama, `api/tanya.py`, `vercel.json`), model cadangan lebih cepat, perbaikan PWA | ✅ 2026-11-26 (lokal) |
| 3 | Commit & push (izin) → hubungkan repositori ke Vercel → isi `GEMINI_API_KEY` → **URL publik** | ⬜ |
| 4 | Uji pasang PWA (Android, iPhone, Windows) & offline di URL publik | ⬜ |
| 5 | Proyek Supabase + `supabase/skema.sql` (tabel + RLS) + uji dua akun | ⬜ |
| 6 | Login (opsi diputuskan) + sinkronisasi + migrasi data lokal | ⬜ |
| 7 | Teman AI wajib login + audit keamanan | ⬜ |
| 8 | Dokumentasi & uji menyeluruh | ⬜ |

**Hal yang diverifikasi saat Tahap 3** (belum bisa diuji tanpa deploy):
- pola `includeFiles` `{python/*.py,app/js/data/rmt.js}` diterima Vercel;
- `buildCommand: null` + `outputDirectory: "app"` menyajikan `app/` dengan benar.

Bila salah satu ditolak, `vercel.json` disesuaikan berdasarkan log deploy.
