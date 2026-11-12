// Pembuat soal latihan acak (5 jenis × 3 level).
// Setiap soal membawa: petunjuk bertahap (scaffolding), kerangka rumus (fading),
// dan pembahasan langkah demi langkah (worked example).

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

function parameter(level) {
  if (level === 1) return { a: acak(1, 20), b: acak(1, 5) };
  if (level === 2) return { a: acak(-5, 30), b: acak(2, 9) };
  return { a: acak(-15, 60), b: pilih([-9, -7, -6, -5, -4, -3, -2, 3, 4, 6, 7, 8, 11, 12, 15]) };
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
