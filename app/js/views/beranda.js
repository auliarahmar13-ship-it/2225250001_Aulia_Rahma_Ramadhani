import { h } from '../ui.js';
import { ambil } from '../state.js';
import { UNIT } from '../data/materi.js';
import { LITERASI } from '../data/literasi.js';
import { bisaPasang, pasang, sudahTerpasang, iOS } from '../pasang.js';

export function langkahBelajar() {
  const d = ambil();
  const langkah = UNIT.map((u, i) => ({
    no: i + 1, judul: u.judul, ikon: u.ikon, ket: u.ket, href: `#/materi/${u.id}`, selesai: !!d.materiSelesai[u.id],
  }));
  langkah.push({ no: 5, judul: 'Latihan', ikon: '✏️', ket: 'Minimal 10 soal', href: '#/latihan', selesai: d.latihan.length >= 10 });
  const litSelesai = LITERASI.filter((l) => d.literasiSelesai[l.id]).length;
  langkah.push({ no: 6, judul: 'Literasi Matematika', ikon: '📖', ket: `${litSelesai}/${LITERASI.length} masalah`, href: '#/literasi', selesai: litSelesai >= 3 });
  langkah.push({ no: 7, judul: 'Kuis', ikon: '🏆', ket: '15 soal', href: '#/kuis', selesai: d.kuis.length > 0 });
  return langkah;
}

export function tampil(root) {
  const d = ambil();
  const nama = d.profil.nama.trim();
  const langkah = langkahBelajar();
  const berikut = langkah.find((l) => !l.selesai);
  const jumlahSelesai = langkah.filter((l) => l.selesai).length;

  root.append(
    h('section', { class: 'sapaan' },
      h('h1', {}, `Halo, ${nama || 'Sobat Matematika'}! 👋`),
      h('p', {}, 'Ayo belajar barisan & deret aritmatika, sedikit demi sedikit.')),

    berikut
      ? h('a', { class: 'kartu kartu-lanjut', href: berikut.href },
        h('div', { class: 'kartu-lanjut-ikon', 'aria-hidden': 'true' }, berikut.ikon),
        h('div', {},
          h('div', { class: 'kecil muted' }, jumlahSelesai ? 'Lanjutkan belajar' : 'Mulai dari sini'),
          h('div', { class: 'tebal' }, `Langkah ${berikut.no}: ${berikut.judul}`),
          h('div', { class: 'kecil muted' }, berikut.ket)),
        h('span', { class: 'panah', 'aria-hidden': 'true' }, '→'))
      : h('div', { class: 'kartu kartu-selamat' }, '🎉 Hebat! Semua langkah sudah selesai. Coba kuis lagi untuk meningkatkan skormu.'),

    h('h2', { class: 'judul-bagian' }, 'Peta Belajar'),
    h('ol', { class: 'peta' }, langkah.map((l) => h('li', {},
      h('a', { href: l.href, class: `peta-item ${l.selesai ? 'selesai' : ''} ${l === berikut ? 'aktif' : ''}` },
        h('span', { class: 'peta-no', 'aria-hidden': 'true' }, l.selesai ? '✓' : String(l.no)),
        h('span', { class: 'peta-teks' }, h('span', { class: 'tebal' }, `${l.ikon} ${l.judul}`), h('span', { class: 'kecil muted' }, l.ket)),
        l.selesai ? h('span', { class: 'sr-only' }, '(selesai)') : null)))),

    kartuPasang(),

    h('div', { class: 'kartu kartu-tips' },
      h('strong', {}, '💡 Tips belajar'),
      h('ul', {},
        h('li', {}, 'Belajar 5–10 menit, lalu istirahat sebentar.'),
        h('li', {}, 'Tekan 🔊 untuk mendengarkan penjelasan.'),
        h('li', {}, 'Musik bisa dimatikan lewat tombol 🎵 di atas.'))),
  );
}

function kartuPasang() {
  if (sudahTerpasang()) return null;
  if (bisaPasang()) {
    return h('div', { class: 'kartu kartu-pasang' },
      h('div', {}, h('strong', {}, '📲 Pasang DeretKu'), h('p', { class: 'kecil' }, 'Buka lebih cepat dari layar utama, dan bisa dipakai tanpa internet.')),
      h('button', { class: 'btn btn-utama', onclick: pasang }, 'Pasang'));
  }
  if (iOS()) {
    return h('div', { class: 'kartu kartu-pasang' },
      h('div', {}, h('strong', {}, '📲 Pasang di iPhone'),
        h('p', { class: 'kecil' }, 'Ketuk tombol Bagikan (kotak dengan panah) di Safari, lalu pilih "Tambah ke Layar Utama".')));
  }
  return null;
}
