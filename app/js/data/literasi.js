// Masalah literasi matematika (kerangka PISA): setiap masalah memiliki 4 tahap
// Memahami → Merumuskan → Menghitung → Menafsirkan.
// tahap: { nama, tanya (html), opsi: [teks], kunci (index), petunjuk (saat salah), penjelasan (saat benar) }

export const TAHAP = [
  { nama: 'Memahami', ikon: '🔎', ket: 'Informasi apa yang diketahui?' },
  { nama: 'Merumuskan', ikon: '🧩', ket: 'Model atau rumus apa yang cocok?' },
  { nama: 'Menghitung', ikon: '🧮', ket: 'Terapkan rumusnya' },
  { nama: 'Menafsirkan', ikon: '💡', ket: 'Apa arti jawabannya dalam cerita?' },
];

function tumpukan(k) {
  let s = `<svg class="vis" style="max-width:190px" viewBox="0 0 ${k * 26 + 10} ${k * 24 + 10}" role="img" aria-label="Tumpukan kaleng berbentuk segitiga">`;
  for (let baris = 0; baris < k; baris++) {
    const isi = k - baris;
    const y = (k - baris) * 24 - 6;
    const x0 = 5 + baris * 13;
    for (let i = 0; i < isi; i++) s += `<rect x="${x0 + i * 26}" y="${y - 18}" width="22" height="22" rx="5" class="vis-kotak ${baris === 0 ? 'vis-a' : ''}"/>`;
  }
  return `${s}</svg><p class="muted kecil" style="text-align:center">Ilustrasi (diperkecil, 5 tingkat)</p>`;
}

