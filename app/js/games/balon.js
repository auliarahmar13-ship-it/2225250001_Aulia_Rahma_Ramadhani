// 🎈 Balon Pola: pecahkan balon yang berisi suku yang hilang dari barisan aritmatika.
// Balon naik makin cepat seiring skor. 3 nyawa. Kombo memberi poin tambahan.

import { h, fmt } from '../ui.js';
import { efek } from '../audio.js';
import { acak, pilih, layarMulai, layarAkhir } from './umum.js';

const ID = 'balon';
const WARNA = ['b-pink', 'b-ungu', 'b-biru', 'b-kuning', 'b-hijau', 'b-oranye'];

function buatRonde(skor) {
  const tingkat = Math.min(4, Math.floor(skor / 60));
  const b = tingkat < 1 ? acak(1, 5) : tingkat < 2 ? acak(2, 9) : pilih([-7, -5, -4, -3, -2, 3, 4, 6, 7, 8, 9, 11, 12]);
  const a = tingkat < 2 ? acak(1, 20) : acak(-10, 50);
  const panjang = 5;
  const suku = Array.from({ length: panjang }, (_, i) => a + i * b);
  const hilang = tingkat < 1 ? panjang - 1 : acak(1, panjang - 1);
  const jawab = suku[hilang];
  const kandidat = [jawab + 1, jawab - 1, jawab + b, jawab - b, jawab + 2, jawab + b + 1, jawab - 2 * b, jawab + 10];
  const opsi = new Set([jawab]);
  for (const k of kandidat.sort(() => Math.random() - 0.5)) { if (opsi.size < 4 && !suku.includes(k)) opsi.add(k); }
  while (opsi.size < 4) { const x = jawab + acak(-15, 15); if (!suku.includes(x)) opsi.add(x); }
  return { suku, hilang, jawab, opsi: [...opsi].sort(() => Math.random() - 0.5) };
}

