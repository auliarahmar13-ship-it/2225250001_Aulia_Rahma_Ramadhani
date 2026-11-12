// Suara DeretKu: musik latar generatif (Web Audio), efek suara, dan narasi (TTS).
// Musik dibuat dengan kode sehingga tidak ada berkas audio, ukuran aplikasi tetap kecil,
// dan tidak ada masalah hak cipta.

import { ambil } from './state.js';

let ctx = null;
let master, busMusik, busEfek, filterMusik;
let timer = null;
let waktuBerikut = 0;
let ketukan = 0;
let musikJalan = false;
let sedangNarasi = false;

const KETUKAN_PER_AKOR = 8;
const DURASI_KETUKAN = 0.55; // detik, tempo lambat dan tenang
// Cmaj7 – Am7 – Fmaj7 – G6 (nada MIDI)
const AKOR = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]];
const PENTATONIK = [72, 74, 76, 79, 81, 84];

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function siapkan() {
  if (ctx) {
    if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
    return ctx;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  filterMusik = ctx.createBiquadFilter();
  filterMusik.type = 'lowpass';
  filterMusik.frequency.value = 1800;
  busMusik = ctx.createGain();
  busMusik.gain.value = 0;
  busMusik.connect(filterMusik).connect(master);

  busEfek = ctx.createGain();
  busEfek.gain.value = 0.8;
  busEfek.connect(master);

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
  return ctx;
}

function targetVolumeMusik() {
  const p = ambil().pengaturan;
  return (p.volumeMusik ?? 0.35) * 0.45 * (sedangNarasi ? 0.35 : 1);
}

function aturVolumeMusik(detik = 0.6) {
  if (!ctx || !busMusik) return;
  const t = ctx.currentTime;
  busMusik.gain.cancelScheduledValues(t);
  busMusik.gain.setValueAtTime(busMusik.gain.value, t);
  busMusik.gain.linearRampToValueAtTime(musikJalan ? targetVolumeMusik() : 0, t + detik);
}

function pad(midi, mulai, durasi) {
  [0, 7].forEach((detune, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = i === 0 ? 'sine' : 'triangle';
    o.frequency.value = mtof(midi);
    o.detune.value = detune;
    const v = i === 0 ? 0.07 : 0.025;
    g.gain.setValueAtTime(0.0001, mulai);
    g.gain.linearRampToValueAtTime(v, mulai + 1.2);
    g.gain.setValueAtTime(v, mulai + durasi - 0.8);
    g.gain.linearRampToValueAtTime(0.0001, mulai + durasi + 0.6);
    o.connect(g).connect(busMusik);
    o.start(mulai);
    o.stop(mulai + durasi + 0.7);
  });
}

function petik(midi, mulai, vol = 0.06, tujuan = busMusik, tipe = 'sine', panjang = 1.4) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipe;
  o.frequency.value = mtof(midi);
  g.gain.setValueAtTime(0.0001, mulai);
  g.gain.exponentialRampToValueAtTime(vol, mulai + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, mulai + panjang);
  o.connect(g).connect(tujuan);
  o.start(mulai);
  o.stop(mulai + panjang + 0.05);
}

function jadwal() {
  if (!ctx || !musikJalan) return;
  while (waktuBerikut < ctx.currentTime + 0.6) {
    const iAkor = Math.floor(ketukan / KETUKAN_PER_AKOR) % AKOR.length;
    const posisi = ketukan % KETUKAN_PER_AKOR;
    const akor = AKOR[iAkor];
    if (posisi === 0) {
      const durasi = KETUKAN_PER_AKOR * DURASI_KETUKAN;
      akor.forEach((m) => pad(m, waktuBerikut, durasi));
      petik(akor[0] - 12, waktuBerikut, 0.09, busMusik, 'sine', 2.5);
    }
    if (posisi % 2 === 1 && Math.random() < 0.55) {
      const nada = PENTATONIK[Math.floor(Math.random() * PENTATONIK.length)];
      petik(nada, waktuBerikut + Math.random() * 0.05, 0.035);
    }
    waktuBerikut += DURASI_KETUKAN;
    ketukan++;
  }
}

