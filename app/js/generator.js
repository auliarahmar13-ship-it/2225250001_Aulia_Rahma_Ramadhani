// Pembuat soal latihan acak (5 jenis × 3 level).
// Setiap soal membawa: petunjuk bertahap (scaffolding), kerangka rumus (fading),
// dan pembahasan langkah demi langkah (worked example).
// RMT (docs/08 Tahap 2): `ditanya` + `alasanDitanya` untuk langkah "Apa yang ditanyakan?"
// (C3 mendefinisikan masalah, hlm. 87, 92, 137) dan `bukti` (1 alasan benar + 2 pengecoh beserta
// `kenapa`) untuk langkah "Buktikan" (C2 bukti logis matematis, hlm. 87, 166).

import { fmt, fmtK } from './ui.js';

const acak = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pilih = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const U = (a, b, n) => a + (n - 1) * b;
export const S = (a, b, n) => (n * (2 * a + (n - 1) * b)) / 2;

const A = (x) => `<span class="va">${x}</span>`;
const B = (x) => `<span class="vb">${x}</span>`;
const N = (x) => `<span class="vn">${x}</span>`;
const UU = (x) => `<span class="vu">${x}</span>`;
const Un = (i) => `U<sub>${i}</sub>`;
const Sn = (i) => `S<sub>${i}</sub>`;
const daftar = (xs) => xs.map(fmt).join(', ');

export const JENIS = [
  { id: 'beda', judul: 'Menentukan Beda', ikon: '↔️', ket: 'Cari selisih tetap (b)' },
  { id: 'berikutnya', judul: 'Suku Berikutnya', ikon: '⏭️', ket: 'Lanjutkan pola' },
  { id: 'suku-n', judul: 'Suku ke-n', ikon: '🎯', ket: 'Pakai rumus Uₙ' },
  { id: 'cari-n', judul: 'Banyak Suku', ikon: '🔍', ket: 'Cari nilai n' },
  { id: 'jumlah', judul: 'Jumlah n Suku', ikon: '➕', ket: 'Pakai rumus Sₙ' },
];

export const NAMA_LEVEL = ['', 'Mudah', 'Sedang', 'Sulit'];

// Pilihan langkah "Apa yang ditanyakan?" (warna sinyal a/b/n/Uₙ tetap dipakai)
export const OPSI_DITANYA = [
  { id: 'b', html: `${B('Beda (b)')}: selisih tetap antarsuku` },
  { id: 'U', html: `${UU('Satu suku (U<sub>n</sub>)')}: bilangan pada urutan tertentu` },
  { id: 'n', html: `${N('Banyak suku (n)')}: berapa banyak bilangannya` },
  { id: 'S', html: `${UU('Jumlah (S<sub>n</sub>)')}: hasil penjumlahan beberapa suku` },
];

function parameter(level) {
  if (level === 1) return { a: acak(1, 20), b: acak(1, 5) };
  if (level === 2) return { a: acak(-5, 30), b: acak(2, 9) };
  return { a: acak(-15, 60), b: pilih([-9, -7, -6, -5, -4, -3, -2, 3, 4, 6, 7, 8, 11, 12, 15]) };
}

// Pilih 2 pengecoh "Buktikan" yang benar-benar keliru: kandidat yang angkanya kebetulan sama dengan
// jawaban dibuang. `nilai: null` = kekeliruan penalaran tanpa angka salah (mis. bukti tidak lengkap),
// ditandai `tanpaAngka`.
function pengecoh(jawaban, ...kandidat) {
  return kandidat
    .filter((k) => k.nilai === null || Math.abs(k.nilai - jawaban) > 1e-9)
    .slice(0, 2)
    .map(({ teks, kenapa, nilai }) => (nilai === null ? { teks, kenapa, tanpaAngka: true } : { teks, kenapa }));
}

function rentangN(level, [m1, M1], [m2, M2], [m3, M3]) {
  return level === 1 ? acak(m1, M1) : level === 2 ? acak(m2, M2) : acak(m3, M3);
}

