# 10 — Rubrik Analitik RMT (Penjelasan Tertulis & Jurnal)

Rubrik ini dipakai guru untuk menilai **tulisan siswa** di DeretKu:
- **Tafsiran** tahap Menafsirkan pada Misi Literasi (`tafsiran_rubrik.csv`);
- **Refleksi** di Jurnal RMT (`jurnal_rubrik.csv`).

Kedua berkas CSV dibuat oleh `python/analisis_statistik.py` di folder `python/hasil/`, dengan
kolom **K1–K4** yang masih kosong untuk diisi skor 1–4.

**Dasar (Kinard & Kozulin, hlm. cetak; lihat [08-analisis-rmt.md](08-analisis-rmt.md)):**
- Asesmen RMT memakai rubrik, terutama rubrik analitik, entri jurnal, dan penjelasan tertulis
  siswa tentang cara memecahkan masalah (hlm. 167).
- Yang diukur antara lain pemakaian bahasa kognitif dan matematis serta disposisi terhadap
  rigor (hlm. 166–167).

## Kriteria dan Tingkat

| Kriteria | 4 — Sangat baik | 3 — Baik | 2 — Berkembang | 1 — Perlu bimbingan |
|---|---|---|---|---|
| **K1 Bahasa matematika** (A5 *Encoding-decoding*; hlm. 86, 118) | Memakai istilah dan simbol baku dengan tepat (a, b, n, Uₙ, Sₙ, beda, suku) dan konsisten | Istilah umumnya tepat, ada sedikit kekeliruan kecil | Istilah sehari-hari bercampur; simbol kadang tertukar (mis. Uₙ dengan Sₙ) | Tidak memakai istilah matematika, atau keliru secara mendasar |
| **K2 Bukti logis** (C2 *Providing and articulating mathematical logical evidence*; hlm. 87, 166) | Alasan lengkap dan runtut: aturan + perhitungan + kesimpulan ("cukup karena 192.000 > 180.000") | Alasan benar tetapi satu bagian tidak disebut (mis. tanpa angka pembanding) | Hanya menyebut hasil atau kesan ("kayaknya cukup") | Tanpa alasan, atau alasan bertentangan dengan hitungan |
| **K3 Kesadaran fungsi berpikir** (C13 *Elaborating mathematical activity through cognitive categories*; hlm. 88, 152) | Menyebut fungsi berpikir yang dipakai dengan tepat **dan** menjelaskan bagaimana memakainya | Menyebut fungsi berpikir yang tepat tanpa penjelasan | Menyebut fungsi berpikir yang kurang sesuai dengan kegiatannya | Tidak ada refleksi tentang cara berpikir |
| **K4 Keterhubungan** (C5 *Projecting and restructuring relationships*, transendensi; hlm. 78–79, 87) | Mengaitkan jawaban dengan konteks cerita **dan** prinsip umum atau situasi lain | Mengaitkan jawaban dengan konteks cerita | Menjawab angka saja tanpa makna dalam cerita | Kaitan dengan konteks keliru |

**Skor total** = K1 + K2 + K3 + K4 (4–16). Interpretasi yang disarankan:
- **13–16**: rigor tinggi;
- **9–12**: berkembang;
- **4–8**: perlu mediasi lanjutan.

Kriteria K3 paling cocok untuk entri **jurnal**. Untuk **tafsiran literasi**, K3 boleh diberi
skor hanya bila siswa menyebut cara berpikirnya; bila tidak, tulis "–" dan hitung skor dari
K1, K2, dan K4 (rentang 3–12).

## Contoh Penilaian (Misi L1 "Tabungan Sepatu Rina")

| Tulisan siswa | K1 | K2 | K3 | K4 | Catatan |
|---|---|---|---|---|---|
| "Cukup, karena total tabungan S₁₂ = 192.000 lebih besar dari harga sepatu 180.000, jadi masih sisa 12.000." | 4 | 4 | – | 4 | Istilah baku, perbandingan angka, makna dalam cerita |
| "Cukup karena uangnya banyak." | 1 | 2 | – | 2 | Hanya kesan, tanpa angka pembanding |
| Jurnal: "Aku memakai Membandingkan: aku hitung 8 − 5 dan 11 − 8 dulu untuk cari beda." | 3 | 3 | 4 | 2 | Kesadaran fungsi sangat baik |

## Indikator Disposisi Rigor (diamati, tidak dinilai dari tulisan)

Disposisi rigor (hlm. 4, 124: gigih menghadapi tantangan) dibaca dari data aplikasi pada
laporan Python:
- **Lapisan bantuan** yang makin sedikit dari waktu ke waktu (§8.2) → makin mandiri.
- **Mencoba lagi** setelah salah: `percobaan` di Literasi, jawaban kedua di Latihan.
- Memilih **Mode Teliti** di Balon Pola dan strategi refleksi yang bernalar (Jurnal, konteks `games:`).

## Cara Memakai

1. Kumpulkan berkas ekspor siswa ke `python/data_siswa/` (berkas ini berisi data pribadi siswa
   dan **tidak** ikut ke GitHub).
2. Jalankan `python python/analisis_statistik.py`.
3. Buka `python/hasil/tafsiran_rubrik.csv` dan `jurnal_rubrik.csv` di Excel atau LibreOffice
   (pemisah `;`), lalu isi K1–K4.
4. Sebaiknya dua penilai menilai sebagian tulisan yang sama untuk memeriksa kesepakatan antarpenilai.
