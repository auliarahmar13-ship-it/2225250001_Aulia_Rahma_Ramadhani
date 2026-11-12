# PRD — DeretKu: Aplikasi Belajar Barisan & Deret Aritmatika

**Dokumen:** Product Requirements Document
**Versi:** 1.0 · 11 November 2026
**Penyusun:** Mahasiswa S1 Pendidikan Matematika
**Status:** Disetujui untuk pengembangan MVP

---

## 1. Latar Belakang

Barisan dan deret aritmatika adalah materi SMP (Fase D, Kurikulum Merdeka) yang
banyak memakai simbol (a, b, n, Uₙ, Sₙ), rumus, dan langkah berurutan. Dari studi
pendahuluan (wawancara siswa, lihat [docs/hasil-wawancara.md](docs/hasil-wawancara.md)) dan kajian
teori beban kognitif (Cognitive Load Theory, Sweller), siswa cepat kewalahan bila:

- terlalu banyak informasi baru muncul sekaligus (beban **intrinsik** tinggi),
- tampilan materi membingungkan: teks dan gambar terpisah, banyak hiasan,
  rumus langsung tanpa makna (beban **ekstrinsik** tinggi),
- tidak ada contoh langkah demi langkah sehingga siswa tidak sempat membangun
  skema (beban **germane** rendah).

Selain itu, kemampuan **literasi matematika** siswa (merumuskan, menerapkan, dan
menafsirkan matematika dalam konteks nyata, kerangka PISA) masih perlu
ditumbuhkan. Soal cerita sering dianggap sulit karena siswa tidak tahu harus
mulai dari mana.

## 2. Pernyataan Masalah

> Siswa SMP mengalami beban kognitif berlebih saat mempelajari barisan dan deret
> aritmatika, sehingga pemahaman konsep dan kemampuan menyelesaikan masalah
> kontekstual (literasi matematika) belum optimal.

## 3. Tujuan Produk

| No | Tujuan | Indikator |
|----|--------|-----------|
| T1 | Menurunkan beban kognitif ekstrinsik saat belajar | Rata-rata skala usaha mental (Paas 1–9) ≤ 5 pada bagian materi |
| T2 | Meningkatkan pemahaman konsep barisan & deret aritmatika | Rata-rata skor kuis ≥ 75 |
| T3 | Menumbuhkan literasi matematika | ≥ 70% tahap *menafsirkan* pada soal literasi dijawab benar |
| T4 | Mudah diakses kapan saja | Bisa dibuka di browser, dipasang di Android/iOS tanpa store, berjalan offline |
| T5 | Menyediakan data untuk penelitian | Data dapat diekspor (JSON) dan dianalisis dengan skrip Python |

## 4. Pengguna Sasaran

| Persona | Deskripsi | Kebutuhan utama |
|---------|-----------|-----------------|
| **Siswa SMP (kelas VIII–IX)**, 13–15 tahun | Memakai HP Android kelas menengah ke bawah, kuota terbatas | Materi singkat dan jelas, bisa offline, tidak membosankan |
| **Guru Matematika** | Memakai aplikasi di kelas atau sebagai tugas | Bahan siap pakai, rekap hasil siswa |
| **Peneliti (mahasiswa)** | Mengumpulkan data beban kognitif dan hasil belajar | Ekspor data dan analisis statistik |

## 5. Ruang Lingkup

### 5.1 Termasuk (MVP)
1. **Materi** 4 unit bersegmen: Pola Bilangan → Barisan Aritmatika → Suku ke-n → Deret Aritmatika.
2. **Latihan** adaptif dengan soal acak tanpa batas, petunjuk bertahap, dan contoh soal terselesaikan.
3. **Kuis** 15 soal pilihan ganda dengan pembahasan; pengecoh disusun dari miskonsepsi.
4. **Literasi Matematika**: 5 masalah kontekstual dengan 4 tahap (Memahami → Merumuskan → Menghitung → Menafsirkan).
5. **Suara**: musik latar (dibuat dengan Web Audio, tanpa file dan tanpa masalah hak cipta), efek suara benar/salah, dan narasi teks-ke-suara.
6. **Skala beban kognitif** (Paas, 1–9) setelah setiap unit materi, latihan, dan kuis.
7. **Profil & pengaturan**: progres, riwayat, ekspor data, musik on/off, ukuran teks.
8. **PWA**: dapat dipasang dari browser, berjalan offline.
9. **Games aritmatika** (3 game): Balon Pola, Lompat Katak, Menara Angka, dengan skor, bintang, dan rekor.
10. **Maskot animasi**: 4 teman belajar yang bergoyang, melambai, berkedip, dan melompat saat disentuh.
11. **Python**: pembuat bank soal (dengan verifikasi kunci), pembuat ikon, server lokal, analisis statistik.

