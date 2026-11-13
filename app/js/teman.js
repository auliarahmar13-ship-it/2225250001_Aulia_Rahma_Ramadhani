// Teman Belajar: 4 ilustrasi siswa (aset dari pengguna, img/teman/) yang menemani di setiap fitur.
// Ari hanya pemandu di Beranda; di fitur belajar siswa ditemani karakter-karakter ini.
// Gambar TIDAK diubah: hanya ditampilkan dengan rasio asli (object-fit: contain), dibingkai,
// dan diberi animasi CSS ringan (masuk, melayang) yang tidak mengubah bentuk karakter.

import { h } from './ui.js';

export const TEMAN = {
  pensil: { src: 'img/teman/teman-naik-pensil.jpg', w: 268, h: 220, nama: 'Duo Pensil', alt: 'Dua siswa berseragam merah putih duduk di atas pensil besar', latar: 'putih' },
  buku: { src: 'img/teman/teman-membawa-buku.jpg', w: 220, h: 220, nama: 'Si Kutu Buku', alt: 'Siswa membawa tumpukan buku dan tas biru', latar: 'putih' },
  kelompok: { src: 'img/teman/teman-kelompok-smp.jpg', w: 220, h: 220, nama: 'Sahabat SMP', alt: 'Empat siswa SMP berseragam putih biru membawa buku', latar: 'bingkai' },
  sekolah: { src: 'img/teman/teman-di-sekolah.jpg', w: 392, h: 220, nama: 'Teman Sekolah', alt: 'Empat siswa berdiri di depan sekolah', latar: 'bingkai' },
};

// Rotasi: setiap fitur punya karakter utama dan cadangan, bergantian tiap kali dibuka
export const ROTASI = {
  materi: ['pensil', 'buku'],
  latihan: ['buku', 'kelompok'],
  kuis: ['kelompok', 'sekolah'],
  literasi: ['sekolah', 'buku'],
  games: ['pensil', 'kelompok'],
};
const hitungan = {};

const NAMA_FITUR = { materi: 'Materi', latihan: 'Latihan', kuis: 'Kuis', literasi: 'Literasi', games: 'Games' };
// "Menemanimu di Materi & Games" (dihitung dari tabel rotasi)
export function peranTeman(id) {
  const f = Object.keys(ROTASI).filter((k) => ROTASI[k].includes(id)).map((k) => NAMA_FITUR[k]);
  return f.length > 1 ? `${f.slice(0, -1).join(', ')} & ${f[f.length - 1]}` : f.join('');
}

export function pilihTeman(fitur) {
  const daftar = ROTASI[fitur] || Object.keys(TEMAN);
  hitungan[fitur] = (hitungan[fitur] ?? -1) + 1;
  return daftar[hitungan[fitur] % daftar.length];
}

// Gambar karakter saja (tanpa gelembung)
export function gambarTeman(id, { kelas = '' } = {}) {
  const t = TEMAN[id];
  return h('div', { class: `teman-gambar latar-${t.latar} ${t.w / t.h > 1.4 ? 'bentuk-lebar' : ''} ${kelas}` },
    h('img', { src: t.src, alt: t.alt, width: String(t.w), height: String(t.h), loading: 'lazy', decoding: 'async', draggable: 'false' }),
    h('span', { class: 'kilau-teman k1', 'aria-hidden': 'true' }, '✦'),
    h('span', { class: 'kilau-teman k2', 'aria-hidden': 'true' }, '✧'));
}

// Karakter + gelembung dialog. opsi.tenang = tanpa animasi melayang (untuk halaman belajar)
// Mengembalikan elemen dengan metode .bicara(teks, suasana) untuk mengganti dialog.
export function temanBelajar(fitur, pesan, { id = pilihTeman(fitur), tenang = false, kelas = '' } = {}) {
  const t = TEMAN[id];
  const gelembung = h('div', { class: 'teman-gelembung', role: 'status', 'aria-live': 'polite' },
    h('span', { class: 'teman-nama' }, t.nama),
    h('span', { class: 'teman-teks' }, pesan));
  const el = h('div', { class: `teman ${tenang ? 'tenang' : ''} ${kelas}` }, gambarTeman(id), gelembung);
  el.bicara = (teks, suasana = '') => {
    gelembung.querySelector('.teman-teks').textContent = teks;
    el.classList.remove('senang', 'semangat', 'bicara-baru');
    void el.offsetWidth;
    el.classList.add('bicara-baru');
    if (suasana) el.classList.add(suasana);
  };
  return el;
}
