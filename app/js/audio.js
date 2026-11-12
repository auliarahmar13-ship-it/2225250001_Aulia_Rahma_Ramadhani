// Suara DeretKu: musik latar generatif (Web Audio), efek suara, dan narasi (TTS).
// Musik dibuat dengan kode sehingga tidak ada berkas audio, ukuran aplikasi tetap kecil,
// dan tidak ada masalah hak cipta.
//
// Musik ceria: progresi I–V–vi–IV (C–G–Am–F), ±116 BPM, bas melompat, petikan akor
// gaya ukulele di ketukan lemah, melodi marimba, dan perkusi ringan.

import { ambil } from './state.js';

let ctx = null;
let master, busMusik, busEfek, filterMusik, derau = null;
let timer = null;
let waktuBerikut = 0;
let ketukan = 0;
let musikJalan = false;
let sedangNarasi = false;

const SEPERDELAPAN = 0.26; // detik per not 1/8 (±116 BPM)
const PER_BIRAMA = 8;
// Akor (MIDI): C, G, Am, F
const AKOR = [
  { akar: 36, nada: [60, 64, 67] },
  { akar: 43, nada: [59, 62, 67] },
  { akar: 45, nada: [60, 64, 69] },
  { akar: 41, nada: [60, 65, 69] },
];
// Melodi 4 birama × 8 not (null = diam). Dua variasi bergantian.
const MELODI = [
  [
    [76, null, 79, 76, 74, null, 72, null],
    [74, null, 71, 74, 79, null, null, 74],
    [72, null, 76, 81, 79, null, 76, null],
    [77, null, 81, 79, 77, 76, 74, null],
  ],
  [
    [79, 79, 76, null, 72, 74, 76, null],
    [79, null, 74, null, 71, 74, 79, null],
    [81, null, 79, 76, 72, null, 76, 79],
    [77, 81, 84, null, 81, 79, 77, 74],
  ],
];

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
  filterMusik.frequency.value = 5200;
  busMusik = ctx.createGain();
  busMusik.gain.value = 0;
  busMusik.connect(filterMusik).connect(master);

  busEfek = ctx.createGain();
  busEfek.gain.value = 0.8;
  busEfek.connect(master);

  // derau putih untuk perkusi & efek
  derau = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = derau.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
  return ctx;
}

function targetVolumeMusik() {
  const p = ambil().pengaturan;
  return (p.volumeMusik ?? 0.35) * 0.5 * (sedangNarasi ? 0.3 : 1);
}

function aturVolumeMusik(detik = 0.6) {
  if (!ctx || !busMusik) return;
  const t = ctx.currentTime;
  busMusik.gain.cancelScheduledValues(t);
  busMusik.gain.setValueAtTime(busMusik.gain.value, t);
  busMusik.gain.linearRampToValueAtTime(musikJalan ? targetVolumeMusik() : 0, t + detik);
}

function petik(midi, mulai, vol = 0.06, tujuan = busMusik, tipe = 'sine', panjang = 1.4) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipe;
  o.frequency.value = mtof(midi);
  g.gain.setValueAtTime(0.0001, mulai);
  g.gain.exponentialRampToValueAtTime(vol, mulai + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, mulai + panjang);
  o.connect(g).connect(tujuan);
  o.start(mulai);
  o.stop(mulai + panjang + 0.05);
}

// Suara marimba: nada dasar + harmonik ke-4 yang cepat hilang
function marimba(midi, mulai, vol = 0.07) {
  petik(midi, mulai, vol, busMusik, 'sine', 0.45);
  petik(midi + 24, mulai, vol * 0.25, busMusik, 'sine', 0.12);
}

function sapuan(f1, f2, mulai, durasi, vol, tujuan, tipe = 'sine') {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipe;
  o.frequency.setValueAtTime(f1, mulai);
  o.frequency.exponentialRampToValueAtTime(f2, mulai + durasi);
  g.gain.setValueAtTime(vol, mulai);
  g.gain.exponentialRampToValueAtTime(0.0001, mulai + durasi);
  o.connect(g).connect(tujuan);
  o.start(mulai);
  o.stop(mulai + durasi + 0.05);
}