### 5.2 Tidak Termasuk (MVP)
- Akun/login dan server basis data (data tersimpan di perangkat siswa).
- Barisan/deret geometri.
- Dasbor guru daring secara real-time (diganti ekspor dan analisis Python).

## 6. Kebutuhan Fungsional & User Story

### F1 — Materi bersegmen
*Sebagai siswa, saya ingin materi disajikan sedikit demi sedikit agar saya tidak kewalahan.*
- Satu kartu = satu ide; ada tombol Lanjut/Kembali dan indikator kemajuan.
- Teks dan visual disatukan dalam satu kartu (tidak ada *split-attention*).
- Contoh soal terselesaikan ditampilkan **langkah demi langkah** (tombol "Langkah berikutnya").
- Ada "Cek Pemahaman" singkat dengan umpan balik langsung.
- Ada tombol 🔊 untuk mendengarkan narasi kartu (prinsip modalitas).
- Unit 1 berfungsi sebagai *pre-training* (pola bilangan) sebelum simbol formal.
- **Kriteria terima:** setiap unit memiliki ringkasan; progres tersimpan; unit ditandai selesai di akhir.

### F2 — Latihan adaptif
*Sebagai siswa, saya ingin berlatih dengan bantuan yang bisa saya buka saat butuh.*
- 5 jenis soal: beda, suku berikutnya, suku ke-n, banyak suku (n), jumlah n suku.
- 3 level (Mudah/Sedang/Sulit): naik setelah 3 benar berturut-turut tanpa petunjuk, turun setelah 2 salah berturut-turut.
- Petunjuk bertahap (maks. 3) dan tombol "Lihat contoh" (*worked example*) dengan bilangan berbeda.
- Pada level Mudah, kerangka rumus ditampilkan otomatis (*faded scaffolding*).
- Input angka dengan tombol ± untuk bilangan negatif (ramah keyboard HP).

### F3 — Kuis
*Sebagai siswa, saya ingin menguji pemahaman dan tahu letak kesalahan saya.*
- 15 soal dari `data/bank-soal.json` (dibuat oleh Python), urutan opsi diacak.
- Satu soal per layar, **tanpa batas waktu** (mengurangi kecemasan atau beban tambahan).
- Hasil: skor, pembahasan tiap soal, dan nama miskonsepsi bila jawaban salah.

### F4 — Literasi Matematika
*Sebagai siswa, saya ingin belajar menyelesaikan soal cerita dengan langkah yang jelas.*
- Setiap masalah memiliki stimulus kontekstual dan 4 tahap pertanyaan.
- Tahap terbuka satu per satu; umpan balik langsung menjelaskan alasannya.

### F5 — Suara
- Musik latar lembut yang dapat dimatikan atau diatur volumenya; berhenti otomatis saat aplikasi tidak terlihat.
- Volume musik turun otomatis saat narasi berbicara.
- Efek suara benar, salah, klik, dan selesai.

### F6 — Skala Beban Kognitif
- Muncul setelah unit materi, sesi latihan, kuis, dan literasi; dapat dilewati.
- Pertanyaan: *"Seberapa besar usaha mental yang kamu keluarkan?"* (1 = sangat-sangat ringan … 9 = sangat-sangat berat).

### F7 — Profil, Pengaturan, Ekspor
- Nama & kelas (opsional), ringkasan progres, riwayat kuis.
- Ekspor data JSON (bagikan lewat WhatsApp/unduh) untuk dianalisis guru/peneliti.
- Hapus data, atur musik/efek/narasi/ukuran teks.

### F8 — Instalasi & Offline
- Tombol "Pasang Aplikasi" (Android/Chrome) dan panduan untuk iPhone (Safari → Bagikan → Tambah ke Layar Utama).
- Seluruh aset di-cache oleh *service worker*; aplikasi berjalan tanpa internet setelah dibuka sekali.

### F10 — Games Aritmatika
*Sebagai siswa, saya ingin berlatih sambil bermain agar tidak bosan.*
- **Balon Pola 🎈**: ketuk balon berisi suku yang hilang; 3 nyawa, kombo, makin cepat.
- **Lompat Katak 🐸**: pilih panjang lompatan (beda) agar katak tepat di bunga, atau tebak posisi akhir (Uₙ); 8 ronde.
- **Menara Angka 🧱**: susun 4 balok menjadi barisan aritmatika dan hindari 1 balok penyusup; 8 ronde.
- Setiap game memiliki layar cara main, skor, 0–3 bintang, rekor tersimpan, konfeti, dan pembahasan singkat.
- Games bersifat santai (Balon Pola memakai kecepatan). Latihan terarah tanpa batas waktu tetap di menu Latihan.

