// Helper antarmuka: pembuat elemen, toast, modal, skala beban kognitif, visual barisan.

import { catatBeban } from './state.js';
import { efek, bacakan, teksNarasi, hentikanNarasi, narasiTersedia } from './audio.js';
import { ambil } from './state.js';

export function h(tag, attrs, ...anak) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v; // hanya untuk konten statis milik aplikasi
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of anak.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function fmt(n) {
  if (typeof n !== 'number') return String(n);
  return (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('id-ID');
}

// Bilangan negatif di dalam operasi diberi kurung: 5 + (−3)
export function fmtK(n) { return n < 0 ? `(${fmt(n)})` : fmt(n); }

export function acakUrutan(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------------------------------------ toast
let timerToast = null;
export function toast(pesan) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = pesan;
  el.classList.add('tampil');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => el.classList.remove('tampil'), 2600);
}

// ------------------------------------------------------------------ modal
function modal(isi, { tutupLuar = true, onTutup } = {}) {
  const sebelum = document.activeElement;
  const latar = h('div', { class: 'modal-latar', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'modal' }, isi));
  const tutup = () => {
    latar.remove();
    document.removeEventListener('keydown', esc);
    if (sebelum && sebelum.focus) sebelum.focus({ preventScroll: true });
  };
  const esc = (e) => { if (e.key === 'Escape') { tutup(); onTutup && onTutup(); } };
  if (tutupLuar) latar.addEventListener('click', (e) => { if (e.target === latar) { tutup(); onTutup && onTutup(); } });
  document.addEventListener('keydown', esc);
  document.body.append(latar);
  const fokus = latar.querySelector('button');
  if (fokus) fokus.focus({ preventScroll: true });
  return tutup;
}

export function konfirmasi(judul, pesan, teksYa = 'Ya') {
  return new Promise((selesai) => {
    let tutup;
    const jawab = (v) => { tutup(); selesai(v); };
    tutup = modal([
      h('h2', {}, judul),
      h('p', {}, pesan),
      h('div', { class: 'baris-tombol' },
        h('button', { class: 'btn btn-sekunder', onclick: () => jawab(false) }, 'Batal'),
        h('button', { class: 'btn btn-bahaya', onclick: () => jawab(true) }, teksYa)),
    ], { onTutup: () => selesai(false) });
  });
}

// ------------------------------------------------------------------ skala beban kognitif (Paas, 1–9)
const LABEL_SKALA = ['Sangat-sangat ringan', 'Sangat ringan', 'Ringan', 'Agak ringan', 'Sedang',
  'Agak berat', 'Berat', 'Sangat berat', 'Sangat-sangat berat'];

export function tanyaBeban(konteks, bagian = '') {
  return new Promise((selesai) => {
    let tutup;
    const keterangan = h('p', { class: 'skala-ket', 'aria-live': 'polite' }, 'Pilih angka 1–9');
    const pilih = (n) => {
      catatBeban(konteks, n);
      efek('klik');
      tutup();
      selesai(n);
    };
    const tombol = LABEL_SKALA.map((label, i) => h('button', {
      class: `skala-btn s${i + 1}`, 'aria-label': `${i + 1}: ${label}`,
      onclick: () => pilih(i + 1),
      onpointerenter: () => { keterangan.textContent = `${i + 1} = ${label}`; },
      onfocus: () => { keterangan.textContent = `${i + 1} = ${label}`; },
    }, String(i + 1)));
    tutup = modal([
      h('div', { class: 'modal-ikon', 'aria-hidden': 'true' }, '🧠'),
      h('h2', {}, 'Seberapa berat usaha pikiranmu?'),
      bagian ? h('p', { class: 'muted' }, `Bagian: ${bagian}`) : null,
      h('div', { class: 'skala' }, tombol),
      h('div', { class: 'skala-ujung' }, h('span', {}, '1 = sangat ringan'), h('span', {}, '9 = sangat berat')),
      keterangan,
      h('p', { class: 'muted kecil' }, 'Jawab jujur, ya. Tidak ada jawaban benar atau salah. Ini membantu gurumu memperbaiki pelajaran.'),
      h('button', { class: 'btn btn-ghost', onclick: () => { tutup(); selesai(null); } }, 'Lewati'),
    ], { tutupLuar: false, onTutup: () => selesai(null) });
  });
}

