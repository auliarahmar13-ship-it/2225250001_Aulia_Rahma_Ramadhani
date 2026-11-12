import { h } from '../ui.js';
import { ambil } from '../state.js';
import { maskot } from '../maskot.js';
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
    h('section', { class: 'game-hero' },
      h('h1', {}, '🎮 Games Aritmatika'),
      h('p', {}, 'Belajar sambil bermain! Kumpulkan bintang dan pecahkan rekormu.'),
      maskot({ pesan: 'Pilih game favoritmu! 🎉', kecil: true })),
    h('div', { class: 'daftar-game' }, GAMES.map((g) => h('a', { class: `kartu-game ${g.warna}`, href: `#/games/${g.id}` },
      h('span', { class: 'kartu-game-ikon', 'aria-hidden': 'true' }, g.ikon),
      h('span', { class: 'kartu-game-teks' },
        h('span', { class: 'kartu-game-judul' }, g.judul),
        h('span', { class: 'kartu-game-ket' }, g.ket),
        h('span', { class: 'kartu-game-label' }, `📘 ${g.materi}`)),
      h('span', { class: 'kartu-game-rekor' }, p[g.id]?.rekor ? `🏅 ${p[g.id].rekor}` : 'Baru!')))),
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