### F11 — Maskot & Tema Ceria
- 4 karakter siswa berseragam (SVG buatan sendiri) di Beranda, Games, dan layar selesai.
- Animasi: bergoyang, melambai, berkedip; disentuh → melompat + gelembung kata penyemangat.
- Tema pink–ungu, ikon gradasi pink–ungu, musik latar ceria.
- Animasi dapat dimatikan dan otomatis mati bila pengguna memilih "kurangi gerakan".

### F9 — Analisis Statistik (Python)
- Statistik deskriptif skor kuis, tingkat kesukaran butir (p), daya beda (korelasi point-biserial), reliabilitas KR-20.
- Frekuensi miskonsepsi, rata-rata beban kognitif per konteks, korelasi beban kognitif dengan skor.
- Keluaran: laporan Markdown + CSV (+ grafik bila *matplotlib* terpasang).

## 7. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|-------|-----------|
| Kinerja | Muat awal < 3 detik di 4G; ukuran total aplikasi < 500 KB |
| Kompatibilitas | Chrome Android 90+, Safari iOS 15+, browser desktop modern |
| Responsif | Lebar 320 px–1440 px, tanpa scroll horizontal; target sentuh ≥ 48 px |
| Aksesibilitas | Kontras WCAG AA, label tombol, mode gelap otomatis, ukuran teks dapat diperbesar |
| Offline | Seluruh fitur berjalan offline setelah kunjungan pertama |
| Privasi | Tidak ada data dikirim ke server; ekspor hanya atas tindakan pengguna |
| Ketersediaan | Di-*hosting* di GitHub Pages (gratis, HTTPS, tanpa masa kedaluwarsa) |
| Bahasa | Seluruh antarmuka dalam Bahasa Indonesia yang ramah siswa |

## 8. Metrik Keberhasilan

- Rata-rata skala usaha mental pada materi ≤ 5 dari 9.
- Rata-rata skor kuis ≥ 75; tingkat kesukaran butir tersebar (mudah–sedang–sulit).
- ≥ 80% siswa menyelesaikan minimal 3 dari 4 unit materi.
- Hasil uji kelayakan ahli media dan ahli materi ≥ "Layak" (skala Likert ≥ 3,25 dari 4).

## 9. Asumsi, Risiko, Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| HP siswa spesifikasi rendah | Tanpa *framework*, tanpa *build*, aset minimal |
| Kuota internet terbatas | PWA offline, ukuran kecil |
| Suara Indonesia (TTS) tidak tersedia di perangkat | Tombol narasi disembunyikan bila tidak ada `speechSynthesis`; memakai suara bawaan |
| Musik mengganggu konsentrasi (beban ekstrinsik) | Volume rendah bawaan, mudah dimatikan, turun saat narasi |
| Animasi/games mengalihkan perhatian dari materi | Animasi hanya di Beranda/Games/layar selesai, bukan di kartu materi atau soal; bisa dimatikan |
| Data siswa hilang saat ganti HP | Fitur ekspor; dijelaskan di panduan guru |
| Layanan *hosting* berubah | Kode di GitHub; bisa dipindah ke Netlify/Vercel dalam hitungan menit |

## 10. Rilis

| Tahap | Isi | Lihat |
|-------|-----|-------|
| v0.1 | Dokumen perencanaan | `docs/` |
| v1.0 (MVP) | Semua fitur F1–F9 | [docs/05-rencana-pengembangan.md](docs/05-rencana-pengembangan.md) |
| v1.1 | Revisi dari uji ahli dan uji coba terbatas | [docs/06-rencana-pengujian.md](docs/06-rencana-pengujian.md) |
| v2.0 (opsional) | Barisan & deret geometri, dasbor guru | — |

## 11. Dokumen Terkait

- [CLAUDE.md](CLAUDE.md): panduan untuk AI asisten/pengembang
- [docs/01-analisis-kebutuhan.md](docs/01-analisis-kebutuhan.md)
- [docs/02-desain-pembelajaran.md](docs/02-desain-pembelajaran.md)
- [docs/03-arsitektur-teknis.md](docs/03-arsitektur-teknis.md)
- [docs/04-konten-materi.md](docs/04-konten-materi.md)
- [docs/05-rencana-pengembangan.md](docs/05-rencana-pengembangan.md)
- [docs/06-rencana-pengujian.md](docs/06-rencana-pengujian.md)
- [docs/07-panduan-deploy.md](docs/07-panduan-deploy.md)
- [docs/hasil-wawancara.md](docs/hasil-wawancara.md)
