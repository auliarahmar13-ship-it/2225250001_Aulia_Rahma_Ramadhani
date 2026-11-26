// Halaman Pemanasan Berpikir (#/pemanasan): Fase I RMT "Pengembangan Kognitif" (docs/08 Tahap 4).
// Satu tugas per layar. Siklus mediasi (Kinard & Kozulin hlm. 12, 92): ❓ definisikan masalah →
// 👀 amati model → ✋ kerjakan → 🧠 namai fungsi berpikir (C13) → 🌉 jembatan ke barisan aritmatika.

import { h, kotakUmpan, batangProgres, acakUrutan, tombolNarasi } from '../ui.js';
import { ambil, catatPemanasan, catatJurnal } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { bannerDunia } from '../dunia.js';
import { temanBelajar } from '../teman.js';
import { TUGAS } from '../data/pemanasan.js';
import { cariFungsi } from '../data/rmt.js';

function labelFungsi(kode) {
  const f = cariFungsi(kode);
  return f ? h('div', { class: 'label-fungsi', title: `${f.kode} · ${f.nama} (${f.istilahAsli})` },
    `🧠 Fungsi berpikir: ${f.ikon} ${f.namaSiswa}`) : null;
}

const judulLangkah = (no, teks) => h('div', { class: 'langkah-judul' }, h('span', { class: 'tahap-no' }, String(no)), ` ${teks}`);