export function buatSoal(jenis, level = 1) {
  const { a, b } = parameter(level);
  const s = (k) => Array.from({ length: k }, (_, i) => U(a, b, i + 1));

  switch (jenis) {
    case 'beda': {
      const x = s(4);
      return {
        jenis, level, suku: [...x, '…'],
        teks: `Tentukan <strong>beda (b)</strong> dari barisan <span class="angka-barisan">${daftar(x)}, ...</span>`,
        jawaban: b,
        kerangka: `${B('b')} = ${Un(2)} − ${Un(1)}`,
        petunjuk: [
          'Beda adalah selisih dua suku yang <strong>berurutan</strong>: suku sesudah dikurangi suku sebelum.',
          `${B('b')} = ${Un(2)} − ${Un(1)} = ${fmt(x[1])} − ${fmtK(x[0])}`,
          b < 0 ? 'Barisannya <strong>turun</strong>, jadi bedanya bernilai negatif (pakai tombol ±).' : 'Barisannya naik, jadi bedanya positif.',
        ],
        pembahasan: [
          `${B('b')} = ${Un(2)} − ${Un(1)} = ${fmt(x[1])} − ${fmtK(x[0])} = ${B(fmt(b))}`,
          `Periksa: ${fmt(x[2])} − ${fmtK(x[1])} = ${fmt(b)} ✓ (selisihnya selalu sama)`,
        ],
        ditanya: 'b',
        alasanDitanya: 'Soal meminta <strong>beda</strong>, yaitu selisih tetap antara dua suku yang berurutan.',
        bukti: {
          benar: `Selisih setiap dua suku berurutan selalu sama: ${fmt(x[1])} − ${fmtK(x[0])} = ${fmt(b)} dan ${fmt(x[2])} − ${fmtK(x[1])} = ${fmt(b)}.`,
          pengecoh: pengecoh(b,
            { nilai: null, // angka benar, tetapi bukti TIDAK LENGKAP (A3 mencari secara sistematis)
              teks: `Cukup hitung ${fmt(x[1])} − ${fmtK(x[0])} = ${fmt(b)}; suku lain tidak perlu diperiksa.`,
              kenapa: 'Satu selisih belum membuktikan bahwa bedanya <strong>tetap</strong>. Bukti yang lengkap memeriksa lebih dari satu pasangan suku.' },
            { nilai: -b, teks: `Beda = suku pertama − suku kedua = ${fmt(x[0])} − ${fmtK(x[1])}.`,
              kenapa: `Urutannya terbalik. Beda = suku <strong>sesudah</strong> − suku <strong>sebelum</strong>, jadi hasilnya ${fmt(b)}, bukan ${fmt(-b)}.` },
            { nilai: x[0] + x[1], teks: `Beda = suku pertama + suku kedua = ${fmt(x[0])} + ${fmtK(x[1])}.`,
              kenapa: 'Beda adalah <strong>selisih</strong> (dikurangi), bukan jumlah dua suku.' }),
        },
      };
    }
    case 'berikutnya': {
      const x = s(4);
      return {
        jenis, level, suku: [...x, '?'],
        teks: `Bilangan berikutnya dari barisan <span class="angka-barisan">${daftar(x)}, ...</span> adalah?`,
        jawaban: U(a, b, 5),
        kerangka: `${Un(5)} = ${Un(4)} + ${B('b')}`,
        petunjuk: [
          'Cari dulu bedanya: suku kedua dikurangi suku pertama.',
          `${B('b')} = ${fmt(x[1])} − ${fmtK(x[0])} = ${fmt(b)}`,
          `Suku berikutnya = suku terakhir + beda = ${fmt(x[3])} + ${fmtK(b)}`,
        ],
        pembahasan: [
          `${B('b')} = ${fmt(x[1])} − ${fmtK(x[0])} = ${B(fmt(b))}`,
          `${Un(5)} = ${fmt(x[3])} + ${fmtK(b)} = ${UU(fmt(U(a, b, 5)))}`,
        ],
        ditanya: 'U',
        alasanDitanya: 'Soal meminta <strong>bilangan berikutnya</strong>, yaitu SATU suku sesudah suku terakhir (U<sub>5</sub>).',
        bukti: {
          benar: `Bedanya tetap ${fmt(b)} (${fmt(x[1])} − ${fmtK(x[0])} = ${fmt(b)}), jadi U<sub>5</sub> = ${fmt(x[3])} + ${fmtK(b)} = ${fmt(U(a, b, 5))}.`,
          pengecoh: pengecoh(U(a, b, 5),
            { nilai: null, // tanpa aturan & perhitungan: bukan bukti logis (C2)
              teks: `Angka ${fmt(U(a, b, 5))} terlihat cocok dengan polanya.`,
              kenapa: '"Terlihat cocok" belum menjadi bukti. Bukti matematis menyebutkan aturannya (beda tetap) dan menunjukkan perhitungannya.' },
            { nilai: x[3] + a, teks: `Suku berikutnya = suku terakhir + suku pertama = ${fmt(x[3])} + ${fmtK(a)}.`,
              kenapa: `Yang ditambahkan ke suku terakhir adalah <strong>beda</strong> (${fmt(b)}), bukan suku pertama (${fmt(a)}).` },
            { nilai: x[3] * 2, teks: `Suku berikutnya = suku terakhir × 2 = ${fmt(x[3])} × 2.`,
              kenapa: `Barisan aritmatika bertambah dengan <strong>beda</strong> tetap (${b >= 0 ? '+' : '−'}${fmt(Math.abs(b))}), bukan dikali.` },
            { nilai: x[3] + 1, teks: `Suku berikutnya = suku terakhir + 1 = ${fmt(x[3])} + 1.`,
              kenapa: `Yang ditambahkan adalah <strong>beda</strong> (${fmt(b)}), bukan selalu 1.` }),
        },
      };
    }
    case 'suku-n': {
      const n = rentangN(level, [6, 15], [16, 30], [31, 60]);
      const x = s(3);
      const hasil = U(a, b, n);
      return {
        jenis, level, suku: [...x, '…'],
        teks: `Tentukan <strong>suku ke-${n}</strong> (${Un(n)}) dari barisan <span class="angka-barisan">${daftar(x)}, ...</span>`,
        jawaban: hasil,
        kerangka: `${UU('U<sub>n</sub>')} = ${A('a')} + (${N('n')} − 1)${B('b')}`,
        petunjuk: [
          `Kenali dulu: ${A('a')} = suku pertama, ${B('b')} = beda, ${N('n')} = ${n}.`,
          `${A('a')} = ${fmt(a)}, ${B('b')} = ${fmt(b)}, ${N('n')} = ${n}. Rumus: ${UU(Un('n'))} = ${A('a')} + (${N('n')} − 1)${B('b')}`,
          `${Un(n)} = ${fmt(a)} + (${n} − 1) × ${fmtK(b)} = ${fmt(a)} + ${n - 1} × ${fmtK(b)}`,
        ],
        pembahasan: [
          `${A('a')} = ${fmt(a)}, ${B('b')} = ${fmt(x[1])} − ${fmtK(x[0])} = ${fmt(b)}, ${N('n')} = ${n}`,
          `${Un(n)} = ${fmt(a)} + (${n} − 1) × ${fmtK(b)}`,
          `${Un(n)} = ${fmt(a)} + ${fmtK((n - 1) * b)} = ${UU(fmt(hasil))}`,
        ],
        ditanya: 'U',
        alasanDitanya: `Soal meminta <strong>suku ke-${n}</strong>, yaitu SATU bilangan pada urutan ke-${n}, bukan jumlah semua suku.`,
        bukti: {
          benar: `${Un(n)} = a + (n − 1)b = ${fmt(a)} + (${n} − 1) × ${fmtK(b)} = ${fmt(hasil)}.`,
          pengecoh: pengecoh(hasil,
            { nilai: a + n * b, teks: `${Un(n)} = a + n × b = ${fmt(a)} + ${n} × ${fmtK(b)}.`,
              kenapa: `Dari U<sub>1</sub> ke ${Un(n)} hanya ada ${n - 1} lompatan, jadi beda ditambahkan (n − 1) kali, bukan n kali.` },
            { nilai: n * b, teks: `${Un(n)} = n × b = ${n} × ${fmtK(b)}.`,
              kenapa: 'Suku pertama (a) terlupa. Setiap suku dimulai dari a, lalu ditambah beda.' },
            { nilai: (n - 1) * b, teks: `${Un(n)} = (n − 1) × b = (${n} − 1) × ${fmtK(b)}.`,
              kenapa: 'Suku pertama (a) belum ditambahkan. Rumusnya Uₙ = a + (n − 1)b.' },
            { nilai: a * n, teks: `${Un(n)} = a × n = ${fmt(a)} × ${n}.`,
              kenapa: 'Suku pertama tidak dikali n. Suku ke-n diperoleh dari a ditambah beda sebanyak (n − 1) kali.' }),
        },
      };
    }
    case 'cari-n': {
      const n = rentangN(level, [6, 15], [16, 30], [20, 50]);
      const x = s(3);
      const akhir = U(a, b, n);
      return {
        jenis, level, suku: [...x, '…', akhir],
        teks: `Berapa <strong>banyak suku</strong> pada barisan <span class="angka-barisan">${daftar(x)}, ..., ${fmt(akhir)}</span>?`,
        jawaban: n,
        kerangka: `${fmt(akhir)} = ${A('a')} + (${N('n')} − 1)${B('b')}`,
        petunjuk: [
          `Suku terakhir ${fmt(akhir)} adalah ${Un('n')}. Yang dicari adalah ${N('n')}.`,
          `${fmt(akhir)} = ${fmt(a)} + (${N('n')} − 1) × ${fmtK(b)}`,
          `(${N('n')} − 1) = (${fmt(akhir)} − ${fmtK(a)}) : ${fmtK(b)}. Jangan lupa tambah 1 di akhir!`,
        ],
        pembahasan: [
          `${A('a')} = ${fmt(a)}, ${B('b')} = ${fmt(b)}, ${Un('n')} = ${fmt(akhir)}`,
          `${fmt(akhir)} − ${fmtK(a)} = (${N('n')} − 1) × ${fmtK(b)} → ${fmt(akhir - a)} = (${N('n')} − 1) × ${fmtK(b)}`,
          `${N('n')} − 1 = ${fmt(n - 1)} → ${N('n')} = ${N(String(n))}`,
        ],
        ditanya: 'n',
        alasanDitanya: 'Soal meminta <strong>banyak suku</strong>, yaitu berapa banyak bilangan di barisan itu (n).',
        bukti: {
          benar: `n − 1 = (${fmt(akhir)} − ${fmtK(a)}) : ${fmtK(b)} = ${fmt(n - 1)}, jadi n = ${fmt(n - 1)} + 1 = ${n}.`,
          pengecoh: pengecoh(n,
            { nilai: n - 1, teks: `n = (${fmt(akhir)} − ${fmtK(a)}) : ${fmtK(b)} = ${fmt(n - 1)}.`,
              kenapa: 'Hasil pembagian itu adalah banyaknya <strong>lompatan</strong> (n − 1). Banyak suku selalu satu lebih banyak, jadi perlu ditambah 1.' },
            { nilai: akhir - a, teks: `n = ${fmt(akhir)} − ${fmtK(a)} = ${fmt(akhir - a)}.`,
              kenapa: 'Selisih suku terakhir dan suku pertama harus dibagi beda dulu, karena setiap lompatan bernilai b.' },
            { nilai: n - 2, teks: `n = (${fmt(akhir)} − ${fmtK(a)}) : ${fmtK(b)} − 1 = ${fmt(n - 2)}.`,
              kenapa: 'Banyak suku = banyak lompatan <strong>ditambah</strong> 1, bukan dikurangi 1.' }),
        },
      };
    }
    case 'jumlah': {
      const n = rentangN(level, [5, 10], [11, 20], [15, 30]);
      const x = s(3);
      const un = U(a, b, n);
      const hasil = S(a, b, n);
      return {
        jenis, level, suku: [...x, '…'],
        teks: `Tentukan <strong>jumlah ${n} suku pertama</strong> (${Sn(n)}) dari deret <span class="angka-barisan">${x.map(fmtK).join(' + ')} + ...</span>`,
        jawaban: hasil,
        kerangka: `${UU('S<sub>n</sub>')} = ${N('n')}/2 × (${A('a')} + ${UU('U<sub>n</sub>')})`,
        petunjuk: [
          `Cari dulu suku terakhirnya, yaitu ${Un(n)} = ${A('a')} + (${N('n')} − 1)${B('b')}.`,
          `${Un(n)} = ${fmt(a)} + ${n - 1} × ${fmtK(b)} = ${fmt(un)}`,
          `${Sn(n)} = ${n}/2 × (${fmt(a)} + ${fmtK(un)}). Ingat: dibagi 2!`,
        ],
        pembahasan: [
          `${A('a')} = ${fmt(a)}, ${B('b')} = ${fmt(b)}, ${N('n')} = ${n}`,
          `${Un(n)} = ${fmt(a)} + (${n} − 1) × ${fmtK(b)} = ${fmt(un)}`,
          `${Sn(n)} = ${n}/2 × (${fmt(a)} + ${fmtK(un)}) = ${fmt(n / 2)} × ${fmtK(a + un)} = ${UU(fmt(hasil))}`,
        ],
        ditanya: 'S',
        alasanDitanya: `Soal meminta <strong>jumlah ${n} suku pertama</strong>, yaitu hasil penjumlahan semua suku dari U<sub>1</sub> sampai ${Un(n)}.`,
        bukti: {
          benar: `${Sn(n)} = n/2 × (a + ${Un(n)}) = ${n}/2 × (${fmt(a)} + ${fmtK(un)}) = ${fmt(hasil)}.`,
          pengecoh: pengecoh(hasil,
            { nilai: n * (a + un), teks: `${Sn(n)} = n × (a + ${Un(n)}) = ${n} × (${fmt(a)} + ${fmtK(un)}).`,
              kenapa: 'Lupa dibagi 2. Pasangan "suku pertama + suku terakhir" hanya ada sebanyak n/2 pasang.' },
            { nilai: un, teks: `${Sn(n)} = ${Un(n)} = ${fmt(un)}.`,
              kenapa: `Itu hanya SATU suku (suku ke-${n}). Jumlah berarti semua suku dari U<sub>1</sub> sampai ${Un(n)} ditambahkan.` },
            { nilai: n * un, teks: `${Sn(n)} = n × ${Un(n)} = ${n} × ${fmtK(un)}.`,
              kenapa: 'Mengalikan suku terakhir dengan n sama saja menganggap semua suku sama besar dengan suku terakhir.' },
            { nilai: (n / 2) * (a + b), teks: `${Sn(n)} = n/2 × (a + b) = ${n}/2 × (${fmt(a)} + ${fmtK(b)}).`,
              kenapa: `Rumus jumlah memakai suku pertama dan suku <strong>terakhir</strong> (${Un(n)}), bukan beda.` }),
        },
      };
    }
    default:
      throw new Error(`Jenis soal tidak dikenal: ${jenis}`);
  }
}

// Ubah input siswa menjadi bilangan: terima "−12", "-12", "1.275", "1 275"
export function bacaJawaban(teks) {
  const bersih = String(teks).trim().replace(/[−–]/g, '-').replace(/[.\s]/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(bersih)) return null;
  return Number(bersih);
}
