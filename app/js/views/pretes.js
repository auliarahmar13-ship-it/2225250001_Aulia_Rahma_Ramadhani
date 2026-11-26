// Tes Awal (#/pretes): asesmen dinamis format "sandwich" (Kinard & Kozulin hlm. 60; docs/08 Tahap 7).
// 5 butir dari bank kuis (daftar `pretes` dibuat python/generate_bank_soal.py, satu per TP1–TP5).
// Butir yang sama ada di kuis akhir (postes) → analisis Python menghitung gain.
// Seperti tes, TIDAK ada umpan balik benar/salah per soal; tanpa batas waktu.

import { h, acakUrutan, batangProgres } from '../ui.js';
import { ambil, catatPretes } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { bannerDunia } from '../dunia.js';
import { temanBelajar } from '../teman.js';
import { muatBank } from './kuis.js';

export function tampil(root) {
  const sudah = ambil().pretes;
  root.append(
    bannerDunia('kuis', 'Tes Awal', '5 soal singkat untuk melihat titik awalmu.', 'Santai saja, ini bukan ujian! 😊'),
    h('div', { class: 'kartu' },
      h('ul', { class: 'info-kuis' },
        h('li', {}, '📝 5 soal pilihan ganda, tanpa batas waktu'),
        h('li', {}, '🌱 Tidak dinilai. Jawab sejujurnya, boleh menebak bila belum tahu'),
        h('li', {}, '📈 Nanti di Kuis akhir, kamu bisa melihat seberapa jauh kamu berkembang')),
      sudah.length
        ? h('p', { class: 'muted' }, `✓ Kamu sudah mengerjakan Tes Awal (${sudah[0].benar}/${sudah[0].total} benar). Tes Awal cukup sekali.`)
        : h('button', { class: 'btn btn-utama lebar', onclick: () => mulai(root) }, 'Mulai Tes Awal'),
      sudah.length ? h('a', { class: 'btn btn-utama lebar', href: '#/pemanasan' }, 'Lanjut: Pemanasan Berpikir →') : null),
    temanBelajar('kuis', 'Tes ini membantu kita tahu dari mana kamu mulai belajar. 🌱', { kelas: 'teman-bawah' }),
  );
}

async function mulai(root) {
  let bank;
  try {
    bank = await muatBank();
  } catch (e) {
    root.replaceChildren(h('div', { class: 'kartu' }, h('p', {}, 'Soal gagal dimuat. Periksa koneksi internet, lalu coba lagi.'),
      h('button', { class: 'btn btn-utama', onclick: () => mulai(root) }, 'Coba lagi')));
    return;
  }
  const soal = (bank.pretes || []).map((id) => bank.soal.find((s) => s.id === id)).filter(Boolean)
    .map((s) => ({ ...s, opsi: acakUrutan(s.opsi) }));
  const jawaban = [];
  const waktuMulai = Date.now();
  let i = 0;
  const wadah = h('div');
  root.replaceChildren(wadah, temanBelajar('kuis', 'Baca pelan-pelan, ya. Tidak ada batas waktu 🌱', { tenang: true, kelas: 'teman-bawah' }));

  function render() {
    hentikanNarasi();
    const s = soal[i];
    let masuk = Date.now();
    const opsi = s.opsi.map((o) => h('button', {
      class: 'opsi', type: 'button',
      onclick: () => {
        jawaban.push({ id: s.id, benar: !!o.benar, miskonsepsi: o.benar ? null : o.miskonsepsi, durasiDetik: Math.round((Date.now() - masuk) / 1000) });
        efek('klik');
        i++;
        if (i < soal.length) render(); else selesai();
      },
    }, o.teks));
    wadah.replaceChildren(
      h('div', { class: 'unit-kepala' }, h('div', { class: 'kecil muted' }, `Soal ${i + 1} dari ${soal.length}`), batangProgres(i + 1, soal.length, `Soal ${i + 1} dari ${soal.length}`)),
      h('article', { class: 'kartu' }, h('p', { class: 'teks-soal' }, s.pertanyaan), h('div', { class: 'daftar-opsi' }, opsi)));
    window.scrollTo({ top: 0 });
  }

  function selesai() {
    const benar = jawaban.filter((j) => j.benar).length;
    catatPretes({ skor: Math.round((benar / soal.length) * 100), benar, total: soal.length, durasiDetik: Math.round((Date.now() - waktuMulai) / 1000), jawaban });
    efek('selesai');
    wadah.replaceChildren(h('section', { class: 'kartu layar-selesai' },
      h('h1', {}, 'Tes Awal selesai! 🌱'),
      h('p', {}, `Kamu menjawab ${benar} dari ${soal.length} soal dengan benar.`),
      h('p', { class: 'muted kecil' }, 'Ini titik awalmu. Setelah belajar, bandingkan dengan hasil Kuis akhir, ya!'),
      h('div', { class: 'tumpuk-tombol' },
        h('a', { class: 'btn btn-utama', href: '#/pemanasan' }, 'Lanjut: Pemanasan Berpikir →'),
        h('a', { class: 'btn btn-ghost', href: '#/' }, 'Beranda'))));
    window.scrollTo({ top: 0 });
  }

  render();
}
