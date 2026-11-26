// Konten materi DeretKu. Satu kartu = satu ide (prinsip segmentasi).
// Jenis kartu:
//   teks      { judul, isi (html), visual? (array suku) }
//   contoh    { judul, soal (html), langkah: [html] }   → langkah dibuka satu per satu
//   cek       { judul, tanya (html), opsi: [teks], kunci (index), benar (html), salah (html) }
//   ringkasan { judul, poin: [html] }  → ditambah daftar fungsi berpikir unit (rmt.js FUNGSI_UNIT)
//   garis     { judul, isi (html), a, b, lompat }  → garis bilangan interaktif (RMT: alat khas matematika)
//   tabel     { judul, isi (html), suku: [..], opsi: [html], kunci, kesimpulan (html) } → tabel interaktif
//   teks + jembatan: true → kartu "🌉 Jembatan" (RMT transendensi, hlm. 78–79)
// Kartu pertama tiap unit menampilkan "Mengapa ini penting?" dari rmt.js MAKNA_UNIT (hlm. 80).
// Warna sinyal: .va = a, .vb = b, .vn = n, .vu = Uₙ / Sₙ

const a = '<span class="va">a</span>';
const b = '<span class="vb">b</span>';
const n = '<span class="vn">n</span>';
const Un = '<span class="vu">U<sub>n</sub></span>';
const Sn = '<span class="vu">S<sub>n</sub></span>';