// ------------------------------------------------------------------ tombol narasi
export function tombolNarasi(targetFn) {
  if (!narasiTersedia || !ambil().pengaturan.narasi) return null;
  let aktif = false;
  const btn = h('button', { class: 'btn-ikon', type: 'button', 'aria-label': 'Dengarkan', title: 'Dengarkan' }, '🔊');
  btn.addEventListener('click', () => {
    if (aktif) { hentikanNarasi(); aktif = false; btn.textContent = '🔊'; return; }
    const el = targetFn();
    if (!el) return;
    aktif = bacakan(teksNarasi(el), () => { aktif = false; btn.textContent = '🔊'; });
    if (aktif) btn.textContent = '⏹';
  });
  return btn;
}

// ------------------------------------------------------------------ visual barisan (SVG)
let idSvg = 0;
export function visualBarisan(suku, { label = true, beda = null } = {}) {
  const w = 60, gap = 30, k = suku.length;
  const W = k * w + (k - 1) * gap + 8;
  const H = label ? 124 : 104;
  const angka = suku.filter((x) => typeof x === 'number');
  const b = beda ?? (angka.length >= 2 && typeof suku[0] === 'number' && typeof suku[1] === 'number' ? suku[1] - suku[0] : null);
  const id = `pa${++idSvg}`;
  let s = `<svg class="vis" viewBox="0 0 ${W} ${H}" role="img" aria-label="Barisan ${suku.map(fmt).join(', ')}">`;
  s += `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="vis-panah"/></marker></defs>`;
  suku.forEach((v, i) => {
    const x = 4 + i * (w + gap);
    const cx = x + w / 2;
    if (v === '…') {
      s += `<text x="${cx}" y="82" text-anchor="middle" class="vis-angka vis-redup">…</text>`;
      return;
    }
    const teks = fmt(v);
    const kelas = ['vis-kotak', i === 0 ? 'vis-a' : '', v === '?' ? 'vis-tanya' : ''].join(' ');
    s += `<rect x="${x}" y="52" width="${w}" height="46" rx="12" class="${kelas}"/>`;
    s += `<text x="${cx}" y="82" text-anchor="middle" class="vis-angka" font-size="${teks.length > 5 ? 14 : teks.length > 3 ? 17 : 21}">${teks}</text>`;
    if (label) s += `<text x="${cx}" y="118" text-anchor="middle" class="vis-label">U<tspan dy="4" font-size="11">${i + 1}</tspan></text>`;
    const lanjut = suku[i + 1];
    if (b !== null && i < k - 1 && lanjut !== '…' && v !== '…') {
      const x1 = cx + 8, x2 = cx + w + gap - 8;
      s += `<path d="M${x1} 48 Q${(x1 + x2) / 2} 12 ${x2} 48" class="vis-busur" marker-end="url(#${id})"/>`;
      s += `<text x="${(x1 + x2) / 2}" y="22" text-anchor="middle" class="vis-beda">${b >= 0 ? '+' : '−'}${fmt(Math.abs(b))}</text>`;
    }
  });
  s += '</svg>';
  return s;
}

export function kotakUmpan(benar, isiHtml) {
  return h('div', { class: `umpan ${benar ? 'umpan-benar' : 'umpan-salah'}`, role: 'status' },
    h('strong', {}, benar ? '✅ Benar!' : '🤔 Belum tepat'),
    h('div', { html: isiHtml }));
}

export function batangProgres(nilai, total, label) {
  const persen = total ? Math.round((nilai / total) * 100) : 0;
  return h('div', { class: 'progres', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(nilai), 'aria-label': label || 'Kemajuan' },
    h('div', { class: 'progres-isi', style: `width:${persen}%` }));
}
