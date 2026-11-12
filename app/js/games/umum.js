// Bagian bersama untuk semua games: layar mulai, layar akhir, konfeti, acak.

import { h } from '../ui.js';
import { ambil, catatPermainan } from '../state.js';
import { efek } from '../audio.js';
import { maskot, sorak } from '../maskot.js';

export const acak = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pilih = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function konfeti(wadah = document.body, jumlah = 60) {
  if (!ambil().pengaturan.animasi || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const warna = ['#ff4fa3', '#a855f7', '#facc15', '#22d3ee', '#4ade80', '#fb923c'];
  const lapis = h('div', { class: 'konfeti', 'aria-hidden': 'true' });
  for (let i = 0; i < jumlah; i++) {
    const k = h('i');
    k.style.left = `${Math.random() * 100}%`;
    k.style.background = pilih(warna);
    k.style.animationDelay = `${Math.random() * 0.6}s`;
    k.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    k.style.setProperty('--putar', `${acak(-540, 540)}deg`);
    k.style.setProperty('--geser', `${acak(-60, 60)}px`);
    if (Math.random() < 0.4) k.style.borderRadius = '50%';
    lapis.append(k);
  }
  wadah.append(lapis);
  setTimeout(() => lapis.remove(), 3600);
}

export function layarMulai(root, { id, judul, ikon, warna, cara, onMulai }) {
  const rekor = ambil().permainan[id]?.rekor || 0;
  root.replaceChildren(
    h('section', { class: `kartu game-mulai ${warna}` },
      h('div', { class: 'game-ikon-besar', 'aria-hidden': 'true' }, ikon),
      h('h1', {}, judul),
      rekor ? h('p', { class: 'rekor' }, `🏅 Rekormu: ${rekor}`) : null,
      h('div', { class: 'cara-main' },
        h('strong', {}, 'Cara main:'),
        h('ol', {}, cara.map((c) => h('li', { html: c })))),
      h('button', { class: 'btn btn-utama btn-besar lebar', onclick: () => { efek('selesai'); onMulai(); } }, '▶ Mulai Main!'),
      h('a', { class: 'btn btn-ghost lebar', href: '#/games' }, 'Pilih game lain')),
  );
  window.scrollTo({ top: 0 });
}

// bintang: 0–3
export function layarAkhir(root, { id, skor, bintang, ringkasan, onUlang }) {
  const rekorBaru = catatPermainan(id, skor);
  const m = maskot({ pesan: bintang >= 2 ? 'Keren banget! 🎉' : 'Ayo coba lagi! 💪', kecil: true });
  root.replaceChildren(
    h('section', { class: 'kartu game-akhir' },
      h('div', { class: 'bintang-wadah', 'aria-label': `${bintang} dari 3 bintang` },
        [0, 1, 2].map((i) => h('span', { class: `bintang ${i < bintang ? 'nyala' : ''}`, style: `animation-delay:${0.2 + i * 0.25}s` }, '★'))),
      h('h1', {}, rekorBaru && skor > 0 ? '🏅 Rekor baru!' : bintang >= 2 ? 'Hebat!' : 'Permainan selesai'),
      h('div', { class: 'skor-besar' }, String(skor)),
      h('p', { class: 'muted' }, ringkasan),
      m,
      h('div', { class: 'tumpuk-tombol' },
        h('button', { class: 'btn btn-utama btn-besar', onclick: onUlang }, '🔁 Main lagi'),
        h('a', { class: 'btn btn-sekunder', href: '#/games' }, '🎮 Game lain'),
        h('a', { class: 'btn btn-ghost', href: '#/latihan' }, '✏️ Latihan soal'))),
  );
  window.scrollTo({ top: 0 });
  efek(rekorBaru && skor > 0 ? 'rekor' : 'selesai');
  if (bintang >= 2 || rekorBaru) { konfeti(); setTimeout(() => sorak(m), 300); }
}

export function bintangDari(benar, total) {
  const r = benar / total;
  return r >= 0.85 ? 3 : r >= 0.6 ? 2 : r >= 0.3 ? 1 : 0;
}
