# 11 — Panduan Guru sebagai Mediator RMT

Panduan ini untuk **guru** yang memakai DeretKu di kelas dengan model **Rigorous Mathematical
Thinking (RMT)**. Rujukan "hlm." = halaman cetak buku Kinard & Kozulin (lihat
[08-analisis-rmt.md](08-analisis-rmt.md)).

> **Prinsip utama:** guru RMT adalah "pertama-tama seorang mediator" (hlm. 160). DeretKu dan
> **Teman AI hanya alat bantu mediasi**. Buku RMT tidak membahas AI, sehingga guru tetap mediator
> utama (hlm. 160, 195).

## 1. Alur Belajar = Fase RMT

| Urutan di aplikasi | Fase RMT (hlm. 123) | Peran guru |
|---|---|---|
| 1. **Tes Awal** (5 soal) | Asesmen dinamis, bagian awal "sandwich" (hlm. 60) | Jelaskan bahwa tes ini tidak dinilai; minta siswa jujur |
| 2. **Pemanasan Berpikir** (6 tugas pola gambar) | **Fase I** Pengembangan Kognitif | Diskusikan nama fungsi berpikir; minta siswa mencatatnya di Jurnal |
| 3–6. **Materi** u1–u4 (garis bilangan, tabel, jembatan) | **Fase II** Konten sebagai Proses | Biarkan siswa menyusun tabel sendiri sebelum rumus muncul; diskusikan kartu 🌉 Jembatan |
| 7. **Latihan** (Apa yang ditanyakan? → Hitung → Buktikan) | **Fase III** Praktik Konstruksi | Minta siswa membacakan buktinya; bahas pengecoh yang dipilih |
| 8. **Literasi** (tafsiran tertulis) | **Fase III** | Minta beberapa siswa membacakan tafsirannya, lalu bandingkan |
| Games (kapan saja) dengan refleksi strategi | **Fase III** | Sarankan Mode Teliti; tanyakan strategi |
| 9. **Kuis** | Asesmen dinamis, bagian akhir "sandwich" | Bandingkan dengan Tes Awal (laporan §8.1) |

Fase-fase ini **tidak harus kaku dan linear** (hlm. 122, 124). Siswa boleh kembali ke tahap
sebelumnya kapan saja.

## 2. Pertanyaan Mediator (dari dialog kelas dalam buku)

| Tujuan (kriteria MLE) | Contoh pertanyaan guru | Hlm. |
|---|---|---|
| Mendefinisikan masalah dulu | "Sebelum menghitung: apa yang ditanyakan soal ini? Satu suku atau jumlahnya?" | 137 |
| Bahasa yang presisi | "Coba katakan lagi dengan lengkap memakai a, b, dan n." | 139 |
| Meminta bukti logis | "Apa buktimu? Bagaimana kamu tahu bedanya 3?" | 166 |
| Parafrasa (resiprositas) | "Jadi maksudmu …? Apakah aku mendengarmu dengan benar?" | 142 |
| Cara lain | "Bisakah kamu menjelaskannya dengan cara lain, misalnya dengan garis bilangan?" | 184–185 |
| Merangkum | "Siapa yang bisa merangkum apa yang kita temukan hari ini?" | 143 |
| Makna | "Mengapa rumus Uₙ berguna? Kapan kamu memakainya?" | 80 |
| Transendensi | "Di mana lagi kamu melihat sesuatu yang bertambah tetap?" | 78–79 |
| Rasa mampu | "Bagian ini sudah benar karena … Sekarang coba bagian berikutnya." | 81 |

## 3. Pertanyaan Perencanaan Guru (hlm. 160–161)

Sebelum pelajaran, guru menjawab untuk dirinya sendiri:
1. Apa yang saya ketahui tentang kelas dan tiap siswa? (Lihat Tes Awal dan miskonsepsi kuis.)
2. Apa niat saya hari ini, dan bagaimana siswa ikut berbagi niat itu?
3. Fungsi berpikir apa yang dilatih, dan konsep inti apa? (Lihat ringkasan unit dan Kamus.)
4. Bagaimana saya mengukur pertumbuhan kognitif? (Laporan §8 dan rubrik.)
5. Apa yang saya lakukan bila siswa kesulitan? (Lapisan bantuan; pertanyaan mediator §2.)
6. Bagaimana saya menilai tugas? ([10-rubrik-rmt.md](10-rubrik-rmt.md).)

## 4. Contoh Satu Pertemuan (2 × 40 menit, unit Suku ke-n)

| Menit | Kegiatan | RMT |
|---|---|---|
| 0–10 | Tanya-jawab "barisan kursi di aula": apa yang tetap? | Konsep sehari-hari, Fase II langkah 1 |
| 10–30 | Materi u3: siswa mengisi **tabel interaktif** dan memilih rumus sendiri | Alat khas matematika (hlm. 152–154) |
| 30–35 | Diskusi kelas: "Mengapa (n − 1), bukan n?" (bukti logis) | C2 |
| 35–60 | Latihan Suku ke-n berpasangan: satu menghitung, satu menilai bukti | Fase III |
| 60–70 | Kartu 🌉 Jembatan "hubungan linear": di mana lagi? | Transendensi |
| 70–80 | Jurnal RMT: tulis satu refleksi | C13 (hlm. 88, 152) |

## 5. Membaca Laporan Python (`python/hasil/laporan.md` §8)

| Bagian | Cara membaca |
|---|---|
| 8.1 Sandwich | ⟨g⟩ < 0,3 rendah · 0,3–0,7 sedang · > 0,7 tinggi. Bandingkan per siswa di `pretes_postes.csv`. |
| 8.2 Lapisan bantuan | Rata-rata tinggi pada satu jenis → jenis itu perlu mediasi kelas. Siswa yang awalnya butuh banyak bantuan lalu makin mandiri menunjukkan **potensi belajar** tinggi (hlm. 194–195). |
| 8.3 Pemanasan | "Menamai fungsi tepat" rendah → luangkan waktu membahas Kamus Fungsi Berpikir. |
| 8.4 Jurnal | Fungsi yang jarang muncul (mis. C2 bukti) → tekankan di pertemuan berikutnya. |
| 8.5 Tulisan | Nilai dengan rubrik di `tafsiran_rubrik.csv` dan `jurnal_rubrik.csv`. |
| Tabel Latihan §6 | "Definisi masalah tepat" dan "Bukti logis tepat" per jenis soal. |

## 6. Teman AI di Kelas

- Teman AI **bertanya balik** dan **tidak memberi jawaban akhir**. Ia meminta bukti dan menyebut
  fungsi berpikir.
- Jawaban AI bisa keliru. Ajak siswa memeriksa jawaban AI dengan rumus. Ini sekaligus latihan bukti logis.
- Kuota Gemini gratis terbatas per hari. Bila habis, aplikasi memberi tahu kapan bisa dipakai lagi;
  belajar tetap berjalan tanpa AI.
- Ingatkan siswa: **jangan menulis data pribadi** (nama lengkap, alamat, nomor HP) di Teman AI,
  tafsiran, atau jurnal.

## 7. Data dan Privasi

- Data belajar tersimpan di HP siswa. Guru menerimanya lewat tombol **Ekspor Data**.
- Simpan berkas siswa hanya di `python/data_siswa/`. Folder ini tidak ikut ke GitHub.
- Minta izin sekolah atau orang tua sebelum mengumpulkan data penelitian.
