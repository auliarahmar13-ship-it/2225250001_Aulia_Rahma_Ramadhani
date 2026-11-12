// Maskot "Teman Belajar": 4 siswa berseragam, digambar sendiri dengan SVG (bebas hak cipta).
// Bergerak dengan CSS: bergoyang, melambai, berkedip. Disentuh → melompat + bicara.
// Hanya dipakai di Beranda, Games, dan layar selesai (bukan di kartu materi/soal),
// agar tidak menambah beban kognitif saat belajar. Bisa dimatikan: Saya → Animasi.

import { efek } from './audio.js';

const KULIT = '#ffd3b3';
const KULIT_GELAP = '#f2b48f';

const ANAK = [
  { nama: 'Raka', rambut: '#5a3218', gaya: 'pendek', bawah: 'celana', tas: '#3b82f6', tas2: '#f59e0b', sepatu: '#1e3a8a', dasi: true },
  { nama: 'Dimas', rambut: '#7a4320', gaya: 'jambul', bawah: 'celana', tas: '#f59e0b', tas2: '#fb7185', sepatu: '#38bdf8', dasi: false, buku: '#fde047' },
  { nama: 'Sari', rambut: '#8a4b22', gaya: 'cepol', bawah: 'rok', tas: '#fb923c', tas2: '#a855f7', sepatu: '#22c55e', dasi: false, buku: '#fde047' },
  { nama: 'Nia', rambut: '#6b3a1e', gaya: 'panjang', bawah: 'rok', tas: '#ec4899', tas2: '#f472b6', sepatu: '#ef4444', dasi: false, pita: '#ef4444' },
];

const UCAPAN = [
  'Ayo belajar! 📚', 'Kamu pasti bisa! 💪', 'Beda itu selisih tetap!', 'Uₙ = a + (n − 1)b ✨',
  'Semangat! 🌟', 'Main games yuk! 🎮', 'Hore! 🎉', 'Satu langkah satu waktu 🐢',
];

function rambutBelakang(a) {
  if (a.gaya === 'panjang') return `<path d="M18 58 Q16 30 50 26 Q84 30 82 58 L86 118 Q76 126 68 112 L68 70 L32 70 L32 112 Q24 126 14 118 Z" fill="${a.rambut}"/>`;
  if (a.gaya === 'cepol') return `<circle cx="52" cy="22" r="13" fill="${a.rambut}"/>`;
  return '';
}

