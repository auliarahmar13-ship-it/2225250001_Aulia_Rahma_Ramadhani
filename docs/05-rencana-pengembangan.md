# 05 — Rencana Pengembangan

Model: **ADDIE**. Estimasi total ± 8 minggu (menyesuaikan jadwal skripsi).

| Minggu | Tahap | Kegiatan | Keluaran |
|--------|-------|----------|----------|
| 1 | Analysis | Wawancara siswa & guru, analisis kurikulum | `docs/01`, `docs/hasil-wawancara.md` |
| 2 | Design | Desain pembelajaran, alur, konten, arsitektur | `PRD.md`, `docs/02–04` |
| 3–4 | Development | Pembuatan aplikasi (lihat daftar tugas) | Folder `app/`, `python/` |
| 5 | Development | Validasi ahli materi & ahli media, revisi | Lembar validasi, v1.1 |
| 6 | Implementation | Uji coba terbatas (6–10 siswa), kemudian uji lapangan (1 kelas) | Data ekspor siswa |
| 7 | Evaluation | Analisis statistik, angket respons siswa | `python/hasil/` |
| 8 | Evaluation | Revisi akhir dan penulisan laporan | v1.2 + laporan |

## Daftar Tugas Development

### A. Fondasi
- [x] Struktur folder, `.vscode`, `.gitignore`
- [x] `index.html`, `manifest.webmanifest`, `sw.js`
- [x] `css/style.css` (token warna, mode gelap, responsif)
- [x] `js/state.js` (simpan/muat/ekspor), `js/app.js` (router)

### B. Python
- [x] `serve.py` server lokal
- [x] `buat_ikon.py` ikon PWA
- [x] `generate_bank_soal.py` 15 butir + verifikasi
- [x] `analisis_statistik.py` + `buat_data_contoh.py`
- [x] `tests/` unittest

### C. Fitur
- [x] Beranda + peta belajar
- [x] Materi 4 unit (kartu, contoh bertahap, cek pemahaman, narasi)
- [x] Latihan adaptif 5 jenis
- [x] Literasi 5 masalah × 4 tahap
- [x] Kuis + pembahasan + miskonsepsi
- [x] Skala beban kognitif
- [x] Profil, pengaturan, ekspor
- [x] Musik latar & efek suara

### D. Rilis
- [x] Buat repositori GitHub dan unggah kode
- [ ] Aktifkan GitHub Pages (lihat `docs/07-panduan-deploy.md`)
- [ ] Uji di minimal 2 HP Android & 1 iPhone
- [ ] Isi transkrip wawancara dan perbarui `docs/01`

### E. Model RMT & Teman AI (lihat `docs/08-analisis-rmt.md` §9)
- [x] Teman AI (Gemini lewat backend Python, model cadangan)
- [x] Tahap 0 Fondasi · Tahap 1 Teman AI mediator · Tahap 2 Latihan RMT
- [x] Tahap 3 Materi · Tahap 4 Pemanasan Berpikir · Tahap 5 Literasi · Tahap 6 Games
- [x] Tahap 7 Evaluasi (Tes Awal, lapisan bantuan, Jurnal RMT, versiData 3, rubrik `docs/10`)
- [x] Tahap 8 Panduan guru (`docs/11`) & lembar validasi (`docs/12`); validasi ahli oleh validator: belum

### F. XP, Pencapaian & Kalender Belajar (disetujui; dibuat SETELAH hosting, dengan persetujuan)
Rancangan agar selaras RMT dan tidak membuat tampilan rumit:
- **XP untuk proses, bukan kecepatan**: mendefinisikan masalah, memberi bukti, menulis tafsiran,
  refleksi jurnal, dan menyelesaikan unit. Tidak ada XP untuk menebak atau kecepatan.
- **Pencapaian** ±10 lencana yang dinamai fungsi berpikir (mis. "📌 Pemburu Keajekan" setelah
  10× konservasi keajekan; "🧾 Pembukti" setelah 10 bukti tepat). Ditampilkan di Saya, tanpa
  papan peringkat antarsiswa (menghindari tekanan dan perbandingan).
- **Kalender belajar**: kalender bulan di Saya, menandai hari belajar dari data yang sudah ada.
  Siswa bisa menulis catatan singkat per hari, terhubung ke Jurnal RMT. Ada pengingat lembut,
  tanpa hukuman bila putus.
- Disimpan local-first di `state.js` dan ikut sinkron ke Supabase (Tahap 6 hosting). Perlu versiData 4.

### G. Hosting Publik & PWA: Vercel + Supabase (local-first). Audit 2026-11-26 menggantikan rencana Render di `docs/09`
- [x] Tahap 1: selesaikan RMT Tahap 7–8 (lokal)
- [ ] Tahap 2: backend Python untuk Vercel (modul API bersama + pembungkus WSGI) + perbaikan PWA (lokal)
- [ ] Tahap 3: commit & push (dengan persetujuan) → deploy Vercel → URL publik HTTPS
- [ ] Tahap 4: uji instalasi PWA (Android, iPhone, Windows) & offline
- [ ] Tahap 5: proyek Supabase + skema + RLS, uji dua akun
- [ ] Tahap 6: login (opsi diputuskan) + sinkronisasi + migrasi data lokal
- [ ] Tahap 7: Teman AI wajib login + audit keamanan
- [ ] Tahap 8: dokumentasi & uji menyeluruh
- [ ] Setelah itu: XP, pencapaian, kalender (bagian F)

## Definisi Selesai (Definition of Done)
- Fitur bekerja di layar 360 px dan desktop, offline, mode terang & gelap.
- Lolos daftar periksa CLT di `CLAUDE.md`.
- `CACHE_VERSION` dinaikkan, unittest Python lulus.
