# 06 — Rencana Pengujian

## 1. Uji Fungsional (Black-box)

| ID | Skenario | Hasil yang diharapkan |
|----|----------|-----------------------|
| UF01 | Buka aplikasi pertama kali | Beranda tampil; musik mulai setelah sentuhan pertama (jika aktif) |
| UF02 | Buka unit materi, tekan Lanjut sampai akhir | Kartu berganti satu per satu; skala beban muncul; unit bertanda ✓ |
| UF03 | Tutup aplikasi di tengah unit, buka lagi | Kembali ke kartu terakhir |
| UF04 | Tekan 🔊 pada kartu | Narasi dibacakan; musik mengecil |
| UF05 | Contoh bertahap: tekan "Langkah berikutnya" | Langkah muncul satu per satu |
| UF06 | Latihan: jawab benar 3× tanpa petunjuk | Level naik |
| UF07 | Latihan: salah 2× | Level turun (min. Mudah) |
| UF08 | Latihan: input bilangan negatif dengan tombol ± | Diterima dan dinilai benar |
| UF09 | Kuis 15 soal sampai selesai | Skor, pembahasan, miskonsepsi tampil; tersimpan di riwayat |
| UF10 | Literasi: jawab tahap salah lalu benar | Umpan balik muncul; tahap berikut terbuka setelah benar |
| UF11 | Matikan musik/efek di pengaturan | Suara berhenti; tersimpan setelah dimuat ulang |
| UF12 | Ubah ukuran teks | Seluruh teks membesar |
| UF13 | Ekspor data | Berkas JSON terunduh/terbagi; terbaca oleh `analisis_statistik.py` |
| UF14 | Mode pesawat setelah kunjungan pertama | Semua halaman tetap berjalan |
| UF15 | Pasang aplikasi (Android Chrome) | Ikon muncul di layar utama; terbuka layar penuh |
| UF16 | Hapus data | Progres kembali kosong setelah konfirmasi |

## 2. Uji Perangkat

| Perangkat | Browser | Status |
|-----------|---------|--------|
| Android (RAM 2–3 GB) | Chrome | ☐ |
| Android | Samsung Internet | ☐ |
| iPhone | Safari | ☐ |
| Laptop | Chrome / Edge / Firefox | ☐ |

## 3. Validasi Ahli (Skala Likert 1–4)

**Ahli materi:** kesesuaian dengan CP/TP, kebenaran konsep, kejelasan contoh,
kualitas soal literasi, kesesuaian bahasa.
**Ahli media:** tampilan, navigasi, keterbacaan, suara, kemudahan instalasi, penerapan prinsip CLT.

Kriteria kelayakan: rata-rata skor 3,26–4,00 = Sangat layak; 2,51–3,25 = Layak;
1,76–2,50 = Kurang layak; 1,00–1,75 = Tidak layak.

## 4. Uji Coba Siswa

1. Siswa memasang/membuka aplikasi, mengisi nama & kelas.
2. Mempelajari 4 unit materi (skala beban otomatis tercatat).
3. Latihan minimal 10 soal, 2 masalah literasi, lalu kuis.
4. Ekspor data dan kirim ke guru, lalu letakkan berkas di `python/data_siswa/`.
5. Jalankan `python python/analisis_statistik.py`.
6. Isi angket respons siswa (kemudahan, ketertarikan, manfaat).

## 5. Analisis Data (otomatis oleh Python)

| Analisis | Rumus/metode |
|----------|--------------|
| Statistik deskriptif skor | n, rata-rata, median, simpangan baku, min, maks |
| Tingkat kesukaran butir | p = jumlah benar / jumlah peserta (≤0,30 sukar; 0,31–0,70 sedang; >0,70 mudah) |
| Daya beda | Korelasi point-biserial butir–total terkoreksi |
| Reliabilitas | KR-20 |
| Beban kognitif | Rata-rata & SB skala Paas per konteks |
| Hubungan | Korelasi Pearson rata-rata beban vs skor kuis |
| Efisiensi instruksional | E = (z_skor − z_beban) / √2 |
| Miskonsepsi | Frekuensi kode miskonsepsi pada jawaban salah |