function rambutDepan(a) {
  const r = a.rambut;
  switch (a.gaya) {
    case 'pendek':
      return `<path d="M19 62 Q14 30 46 27 Q80 24 82 58 Q76 44 66 42 L64 48 L58 40 L52 47 L46 40 L40 47 L34 42 Q24 48 19 62 Z" fill="${r}"/>`;
    case 'jambul':
      return `<path d="M19 62 Q14 32 44 28 Q48 12 66 18 Q86 28 82 60 Q78 46 68 44 Q60 36 50 44 Q40 40 32 46 Q24 50 19 62 Z" fill="${r}"/><path d="M50 22 Q58 16 64 22" stroke="#ffffff55" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 'cepol':
      return `<path d="M19 62 Q16 30 50 28 Q84 30 81 62 Q74 46 62 44 Q54 40 46 46 Q34 42 26 50 Z" fill="${r}"/>`;
    default: // panjang
      return `<path d="M19 64 Q16 30 50 28 Q84 30 81 64 Q78 46 64 42 Q50 48 36 42 Q22 48 19 64 Z" fill="${r}"/>`
        + `<g transform="translate(76 40)"><circle cx="-6" cy="0" r="6" fill="${a.pita}"/><circle cx="6" cy="0" r="6" fill="${a.pita}"/><circle r="3.5" fill="#b91c1c"/></g>`;
  }
}

function satuAnak(a, i) {
  const bawah = a.bawah === 'celana'
    ? `<rect x="31" y="136" width="38" height="24" rx="5" fill="#1e2a4a"/><rect x="49" y="140" width="2" height="20" fill="#0f172a"/>`
    : `<path d="M30 134 L70 134 L80 164 Q50 170 20 164 Z" fill="#2156c4"/><path d="M38 136 L34 164 M50 136 L50 166 M62 136 L66 164" stroke="#ffffff40" stroke-width="1.5"/>`;
  return `
<g transform="translate(${i * 98} 0)">
 <g class="anak anak-${i}" data-anak="${i}" style="animation-delay:${-i * 0.45}s">
  <ellipse cx="50" cy="196" rx="30" ry="5" fill="#00000018"/>
  <!-- tas -->
  <rect x="14" y="92" width="72" height="52" rx="14" fill="${a.tas}"/>
  <rect x="10" y="112" width="16" height="26" rx="6" fill="${a.tas2}"/>
  <!-- kaki -->
  <rect x="36" y="156" width="10" height="30" rx="4" fill="${KULIT}"/>
  <rect x="54" y="156" width="10" height="30" rx="4" fill="${KULIT}"/>
  <rect x="35" y="172" width="12" height="14" rx="3" fill="#f1f5f9"/>
  <rect x="53" y="172" width="12" height="14" rx="3" fill="#f1f5f9"/>
  <ellipse cx="40" cy="190" rx="10" ry="6" fill="${a.sepatu}"/>
  <ellipse cx="60" cy="190" rx="10" ry="6" fill="${a.sepatu}"/>
  ${bawah}
  <!-- badan -->
  <rect x="28" y="94" width="44" height="46" rx="12" fill="#ffffff" stroke="#e2e8f0"/>
  <path d="M40 94 L50 104 L60 94" fill="#f1f5f9" stroke="#cbd5e1"/>
  <path d="M30 100 L30 136 M70 100 L70 136" stroke="${a.tas2}" stroke-width="4" stroke-linecap="round"/>
  ${a.dasi ? '<path d="M50 102 L46 108 L50 126 L54 108 Z" fill="#1d4ed8"/>' : ''}
  <!-- lengan kiri memegang buku -->
  <path d="M30 104 Q22 118 34 128" stroke="${KULIT}" stroke-width="9" fill="none" stroke-linecap="round"/>
  ${a.buku ? `<rect x="30" y="112" width="20" height="24" rx="3" fill="${a.buku}" stroke="#eab308" transform="rotate(-8 40 124)"/><line x1="34" y1="116" x2="34" y2="134" stroke="#2563eb" stroke-width="2" transform="rotate(-8 40 124)"/>` : ''}
  <!-- lengan kanan melambai -->
  <g class="lengan" style="animation-delay:${-i * 0.3}s">
   <path d="M68 104 Q80 92 84 76" stroke="${KULIT}" stroke-width="9" fill="none" stroke-linecap="round"/>
   <circle cx="85" cy="73" r="6.5" fill="${KULIT}"/>
   <path d="M64 100 Q70 96 74 102" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
  </g>
  <!-- kepala -->
  ${rambutBelakang(a)}
  <circle cx="20" cy="66" r="6" fill="${KULIT_GELAP}"/>
  <circle cx="80" cy="66" r="6" fill="${KULIT_GELAP}"/>
  <circle cx="50" cy="62" r="31" fill="${KULIT}"/>
  ${rambutDepan(a)}
  <g class="mata" style="animation-delay:${i * 0.7}s">
   <ellipse cx="39" cy="66" rx="6" ry="7" fill="#4a2512"/>
   <ellipse cx="61" cy="66" rx="6" ry="7" fill="#4a2512"/>
   <circle cx="41" cy="63" r="2.3" fill="#fff"/>
   <circle cx="63" cy="63" r="2.3" fill="#fff"/>
  </g>
  <path d="M32 55 Q38 51 44 54 M56 54 Q62 51 68 55" stroke="#5a3218" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="31" cy="76" r="4.5" fill="#fb7185" opacity=".45"/>
  <circle cx="69" cy="76" r="4.5" fill="#fb7185" opacity=".45"/>
  <circle cx="50" cy="72" r="2" fill="${KULIT_GELAP}"/>
  <path class="mulut" d="M41 78 Q50 90 59 78 Z" fill="#9f1239"/>
  <ellipse cx="50" cy="84" rx="4" ry="2" fill="#fda4af"/>
 </g>
</g>`;
}

const SVG_MASKOT = `<svg class="maskot-svg" viewBox="-4 4 396 200" role="img" aria-label="Empat teman belajar melambaikan tangan">${ANAK.map(satuAnak).join('')}</svg>`;

// opsi: { pesan: teks gelembung awal, kecil: boolean }
export function maskot({ pesan = '', kecil = false } = {}) {
  const wadah = document.createElement('div');
  wadah.className = `maskot ${kecil ? 'maskot-kecil' : ''}`;
  wadah.innerHTML = `<div class="gelembung" ${pesan ? '' : 'hidden'}></div>${SVG_MASKOT}`;
  const gelembung = wadah.querySelector('.gelembung');
  if (pesan) gelembung.textContent = pesan;

  let timer = null;
  wadah.addEventListener('animationend', (e) => {
    if (e.animationName === 'loncat') e.target.classList.remove('loncat');
  });
  wadah.addEventListener('click', (e) => {
    const g = e.target.closest('[data-anak]');
    if (!g) return;
    const i = Number(g.dataset.anak);
    g.classList.remove('loncat');
    void g.getBoundingClientRect(); // ulang animasi
    g.classList.add('loncat');
    efek('boing');
    gelembung.hidden = false;
    gelembung.textContent = `${ANAK[i].nama}: ${UCAPAN[Math.floor(Math.random() * UCAPAN.length)]}`;
    gelembung.style.setProperty('--x', `${12.5 + i * 25}%`);
    clearTimeout(timer);
    timer = setTimeout(() => { gelembung.hidden = true; }, 2600);
  });
  return wadah;
}

// Semua anak melompat bersama (dipakai saat menang/selesai)
export function sorak(wadah) {
  if (!wadah) return;
  wadah.querySelectorAll('[data-anak]').forEach((g, i) => {
    g.classList.remove('loncat');
    void g.getBoundingClientRect();
    setTimeout(() => g.classList.add('loncat'), i * 90);
  });
}
