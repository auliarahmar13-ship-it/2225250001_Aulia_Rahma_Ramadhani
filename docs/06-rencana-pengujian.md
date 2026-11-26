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
| UF17 | Ketuk maskot di Beranda | Anak melompat, bunyi "boing", gelembung penyemangat muncul |
| UF18 | Matikan "Animasi maskot" | Maskot diam |
| UF19 | Balon Pola: ketuk balon benar / salah / biarkan lolos | +poin & kombo / nyawa berkurang / nyawa berkurang; 0 nyawa → layar akhir |
| UF20 | Lompat Katak: jawab benar & salah | Katak melompat tiap suku; benar → menang, salah → tercebur + penjelasan |
| UF22 | Beranda: geser baris poster, ketuk poster Episode 1 | Baris tergeser mulus; halaman materi terbuka dengan transisi halus |
| UF23 | Beranda: ketuk Ari / tombol 🗺️ Peta | Ari melompat & menyapa / halaman bergulir ke Peta Petualangan |
| UF24 | Selesaikan misi literasi | Skala beban muncul; misi bertanda ✓ di poster |
| UF21 | Menara Angka: ketuk penyusup | Balok bergoyang, pesan "penyusup"; 8 ronde → bintang & rekor tersimpan |

| UF25 | Tes Awal: kerjakan 5 soal | Tanpa umpan balik per soal; hasil tersimpan; tidak bisa diulang; Beranda lanjut ke Pemanasan |
| UF26 | Pemanasan: 6 tugas (definisikan → kerjakan → namai fungsi) | Jembatan tampil; catatan & jurnal tersimpan; selesai → Materi u1 |
| UF27 | Materi u2 garis bilangan / u3 tabel interaktif | Lanjut terkunci sampai alat dipakai; tabel menandai sel salah; rumus dipilih sendiri |
| UF28 | Latihan: "Apa yang ditanyakan?" → hitung → "Buktikan" | Langkah berurutan; bukti hanya bila angka benar; fungsi berpikir tampil |
| UF29 | Literasi tahap Menafsirkan | Pilihan tersembunyi sampai tafsiran ≥ 1 kalimat ditulis |
| UF30 | Games: layar akhir | Pertanyaan refleksi strategi; tersimpan di Jurnal RMT |
| UF31 | Saya → Jurnal RMT: tulis refleksi | Rekap fungsi diperbarui; teks tampil apa adanya |
| UF32 | Teman AI (server menyala) | Bertanya balik, minta bukti, tidak memberi jawaban akhir; pesan kuota ramah |
| UF33 | Ekspor data → `analisis_statistik.py` | `versiData: 3`; laporan §8 Indikator RMT + CSV rubrik |

Uji otomatis: `python -m unittest discover python/tests` (bank soal, statistik, RMT, Gemini tiruan, endpoint API).

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
**Ahli model RMT:** kesesuaian 3 fase, alat, bukti logis, kriteria MLE, asesmen dinamis.
Butir lengkap: [12-lembar-validasi-ahli.md](12-lembar-validasi-ahli.md).

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
