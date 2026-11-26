// Pemanasan Berpikir: Fase I RMT "Pengembangan Kognitif" (Kinard & Kozulin hlm. 123; docs/08 Tahap 4).
// Tugas pola NONANGKA buatan sendiri (BUKAN salinan Instrumental Enrichment, hlm. 9).
// Siklus tiap tugas (hlm. 12, 92): definisikan masalah → amati model → kerjakan →
// namai fungsi berpikir yang dipakai (C13) → jembatan ke barisan aritmatika (transendensi, hlm. 78).
//
// Bentuk tugas:
//   { id, judul, fungsi (kode rmt.js), model (array baris; tiap baris = { label?, isi: teks emoji }),
//     masalah: { opsi: [teks], kunci }, tanya, opsi: [teks], kunci, alasan (teks: mengapa benar),
//     pengecohFungsi: [kode, kode] (2 fungsi lain untuk langkah "namai fungsi"), jembatan (teks) }
// Teks biasa (tanpa HTML). Satu tugas = satu ide; teks pendek (aturan beban kognitif).

export const TUGAS = [
  {
    id: 'P1', judul: 'Dua baris buah', fungsi: 'A2',
    model: [{ label: 'Baris A', isi: '🍎 🍌 🍎 🍌' }, { label: 'Baris B', isi: '🍎 🍌 🍌 🍎' }],
    masalah: { opsi: ['Mencari apa yang sama dan apa yang berbeda dari dua baris', 'Menghitung semua buah', 'Menggambar buah baru'], kunci: 0 },
    tanya: 'Apa perbedaan Baris A dan Baris B?',
    opsi: ['Jenis buahnya berbeda', 'Urutan buahnya berbeda', 'Banyak buahnya berbeda'], kunci: 1,
    alasan: 'Keduanya sama-sama berisi 2 apel dan 2 pisang. Yang berbeda hanya urutannya.',
    pengecohFungsi: ['B6', 'C4'],
    jembatan: 'Di barisan aritmatika, kamu akan membandingkan dua suku yang berurutan untuk menemukan bedanya.',
  },
  {
    id: 'P2', judul: 'Siapa yang merusak pola?', fungsi: 'A3',
    model: [{ isi: '🔴 🔵 🔴 🔵 🔴 🔴 🔵' }],
    masalah: { opsi: ['Menemukan bagian yang tidak mengikuti aturan', 'Menghitung banyak warna', 'Mengurutkan dari yang terbesar'], kunci: 0 },
    tanya: 'Polanya merah–biru bergantian. Gambar ke berapa yang merusak pola?',
    opsi: ['Ke-5', 'Ke-6', 'Ke-7'], kunci: 1,
    alasan: 'Periksa satu per satu: gambar ke-5 merah (benar), maka ke-6 seharusnya biru, tetapi ternyata merah.',
    pengecohFungsi: ['A1', 'B4'],
    jembatan: 'Untuk yakin sebuah barisan aritmatika, periksa SEMUA selisihnya, bukan hanya yang pertama.',
  },
  {
    id: 'P3', judul: 'Menara balok', fungsi: 'B1',
    model: [{ label: 'Menara 1', isi: '🟪' }, { label: 'Menara 2', isi: '🟪🟪🟪' }, { label: 'Menara 3', isi: '🟪🟪🟪🟪🟪' }, { label: 'Menara 4', isi: '🟪🟪🟪🟪🟪🟪🟪' }],
    masalah: { opsi: ['Mencari apa yang tetap ketika menaranya berubah', 'Mencari menara yang paling indah', 'Menghitung warna balok'], kunci: 0 },
    tanya: 'Menaranya terus bertambah tinggi. Apa yang TETAP?',
    opsi: ['Tinggi menaranya', 'Tambahannya selalu 2 balok', 'Banyak menaranya'], kunci: 1,
    alasan: 'Tingginya berubah, tetapi dari satu menara ke menara berikutnya tambahannya selalu 2 balok.',
    pengecohFungsi: ['A5', 'C10'],
    jembatan: 'Inilah ide beda (b): sukunya berubah, tetapi tambahannya tetap.',
  },
  {
    id: 'P4', judul: 'Lanjutkan polanya', fungsi: 'B5',
    model: [{ isi: '🔺 🔺 🔵   🔺 🔺 🔵   🔺 🔺 ❓' }],
    masalah: { opsi: ['Menemukan aturan pola lalu menebak bagian berikutnya', 'Menghitung banyak segitiga', 'Mengganti semua bentuk'], kunci: 0 },
    tanya: 'Bentuk apa yang menggantikan ❓?',
    opsi: ['🔺', '🔵', '🟩'], kunci: 1,
    alasan: 'Aturannya: dua segitiga lalu satu lingkaran, berulang. Jadi setelah dua segitiga datang lingkaran.',
    pengecohFungsi: ['B3', 'C6'],
    jembatan: 'Dengan aturan umum, kamu bisa menebak suku berikutnya tanpa melihat semuanya, seperti rumus Uₙ nanti.',
  },
  {
    id: 'P5', judul: 'Kode tangga', fungsi: 'A5',
    model: [{ label: 'Kode', isi: '⬆️ = naik 1 anak tangga · ⬇️ = turun 1 anak tangga' }, { label: 'Pesan', isi: '⬆️ ⬆️ ⬇️ ⬆️' }],
    masalah: { opsi: ['Membaca arti kode, lalu menentukan posisi akhir', 'Menggambar tangga', 'Menghitung banyak panah ke atas saja'], kunci: 0 },
    tanya: 'Setelah mengikuti pesan itu, kamu berada di mana dibanding posisi awal?',
    opsi: ['2 anak tangga lebih tinggi', '4 anak tangga lebih tinggi', 'Kembali ke posisi awal'], kunci: 0,
    alasan: 'Naik, naik, turun, naik: naik 3 kali dan turun 1 kali, jadi akhirnya 2 anak tangga lebih tinggi.',
    pengecohFungsi: ['A2', 'B1'],
    jembatan: 'Matematika memakai simbol seperti a, b, n, dan Uₙ. Setiap simbol membawa makna yang harus kamu baca.',
  },
  {
    id: 'P6', judul: 'Dari balok ke angka', fungsi: 'C5',
    model: [{ label: 'Menara', isi: '🟪 · 🟪🟪🟪 · 🟪🟪🟪🟪🟪 · 🟪🟪🟪🟪🟪🟪🟪' }, { label: 'Angka', isi: '1 · 3 · 5 · 7' }],
    masalah: { opsi: ['Menghubungkan pola balok dengan pola angka', 'Menghitung warna balok', 'Mencari menara tertinggi'], kunci: 0 },
    tanya: 'Kalau menara balok ditulis dengan angka 1, 3, 5, 7, aturannya adalah ...',
    opsi: ['Setiap suku ditambah 2', 'Setiap suku ditambah 1', 'Setiap suku dikali 2'], kunci: 0,
    alasan: '1 + 2 = 3, 3 + 2 = 5, 5 + 2 = 7. Tambahannya selalu 2, sama seperti tambahan balok tadi.',
    pengecohFungsi: ['B3', 'A4'],
    jembatan: 'Pola balok tadi adalah barisan aritmatika 1, 3, 5, 7 dengan beda 2. Kamu siap masuk ke Materi!',
  },
];
