// Teman AI: mediator belajar RMT, bertanya ke Gemini LEWAT SERVER DeretKu
// (python/serve.py → POST /api/tanya). API key hanya ada di server (.env). Berkas ini tidak pernah
// memegang atau mengirim kunci, dan tidak mengirim data pribadi siswa: hanya pesan siswa,
// teks soal (tanpa kunci jawaban), dan riwayat percakapan soal yang sedang dikerjakan.
// Pola mediasi (tanya-balik, bukti logis, fungsi berpikir) diatur di python/gemini.py.

import { h, tombolNarasi } from './ui.js';
import { efek, hentikanNarasi } from './audio.js';
import { FUNGSI } from './data/rmt.js';

const ALAMAT = 'api/tanya';        // relatif, ikut folder tempat aplikasi dibuka
export const MAKS_PERTANYAAN = 500; // sama dengan batas di python/gemini.py
const MAKS_KONTEKS = 800;
const MAKS_RIWAYAT = 8;            // sama dengan MAKS_RIWAYAT di python/gemini.py
const BATAS_WAKTU_MS = 70000;      // server: 30 dtk + 1x coba ulang

// tunggu: detik dari header Retry-After (0 bila tidak ada), untuk jeda tombol Kirim.
export class GalatAI extends Error {
  constructor(pesan, tunggu = 0) { super(pesan); this.tunggu = tunggu; }
}
const JEDA_MAKS = 120; // detik; jeda lebih lama (mis. kuota harian) cukup ditampilkan sebagai pesan

// ------------------------------------------------------------------ ketersediaan
// Di GitHub Pages (hanya berkas statis) endpoint tidak ada, jadi tombol AI disembunyikan.
// Cek memakai pertanyaan kosong: server menolaknya (400) TANPA memanggil Gemini/memakai kuota.
const cek = { janji: null, waktu: 0, ok: false }; // hasil "tersedia" disimpan; "tidak" dicek ulang tiap 60 dtk
export function aiTersedia() {
  if (cek.janji && (cek.ok || Date.now() - cek.waktu < 60000)) return cek.janji;
  cek.waktu = Date.now();
  const janji = fetch(ALAMAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pertanyaan: '' }),
  })
    .then((r) => r.status === 400 && (r.headers.get('Content-Type') || '').includes('application/json'))
    .catch(() => false)
    .then((ok) => { if (cek.janji === janji) cek.ok = ok; return ok; });
  cek.janji = janji;
  return janji;
}

// ------------------------------------------------------------------ permintaan
// riwayat: [{ peran: 'siswa'|'ai', teks }] bergantian, diawali 'siswa', diakhiri 'ai'.
export async function tanyaAI(pertanyaan, konteks = '', sinyal, riwayat = []) {
  const q = (pertanyaan || '').trim();
  if (!q) throw new GalatAI('Tulis dulu pertanyaan atau jawabanmu, ya.');
  if (q.length > MAKS_PERTANYAAN) throw new GalatAI(`Pesanmu terlalu panjang (maksimal ${MAKS_PERTANYAAN} huruf).`);
  if (!navigator.onLine) throw new GalatAI('Teman AI butuh internet. Sambungkan internet dulu, ya.');

  const batas = new AbortController();
  const timer = setTimeout(() => batas.abort(), BATAS_WAKTU_MS);
  if (sinyal) sinyal.addEventListener('abort', () => batas.abort(), { once: true });

  let res;
  try {
    res = await fetch(ALAMAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pertanyaan: q,
        konteks: (konteks || '').slice(0, MAKS_KONTEKS),
        riwayat: riwayat.slice(-MAKS_RIWAYAT),
      }),
      signal: batas.signal,
    });
  } catch (e) {
    if (sinyal && sinyal.aborted) throw e; // dibatalkan oleh aplikasi (pindah soal/halaman)
    throw new GalatAI(batas.signal.aborted
      ? 'Teman AI terlalu lama menjawab. Coba tanya lagi, ya.'
      : 'Tidak bisa terhubung ke Teman AI. Periksa internetmu.');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try { data = await res.json(); } catch (e) { /* bukan JSON: mis. GitHub Pages */ }
  if (res.ok && data && typeof data.jawaban === 'string') return rapikan(data.jawaban);
  const tunggu = Math.max(0, parseInt(res.headers.get('Retry-After') || '0', 10) || 0);
  if (data && typeof data.galat === 'string') throw new GalatAI(data.galat, tunggu);
  if ([404, 405, 501].includes(res.status)) throw new GalatAI('Teman AI belum tersedia di versi aplikasi ini.');
  throw new GalatAI('Teman AI sedang bermasalah. Coba lagi nanti, ya.');
}