function bunyiDerau(mulai, durasi, vol, frek, tipe = 'highpass', tujuan = busMusik) {
  const s = ctx.createBufferSource();
  s.buffer = derau;
  const f = ctx.createBiquadFilter();
  f.type = tipe;
  f.frequency.value = frek;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, mulai);
  g.gain.exponentialRampToValueAtTime(0.0001, mulai + durasi);
  s.connect(f).connect(g).connect(tujuan);
  s.start(mulai);
  s.stop(mulai + durasi + 0.02);
}

function jadwal() {
  if (!ctx || !musikJalan) return;
  while (waktuBerikut < ctx.currentTime + 0.5) {
    const t = waktuBerikut;
    const birama = Math.floor(ketukan / PER_BIRAMA);
    const iAkor = birama % AKOR.length;
    const pos = ketukan % PER_BIRAMA;
    const akor = AKOR[iAkor];
    const variasi = Math.floor(birama / AKOR.length) % MELODI.length;

    // bas melompat: akar di ketukan 1 & 3, kwint di sela
    if (pos === 0 || pos === 4) petik(akor.akar, t, 0.16, busMusik, 'triangle', 0.32);
    if (pos === 3 || pos === 7) petik(akor.akar + 7, t, 0.09, busMusik, 'triangle', 0.18);

    // petikan akor ala ukulele di ketukan lemah
    if (pos % 2 === 1) akor.nada.forEach((m, k) => petik(m, t + k * 0.012, 0.03, busMusik, 'triangle', 0.16));

    // melodi marimba (sesekali dihias acak agar tidak monoton)
    let nada = MELODI[variasi][iAkor][pos];
    if (nada && Math.random() < 0.12) nada += [-3, 2, 3][Math.floor(Math.random() * 3)];
    if (nada) marimba(nada, t, 0.065);

    // perkusi: tendangan lembut 1 & 3, tepukan 2 & 4, hi-hat tiap 1/8
    if (pos === 0 || pos === 4) sapuan(130, 45, t, 0.18, 0.22, busMusik);
    if (pos === 2 || pos === 6) bunyiDerau(t, 0.09, 0.05, 1800, 'bandpass');
    bunyiDerau(t, 0.03, pos % 2 ? 0.012 : 0.02, 8000);

    waktuBerikut += SEPERDELAPAN;
    ketukan++;
  }
}

export function mulaiMusik() {
  if (!siapkan() || musikJalan) return;
  musikJalan = true;
  waktuBerikut = ctx.currentTime + 0.1;
  ketukan = 0;
  jadwal();
  timer = setInterval(jadwal, 150);
  aturVolumeMusik(1.5);
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
      petik(76, t, 0.22, busEfek, 'sine', 0.3);
      petik(81, t + 0.09, 0.22, busEfek, 'sine', 0.3);
      petik(88, t + 0.18, 0.16, busEfek, 'sine', 0.45);
      break;
    case 'salah':
      petik(57, t, 0.16, busEfek, 'triangle', 0.3);
      petik(55, t + 0.14, 0.16, busEfek, 'triangle', 0.45);
      break;
    case 'klik':
      petik(88, t, 0.05, busEfek, 'sine', 0.06);
      break;
    case 'selesai':
      [72, 76, 79, 84].forEach((m, i) => petik(m, t + i * 0.11, 0.2, busEfek, 'triangle', 0.6));
      petik(88, t + 0.5, 0.18, busEfek, 'sine', 0.9);
      break;
    case 'rekor':
      [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => petik(m, t + i * 0.09, 0.18, busEfek, 'square', 0.25));
      break;
    case 'buka':
      petik(79, t, 0.08, busEfek, 'sine', 0.2);
      break;
    case 'pop':
      bunyiDerau(t, 0.07, 0.35, 1200, 'highpass', busEfek);
      sapuan(900, 1800, t, 0.08, 0.15, busEfek);
      break;
    case 'lompat':
      sapuan(260, 820, t, 0.22, 0.18, busEfek, 'triangle');
      break;
    case 'cebur':
      bunyiDerau(t, 0.45, 0.3, 900, 'lowpass', busEfek);
      sapuan(500, 120, t, 0.35, 0.12, busEfek);
      break;
    case 'boing':
      sapuan(220, 660, t, 0.12, 0.16, busEfek, 'triangle');
      sapuan(660, 330, t + 0.12, 0.2, 0.12, busEfek, 'triangle');
      break;
    case 'taruh':
      petik(84, t, 0.12, busEfek, 'triangle', 0.15);
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
