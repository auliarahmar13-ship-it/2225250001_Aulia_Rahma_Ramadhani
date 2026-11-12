# 04 — Rancangan Konten Materi

Sumber kebenaran konten ada di `app/js/data/materi.js`, `app/js/data/literasi.js`,
dan `python/generate_bank_soal.py`. Dokumen ini adalah ringkasan untuk validasi
ahli materi.

## Unit 1 — Pola Bilangan (Pemanasan) · TP1
1. Apa itu pola bilangan: susunan bilangan dengan aturan tertentu (visual 2, 4, 6, 8).
2. Pola dalam kehidupan: kursi di gedung (10, 12, 14, ...).
3. Cek: bilangan berikutnya dari 3, 7, 11, 15 adalah ...
4. Ringkasan.

## Unit 2 — Barisan Aritmatika · TP2
1. Pengertian: selisih dua suku berurutan selalu sama, yang disebut **beda (b)**.
2. Suku pertama ditulis **a** atau U₁ (visual 5, 8, 11, 14 dengan label +3).
3. Contoh bertahap menentukan beda: b = U₂ − U₁.
4. Beda negatif: barisan turun 20, 17, 14, ... (b = −3).
5. Cek: manakah yang merupakan barisan aritmatika?
6. Cek: beda dari 12, 9, 6, 3.
7. Ringkasan.

## Unit 3 — Suku ke-n · TP3
1. Masalah pemicu: suku ke-50 dari 5, 8, 11, ...? Menulis satu per satu melelahkan.
2. Membangun rumus dari tabel: U₁ = a, U₂ = a + b, U₃ = a + 2b, ..., sehingga **Uₙ = a + (n − 1)b**.
3. Contoh bertahap: U₅₀ dari 5, 8, 11, ... = 152.
4. Contoh bertahap mencari banyak suku: 7, 11, 15, ..., 87, sehingga n = 21.
5. Cek: U₁₀ dari 2, 5, 8, ... = 29.
6. Ringkasan.

## Unit 4 — Deret Aritmatika · TP4
1. Pengertian deret: penjumlahan suku-suku barisan. Sₙ = jumlah n suku pertama.
2. Kisah Gauss: 1 + 2 + ... + 100, pasangkan ujung-ujungnya: 50 × 101 = 5050.
3. Rumus: **Sₙ = n/2 (a + Uₙ)** atau **Sₙ = n/2 (2a + (n − 1)b)**.
4. Contoh bertahap: S₁₀ dari 3, 7, 11, ... = 210.
5. Cek: 1 + 2 + ... + 20 = 210.
6. Ringkasan.

## Literasi Matematika · TP5

| ID | Konteks | Pertanyaan inti | Jawaban |
|----|---------|-----------------|---------|
| L1 | Tabungan Rina: Rp5.000, naik Rp2.000/minggu | Total tabungan 12 minggu | Rp192.000 |
| L2 | Gedung pertunjukan: 15 kursi baris 1, +3 tiap baris, 20 baris | Total kursi | 870 |
| L3 | Lari pagi Budi: 500 m, +250 m/hari | Hari ke berapa lari 3 km | Hari ke-11 |
| L4 | Tumpukan kaleng: 12 di bawah, berkurang 1 tiap tingkat | Total kaleng | 78 |
| L5 | Ojek daring: Rp7.000 km pertama, +Rp3.000/km | Cukupkah Rp50.000 untuk 15 km? | Cukup (Rp49.000) |

## Kuis (15 butir)

| ID | TP | Level | Inti | Kunci |
|----|----|-------|------|-------|
| K01 | TP2 | mudah | Beda 4, 9, 14, 19 | 5 |
| K02 | TP1 | mudah | Suku berikutnya 31, 27, 23, 19 | 15 |
| K03 | TP2 | mudah | Mengenali barisan aritmatika | 2, 6, 10, 14 |
| K04 | TP3 | sedang | U₁₅ dari 3, 7, 11 | 59 |
| K05 | TP3 | sedang | Rumus Uₙ dari 6, 10, 14 | 4n + 2 |
| K06 | TP3 | sedang | Banyak suku 5, 9, ..., 101 | 25 |
| K07 | TP3 | sulit | U₈ = 30, b = 3, a = ? | 9 |
| K08 | TP3 | sulit | U₃ = 11, U₇ = 27, b = ? | 4 |
| K09 | TP4 | sedang | S₁₀ dari 2, 5, 8 | 155 |
| K10 | TP4 | sedang | 1 + 2 + ... + 50 | 1275 |
| K11 | TP4 | sulit | Jumlah bilangan genap 2 s.d. 40 | 420 |
| K12 | TP5 | sedang | Tabungan minggu ke-8 | Rp45.000 |
| K13 | TP5 | sulit | Total tabungan 8 minggu | Rp220.000 |
| K14 | TP5 | sulit | Total kursi 20 baris | 620 |
| K15 | TP3 | sulit | Beda dari Uₙ = 3n + 1 | 3 |

## Latihan (dibuat acak oleh `generator.js`)

| Jenis | Level Mudah | Level Sedang | Level Sulit |
|-------|-------------|--------------|-------------|
| beda | a 1–20, b 1–5 | b 2–9 | b negatif |
| berikutnya | sama | sama | b negatif |
| suku-n | n ≤ 15 | n ≤ 30 | n ≤ 60, b bisa negatif |
| cari-n | n ≤ 15 | n ≤ 30 | n ≤ 50 |
| jumlah | n ≤ 10 | n ≤ 20 | n ≤ 30 |
