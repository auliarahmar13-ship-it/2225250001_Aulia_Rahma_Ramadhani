# 01 — Analisis Kebutuhan

Tahap **Analysis** dalam model pengembangan ADDIE (Analysis, Design, Development,
Implementation, Evaluation).

> ⚠️ Bagian "Temuan Wawancara" masih berupa **temuan sementara** dari kajian
> literatur karena transkrip wawancara belum dilampirkan. Setelah transkrip
> dimasukkan ke [hasil-wawancara.md](hasil-wawancara.md), perbarui tabel di bagian 2.

## 1. Analisis Kurikulum

| Komponen | Isi |
|----------|-----|
| Kurikulum | Kurikulum Merdeka, Fase D (SMP kelas VII–IX) |
| Elemen | Bilangan; Aljabar (pola bilangan) |
| Capaian Pembelajaran | Peserta didik dapat mengenali, memprediksi, dan menggeneralisasi pola dalam bentuk susunan benda dan bilangan |
| Materi | Pola bilangan, barisan aritmatika, suku ke-n, deret aritmatika |

### Tujuan Pembelajaran (TP)
1. TP1: Mengenali pola dan menentukan bilangan berikutnya.
2. TP2: Menjelaskan pengertian barisan aritmatika dan menentukan beda (b).
3. TP3: Menentukan suku ke-n (Uₙ = a + (n − 1)b) dan banyak suku.
4. TP4: Menentukan jumlah n suku pertama (Sₙ).
5. TP5: Menyelesaikan masalah kontekstual (literasi) terkait barisan dan deret aritmatika.

## 2. Temuan Wawancara (Sementara)

| No | Temuan | Jenis beban kognitif | Implikasi desain |
|----|--------|----------------------|------------------|
| 1 | Siswa bingung dengan banyak simbol (a, b, n, Uₙ, Sₙ) yang dikenalkan sekaligus | Intrinsik | Pra-latihan: unit Pola Bilangan dulu; simbol dikenalkan satu per satu |
| 2 | Buku/LKS padat teks; rumus muncul tanpa asal-usul | Ekstrinsik | Kartu bersegmen; rumus dibangun dari tabel pola |
| 3 | Siswa lupa langkah saat mengerjakan soal | Intrinsik / memori kerja | Contoh terselesaikan bertahap; petunjuk bertahap |
| 4 | Siswa sering keliru (n − 1) menjadi n, lupa membagi 2 di Sₙ | Germane belum terbentuk | Umpan balik berbasis miskonsepsi |
| 5 | Soal cerita sulit karena tidak tahu informasi mana yang penting | Ekstrinsik + literasi | 4 tahap literasi: memahami → merumuskan → menghitung → menafsirkan |
| 6 | Siswa cemas dengan batas waktu | Ekstrinsik (afektif) | Kuis tanpa batas waktu |
| 7 | Belajar lebih nyaman lewat HP; kuota terbatas | Akses | PWA ringan dan offline |
| 8 | Suasana belajar membosankan | Motivasi | Musik latar lembut (bisa dimatikan), efek suara umpan balik |

## 3. Analisis Karakteristik Siswa

- Usia 13–15 tahun, tahap operasional formal awal (Piaget): masih butuh representasi konkret/visual.
- Terbiasa dengan HP Android; perhatian mudah teralihkan, sehingga sesi belajar dibuat pendek (5–10 menit per unit).
- Kemampuan awal beragam, sehingga latihan dibuat adaptif tiga level.

## 4. Analisis Teknis

| Kebutuhan | Keputusan |
|-----------|-----------|
| Web + Android tanpa Play Store | PWA (manifest + service worker) |
| HP spesifikasi rendah | Vanilla JS, tanpa framework, < 500 KB |
| Offline | Cache seluruh aset |
| Data penelitian | Ekspor JSON → analisis Python |
| Link permanen | GitHub Pages |

## 5. Kesimpulan

Diperlukan media pembelajaran berbasis PWA yang menerapkan prinsip-prinsip Teori
Beban Kognitif dan kerangka literasi matematika PISA untuk materi barisan dan deret
aritmatika, dilengkapi alat ukur beban kognitif (skala Paas) dan analisis statistik.