export const LITERASI = [
  {
    id: 'L1', judul: 'Tabungan Sepatu Rina', konteks: 'Personal', ikon: '🐷',
    stimulus: '<p>Rina ingin membeli sepatu seharga <strong>Rp180.000</strong>. Ia mulai menabung: minggu pertama <strong>Rp5.000</strong>, dan setiap minggu berikutnya ia menabung <strong>Rp2.000 lebih banyak</strong> daripada minggu sebelumnya.</p><p>Rina menabung selama <strong>12 minggu</strong>.</p>',
    tahap: [
      {
        tanya: 'Informasi mana yang sesuai dengan cerita?',
        opsi: ['a = 5.000, b = 2.000, n = 12', 'a = 2.000, b = 5.000, n = 12', 'a = 5.000, b = 2.000, n = 180', 'a = 180.000, b = 2.000, n = 12'],
        kunci: 0,
        petunjuk: 'Suku pertama (a) = tabungan minggu pertama. Beda (b) = tambahan setiap minggu. n = lama menabung.',
        penjelasan: 'Tepat! Harga sepatu (Rp180.000) bukan bagian dari barisan. Harga itu dipakai nanti untuk menafsirkan jawaban.',
      },
      {
        tanya: 'Untuk mengetahui <strong>total</strong> uang tabungan selama 12 minggu, rumus yang tepat adalah ...',
        opsi: ['U₁₂ = a + 11b', 'S₁₂ = 12/2 × (2a + 11b)', 'S₁₂ = 12 × (2a + 11b)', 'U₁₂ = a + 12b'],
        kunci: 1,
        petunjuk: 'Kata "total" berarti menjumlahkan semua tabungan, jadi yang dipakai adalah deret (S), bukan satu suku (U).',
        penjelasan: 'Benar. Total = jumlah 12 suku pertama, yaitu S₁₂.',
      },
      {
        tanya: 'Berapa total tabungan Rina setelah 12 minggu?',
        opsi: ['Rp27.000', 'Rp192.000', 'Rp384.000', 'Rp180.000'],
        kunci: 1,
        petunjuk: 'S₁₂ = 6 × (2 × 5.000 + 11 × 2.000) = 6 × (10.000 + 22.000). Jangan lupa dibagi 2 (12/2 = 6).',
        penjelasan: 'S₁₂ = 6 × 32.000 = Rp192.000.',
      },
      {
        tanya: 'Apakah tabungan Rina cukup untuk membeli sepatu seharga Rp180.000?',
        opsi: ['Cukup, dan masih tersisa Rp12.000', 'Tidak cukup, kurang Rp12.000', 'Cukup, pas tanpa sisa', 'Tidak dapat ditentukan'],
        kunci: 0,
        petunjuk: 'Bandingkan total tabungan (Rp192.000) dengan harga sepatu (Rp180.000).',
        penjelasan: 'Rp192.000 − Rp180.000 = Rp12.000. Hasil hitungan harus dimaknai kembali dalam cerita, dan itulah inti literasi matematika!',
      },
    ],
  },
  {
    id: 'L2', judul: 'Kursi Gedung Pertunjukan', konteks: 'Sosial', ikon: '🎭',
    stimulus: '<p>Sebuah gedung pertunjukan memiliki <strong>20 baris kursi</strong>. Baris paling depan berisi <strong>15 kursi</strong>. Setiap baris di belakangnya berisi <strong>3 kursi lebih banyak</strong> daripada baris di depannya.</p><p>Panitia sebuah pentas seni memperkirakan <strong>900 penonton</strong> akan datang.</p>',
    tahap: [
      {
        tanya: 'Baris paling belakang adalah baris ke- ...',
        opsi: ['1', '3', '15', '20'],
        kunci: 3,
        petunjuk: 'Gedung itu memiliki 20 baris. Baris paling depan adalah baris ke-1.',
        penjelasan: 'Benar, baris paling belakang adalah baris ke-20, jadi n = 20.',
      },
      {
        tanya: 'Banyak kursi di baris paling belakang dapat dicari dengan ...',
        opsi: ['U₂₀ = 15 + (20 − 1) × 3', 'U₂₀ = 15 + 20 × 3', 'S₂₀ = 20/2 × (15 + 3)', 'U₂₀ = 20 + (15 − 1) × 3'],
        kunci: 0,
        petunjuk: 'Satu baris saja → suku (U). Ingat rumus Uₙ = a + (n − 1)b dengan a = 15, b = 3.',
        penjelasan: 'U₂₀ = 15 + 19 × 3 = 15 + 57 = 72 kursi di baris paling belakang.',
      },
      {
        tanya: 'Berapa banyak kursi seluruhnya di gedung itu?',
        opsi: ['72', '870', '1.740', '900'],
        kunci: 1,
        petunjuk: 'S₂₀ = 20/2 × (a + U₂₀) = 10 × (15 + 72).',
        penjelasan: 'S₂₀ = 10 × 87 = 870 kursi.',
      },
      {
        tanya: 'Jika benar-benar 900 penonton datang, apa artinya?',
        opsi: ['Semua dapat duduk, masih ada 30 kursi kosong', '30 penonton tidak mendapat kursi', 'Kursinya pas untuk semua penonton', 'Semua kursi kosong'],
        kunci: 1,
        petunjuk: 'Bandingkan banyak kursi (870) dengan banyak penonton (900).',
        penjelasan: '900 − 870 = 30. Panitia perlu menyiapkan 30 kursi tambahan atau membatasi tiket.',
      },
    ],
  },
  {
    id: 'L3', judul: 'Latihan Lari Budi', konteks: 'Personal', ikon: '🏃',
    stimulus: '<p>Budi berlatih lari untuk lomba <strong>3 km</strong>. Hari pertama ia berlari <strong>500 m</strong>. Setiap hari jaraknya ditambah <strong>250 m</strong>.</p><p>Lomba diadakan <strong>14 hari</strong> setelah hari pertama latihan.</p>',
    tahap: [
      {
        tanya: 'Agar satuannya sama, 3 km = ... m',
        opsi: ['30 m', '300 m', '3.000 m', '30.000 m'],
        kunci: 2,
        petunjuk: '1 km = 1.000 m.',
        penjelasan: 'Benar, 3 km = 3.000 m. Menyamakan satuan adalah langkah penting dalam soal cerita.',
      },
      {
        tanya: 'Budi ingin tahu pada hari ke-n ia berlari 3.000 m. Persamaan yang tepat adalah ...',
        opsi: ['3.000 = 500 + (n − 1) × 250', '3.000 = 250 + (n − 1) × 500', '3.000 = n/2 × (500 + 250)', '3.000 = 500 + n × 250'],
        kunci: 0,
        petunjuk: 'Jarak pada satu hari = suku ke-n, dengan a = 500 dan b = 250.',
        penjelasan: 'Uₙ = a + (n − 1)b → 3.000 = 500 + (n − 1) × 250.',
      },
      {
        tanya: 'Selesaikan persamaannya. Nilai n adalah ...',
        opsi: ['n = 10', 'n = 11', 'n = 12', 'n = 6'],
        kunci: 1,
        petunjuk: '3.000 − 500 = 2.500 → (n − 1) = 2.500 : 250. Jangan lupa tambah 1.',
        penjelasan: 'n − 1 = 10, jadi n = 11.',
      },
      {
        tanya: 'Apa kesimpulan yang tepat?',
        opsi: ['Budi sudah bisa berlari 3 km pada hari ke-11, sebelum lomba', 'Budi belum bisa berlari 3 km saat lomba', 'Budi baru bisa berlari 3 km tepat di hari lomba', 'Budi harus berlari 14 km'],
        kunci: 0,
        petunjuk: 'Bandingkan hari ke-11 dengan jadwal lomba (hari ke-14).',
        penjelasan: 'Hari ke-11 lebih awal dari hari ke-14, jadi Budi siap 3 hari sebelum lomba.',
      },
    ],
  },
  {
    id: 'L4', judul: 'Tumpukan Kaleng Susu', konteks: 'Pekerjaan', ikon: '🥫',
    stimulus: `<p>Di sebuah minimarket, kaleng susu disusun membentuk segitiga. Tingkat paling bawah berisi <strong>12 kaleng</strong>, tingkat di atasnya <strong>11 kaleng</strong>, begitu seterusnya <strong>berkurang 1</strong> hingga tingkat paling atas berisi <strong>1 kaleng</strong>.</p>${tumpukan(5)}<p>Petugas hanya mempunyai <strong>70 kaleng</strong>.</p>`,
    tahap: [
      {
        tanya: 'Dari bawah ke atas, barisan banyak kaleng adalah ...',
        opsi: ['12, 11, 10, ..., 1 dengan a = 12, b = −1, n = 12', '1, 2, 3, ..., 12 dengan a = 1, b = −1, n = 12', '12, 11, 10, ..., 1 dengan a = 12, b = 1, n = 11', '12, 10, 8, ..., 2 dengan b = −2'],
        kunci: 0,
        petunjuk: 'Mulai dari tingkat bawah (12). Setiap naik satu tingkat berkurang 1, jadi bedanya negatif. Hitung banyak tingkat dari 12 sampai 1.',
        penjelasan: 'a = 12, b = −1, dan ada 12 tingkat (12, 11, ..., 1).',
      },
      {
        tanya: 'Rumus untuk menghitung total kaleng yang dibutuhkan adalah ...',
        opsi: ['S₁₂ = 12/2 × (12 + 1)', 'S₁₂ = 12 × (12 + 1)', 'U₁₂ = 12 + 11 × (−1)', 'S₁₂ = 12/2 × (12 − 1)'],
        kunci: 0,
        petunjuk: 'Total = jumlah semua tingkat → Sₙ = n/2 × (a + Uₙ), dengan suku terakhir Uₙ = 1.',
        penjelasan: 'S₁₂ = 12/2 × (12 + 1).',
      },
      {
        tanya: 'Berapa total kaleng yang dibutuhkan?',
        opsi: ['78', '156', '72', '66'],
        kunci: 0,
        petunjuk: '12/2 = 6, lalu 6 × 13 = ?',
        penjelasan: 'S₁₂ = 6 × 13 = 78 kaleng.',
      },
      {
        tanya: 'Petugas hanya mempunyai 70 kaleng. Apa yang terjadi?',
        opsi: ['Tumpukan tidak dapat lengkap sampai puncak, kurang 8 kaleng', 'Tumpukan lengkap dan tersisa 8 kaleng', 'Tumpukan lengkap tanpa sisa', 'Petugas perlu 12 kaleng lagi'],
        kunci: 0,
        petunjuk: 'Bandingkan kebutuhan (78) dengan yang tersedia (70).',
        penjelasan: '78 − 70 = 8. Petugas perlu 8 kaleng lagi, atau membuat tumpukan dengan alas lebih kecil.',
      },
    ],
  },
  {
    id: 'L5', judul: 'Ongkos Ojek Daring', konteks: 'Sosial', ikon: '🛵',
    stimulus: `<p>Tarif sebuah ojek daring: <strong>Rp7.000</strong> untuk kilometer pertama, lalu bertambah <strong>Rp3.000</strong> untuk setiap kilometer berikutnya.</p>
<table class="tabel-pola"><thead><tr><th>Jarak</th><th>1 km</th><th>2 km</th><th>3 km</th><th>…</th></tr></thead><tbody><tr><td>Tarif</td><td>7.000</td><td>?</td><td>?</td><td>…</td></tr></tbody></table>
<p>Sinta akan pergi ke rumah nenek sejauh <strong>15 km</strong> dan membawa uang <strong>Rp50.000</strong>.</p>`,
    tahap: [
      {
        tanya: 'Tarif untuk jarak 2 km adalah ...',
        opsi: ['Rp10.000', 'Rp14.000', 'Rp6.000', 'Rp13.000'],
        kunci: 0,
        petunjuk: 'Tarif km pertama ditambah Rp3.000.',
        penjelasan: 'Rp7.000 + Rp3.000 = Rp10.000. Barisannya: 7.000, 10.000, 13.000, ...',
      },
      {
        tanya: 'Tarif untuk perjalanan 15 km sesuai dengan ...',
        opsi: ['U₁₅ (suku ke-15)', 'S₁₅ (jumlah 15 suku)', 'b × 15', 'a × 15'],
        kunci: 0,
        petunjuk: 'Sinta membayar SATU tarif sesuai jaraknya, bukan menjumlahkan tarif 1 km, 2 km, 3 km, dan seterusnya.',
        penjelasan: 'Tarif 15 km adalah satu nilai pada barisan, yaitu suku ke-15.',
      },
      {
        tanya: 'Berapa tarif untuk 15 km?',
        opsi: ['Rp52.000', 'Rp49.000', 'Rp45.000', 'Rp420.000'],
        kunci: 1,
        petunjuk: 'U₁₅ = 7.000 + (15 − 1) × 3.000.',
        penjelasan: 'U₁₅ = 7.000 + 42.000 = Rp49.000.',
      },
      {
        tanya: 'Apakah uang Sinta cukup?',
        opsi: ['Cukup, kembaliannya Rp1.000', 'Tidak cukup, kurang Rp2.000', 'Cukup, kembaliannya Rp5.000', 'Tidak cukup, kurang Rp1.000'],
        kunci: 0,
        petunjuk: 'Bandingkan Rp50.000 dengan tarif Rp49.000.',
        penjelasan: 'Rp50.000 − Rp49.000 = Rp1.000. 💭 Refleksi: jika saat hujan ada biaya tambahan Rp2.000, apakah uangnya masih cukup?',
      },
    ],
  },
];

export function cariLiterasi(id) { return LITERASI.find((l) => l.id === id); }