export const UNIT = [
  {
    id: 'u1', judul: 'Pola Bilangan', ikon: '🔢', tp: 'TP1', menit: 4,
    ket: 'Pemanasan: mengenali aturan sebuah pola',
    kartu: [
      {
        jenis: 'teks', judul: 'Apa itu pola bilangan?',
        isi: '<p>Pola bilangan adalah <strong>susunan bilangan yang mengikuti aturan tertentu</strong>.</p><p>Lihat barisan di bawah. Setiap bilangan bertambah 2 dari bilangan sebelumnya.</p>',
        visual: [2, 4, 6, 8, '?'],
      },
      {
        jenis: 'teks', judul: 'Pola ada di sekitar kita',
        isi: '<p>Di sebuah aula, baris pertama berisi <strong>10 kursi</strong>, baris kedua <strong>12 kursi</strong>, baris ketiga <strong>14 kursi</strong>.</p><p>Aturannya: <strong>setiap baris bertambah 2 kursi</strong>. Jadi baris keempat berisi 16 kursi.</p>',
        visual: [10, 12, 14, 16],
      },
      {
        jenis: 'contoh', judul: 'Contoh: menemukan aturan',
        soal: '<p>Tentukan bilangan berikutnya dari <strong>5, 10, 15, 20, ...</strong></p>',
        langkah: [
          '<strong>Langkah 1.</strong> Bandingkan dua bilangan yang berdekatan: 10 − 5 = 5.',
          '<strong>Langkah 2.</strong> Periksa pasangan lainnya: 15 − 10 = 5, 20 − 15 = 5. Aturannya <strong>+5</strong>.',
          '<strong>Langkah 3.</strong> Bilangan berikutnya: 20 + 5 = <span class="vu">25</span>.',
        ],
      },
      {
        jenis: 'cek', judul: 'Cek Pemahaman',
        tanya: '<p>Bilangan berikutnya dari <strong>3, 7, 11, 15, ...</strong> adalah?</p>',
        opsi: ['18', '19', '20', '22'], kunci: 1,
        benar: 'Aturannya +4, jadi 15 + 4 = 19.',
        salah: 'Coba hitung selisihnya: 7 − 3 = ?, 11 − 7 = ? Lalu tambahkan ke 15.',
      },
      {
        jenis: 'ringkasan', judul: 'Ringkasan',
        poin: [
          'Pola bilangan = susunan bilangan dengan <strong>aturan tetap</strong>.',
          'Cari aturannya dengan <strong>membandingkan bilangan yang berdekatan</strong>.',
          'Selanjutnya kamu akan mengenal pola khusus yang selisihnya selalu sama, yaitu <strong>barisan aritmatika</strong>.',
        ],
      },
    ],
  },
  {
    id: 'u2', judul: 'Barisan Aritmatika', ikon: '📏', tp: 'TP2', menit: 8,
    ket: 'Mengenal suku pertama (a) dan beda (b)',
    kartu: [
      {
        jenis: 'teks', judul: 'Pengertian barisan aritmatika',
        isi: `<p><strong>Barisan aritmatika</strong> adalah barisan bilangan yang <strong>selisih dua suku berurutannya selalu sama</strong>.</p><p>Selisih tetap itu disebut <strong>beda</strong>, ditulis ${b}.</p>`,
        visual: [5, 8, 11, 14],
      },
      {
        jenis: 'teks', judul: 'Suku dan suku pertama',
        isi: `<p>Setiap bilangan dalam barisan disebut <strong>suku</strong>. Suku ke-1 ditulis U<sub>1</sub>, suku ke-2 ditulis U<sub>2</sub>, dan seterusnya.</p><p>Suku pertama juga diberi nama ${a}. Pada barisan di bawah: ${a} = 5 dan ${b} = 3.</p>`,
        visual: [5, 8, 11, 14],
      },
      {
        jenis: 'garis', judul: 'Alat: garis bilangan', a: 5, b: 3, lompat: 3,
        isi: `<p>Garis bilangan adalah <strong>alat</strong> untuk melihat jarak antarsuku. Mulai dari ${a} = 5, tekan tombol untuk melompat sejauh ${b} = 3.</p>`,
      },
      {
        jenis: 'contoh', judul: 'Contoh: menentukan beda',
        soal: '<p>Tentukan beda dari barisan <strong>4, 9, 14, 19, ...</strong></p>',
        langkah: [
          `<strong>Langkah 1.</strong> Beda = suku sesudah − suku sebelum: ${b} = U<sub>2</sub> − U<sub>1</sub>.`,
          `<strong>Langkah 2.</strong> ${b} = 9 − 4 = <span class="vb">5</span>.`,
          '<strong>Langkah 3.</strong> Periksa: 14 − 9 = 5 dan 19 − 14 = 5. Selisihnya selalu sama ✓, jadi ini barisan aritmatika.',
        ],
      },
      {
        jenis: 'teks', judul: 'Beda bisa negatif',
        isi: `<p>Jika barisannya <strong>turun</strong>, bedanya negatif.</p><p>Barisan 20, 17, 14, 11: ${b} = 17 − 20 = <span class="vb">−3</span>.</p>`,
        visual: [20, 17, 14, 11],
      },
      {
        jenis: 'cek', judul: 'Cek Pemahaman',
        tanya: '<p>Manakah yang merupakan <strong>barisan aritmatika</strong>?</p>',
        opsi: ['1, 2, 4, 8', '3, 6, 9, 12', '1, 4, 9, 16', '2, 3, 5, 8'], kunci: 1,
        benar: '3, 6, 9, 12 selisihnya selalu 3.',
        salah: 'Hitung selisih tiap pasangan suku. Pada barisan aritmatika, semua selisihnya harus sama.',
      },
      {
        jenis: 'teks', jembatan: true, judul: 'Tidak semua pola itu aritmatika',
        isi: `<p><strong>2, 5, 8, 11</strong>: selisihnya 3, 3, 3 (tetap). Ini barisan aritmatika.</p><p><strong>2, 6, 18, 54</strong>: setiap suku dikali 3. Selisihnya 4, 12, 36 (berubah), jadi <strong>bukan</strong> barisan aritmatika.</p><p>Kuncinya selalu sama: periksa apakah <strong>selisihnya tetap</strong>.</p>`,
      },
      {
        jenis: 'cek', judul: 'Cek Pemahaman',
        tanya: '<p>Beda dari barisan <strong>12, 9, 6, 3, ...</strong> adalah?</p>',
        opsi: ['3', '−3', '12', '9'], kunci: 1,
        benar: 'b = 9 − 12 = −3. Barisannya turun, jadi bedanya negatif.',
        salah: 'Ingat urutannya: suku sesudah dikurangi suku sebelum, yaitu 9 − 12.',
      },
      {
        jenis: 'ringkasan', judul: 'Ringkasan',
        poin: [
          `Barisan aritmatika: selisih dua suku berurutan <strong>selalu sama</strong>.`,
          `${a} = suku pertama (U<sub>1</sub>).`,
          `${b} = beda = U<sub>2</sub> − U<sub>1</sub>. Barisan naik → ${b} positif; barisan turun → ${b} negatif.`,
        ],
      },
    ],
  },
  {
    id: 'u3', judul: 'Suku ke-n', ikon: '🎯', tp: 'TP3', menit: 10,
    ket: `Rumus Uₙ = a + (n − 1)b`,
    kartu: [
      {
        jenis: 'teks', judul: 'Masalah',
        isi: '<p>Berapa <strong>suku ke-50</strong> dari barisan 5, 8, 11, 14, ...?</p><p>Menulis 50 bilangan satu per satu tentu melelahkan dan mudah salah. Kita butuh <strong>cara cepat</strong>.</p>',
        visual: [5, 8, 11, 14, '…'],
      },
      {
        // RMT: tabel sebagai alat (hlm. 152–154). Siswa mengisi perubahan Uₙ, lalu merumuskan sendiri.
        jenis: 'tabel', judul: 'Menemukan rumus dari tabel', suku: [5, 8, 11, 14],
        isi: `<p>Isi kolom <strong>perubahan</strong>: berapa ${Un} bertambah setiap ${n} naik 1?</p>`,
        opsi: [`${Un} = ${a} + ${n} × ${b}`, `${Un} = ${a} + (${n} − 1) × ${b}`, `${Un} = ${n} × ${b}`],
        kunci: 1,
        kesimpulan: `U<sub>2</sub> = ${a} + <span class="vb">1</span>${b}, U<sub>3</sub> = ${a} + <span class="vb">2</span>${b}, U<sub>4</sub> = ${a} + <span class="vb">3</span>${b}. Banyaknya ${b} selalu <strong>satu kurangnya</strong> dari urutan suku.`,
      },
      {
        jenis: 'teks', judul: 'Rumus suku ke-n',
        isi: `<div class="rumus">${Un} = ${a} + (${n} − 1)${b}</div>
<ul class="keterangan"><li>${Un} = suku ke-n</li><li>${a} = suku pertama</li><li>${b} = beda</li><li>${n} = urutan suku</li></ul>`,
      },
      {
        jenis: 'contoh', judul: 'Contoh: mencari suku ke-50',
        soal: '<p>Tentukan suku ke-50 dari barisan <strong>5, 8, 11, 14, ...</strong></p>',
        langkah: [
          `<strong>Langkah 1. Kenali.</strong> ${a} = 5, ${b} = 8 − 5 = 3, ${n} = 50.`,
          `<strong>Langkah 2. Tulis rumus.</strong> U<sub>50</sub> = ${a} + (${n} − 1)${b}`,
          '<strong>Langkah 3. Substitusi.</strong> U<sub>50</sub> = 5 + (50 − 1) × 3 = 5 + 49 × 3',
          '<strong>Langkah 4. Hitung.</strong> U<sub>50</sub> = 5 + 147 = <span class="vu">152</span>',
        ],
      },
      {
        jenis: 'contoh', judul: 'Contoh: mencari banyak suku',
        soal: '<p>Berapa banyak suku pada barisan <strong>7, 11, 15, ..., 87</strong>?</p>',
        langkah: [
          `<strong>Langkah 1. Kenali.</strong> ${a} = 7, ${b} = 4, suku terakhir ${Un} = 87. Yang dicari: ${n}.`,
          `<strong>Langkah 2. Susun persamaan.</strong> 87 = 7 + (${n} − 1) × 4`,
          `<strong>Langkah 3. Selesaikan.</strong> 80 = (${n} − 1) × 4 → ${n} − 1 = 20`,
          `<strong>Langkah 4.</strong> ${n} = <span class="vn">21</span>. Jadi ada 21 suku.`,
        ],
      },
      {
        jenis: 'cek', judul: 'Cek Pemahaman',
        tanya: '<p>Suku ke-10 dari barisan <strong>2, 5, 8, ...</strong> adalah?</p>',
        opsi: ['29', '32', '30', '27'], kunci: 0,
        benar: 'U₁₀ = 2 + (10 − 1) × 3 = 2 + 27 = 29.',
        salah: 'Perhatikan: yang dikalikan dengan b adalah (n − 1), yaitu 9, bukan 10.',
      },
      {
        jenis: 'teks', jembatan: true, judul: 'Rumus ini berlaku untuk semua suku',
        isi: `<p>Untuk 5, 8, 11, ...: ${Un} = 5 + (${n} − 1) × 3 = <strong>3${n} + 2</strong>.</p><p>Setiap ${n} naik 1, ${Un} naik 3, yaitu sebesar ${b}. Hubungan "naik tetap setiap langkah" seperti ini disebut <strong>hubungan linear</strong>. Kamu akan menemuinya lagi saat belajar fungsi dan grafik garis lurus.</p>`,
      },
      {
        jenis: 'ringkasan', judul: 'Ringkasan',
        poin: [
          `Rumus suku ke-n: <strong>${Un} = ${a} + (${n} − 1)${b}</strong>.`,
          'Langkah: <strong>kenali</strong> a, b, n → <strong>tulis rumus</strong> → <strong>substitusi</strong> → <strong>hitung</strong>.',
          `Hati-hati: kalikan ${b} dengan <strong>(${n} − 1)</strong>, bukan ${n}.`,
        ],
      },
    ],
  },
  {
    id: 'u4', judul: 'Deret Aritmatika', ikon: '➕', tp: 'TP4', menit: 9,
    ket: 'Jumlah n suku pertama (Sₙ)',
    kartu: [
      {
        jenis: 'teks', judul: 'Apa itu deret?',
        isi: `<p><strong>Deret aritmatika</strong> adalah <strong>penjumlahan</strong> suku-suku barisan aritmatika.</p><p>Barisan: 2, 4, 6, 8<br>Deret: 2 + 4 + 6 + 8 = 20</p><p>Jumlah ${n} suku pertama ditulis ${Sn}. Di sini S<sub>4</sub> = 20.</p>`,
      },
      {
        jenis: 'teks', judul: 'Cara cerdik Gauss',
        isi: `<p>Konon, Gauss kecil diminta menjumlahkan 1 + 2 + 3 + ... + 100. Ia memasangkan ujung-ujungnya:</p>
<svg class="vis" viewBox="0 0 320 120" role="img" aria-label="1 dipasangkan dengan 100, 2 dengan 99, 3 dengan 98, setiap pasangan berjumlah 101">
<g class="vis-angka" font-size="18" text-anchor="middle"><text x="30" y="95">1</text><text x="80" y="95">2</text><text x="130" y="95">3</text><text x="160" y="95" class="vis-redup">…</text><text x="190" y="95">98</text><text x="240" y="95">99</text><text x="290" y="95">100</text></g>
<path d="M30 76 Q160 -4 290 76" class="vis-busur"/><path d="M80 76 Q160 20 240 76" class="vis-busur"/><path d="M130 76 Q160 46 190 76" class="vis-busur"/>
<text x="160" y="22" text-anchor="middle" class="vis-beda">101</text><text x="160" y="46" text-anchor="middle" class="vis-beda">101</text><text x="160" y="66" text-anchor="middle" class="vis-beda" font-size="12">101</text></svg>
<p>Ada 50 pasangan, masing-masing berjumlah 101. Jadi hasilnya 50 × 101 = <span class="vu">5050</span>.</p>`,
      },
      {
        jenis: 'teks', judul: 'Rumus jumlah n suku',
        isi: `<p>Ide Gauss: (banyak pasangan) × (jumlah tiap pasangan) = ${n}/2 × (suku pertama + suku terakhir).</p>
<div class="rumus">${Sn} = <span class="vn">n</span>/2 × (${a} + ${Un})</div>
<p>Jika ${Un} belum diketahui, ganti dengan ${a} + (${n} − 1)${b}:</p>
<div class="rumus">${Sn} = <span class="vn">n</span>/2 × (2${a} + (${n} − 1)${b})</div>`,
      },
      {
        jenis: 'contoh', judul: 'Contoh: jumlah 10 suku pertama',
        soal: '<p>Tentukan jumlah 10 suku pertama dari deret <strong>3 + 7 + 11 + ...</strong></p>',
        langkah: [
          `<strong>Langkah 1. Kenali.</strong> ${a} = 3, ${b} = 4, ${n} = 10.`,
          `<strong>Langkah 2. Cari suku terakhir.</strong> U<sub>10</sub> = 3 + (10 − 1) × 4 = 3 + 36 = 39`,
          `<strong>Langkah 3. Tulis rumus.</strong> S<sub>10</sub> = 10/2 × (${a} + U<sub>10</sub>)`,
          '<strong>Langkah 4. Hitung.</strong> S<sub>10</sub> = 5 × (3 + 39) = 5 × 42 = <span class="vu">210</span>',
        ],
      },
      {
        jenis: 'cek', judul: 'Cek Pemahaman',
        tanya: '<p>Hasil dari <strong>1 + 2 + 3 + ... + 20</strong> adalah?</p>',
        opsi: ['420', '200', '210', '20'], kunci: 2,
        benar: 'S₂₀ = 20/2 × (1 + 20) = 10 × 21 = 210.',
        salah: 'Pakai Sₙ = n/2 × (a + Uₙ) dengan n = 20, a = 1, Uₙ = 20. Jangan lupa dibagi 2.',
      },
      {
        jenis: 'cek', judul: 'Cek Pemahaman',
        tanya: '<p>Rina menabung Rp2.000 di hari pertama, Rp4.000 di hari kedua, Rp6.000 di hari ketiga, dan seterusnya. Untuk mengetahui <strong>total tabungan selama 10 hari</strong>, yang dihitung adalah ...</p>',
        opsi: ['U₁₀ (suku ke-10)', 'S₁₀ (jumlah 10 suku)', 'Beda (b)', 'Suku pertama (a)'], kunci: 1,
        benar: 'Total = jumlah semua tabungan, jadi yang dihitung adalah deret S₁₀. U₁₀ hanya tabungan di hari ke-10.',
        salah: 'Kata "total" berarti menjumlahkan semuanya. Mana yang berarti jumlah?',
      },
      {
        // RMT: "relasi antar-relasi" (hlm. 184)
        jenis: 'teks', jembatan: true, judul: 'Selisih dari selisih',
        isi: `<p>Deret 2 + 4 + 6 + 8 + ...</p>
<table class="tabel-pola"><thead><tr><th>${n}</th><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead><tbody>
<tr><td>${Sn}</td><td>2</td><td>6</td><td>12</td><td>20</td></tr>
<tr><td>Selisih</td><td></td><td>4</td><td>6</td><td>8</td></tr>
<tr><td>Selisih dari selisih</td><td></td><td></td><td class="vb">2</td><td class="vb">2</td></tr></tbody></table>
<p>${Sn} bukan barisan aritmatika, tetapi <strong>selisih dari selisihnya tetap</strong>, yaitu sebesar ${b} = 2. Pola teratur tetap tersembunyi di dalamnya!</p>`,
      },
      {
        jenis: 'ringkasan', judul: 'Ringkasan',
        poin: [
          `Deret = penjumlahan suku-suku barisan. ${Sn} = jumlah ${n} suku pertama.`,
          `<strong>${Sn} = ${n}/2 × (${a} + ${Un})</strong> atau <strong>${Sn} = ${n}/2 × (2${a} + (${n} − 1)${b})</strong>.`,
          `Bedakan: ${Un} = <em>satu</em> suku; ${Sn} = <em>jumlah</em> banyak suku.`,
          'Hati-hati: jangan lupa <strong>dibagi 2</strong>.',
        ],
      },
    ],
  },
];

export function cariUnit(id) { return UNIT.find((u) => u.id === id); }
