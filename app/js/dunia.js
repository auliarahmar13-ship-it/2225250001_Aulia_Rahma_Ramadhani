// Komponen "Dunia Belajar": banner halaman, baris kartu horizontal (gaya streaming), dan poster.

import { h } from './ui.js';
import { gambarTeman, pilihTeman } from './teman.js';

const TEMA_DUNIA = {
  materi: { nama: 'Perpustakaan Ajaib', ikon: '📚', kelas: 'dunia-materi' },
  latihan: { nama: 'Hutan Latihan', ikon: '🌳', kelas: 'dunia-latihan' },
  literasi: { nama: 'Kota Cerita', ikon: '🏙️', kelas: 'dunia-literasi' },
  kuis: { nama: 'Arena Juara', ikon: '🏟️', kelas: 'dunia-kuis' },
  games: { nama: 'Taman Bermain', ikon: '🎡', kelas: 'dunia-games' },
};

// Banner kecil di atas halaman daftar: memberi nuansa petualangan yang konsisten.
// Di sini siswa disambut Teman Belajar (Ari khusus di Beranda).
export function bannerDunia(tema, judul, sub, pesanTeman = '') {
  const t = TEMA_DUNIA[tema];
  const el = h('section', { class: `banner-dunia ${t.kelas}` },
    h('div', { class: 'banner-bintang', 'aria-hidden': 'true' }),
    h('div', { class: 'banner-teks' },
      h('span', { class: 'banner-dunia-nama' }, `${t.ikon} ${t.nama}`),
      h('h1', {}, judul),
      sub ? h('p', {}, sub) : null),
    h('div', { class: 'banner-teman' }, gambarTeman(pilihTeman(tema), { kelas: 'melayang-teman' })),
    pesanTeman ? h('div', { class: 'banner-gelembung' }, pesanTeman) : null);
  return el;
}

// Baris kartu yang bisa digeser (scroll-snap), dengan tombol panah di layar lebar
export function barisKartu(judul, kartu, { lihatSemua, kelas = '', sub } = {}) {
  const rel = h('div', { class: `rel ${kelas}`, role: 'list' }, kartu.map((k, i) => {
    k.style.setProperty('--i', i);
    k.setAttribute('role', 'listitem');
    return k;
  }));
  const geser = (arah) => rel.scrollBy({ left: arah * rel.clientWidth * 0.8, behavior: 'smooth' });
  return h('section', { class: 'baris' },
    h('header', { class: 'baris-kepala' },
      h('div', {}, h('h2', {}, judul), sub ? h('p', { class: 'baris-sub' }, sub) : null),
      lihatSemua ? h('a', { class: 'lihat-semua', href: lihatSemua }, 'Lihat semua ›') : null),
    h('div', { class: 'rel-bungkus' },
      h('button', { class: 'rel-panah kiri', type: 'button', 'aria-label': 'Geser ke kiri', onclick: () => geser(-1) }, '‹'),
      rel,
      h('button', { class: 'rel-panah kanan', type: 'button', 'aria-label': 'Geser ke kanan', onclick: () => geser(1) }, '›')));
}

// Poster tegak 2:3
export function poster({ href, ilustrasi, judul, sub, label, progres = null, selesai = false, baru = false }) {
  return h('a', { class: `poster ${selesai ? 'selesai' : ''}`, href, 'aria-label': `${label ? `${label}: ` : ''}${judul}${selesai ? ' (selesai)' : ''}` },
    h('div', { class: 'poster-gambar', html: ilustrasi }),
    h('div', { class: 'poster-kilap', 'aria-hidden': 'true' }),
    label ? h('span', { class: 'poster-label' }, label) : null,
    selesai ? h('span', { class: 'poster-cap cap-ok' }, '✓ Selesai') : baru ? h('span', { class: 'poster-cap' }, 'BARU') : null,
    h('div', { class: 'poster-info' },
      h('span', { class: 'poster-judul' }, judul),
      sub ? h('span', { class: 'poster-sub' }, sub) : null,
      progres !== null ? h('span', { class: 'poster-progres' }, h('span', { style: `width:${Math.round(progres * 100)}%` })) : null));
}

// Kartu lebar 16:9, opsional dengan nomor peringkat besar
export function kartuLebar({ href, ilustrasi, judul, sub, peringkat, rekor }) {
  return h('a', { class: `kartu-lebar ${peringkat ? 'berperingkat' : ''}`, href, 'aria-label': judul },
    peringkat ? h('span', { class: 'peringkat', 'aria-hidden': 'true' }, String(peringkat)) : null,
    h('div', { class: 'kartu-lebar-gambar' },
      h('div', { class: 'poster-gambar', html: ilustrasi }),
      h('div', { class: 'poster-kilap', 'aria-hidden': 'true' }),
      rekor ? h('span', { class: 'poster-cap' }, `🏅 ${rekor}`) : null,
      h('div', { class: 'poster-info' }, h('span', { class: 'poster-judul' }, judul), sub ? h('span', { class: 'poster-sub' }, sub) : null)));
}