export function mulaiMusik() {
  if (!siapkan() || musikJalan) return;
  musikJalan = true;
  waktuBerikut = ctx.currentTime + 0.1;
  ketukan = 0;
  jadwal();
  timer = setInterval(jadwal, 200);
  aturVolumeMusik(2);
}

export function hentikanMusik() {
  if (!ctx || !musikJalan) return;
  musikJalan = false;
  aturVolumeMusik(0.8);
  const t = timer;
  setTimeout(() => clearInterval(t), 900);
  timer = null;
}

export function perbaruiVolume() { aturVolumeMusik(0.3); }
export function musikAktif() { return musikJalan; }

// ---------------------------------------------------------------- efek suara
export function efek(jenis) {
  if (!ambil().pengaturan.efek) return;
  if (!siapkan()) return;
  const t = ctx.currentTime + 0.01;
  switch (jenis) {
    case 'benar':
      petik(76, t, 0.22, busEfek, 'sine', 0.35);
      petik(81, t + 0.11, 0.22, busEfek, 'sine', 0.5);
      break;
    case 'salah':
      petik(57, t, 0.16, busEfek, 'triangle', 0.3);
      petik(55, t + 0.14, 0.16, busEfek, 'triangle', 0.45);
      break;
    case 'klik':
      petik(88, t, 0.05, busEfek, 'sine', 0.06);
      break;
    case 'selesai':
      [72, 76, 79, 84].forEach((m, i) => petik(m, t + i * 0.12, 0.2, busEfek, 'sine', 0.7));
      break;
    case 'buka':
      petik(79, t, 0.08, busEfek, 'sine', 0.2);
      break;
    default:
  }
}

// ---------------------------------------------------------------- narasi (TTS)
export const narasiTersedia = typeof window !== 'undefined' && 'speechSynthesis' in window;
let suaraId = null;
let tokenNarasi = 0;

function pilihSuara() {
  const semua = window.speechSynthesis.getVoices();
  suaraId = semua.find((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith('id')) || null;
}
if (narasiTersedia) {
  pilihSuara();
  window.speechSynthesis.addEventListener?.('voiceschanged', pilihSuara);
}

// Ubah elemen HTML menjadi kalimat yang enak dibacakan
export function teksNarasi(el) {
  const salin = el.cloneNode(true);
  salin.querySelectorAll('[data-tanpa-narasi], button, svg').forEach((x) => x.remove());
  salin.querySelectorAll('sub').forEach((s) => { s.textContent = ` ${s.textContent} `; });
  return salin.textContent
    .replace(/−/g, ' minus ')
    .replace(/×/g, ' kali ')
    .replace(/÷/g, ' bagi ')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 bagi $2')
    .replace(/=/g, ' sama dengan ')
    .replace(/\+/g, ' tambah ')
    .replace(/(\d)\/(\d)/g, '$1 per $2')
    .replace(/\bn\/2\b/g, 'n per 2')
    .replace(/\s+/g, ' ')
    .trim();
}

export function bacakan(teks, selesai) {
  if (!narasiTersedia || !ambil().pengaturan.narasi) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(teks);
  u.lang = 'id-ID';
  if (suaraId) u.voice = suaraId;
  u.rate = 0.95;
  sedangNarasi = true;
  aturVolumeMusik(0.3);
  const token = ++tokenNarasi;
  const akhir = () => {
    if (token !== tokenNarasi) return; // ucapan lama yang dibatalkan
    sedangNarasi = false;
    aturVolumeMusik(0.8);
    if (selesai) selesai();
  };
  u.onend = akhir;
  u.onerror = akhir;
  window.speechSynthesis.speak(u);
  return true;
}

export function hentikanNarasi() {
  if (!narasiTersedia) return;
  tokenNarasi++;
  window.speechSynthesis.cancel();
  if (sedangNarasi) { sedangNarasi = false; aturVolumeMusik(0.5); }
}