export function tampil(root) {
  let rafId = null;
  let aktif = false;

  const mulai = () => {
    let skor = 0, nyawa = 3, kombo = 0, benarTotal = 0, ronde = 0;
    let soal, balon = [], waktuLalu = 0, jeda = false;

    const elSkor = h('span', { class: 'hud-skor' }, '0');
    const elNyawa = h('span', { class: 'hud-nyawa', 'aria-label': 'Nyawa' });
    const elKombo = h('span', { class: 'hud-kombo' });
    const elSoal = h('div', { class: 'soal-balon', 'aria-live': 'polite' });
    const arena = h('div', { class: 'arena arena-langit' },
      h('div', { class: 'awan a1', 'aria-hidden': 'true' }), h('div', { class: 'awan a2', 'aria-hidden': 'true' }));

    root.replaceChildren(
      h('div', { class: 'hud' }, h('span', {}, '⭐ ', elSkor), elKombo, elNyawa),
      elSoal, arena,
      h('p', { class: 'kecil muted tengah' }, 'Ketuk balon yang berisi angka pengganti "?"'));

    const gambarNyawa = () => { elNyawa.textContent = '❤️'.repeat(nyawa) + '🤍'.repeat(3 - nyawa); };
    gambarNyawa();

    function rondeBaru() {
      balon.forEach((b) => b.el.remove());
      balon = [];
      ronde++;
      soal = buatRonde(skor);
      elSoal.replaceChildren(...soal.suku.map((x, i) => h('span', { class: `chip ${i === soal.hilang ? 'chip-tanya' : ''}` }, i === soal.hilang ? '?' : fmt(x))));
      const lebar = arena.clientWidth || 320;
      const tinggi = arena.clientHeight || 420;
      const lajur = lebar / soal.opsi.length;
      const cepat = 38 + Math.min(skor, 400) * 0.22; // px/detik
      soal.opsi.forEach((nilai, i) => {
        const el = h('button', { class: `balon ${pilih(WARNA)}`, type: 'button', 'aria-label': `Balon ${fmt(nilai)}` }, h('span', {}, fmt(nilai)));
        arena.append(el);
        const b = { el, nilai, x: Math.max(8, Math.min(lebar - 84, lajur * i + lajur / 2 - 34 + acak(-6, 6))), y: tinggi - 70 + acak(0, 90), v: cepat * (0.85 + Math.random() * 0.3), fase: Math.random() * 6, hidup: true };
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); ketuk(b); });
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ketuk(b); } });
        balon.push(b);
      });
    }

    function ketuk(b) {
      if (!b.hidup || jeda || !aktif) return;
      if (b.nilai === soal.jawab) {
        b.hidup = false;
        b.el.classList.add('pecah');
        efek('pop'); efek('benar');
        kombo++; benarTotal++;
        const tambah = 10 + Math.min(kombo - 1, 5) * 2;
        skor += tambah;
        elSkor.textContent = String(skor);
        elKombo.textContent = kombo >= 2 ? `🔥 Kombo ×${kombo}` : '';
        tampilkanPoin(b, `+${tambah}`);
        elSoal.querySelector('.chip-tanya')?.replaceChildren(fmt(soal.jawab));
        elSoal.querySelector('.chip-tanya')?.classList.add('chip-benar');
        jeda = true;
        setTimeout(() => { jeda = false; if (aktif) rondeBaru(); }, 650);
      } else {
        b.hidup = false;
        b.el.classList.add('salah-pecah');
        efek('salah');
        kombo = 0; elKombo.textContent = '';
        kurangiNyawa();
      }
    }

    function tampilkanPoin(b, teks) {
      const p = h('div', { class: 'poin-melayang' }, teks);
      p.style.left = `${b.x + 20}px`;
      p.style.top = `${b.y}px`;
      arena.append(p);
      setTimeout(() => p.remove(), 900);
    }

    function kurangiNyawa() {
      nyawa--;
      gambarNyawa();
      arena.classList.remove('getar'); void arena.offsetWidth; arena.classList.add('getar');
      if (nyawa <= 0) selesai();
    }

    function langkah(t) {
      if (!aktif) return;
      const dt = waktuLalu ? Math.min((t - waktuLalu) / 1000, 0.05) : 0;
      waktuLalu = t;
      if (!jeda) {
        for (const b of balon) {
          if (!b.hidup) continue;
          b.y -= b.v * dt;
          b.fase += dt * 2;
          b.el.style.transform = `translate(${b.x + Math.sin(b.fase) * 8}px, ${b.y}px)`;
          if (b.y < -110) {
            b.hidup = false;
            if (b.nilai === soal.jawab) {
              efek('salah');
              kombo = 0; elKombo.textContent = '';
              elSoal.querySelector('.chip-tanya')?.replaceChildren(fmt(soal.jawab));
              kurangiNyawa();
              if (nyawa > 0) { jeda = true; setTimeout(() => { jeda = false; if (aktif) rondeBaru(); }, 900); }
            }
          }
        }
      }
      rafId = requestAnimationFrame(langkah);
    }

    function selesai() {
      aktif = false;
      cancelAnimationFrame(rafId);
      const bintang = skor >= 150 ? 3 : skor >= 80 ? 2 : skor >= 30 ? 1 : 0;
      setTimeout(() => layarAkhir(root, {
        id: ID, skor, bintang,
        ringkasan: `${benarTotal} balon benar dari ${ronde} barisan.`,
        onUlang: mulai,
      }), 500);
    }

    aktif = true;
    requestAnimationFrame(() => { rondeBaru(); rafId = requestAnimationFrame(langkah); });
  };

  layarMulai(root, {
    id: ID, judul: 'Balon Pola', ikon: '🎈', warna: 'g-pink',
    cara: [
      'Lihat barisan aritmatika di atas. Ada satu suku yang hilang (<strong>?</strong>).',
      'Cari bedanya, lalu <strong>ketuk balon</strong> yang berisi angka yang benar.',
      'Jangan sampai balon yang benar terbang lolos! Kamu punya 3 ❤️.',
      'Jawab benar berturut-turut untuk <strong>kombo 🔥</strong>. Balon akan makin cepat!',
    ],
    onMulai: mulai,
  });

  return () => { aktif = false; cancelAnimationFrame(rafId); };
}
