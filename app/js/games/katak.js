// 🐸 Lompat Katak: katak melompat dengan beda tetap (b) dari suku pertama (a).
// Tipe ronde: "beda" (pilih panjang lompatan agar tepat di bunga) dan
// "posisi" (tebak di angka berapa katak setelah lompatan ke-k = Uₙ).

import { h, fmt } from '../ui.js';
import { efek } from '../audio.js';
import { acak, layarMulai, layarAkhir, bintangDari } from './umum.js';

const ID = 'katak';
const RONDE = 8;
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));

function buatRonde(i) {
  const k = acak(3, i < 4 ? 4 : 6);
  const b = acak(2, i < 4 ? 5 : 9);
  const a = acak(0, i < 4 ? 5 : 15);
  const target = a + k * b;
  const tipe = i % 2 === 0 ? 'beda' : 'posisi';
  const benar = tipe === 'beda' ? b : target;
  const salah = tipe === 'beda'
    ? [b + 1, b - 1, b + 2, target - a].filter((x) => x > 0 && x !== b)
    : [target + b, target - b, a + (k + 1) * b, k * b].filter((x) => x !== target);
  const opsi = [benar];
  for (const s of salah.sort(() => Math.random() - 0.5)) if (opsi.length < 3 && !opsi.includes(s)) opsi.push(s);
  return { a, b, k, target, tipe, benar, opsi: opsi.sort(() => Math.random() - 0.5) };
}

export function tampil(root) {
  let aktif = true;

  const mulai = () => {
    let i = 0, benarTotal = 0, skor = 0;

    async function ronde() {
      if (!aktif) return;
      const r = buatRonde(i);
      const elInfo = h('div', { class: 'kecil muted' }, `Ronde ${i + 1} dari ${RONDE} · ⭐ ${skor}`);
      const pertanyaan = r.tipe === 'beda'
        ? `Katak di batu <b class="va">${r.a}</b>. Bunga 🌸 ada di <b class="vu">${r.target}</b>. Katak harus sampai <b>tepat</b> dalam <b class="vn">${r.k}</b> lompatan sama panjang. Berapa panjang setiap lompatan (<b class="vb">b</b>)?`
        : `Katak mulai di <b class="va">${r.a}</b> dan setiap lompatan panjangnya <b class="vb">${r.b}</b>. Di angka berapa katak setelah <b class="vn">${r.k}</b> lompatan?`;

      const kolam = h('div', { class: 'kolam' });
      const katak = h('div', { class: 'katak', 'aria-hidden': 'true' }, '🐸');
      const umpan = h('div', { 'aria-live': 'polite' });
      const tombol = r.opsi.map((nilai) => h('button', { class: 'btn btn-opsi-game', type: 'button', onclick: (e) => jawab(nilai, e.currentTarget) }, fmt(nilai)));

      root.replaceChildren(
        h('div', { class: 'baris-antara' }, h('h1', { class: 'judul-sesi' }, '🐸 Lompat Katak'), elInfo),
        h('div', { class: 'kartu' }, h('p', { class: 'teks-soal', html: pertanyaan }), kolam,
          h('div', { class: 'baris-opsi-game' }, tombol), umpan));

      // Skala kolam: a di kiri, target di ±76%; lompatan yang kelewatan berhenti di tepi kanan
      const posX = (v) => Math.min(95, 6 + ((v - r.a) / (r.target - r.a)) * 70); // %
      const daun = (v, kelas, ...isi) => { const d = h('div', { class: `daun ${kelas}` }, ...isi); d.style.left = `${posX(v)}%`; kolam.append(d); return d; };
      daun(r.a, 'daun-awal', h('span', {}, fmt(r.a)));
      if (r.tipe === 'beda') daun(r.target, 'daun-bunga', h('span', {}, '🌸'), h('small', {}, fmt(r.target)));
      kolam.append(katak);
      katak.style.left = `${posX(r.a)}%`;

      async function jawab(nilai, btn) {
        tombol.forEach((t) => { t.disabled = true; });
        btn.classList.add('dipilih');
        const lompatan = r.tipe === 'beda' ? nilai : r.b;
        let pos = r.a;
        for (let j = 1; j <= r.k; j++) {
          if (!aktif) return;
          pos += lompatan;
          const d = daun(pos, 'daun-jejak', h('span', {}, fmt(pos)));
          d.append(h('small', {}, `U${toSub(j + 1)}`));
          katak.classList.remove('lompat'); void katak.offsetWidth; katak.classList.add('lompat');
          katak.style.left = `${posX(pos)}%`;
          efek('lompat');
          await tunggu(520);
        }
        const tepat = nilai === r.benar;
        if (tepat) {
          benarTotal++; skor += 100;
          efek('benar');
          katak.classList.add('menang');
          umpan.replaceChildren(h('div', { class: 'umpan umpan-benar' }, h('strong', {}, '✅ Tepat sekali!'),
            h('div', { html: r.tipe === 'beda'
              ? `b = (${fmt(r.target)} − ${fmt(r.a)}) : ${r.k} = <b>${r.b}</b>`
              : `U<sub>${r.k + 1}</sub> = ${r.a} + ${r.k} × ${r.b} = <b>${fmt(r.target)}</b>` })));
        } else {
          efek('cebur');
          katak.classList.add('cebur');
          umpan.replaceChildren(h('div', { class: 'umpan umpan-salah' }, h('strong', {}, '💦 Byur! Belum tepat'),
            h('div', { html: r.tipe === 'beda'
              ? `Jarak ${fmt(r.a)} → ${fmt(r.target)} adalah ${fmt(r.target - r.a)}, dibagi ${r.k} lompatan: b = <b>${r.b}</b>.`
              : `Setelah ${r.k} lompatan: ${r.a} + ${r.k} × ${r.b} = <b>${fmt(r.target)}</b>. Ingat: suku ke-${r.k + 1} = a + (n − 1)b.` })));
        }
        i++;
        umpan.append(h('button', { class: 'btn btn-utama lebar', onclick: () => (i < RONDE ? ronde() : akhir()) }, i < RONDE ? 'Ronde berikutnya →' : 'Lihat hasil 🏁'));
      }
    }

    function akhir() {
      layarAkhir(root, {
        id: ID, skor, bintang: bintangDari(benarTotal, RONDE),
        ringkasan: `${benarTotal} dari ${RONDE} lompatan tepat.`,
        onUlang: mulai,
      });
    }

    ronde();
  };

  layarMulai(root, {
    id: ID, judul: 'Lompat Katak', ikon: '🐸', warna: 'g-hijau',
    cara: [
      'Katak selalu melompat dengan <strong>panjang yang sama</strong>, yaitu <span class="vb">beda (b)</span>.',
      'Kadang kamu harus memilih <strong>panjang lompatan</strong> agar katak tepat mendarat di bunga 🌸.',
      'Kadang kamu harus menebak <strong>posisi akhir</strong> katak (suku ke-n).',
      'Ada 8 ronde. Salah jawab? Katak tercebur 💦!',
    ],
    onMulai: mulai,
  });

  return () => { aktif = false; };
}

function toSub(n) { return String(n).split('').map((c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]).join(''); }
