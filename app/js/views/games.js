import { h } from '../ui.js';
import { ambil } from '../state.js';
import { maskot } from '../maskot.js';
import { bannerDunia, kartuLebar } from '../dunia.js';
import { posterGame } from '../ilustrasi.js';
import * as balon from '../games/balon.js';
import * as katak from '../games/katak.js';
import * as susun from '../games/susun.js';

const GAMES = [
  { id: 'balon', judul: 'Balon Pola', ikon: '🎈', warna: 'g-pink', ket: 'Pecahkan balon berisi suku yang hilang. Makin lama makin cepat!', materi: 'Beda & suku berikutnya', modul: balon },
  { id: 'katak', judul: 'Lompat Katak', ikon: '🐸', warna: 'g-hijau', ket: 'Bantu katak melompat tepat ke bunga dengan beda yang pas.', materi: 'Beda & suku ke-n', modul: katak },
  { id: 'susun', judul: 'Menara Angka', ikon: '🧱', warna: 'g-ungu', ket: 'Susun balok jadi barisan aritmatika dan temukan penyusupnya.', materi: 'Mengenali barisan', modul: susun },
];

export function tampilDaftar(root) {
  const p = ambil().permainan;
  root.append(
    bannerDunia('games', 'Arena Games', 'Belajar sambil bermain! Kumpulkan bintang dan pecahkan rekormu.', 'Pilih game favoritmu! 🎉'),
    h('div', { class: 'grid-game' }, GAMES.map((g, i) => h('div', { class: 'game-item' },
      kartuLebar({ href: `#/games/${g.id}`, ilustrasi: posterGame(g.id), judul: `${g.ikon} ${g.judul}`, sub: g.materi, peringkat: i + 1, rekor: p[g.id]?.rekor }),
      h('p', { class: 'kecil muted' }, g.ket)))),
    maskot({ pesan: 'Ayo main bareng! 🎮', kecil: true }),
    h('p', { class: 'kecil muted tengah' }, 'Games bersifat santai. Untuk belajar terarah tanpa batas waktu, gunakan menu Latihan.'),
  );
}

export function tampilGame(root, [id]) {
  const g = GAMES.find((x) => x.id === id);
  if (!g) {
    root.append(h('p', {}, 'Game tidak ditemukan.'), h('a', { class: 'btn btn-utama', href: '#/games' }, 'Kembali'));
    return null;
  }
  return g.modul.tampil(root);
}
