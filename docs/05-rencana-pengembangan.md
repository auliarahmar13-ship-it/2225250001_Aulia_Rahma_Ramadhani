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
- [ ] Buat repositori GitHub dan unggah kode
- [ ] Aktifkan GitHub Pages (lihat `docs/07-panduan-deploy.md`)
- [ ] Uji di minimal 2 HP Android & 1 iPhone
- [ ] Isi transkrip wawancara dan perbarui `docs/01`

## Definisi Selesai (Definition of Done)
- Fitur bekerja di layar 360 px dan desktop, offline, mode terang & gelap.
- Lolos daftar periksa CLT di `CLAUDE.md`.
- `CACHE_VERSION` dinaikkan, unittest Python lulus.
