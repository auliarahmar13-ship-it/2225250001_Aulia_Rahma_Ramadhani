// Titik masuk DeretKu: router hash, kerangka, audio, dan service worker.

import { ambil, aturPengaturan } from './state.js';
import { siapkan, mulaiMusik, hentikanMusik, musikAktif, hentikanNarasi, efek } from './audio.js';
import { saatStatusPasang } from './pasang.js';
import * as beranda from './views/beranda.js';
import * as materi from './views/materi.js';
import * as latihan from './views/latihan.js';
import * as kuis from './views/kuis.js';
import * as literasi from './views/literasi.js';
import * as saya from './views/saya.js';

const RUTE = [
  { pola: /^\/$/, view: beranda.tampil, judul: 'DeretKu', tab: 'beranda' },
  { pola: /^\/materi$/, view: materi.tampilDaftar, judul: 'Materi', tab: 'materi' },
  { pola: /^\/materi\/(\w+)$/, view: materi.tampilUnit, judul: 'Materi', tab: 'materi', induk: '#/materi' },
  { pola: /^\/latihan$/, view: latihan.tampilDaftar, judul: 'Latihan', tab: 'latihan' },
  { pola: /^\/latihan\/([\w-]+)$/, view: latihan.tampilSesi, judul: 'Latihan', tab: 'latihan', induk: '#/latihan' },
  { pola: /^\/literasi$/, view: literasi.tampilDaftar, judul: 'Literasi', tab: 'literasi' },
  { pola: /^\/literasi\/(\w+)$/, view: literasi.tampilMasalah, judul: 'Literasi', tab: 'literasi', induk: '#/literasi' },
  { pola: /^\/kuis$/, view: kuis.tampil, judul: 'Kuis', tab: 'kuis' },
  { pola: /^\/saya$/, view: saya.tampil, judul: 'Saya', tab: 'saya' },
];

const main = document.getElementById('app');
const judul = document.getElementById('judul-halaman');
const tombolKembali = document.getElementById('tombol-kembali');
const tombolMusik = document.getElementById('tombol-musik');
let bersihkan = null;
let induk = '#/';

function render() {
  if (typeof bersihkan === 'function') bersihkan();
  bersihkan = null;
  hentikanNarasi();
  document.querySelectorAll('.modal-latar').forEach((m) => m.remove());

  const jalur = (location.hash.replace(/^#/, '') || '/').replace(/\/+$/, '') || '/';
  let cocok = null, param = [];
  for (const r of RUTE) {
    const m = jalur.match(r.pola);
    if (m) { cocok = r; param = m.slice(1); break; }
  }
  if (!cocok) { location.replace('#/'); return; }

  main.replaceChildren();
  judul.textContent = cocok.judul;
  document.title = cocok.judul === 'DeretKu' ? 'DeretKu: Barisan & Deret Aritmatika' : `${cocok.judul} · DeretKu`;
  induk = cocok.induk || '#/';
  tombolKembali.hidden = !cocok.induk;
  document.querySelectorAll('.tab').forEach((t) => {
    const aktif = t.dataset.tab === cocok.tab;
    t.classList.toggle('aktif', aktif);
    if (aktif) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
  bersihkan = cocok.view(main, param) || null;
  window.scrollTo({ top: 0 });
  main.focus({ preventScroll: true });
}

tombolKembali.addEventListener('click', () => { location.hash = induk; });

// ---- musik
function perbaruiTombolMusik() {
  const on = ambil().pengaturan.musik;
  tombolMusik.textContent = on ? '🎵' : '🔇';
  tombolMusik.setAttribute('aria-label', on ? 'Matikan musik' : 'Nyalakan musik');
  tombolMusik.setAttribute('aria-pressed', on ? 'true' : 'false');
}
tombolMusik.addEventListener('click', () => {
  const on = !ambil().pengaturan.musik;
  aturPengaturan('musik', on);
  siapkan();
  if (on) mulaiMusik(); else hentikanMusik();
  perbaruiTombolMusik();
});

// Browser hanya mengizinkan suara setelah interaksi pertama pengguna
function interaksiPertama() {
  siapkan();
  if (ambil().pengaturan.musik && !musikAktif()) mulaiMusik();
  window.removeEventListener('pointerdown', interaksiPertama);
  window.removeEventListener('keydown', interaksiPertama);
}
window.addEventListener('pointerdown', interaksiPertama);
window.addEventListener('keydown', interaksiPertama);

// Bunyi klik halus untuk navigasi
document.addEventListener('click', (e) => {
  const el = e.target.closest('.tab, a.btn, a.item-daftar, a.peta-item');
  if (el) efek('klik');
});

// ---- tampilan
document.documentElement.dataset.teks = ambil().pengaturan.ukuranTeks || 'normal';
perbaruiTombolMusik();
saatStatusPasang(() => { if (/^#?\/?$/.test(location.hash)) render(); });
window.addEventListener('hashchange', render);
render();

// ---- service worker (offline + instal)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Service worker gagal:', e));
  });
}
