// 🧱 Menara Angka: susun 4 balok menjadi barisan aritmatika (dari terkecil).
// Ada 1 balok "penyusup" yang tidak termasuk barisan, jangan dipakai!

import { h, fmt, visualBarisan } from '../ui.js';
import { efek } from '../audio.js';
import { acak, pilih, layarMulai, layarAkhir, bintangDari } from './umum.js';

const ID = 'susun';
const RONDE = 8;
const WARNA = ['k-pink', 'k-ungu', 'k-biru', 'k-kuning', 'k-hijau'];

function buatRonde(i) {
  const b = i < 3 ? acak(2, 5) : acak(3, 12);
  const a = i < 3 ? acak(1, 15) : acak(-10, 40);
  const suku = [0, 1, 2, 3].map((k) => a + k * b);
  // penyusup: dekat dengan suku tapi tidak cocok pola
  let penyusup;
  do { penyusup = pilih(suku) + pilih([1, -1, 2, -2, Math.ceil(b / 2)]); } while (suku.includes(penyusup) || (penyusup - a) % b === 0);
  const balok = [...suku, penyusup].map((nilai, k) => ({ nilai, warna: WARNA[k % WARNA.length] })).sort(() => Math.random() - 0.5);
  return { a, b, suku, penyusup, balok };
}

export function tampil(root) {
  let aktif = true;

  const mulai = () => {
    let i = 0, skor = 0, sempurna = 0;

    function ronde() {
      if (!aktif) return;
      const r = buatRonde(i);
      let terisi = 0, kesalahan = 0;
      const slot = r.suku.map((_, k) => h('div', { class: 'slot' }, h('small', {}, `U${'₁₂₃₄'[k]}`)));
      const umpan = h('div', { 'aria-live': 'polite' });
      const elPesan = h('p', { class: 'kecil muted tengah' }, 'Ketuk balok dari yang terkecil.');
      const balok = r.balok.map((bk) => {
        const el = h('button', { class: `balok ${bk.warna}`, type: 'button' }, fmt(bk.nilai));
        el.addEventListener('click', () => ketuk(bk, el));
        return el;
      });

      root.replaceChildren(
        h('div', { class: 'baris-antara' }, h('h1', { class: 'judul-sesi' }, '🧱 Menara Angka'), h('span', { class: 'kecil muted' }, `Ronde ${i + 1}/${RONDE} · ⭐ ${skor}`)),
        h('div', { class: 'kartu' },
          h('p', { class: 'teks-soal' }, 'Susun 4 balok menjadi barisan aritmatika. Awas, ada 1 balok ', h('strong', {}, 'penyusup 🕵️'), '!'),
          h('div', { class: 'deret-slot' }, slot),
          elPesan,
          h('div', { class: 'tumpukan-balok' }, balok),
          umpan));

      function ketuk(bk, el) {
        if (terisi >= 4 || el.disabled) return;
        if (bk.nilai === r.suku[terisi]) {
          efek('taruh');
          el.disabled = true;
          el.classList.add('terpakai');
          const isi = h('div', { class: `balok balok-di-slot ${bk.warna}` }, fmt(bk.nilai));
          slot[terisi].prepend(isi);
          slot[terisi].classList.add('penuh');
          terisi++;
          if (terisi === 4) selesaiRonde();
        } else {
          kesalahan++;
          efek('salah');
          el.classList.remove('goyang'); void el.offsetWidth; el.classList.add('goyang');
          elPesan.textContent = bk.nilai === r.penyusup
            ? `🕵️ ${fmt(bk.nilai)} adalah penyusup! Ia tidak cocok dengan pola.`
            : `Belum. Cari angka terkecil berikutnya setelah ${terisi ? fmt(r.suku[terisi - 1]) : 'awal'}.`;
        }
      }

      function selesaiRonde() {
        const poin = Math.max(0, 100 - kesalahan * 30);
        skor += poin;
        if (kesalahan === 0) sempurna++;
        efek(kesalahan === 0 ? 'selesai' : 'benar');
        const sisa = balok.find((el) => !el.disabled);
        if (sisa) sisa.classList.add('ketahuan');
        elPesan.textContent = '';
        umpan.replaceChildren(
          h('div', { class: 'umpan umpan-benar' },
            h('strong', {}, kesalahan === 0 ? '🌟 Sempurna! +100' : `✅ Menara jadi! +${poin}`),
            h('div', { html: `Bedanya selalu <b class="vb">${fmt(r.b)}</b>. Penyusupnya: <b>${fmt(r.penyusup)}</b>.` })),
          h('div', { class: 'wadah-vis', html: visualBarisan(r.suku) }));
        i++;
        umpan.append(h('button', { class: 'btn btn-utama lebar', onclick: () => (i < RONDE ? ronde() : akhir()) }, i < RONDE ? 'Ronde berikutnya →' : 'Lihat hasil 🏁'));
      }
    }

    function akhir() {
      layarAkhir(root, {
        id: ID, skor, bintang: bintangDari(sempurna, RONDE),
        ringkasan: `${sempurna} dari ${RONDE} menara tersusun sempurna tanpa salah.`,
        onUlang: mulai,
      });
    }

    ronde();
  };

  layarMulai(root, {
    id: ID, judul: 'Menara Angka', ikon: '🧱', warna: 'g-ungu',
    cara: [
      'Ada 5 balok angka. Empat di antaranya membentuk <strong>barisan aritmatika</strong>.',
      'Ketuk balok <strong>dari yang terkecil</strong> untuk menyusun barisan.',
      'Satu balok adalah <strong>penyusup 🕵️</strong> yang tidak cocok dengan pola. Jangan dipilih!',
      'Tanpa salah = 100 poin. Setiap salah dikurangi 30 poin.',
    ],
    onMulai: mulai,
  });

  return () => { aktif = false; };
}