export function tampil(root) {
  const d = ambil();
  let indeks = Math.max(0, TUGAS.findIndex((t) => !d.pemanasanSelesai[t.id]));
  const semuaSelesai = TUGAS.every((t) => d.pemanasanSelesai[t.id]);
  if (semuaSelesai) indeks = 0;

  const kepala = h('div', { class: 'unit-kepala' });
  const wadah = h('div');
  const teman = temanBelajar('pemanasan', 'Sebelum angka, kita latih cara berpikir dulu, yuk!', { tenang: true, kelas: 'teman-bawah' });
  root.append(...[ // filter: append(null) menulis teks "null"
    bannerDunia('pemanasan', 'Pemanasan Berpikir', 'Latih cara berpikir dengan gambar dan pola, sebelum masuk ke angka.', 'Pikiran juga perlu pemanasan! 🧠'),
    semuaSelesai ? h('p', { class: 'kecil muted' }, '✓ Kamu sudah menyelesaikan semua tugas. Boleh diulang kapan saja.') : null,
    kepala, wadah, teman].filter(Boolean));

  function render() {
    hentikanNarasi();
    const t = TUGAS[indeks];
    const hasil = { definisi: null, benar: null, fungsiTepat: null };
    kepala.replaceChildren(
      h('div', { class: 'unit-judul' }, '🧠 ', t.judul),
      h('div', { class: 'kecil muted' }, `Tugas ${indeks + 1} dari ${TUGAS.length}`),
      batangProgres(indeks + 1, TUGAS.length, `Tugas ${indeks + 1} dari ${TUGAS.length}`));

    const model = h('div', { class: 'model-pola', role: 'img', 'aria-label': t.model.map((m) => `${m.label || ''} ${m.isi}`).join('; ') },
      t.model.map((m) => h('div', { class: 'model-baris' },
        m.label ? h('span', { class: 'model-label' }, m.label) : null,
        h('span', { class: 'model-isi' }, m.isi))));

    // ---- Langkah 1: definisikan masalah (C3)
    const umpan1 = h('div', { 'aria-live': 'polite' });
    const opsi1 = acakUrutan(t.masalah.opsi.map((teks, j) => ({ teks, j }))).map((o) => h('button', {
      class: 'opsi', type: 'button',
      onclick: (e) => {
        if (hasil.definisi !== null) return;
        hasil.definisi = o.j === t.masalah.kunci;
        opsi1.forEach((b) => { b.disabled = true; });
        opsi1.find((b) => b.dataset.j === String(t.masalah.kunci)).classList.add('benar');
        if (!hasil.definisi) e.currentTarget.classList.add('salah');
        efek(hasil.definisi ? 'benar' : 'salah');
        umpan1.replaceChildren(kotakUmpan(hasil.definisi, hasil.definisi
          ? 'Tepat! Sekarang kamu tahu apa yang harus dikerjakan.'
          : `Tugas ini meminta: ${t.masalah.opsi[t.masalah.kunci].toLowerCase()}.`), labelFungsi('C3'));
        langkah2.hidden = false;
      },
      'data-j': String(o.j),
    }, o.teks));
    const langkah1 = h('section', { class: 'langkah-rmt' }, judulLangkah(1, '❓ Apa yang diminta tugas ini?'),
      h('div', { class: 'daftar-opsi' }, opsi1), umpan1);

    // ---- Langkah 2: kerjakan (boleh mencoba lagi; setelah 2 kali salah jawaban ditunjukkan)
    const umpan2 = h('div', { 'aria-live': 'polite' });
    let salah2 = 0;
    const opsi2 = acakUrutan(t.opsi.map((teks, j) => ({ teks, j }))).map((o) => h('button', {
      class: 'opsi', type: 'button', 'data-j': String(o.j),
      onclick: (e) => {
        const btn = e.currentTarget;
        if (o.j === t.kunci) {
          if (hasil.benar === null) hasil.benar = salah2 === 0;
          btn.classList.add('benar');
          opsi2.forEach((b) => { b.disabled = true; });
          efek('benar');
          umpan2.replaceChildren(kotakUmpan(true, t.alasan));
          tampilLangkah3();
        } else {
          salah2++;
          btn.classList.add('salah');
          btn.disabled = true;
          efek('salah');
          if (salah2 >= 2) {
            hasil.benar = false;
            opsi2.forEach((b) => { b.disabled = true; if (b.dataset.j === String(t.kunci)) b.classList.add('benar'); });
            umpan2.replaceChildren(kotakUmpan(false, `Jawaban yang tepat ditandai ✓. ${t.alasan}`));
            tampilLangkah3();
          } else {
            umpan2.replaceChildren(kotakUmpan(false, 'Amati lagi gambarnya pelan-pelan, lalu coba sekali lagi.'));
          }
        }
      },
    }, o.teks));
    const langkah2 = h('section', { class: 'langkah-rmt', hidden: true }, judulLangkah(2, '✋ Kerjakan'),
      h('p', { class: 'tebal' }, t.tanya), h('div', { class: 'daftar-opsi' }, opsi2), umpan2);

    // ---- Langkah 3: namai fungsi berpikir yang dipakai (C13; hlm. 12, 88, 152)
    const langkah3 = h('section', { class: 'langkah-rmt', hidden: true });
    const wadahLanjut = h('div');
    function tampilLangkah3() {
      if (!langkah3.hidden) return;
      const umpan3 = h('div', { 'aria-live': 'polite' });
      const kode = acakUrutan([t.fungsi, ...t.pengecohFungsi]);
      const benar = cariFungsi(t.fungsi);
      const opsi3 = kode.map((k) => {
        const f = cariFungsi(k);
        return h('button', {
          class: 'opsi', type: 'button',
          onclick: (e) => {
            if (hasil.fungsiTepat !== null) return;
            hasil.fungsiTepat = k === t.fungsi;
            opsi3.forEach((b, i) => { b.disabled = true; if (kode[i] === t.fungsi) b.classList.add('benar'); });
            if (!hasil.fungsiTepat) e.currentTarget.classList.add('salah');
            efek(hasil.fungsiTepat ? 'benar' : 'buka');
            umpan3.replaceChildren(
              kotakUmpan(hasil.fungsiTepat, `${hasil.fungsiTepat ? 'Tepat!' : 'Yang baru kamu pakai adalah'} ${benar.ikon} ${benar.namaSiswa}: ${benar.definisi.charAt(0).toLowerCase()}${benar.definisi.slice(1)}`),
              h('div', { class: 'kotak-jembatan' }, h('strong', {}, '🌉 Jembatan: '), t.jembatan));
            catatPemanasan({ id: t.id, ...hasil });
            const dipilih = cariFungsi(k);
            catatJurnal({ konteks: `pemanasan:${t.id}`, fungsiKognitif: [k], refleksi: `Menurutku, aku memakai ${dipilih.namaSiswa}.` });
            tampilLanjut();
          },
        }, h('span', {}, h('strong', {}, `${f.ikon} ${f.namaSiswa}`), h('br'), h('span', { class: 'kecil muted' }, f.definisi)));
      });
      langkah3.replaceChildren(judulLangkah(3, '🧠 Fungsi berpikir apa yang baru kamu pakai?'),
        h('div', { class: 'daftar-opsi' }, opsi3), umpan3);
      langkah3.hidden = false;
    }

    function tampilLanjut() {
      const terakhir = indeks === TUGAS.length - 1;
      const btn = terakhir
        ? h('a', { class: 'btn btn-utama lebar', href: '#/materi/u1' }, 'Mulai Materi: Pola Bilangan →')
        : h('button', { class: 'btn btn-utama lebar', onclick: () => { indeks++; render(); window.scrollTo({ top: 0 }); } }, 'Tugas berikutnya →');
      wadahLanjut.replaceChildren(btn);
      if (terakhir) teman.bicara('Hebat! Pikiranmu sudah siap. Ayo masuk ke Materi! 🎉', 'senang');
      btn.focus({ preventScroll: true });
    }

    const isi = h('div', { class: 'kartu-isi' },
      h('div', { class: 'langkah-judul' }, '👀 Amati'), model, langkah1, langkah2, langkah3, wadahLanjut);
    wadah.replaceChildren(h('article', { class: 'kartu' },
      h('header', { class: 'kartu-kepala' }, h('h2', {}, t.judul), tombolNarasi(() => isi.querySelector('.langkah-rmt:not([hidden]) p, .langkah-rmt .tebal') || model)),
      isi));
  }

  render();
  return () => hentikanNarasi();
}