// Gemini kadang tetap memakai Markdown; tampilkan sebagai teks biasa yang bersih.
function rapikan(t) {
  return t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#{1,6}\s*/gm, '').replace(/^\s*[*-]\s+/gm, '• ').trim();
}

// Pisahkan baris "Fungsi berpikir: …" dari jawaban AI dan cocokkan dengan kamus RMT.
// Nama yang tidak ada di kamus diabaikan (tidak ditampilkan sebagai label).
export function pisahFungsi(teks) {
  const pola = /^\s*Fungsi berpikir\s*:\s*(.+?)\s*$/im;
  const m = teks.match(pola);
  if (!m) return { isi: teks, fungsi: null };
  const nama = m[1].replace(/[.[\]"']/g, '').trim().toLowerCase();
  const fungsi = FUNGSI.find((f) => [f.namaSiswa, f.nama, f.istilahAsli].some((x) => x.toLowerCase() === nama)) || null;
  return { isi: teks.replace(pola, '').trim(), fungsi };
}

// ------------------------------------------------------------------ komponen
// Mengembalikan { tombol, panel, hentikan }. Tombol disembunyikan sampai server AI terbukti tersedia.
// ambilKonteks(): teks soal + status jawaban siswa (TANPA kunci jawaban).
export function panelTanyaAI(ambilKonteks) {
  const idPanel = `panel-ai-${Math.random().toString(36).slice(2, 8)}`;
  const tombol = h('button', {
    class: 'btn btn-sekunder', type: 'button', hidden: true,
    'aria-expanded': 'false', 'aria-controls': idPanel,
  }, '🤖 Tanya Teman AI');

  const input = h('input', {
    type: 'text', class: 'input-ai', maxlength: String(MAKS_PERTANYAAN), autocomplete: 'off',
    enterkeyhint: 'send', 'aria-label': 'Pesanmu untuk Teman AI',
    placeholder: 'Contoh: Aku bingung mulai dari mana',
  });
  const kirim = h('button', { class: 'btn btn-utama', type: 'submit' }, 'Kirim');
  const percakapan = h('div', { class: 'ai-percakapan', 'aria-live': 'polite' });
  const status = h('div');
  const ulang = h('button', { class: 'btn btn-ghost ai-ulang', type: 'button', hidden: true }, '↺ Mulai ulang percakapan');
  const form = h('form', { class: 'baris-input' }, input, kirim);
  const panel = h('div', { class: 'panel-ai', id: idPanel, hidden: true },
    h('div', { class: 'tebal' }, '🤖 Tanya Teman AI'),
    h('p', { class: 'kecil muted ai-ket' }, 'Teman AI tidak memberi jawaban, tetapi bertanya balik agar kamu menemukannya sendiri. Jawab pertanyaannya, ya! Jawaban AI bisa keliru, jadi cek lagi dengan rumus.'),
    percakapan, status, form, ulang);

  let riwayat = [];
  let pengendali = null;
  let timerJeda = null;

  // Jeda singkat setelah server meminta menunggu (Retry-After), agar siswa tidak menekan berulang.
  function mulaiJeda(detik) {
    clearInterval(timerJeda);
    let sisa = detik;
    const tampil = () => { kirim.textContent = `Tunggu ${sisa} dtk`; };
    kirim.disabled = true;
    tampil();
    timerJeda = setInterval(() => {
      sisa -= 1;
      if (sisa > 0) { tampil(); return; }
      clearInterval(timerJeda); timerJeda = null;
      kirim.disabled = false;
      kirim.textContent = 'Kirim';
    }, 1000);
  }

  aiTersedia().then((ok) => { if (ok) tombol.hidden = false; });

  tombol.addEventListener('click', () => {
    const buka = panel.hidden;
    panel.hidden = !buka;
    tombol.setAttribute('aria-expanded', String(buka));
    tombol.textContent = buka ? 'Tutup Teman AI' : '🤖 Tanya Teman AI';
    if (buka) { efek('buka'); input.focus({ preventScroll: true }); }
  });

  ulang.addEventListener('click', () => {
    if (pengendali) { pengendali.abort(); pengendali = null; }
    if (!timerJeda) kirim.disabled = false;
    input.disabled = false;
    riwayat = [];
    percakapan.replaceChildren();
    status.replaceChildren();
    ulang.hidden = true;
    input.placeholder = 'Contoh: Aku bingung mulai dari mana';
    input.focus({ preventScroll: true });
  });

  function pesanSiswa(teks) {
    const p = h('p', { class: 'ai-teks' });
    p.textContent = teks;
    return h('div', { class: 'ai-pesan ai-pesan-siswa' }, h('strong', { class: 'kecil' }, 'Kamu'), p);
  }

  function pesanAI(jawaban) {
    const { isi, fungsi } = pisahFungsi(jawaban);
    const p = h('p', { class: 'ai-teks' });
    p.textContent = isi; // teks biasa, BUKAN HTML (aman dari kode sisipan)
    return h('div', { class: 'ai-pesan ai-jawaban' },
      h('div', { class: 'ai-kepala' }, h('strong', {}, '🤖 Teman AI'), tombolNarasi(() => p)),
      p,
      fungsi ? h('div', { class: 'ai-fungsi', title: `${fungsi.kode} · ${fungsi.nama} (${fungsi.istilahAsli})` },
        `🧠 Fungsi berpikir: ${fungsi.ikon} ${fungsi.namaSiswa}`) : null);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (pengendali) return; // masih menunggu jawaban sebelumnya
    const pesan = input.value.trim();
    if (!pesan) { tampilGalat('Tulis dulu pertanyaan atau jawabanmu, ya.'); input.focus(); return; }

    pengendali = new AbortController();
    const sinyal = pengendali.signal;
    hentikanNarasi();
    kirim.disabled = true;
    input.disabled = true;
    const elSiswa = pesanSiswa(pesan);
    percakapan.append(elSiswa);
    status.replaceChildren(h('div', { class: 'ai-memuat', role: 'status' },
      h('span', { class: 'ai-titik', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      'Teman AI sedang berpikir…'));

    try {
      const jawaban = await tanyaAI(pesan, ambilKonteks(), sinyal, riwayat);
      if (sinyal.aborted) return;
      riwayat = [...riwayat, { peran: 'siswa', teks: pesan }, { peran: 'ai', teks: jawaban.slice(0, 1500) }];
      percakapan.append(pesanAI(jawaban));
      status.replaceChildren();
      input.value = '';
      input.placeholder = 'Tulis jawaban atau alasanmu…';
      ulang.hidden = false;
      efek('buka');
    } catch (err) {
      if (sinyal.aborted) return;
      elSiswa.remove(); // pesan yang gagal terkirim tidak masuk riwayat; teks tetap di kotak isian
      tampilGalat(err instanceof GalatAI ? err.message : 'Teman AI sedang bermasalah. Coba lagi nanti, ya.');
      if (err instanceof GalatAI && err.tunggu > 0 && err.tunggu <= JEDA_MAKS) mulaiJeda(err.tunggu);
    } finally {
      if (!sinyal.aborted) {
        if (!timerJeda) kirim.disabled = false;
        input.disabled = false;
        input.focus({ preventScroll: true });
      }
      pengendali = null;
    }
  });

  function tampilGalat(pesan) {
    status.replaceChildren(h('div', { class: 'umpan umpan-salah', role: 'alert' },
      h('strong', {}, '🤔 Teman AI belum bisa menjawab'), h('div', {}, pesan)));
  }

  // Dipanggil saat soal/halaman berganti: batalkan permintaan yang masih berjalan.
  const hentikan = () => { if (pengendali) pengendali.abort(); clearInterval(timerJeda); };
  // Banyak pesan siswa yang berhasil dijawab (untuk "lapisan bantuan", asesmen dinamis hlm. 60)
  const jumlahPesan = () => riwayat.length / 2;
  return { tombol, panel, hentikan, jumlahPesan };
}
