# 02 — Desain Pembelajaran

## 1. Landasan Teori

### Teori Beban Kognitif (Sweller, 1988; Sweller, van Merriënboer & Paas, 2019)
Memori kerja terbatas (± 4 unsur informasi baru sekaligus). Beban kognitif terdiri atas:

| Jenis | Sumber | Strategi di DeretKu |
|-------|--------|---------------------|
| **Intrinsik** | Kompleksitas materi (interaksi unsur) | Diurutkan dari sederhana ke kompleks; segmentasi; pra-latihan |
| **Ekstrinsik** | Cara penyajian yang buruk | Desain bersih; teks + visual menyatu; tanpa batas waktu; tanpa hiasan bergerak |
| **Germane** | Usaha membangun skema | Contoh terselesaikan, *self-explanation* lewat cek pemahaman, latihan bervariasi |

### Prinsip Multimedia Mayer yang Diterapkan
| Prinsip | Penerapan |
|---------|-----------|
| Segmenting | Kartu materi satu ide, dikendalikan siswa (tombol Lanjut) |
| Pre-training | Unit 1 Pola Bilangan sebelum notasi formal |
| Signaling | Warna konsisten untuk a, b, n, Uₙ/Sₙ |
| Spatial contiguity | Label "+b" langsung di antara suku pada visual |
| Modality | Narasi suara (TTS) opsional |
| Redundancy | Narasi = teks kartu, tidak ada teks ketiga |
| Coherence | Tidak ada gambar dekoratif; musik volume rendah dan bisa dimatikan |
| Worked example & fading | Contoh bertahap → petunjuk → mandiri |

### Literasi Matematika (PISA 2022)
Kemampuan **merumuskan**, **menerapkan**, dan **menafsirkan** matematika dalam
berbagai konteks. DeretKu menyusun setiap masalah literasi menjadi 4 tahap:

1. **Memahami**: mengidentifikasi informasi yang diketahui (a, b, n) dari teks.
2. **Merumuskan**: memilih model matematika (Uₙ atau Sₙ).
3. **Menghitung**: menerapkan rumus dengan benar.
4. **Menafsirkan**: memaknai hasil dalam konteks (mis. "apakah uangnya cukup?").

Konteks: personal (tabungan, olahraga), sosial (gedung pertunjukan), pekerjaan (toko), ilmiah (pola tumpukan).

## 2. Alur Belajar

```
Beranda
  └─ Peta Belajar
       1. Pola Bilangan (pemanasan)   ─┐
       2. Barisan Aritmatika           │ Materi: kartu bersegmen + cek pemahaman
       3. Suku ke-n                    │  → skala beban kognitif
       4. Deret Aritmatika            ─┘
       5. Latihan adaptif   (5 jenis × 3 level, petunjuk bertahap, contoh)
       6. Literasi          (5 masalah × 4 tahap)
       7. Kuis              (15 soal, pembahasan, analisis miskonsepsi)
  └─ Games (kapan saja)     Balon Pola · Lompat Katak · Menara Angka
```

Siswa boleh membuka bagian mana pun (tidak dikunci), tetapi Beranda selalu
menyarankan langkah berikutnya.

## 3. Pengukuran Beban Kognitif

Skala usaha mental subjektif **Paas (1992)**, 9 titik:

> "Seberapa besar usaha mental yang kamu keluarkan untuk bagian ini?"
> 1 Sangat-sangat ringan · 2 Sangat ringan · 3 Ringan · 4 Agak ringan · 5 Sedang ·
> 6 Agak berat · 7 Berat · 8 Sangat berat · 9 Sangat-sangat berat

Ditanyakan setelah: setiap unit materi, sesi latihan (saat keluar, minimal 3 soal),
kuis, dan setiap masalah literasi. Data dipakai untuk:
- membandingkan beban antarunit (unit mana yang perlu direvisi),
- menghitung **efisiensi instruksional** (Paas & van Merriënboer, 1993):
  E = (z_skor − z_beban) / √2 (dihitung di `python/analisis_statistik.py`).

## 4. Miskonsepsi yang Ditargetkan

| Kode | Miskonsepsi | Contoh |
|------|-------------|--------|
| `M-n-bukan-n-1` | Memakai n, bukan (n − 1), di rumus Uₙ | U₁₀ = a + 10b |
| `M-lupa-bagi-2` | Lupa membagi 2 pada Sₙ | Sₙ = n(a + Uₙ) |
| `M-U-vs-S` | Tertukar suku ke-n dengan jumlah n suku | Menjawab Uₙ saat ditanya Sₙ |
| `M-beda-terbalik` | Menghitung beda U₁ − U₂ | b = 4 − 9 = 5 → tanda salah |
| `M-a-sebagai-b` | Mengira suku pertama = beda | b = a |
| `M-lupa-tambah-1` | Banyak suku = (Uₙ − a)/b tanpa +1 | n = 24, seharusnya 25 |
| `M-suku-lanjut` | Menjawab suku berikutnya, bukan yang ditanya | — |
| `M-hitung` | Kesalahan operasi hitung | — |

## 5. Gaya Visual

- Tema ceria **pink–ungu** (gradasi `#ff4fa3 → #c026d3 → #7c3aed`) agar menyenangkan bagi siswa SMP.
- Warna sinyal: a = biru, b = oranye, n = ungu, Uₙ/Sₙ = hijau.
- **Maskot**: 4 teman belajar (Raka, Dimas, Sari, Nia) berseragam sekolah, digambar sebagai SVG.
  Mereka bergoyang, melambai, dan berkedip; jika disentuh, mereka melompat dan memberi kata penyemangat.
  Maskot hanya tampil di Beranda, Games, dan layar selesai (prinsip *coherence*: tidak mengganggu
  saat membaca materi atau mengerjakan soal).
- Tipografi sistem, ukuran dasar 17 px (bisa 19/21 px).
- Satu tombol utama per layar, terletak di bawah (mudah dijangkau ibu jari).
- Mode gelap mengikuti pengaturan HP.

## 6. Suara

| Elemen | Desain | Alasan CLT |
|--------|--------|------------|
| Musik latar | Ceria: progresi C–G–Am–F, ±116 BPM, bas melompat, petikan ala ukulele, melodi marimba, perkusi ringan (Web Audio), volume 35% | Menyenangkan dan memotivasi; bisa dimatikan agar tidak menambah beban ekstrinsik |
| Efek games | Pop balon, lompat, cebur, boing, fanfare rekor | Umpan balik permainan yang menyenangkan |
| Efek benar | Dua nada naik | Umpan balik cepat tanpa membaca |
| Efek salah | Nada rendah lembut, tidak mengagetkan | Tidak menghukum |
| Narasi | Web Speech API, `id-ID` | Prinsip modalitas |
| *Ducking* | Musik turun ke 20% saat narasi | Mengurangi tumpang tindih audio |
