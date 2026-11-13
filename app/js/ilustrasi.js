// Ilustrasi "3D" DeretKu: semua digambar dengan SVG (gradasi + bayangan + bentuk isometrik).
// Tidak ada gambar luar, sehingga bebas hak cipta, ringan, tajam di semua layar, dan offline.

let nomor = 0;
const uid = (p) => `${p}${++nomor}`;

// Pembangkit acak deterministik (agar bintang tidak berpindah saat dirender ulang)
function acak(benih) {
  let s = benih % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function bintang(w, h, jumlah, benih, maxY = h, gerak = true) {
  const r = acak(benih);
  let s = '';
  for (let i = 0; i < jumlah; i++) {
    const x = (r() * w).toFixed(1), y = (r() * maxY).toFixed(1), rad = (0.5 + r() * 1.3).toFixed(2);
    s += gerak
      ? `<circle class="kerlip" style="animation-delay:${(r() * 3).toFixed(2)}s" cx="${x}" cy="${y}" r="${rad}" fill="#fff"/>`
      : `<circle cx="${x}" cy="${y}" r="${rad}" fill="#fff" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`;
  }
  return s;
}

function kilau(x, y, u = 6, warna = '#fff') {
  return `<path class="kerlip" d="M${x} ${y - u} Q${x} ${y} ${x + u} ${y} Q${x} ${y} ${x} ${y + u} Q${x} ${y} ${x - u} ${y} Q${x} ${y} ${x} ${y - u}Z" fill="${warna}"/>`;
}

const PALET = {
  pink: ['#ffc2e2', '#ff4fa3', '#b3125f'],
  ungu: ['#e2c7ff', '#a855f7', '#5b1a9e'],
  biru: ['#bdefff', '#38bdf8', '#0b6aa3'],
  kuning: ['#fff4b3', '#facc15', '#b26b05'],
  hijau: ['#c5f7d6', '#22c55e', '#137a3a'],
  oranye: ['#ffd9b8', '#fb923c', '#b4470f'],
};

// Kubus isometrik: (x, y) = titik puncak atas, s = setengah lebar
function kubus(x, y, s, [atas, kiri, kanan]) {
  return `<path d="M${x} ${y}L${x + s} ${y + s / 2}L${x} ${y + s}L${x - s} ${y + s / 2}Z" fill="${atas}"/>`
    + `<path d="M${x - s} ${y + s / 2}L${x} ${y + s}L${x} ${y + 2 * s}L${x - s} ${y + 1.5 * s}Z" fill="${kiri}"/>`
    + `<path d="M${x + s} ${y + s / 2}L${x} ${y + s}L${x} ${y + 2 * s}L${x + s} ${y + 1.5 * s}Z" fill="${kanan}"/>`;
}

function gradLinier(id, stops, x2 = 0, y2 = 1) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
}

// Bola mengilap 3D
function gradBola(id, [terang, utama, gelap]) {
  return `<radialGradient id="${id}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="${terang}"/><stop offset=".55" stop-color="${utama}"/><stop offset="1" stop-color="${gelap}"/></radialGradient>`;
}

function latar(id, atas, bawah, w, h, benih, jumlahBintang = 26) {
  return `<defs>${gradLinier(id, [[0, atas], [1, bawah]])}</defs><rect width="${w}" height="${h}" fill="url(#${id})"/>${bintang(w, h, jumlahBintang, benih, h * 0.6, false)}`;
}

// ===================================================================== POSTER EPISODE (200 × 300)
function posterU1() {
  const g = uid('g');
  let s = `<svg viewBox="0 0 200 300" class="ilus" aria-hidden="true">${latar(g, '#2e1065', '#db2777', 200, 300, 11)}`;
  s += `<ellipse cx="104" cy="250" rx="96" ry="26" fill="#ffffff22"/>`;
  const warna = [PALET.pink, PALET.ungu, PALET.biru, PALET.kuning];
  const sz = 17;
  const menara = [[42, 246], [82, 228], [122, 210], [162, 192]];
  for (let i = 3; i >= 0; i--) {
    const [x, by] = menara[i];
    for (let k = 0; k <= i; k++) s += kubus(x, by - 2 * sz - k * sz, sz, warna[i]);
  }
  menara.forEach(([x, by], i) => {
    const y = by - 2 * sz - i * sz - 12;
    s += `<g class="melayang" style="animation-delay:${i * 0.3}s"><circle cx="${x}" cy="${y - 6}" r="13" fill="#fff" opacity=".95"/><text x="${x}" y="${y - 1}" text-anchor="middle" font-size="14" font-weight="800" fill="#7e22ce">${(i + 1) * 2}</text></g>`;
  });
  s += kilau(30, 70, 7) + kilau(170, 50, 5) + kilau(150, 110, 4, '#ffe066');
  return `${s}</svg>`;
}

function posterU2() {
  const g = uid('g');
  const warna = [PALET.pink, PALET.ungu, PALET.biru, PALET.kuning];
  const ids = warna.map(() => uid('b'));
  let s = `<svg viewBox="0 0 200 300" class="ilus" aria-hidden="true"><defs>${ids.map((id, i) => gradBola(id, warna[i])).join('')}</defs>${latar(g, '#0f3460', '#7c3aed', 200, 300, 23)}`;
  const titik = [[38, 220], [80, 182], [122, 150], [162, 112]];
  s += `<path d="M20 240 Q90 190 180 90" stroke="#ffffff55" stroke-width="3" stroke-dasharray="4 7" fill="none"/>`;
  titik.forEach(([x, y], i) => {
    if (i < 3) {
      const [x2, y2] = titik[i + 1];
      s += `<path d="M${x + 8} ${y - 22} Q${(x + x2) / 2 + 4} ${Math.min(y, y2) - 40} ${x2 - 6} ${y2 - 24}" stroke="#ffb35c" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      s += `<text x="${(x + x2) / 2 + 6}" y="${Math.min(y, y2) - 36}" text-anchor="middle" font-size="13" font-weight="800" fill="#ffd18a">+3</text>`;
    }
  });
  titik.forEach(([x, y], i) => {
    s += `<ellipse cx="${x}" cy="${y + 22}" rx="16" ry="5" fill="#00000035"/>`;
    s += `<g class="melayang" style="animation-delay:${i * 0.25}s"><circle cx="${x}" cy="${y}" r="20" fill="url(#${ids[i]})"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="#fff" stroke="#00000030" stroke-width=".6">${5 + 3 * i}</text></g>`;
  });
  s += kilau(40, 60, 6) + kilau(160, 200, 5, '#ffe066');
  return `${s}</svg>`;
}

function posterU3() {
  const g = uid('g'), r = uid('r'), p = uid('p'), api = uid('a');
  let s = `<svg viewBox="0 0 200 300" class="ilus" aria-hidden="true"><defs>${gradLinier(r, [[0, '#ffffff'], [0.5, '#e9d5ff'], [1, '#a78bfa']], 1, 0)}${gradBola(p, PALET.oranye)}${gradLinier(api, [[0, '#fff7ae'], [0.5, '#fb923c'], [1, '#ef444400']])}</defs>${latar(g, '#0b1240', '#6d28d9', 200, 300, 37, 34)}`;
  // planet bercincin
  s += `<g class="melayang"><circle cx="152" cy="62" r="30" fill="url(#${p})"/><ellipse cx="152" cy="64" rx="48" ry="11" fill="none" stroke="#ffe7a3" stroke-width="4" opacity=".85" transform="rotate(-14 152 64)"/><text x="152" y="69" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">U₅₀</text></g>`;
  // jejak titik
  [[24, 270, 5], [44, 246, 8], [64, 222, 11], [84, 198, 14]].forEach(([x, y, v], i) => {
    s += `<circle cx="${x}" cy="${y}" r="${9 + i}" fill="#ffffff" opacity="${0.25 + i * 0.15}"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="${9 + i}" font-weight="800" fill="#4c1d95">${v}</text>`;
  });
  // roket
  s += `<g class="melayang" style="animation-delay:.4s"><g transform="translate(118 160) rotate(40)">
    <path d="M-6 30 L6 30 L0 62Z" fill="url(#${api})" class="api"/>
    <path d="M-14 24 L-26 40 L-12 34Z" fill="#ec4899"/><path d="M14 24 L26 40 L12 34Z" fill="#ec4899"/>
    <path d="M0 -40 C18 -20 18 14 12 32 L-12 32 C-18 14 -18 -20 0 -40Z" fill="url(#${r})"/>
    <path d="M0 -40 C8 -31 11 -24 12 -18 L-12 -18 C-11 -24 -8 -31 0 -40Z" fill="#ec4899"/>
    <circle cx="0" cy="0" r="8" fill="#38bdf8" stroke="#fff" stroke-width="3"/><circle cx="-2.5" cy="-2.5" r="2.5" fill="#fff" opacity=".8"/></g></g>`;
  s += kilau(30, 120, 6) + kilau(180, 170, 4) + kilau(70, 40, 5, '#ffe066');
  return `${s}</svg>`;
}

function koin(cx, by, tumpuk, w = 18, t = 5) {
  let s = '';
  for (let k = 0; k < tumpuk; k++) {
    const y = by - k * t;
    s += `<path d="M${cx - w} ${y} v${t} a${w} ${w * 0.4} 0 0 0 ${2 * w} 0 v-${t}Z" fill="#c98a0a"/>`;
    s += `<ellipse cx="${cx}" cy="${y}" rx="${w}" ry="${w * 0.4}" fill="#facc15" stroke="#fde68a" stroke-width="1.2"/>`;
  }
  return s;
}

function posterU4() {
  const g = uid('g');
  let s = `<svg viewBox="0 0 200 300" class="ilus" aria-hidden="true">${latar(g, '#3b0764', '#ea580c', 200, 300, 51)}`;
  s += `<circle cx="100" cy="150" r="70" fill="#ffe08a" opacity=".18"/>`;
  // peti harta isometrik
  s += kubus(100, 168, 44, ['#fbbf24', '#b45309', '#7c2d12']);
  s += `<path d="M56 190 L100 212 L144 190" stroke="#fde68a" stroke-width="4" fill="none"/><rect x="94" y="214" width="12" height="16" rx="3" fill="#fde68a"/>`;
  // tumpukan koin naik (deret!)
  [[34, 250, 2], [62, 262, 4], [138, 262, 6], [166, 250, 8]].forEach(([x, y, n]) => { s += koin(x, y, n, 15, 6); });
  s += `<g class="melayang"><rect x="56" y="70" width="88" height="34" rx="17" fill="#ffffffdd"/><text x="100" y="93" text-anchor="middle" font-size="16" font-weight="800" fill="#9d174d">1+2+…+100</text></g>`;
  s += `<text x="100" y="140" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" stroke="#9a3412" stroke-width="1">5050</text>`;
  s += kilau(40, 130, 7, '#fff7c2') + kilau(165, 120, 6, '#fff7c2') + kilau(120, 40, 4);
  return `${s}</svg>`;
}

export const POSTER_UNIT = { u1: posterU1, u2: posterU2, u3: posterU3, u4: posterU4 };

// Poster umum: emoji di atas panggung 3D + chip angka melayang (200 × 300)
export function posterEmoji({ atas, bawah, emoji, chip = [], benih = 7 }) {
  const g = uid('g'), pg = uid('p'), ps = uid('s');
  let s = `<svg viewBox="0 0 200 300" class="ilus" aria-hidden="true"><defs>${gradLinier(pg, [[0, '#ffffff'], [1, '#e9d5ff']])}${gradLinier(ps, [[0, '#c4b5fd'], [1, '#7c3aed']])}</defs>${latar(g, atas, bawah, 200, 300, benih)}`;
  s += `<circle cx="100" cy="140" r="62" fill="#ffffff" opacity=".14"/>`;
  s += `<path d="M38 214 v16 a62 18 0 0 0 124 0 v-16Z" fill="url(#${ps})"/><ellipse cx="100" cy="214" rx="62" ry="18" fill="url(#${pg})"/>`;
  s += `<g class="melayang"><text x="100" y="200" text-anchor="middle" font-size="86">${emoji}</text></g>`;
  const pos = [[44, 70], [150, 92], [52, 128]];
  chip.slice(0, 3).forEach((c, i) => {
    const [x, y] = pos[i];
    const w = 12 + c.length * 8;
    s += `<g class="melayang" style="animation-delay:${0.3 + i * 0.35}s"><rect x="${x - w / 2}" y="${y - 14}" width="${w}" height="26" rx="13" fill="#ffffffe6"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#6d28d9">${c}</text></g>`;
  });
  s += kilau(170, 40, 5) + kilau(26, 180, 4, '#ffe066');
  return `${s}</svg>`;
}

const POSTER_LITERASI = {
  L1: { atas: '#831843', bawah: '#f472b6', emoji: '🐷', chip: ['5.000', '7.000', '9.000'] },
  L2: { atas: '#1e1b4b', bawah: '#a855f7', emoji: '🎭', chip: ['15', '18', '21'] },
  L3: { atas: '#064e3b', bawah: '#34d399', emoji: '🏃', chip: ['500 m', '750 m', '1 km'] },
  L4: { atas: '#7c2d12', bawah: '#fbbf24', emoji: '🥫', chip: ['12', '11', '10'] },
  L5: { atas: '#0c4a6e', bawah: '#38bdf8', emoji: '🛵', chip: ['7rb', '10rb', '13rb'] },
};
export function posterLiterasi(id, i = 0) { return posterEmoji({ ...POSTER_LITERASI[id], benih: 60 + i }); }

// ===================================================================== KARTU LEBAR GAMES (320 × 180)
export function posterGame(id) {
  const g = uid('g');
  if (id === 'balon') {
    const w = [PALET.pink, PALET.ungu, PALET.biru, PALET.kuning, PALET.hijau];
    const ids = w.map(() => uid('b'));
    let s = `<svg viewBox="0 0 320 180" class="ilus" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><defs>${ids.map((x, i) => gradBola(x, w[i])).join('')}</defs>${latar(g, '#7dd3fc', '#f9a8d4', 320, 180, 3, 0)}`;
    s += `<ellipse cx="60" cy="40" rx="40" ry="12" fill="#fff" opacity=".7"/><ellipse cx="250" cy="120" rx="50" ry="13" fill="#fff" opacity=".6"/>`;
    [[60, 110, 9], [120, 70, 12], [180, 100, 15], [240, 60, 18], [285, 115, 21]].forEach(([x, y, v], i) => {
      s += `<g class="melayang" style="animation-delay:${i * 0.3}s"><path d="M${x} ${y + 30} q-6 20 4 40" stroke="#6b21a888" fill="none" stroke-width="1.5"/><ellipse cx="${x}" cy="${y}" rx="24" ry="29" fill="url(#${ids[i]})"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="#fff">${v}</text></g>`;
    });
    return `${s}</svg>`;
  }
  if (id === 'katak') {
    let s = `<svg viewBox="0 0 320 180" class="ilus" aria-hidden="true" preserveAspectRatio="xMidYMid slice">${latar(g, '#0e7490', '#22c55e', 320, 180, 5, 0)}`;
    s += `<ellipse cx="160" cy="130" rx="190" ry="58" fill="#38bdf8"/><ellipse cx="160" cy="124" rx="170" ry="44" fill="#7dd3fc" opacity=".6"/>`;
    [[50, 132, 2], [115, 122, 5], [180, 130, 8], [245, 120, 11]].forEach(([x, y, v]) => {
      s += `<ellipse cx="${x}" cy="${y + 4}" rx="26" ry="9" fill="#14532d55"/><ellipse cx="${x}" cy="${y}" rx="26" ry="9" fill="#22c55e"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${v}</text>`;
    });
    s += `<path d="M115 110 Q148 50 180 112" stroke="#fff" stroke-width="2" stroke-dasharray="4 5" fill="none"/>`;
    s += `<g class="melayang"><text x="150" y="82" text-anchor="middle" font-size="40">🐸</text></g><text x="285" y="118" font-size="28" text-anchor="middle">🌸</text>`;
    return `${s}</svg>`;
  }
  // susun
  let s = `<svg viewBox="0 0 320 180" class="ilus" aria-hidden="true" preserveAspectRatio="xMidYMid slice">${latar(g, '#4c1d95', '#c026d3', 320, 180, 9, 16)}`;
  const w = [PALET.pink, PALET.kuning, PALET.biru, PALET.hijau];
  for (let i = 3; i >= 0; i--) {
    const x = 120 + i * 34, by = 168 - i * 17;
    for (let k = 0; k <= i; k++) s += kubus(x, by - 34 - k * 17, 17, w[i]);
    s += `<text x="${x}" y="${by - 46 - i * 17}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">${3 + 4 * i}</text>`;
  }
  s += `<g class="melayang"><text x="60" y="120" font-size="44" text-anchor="middle">🕵️</text></g>`;
  return `${s}</svg>`;
}

// ===================================================================== ADEGAN HERO (400 × 300)
export function adeganHero() {
  const langit = uid('l'), bulan = uid('m'), gunung = uid('gn'), pulau = uid('pu');
  let s = `<svg class="adegan" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    ${gradLinier(langit, [[0, '#14052b'], [0.45, '#4c1d95'], [0.75, '#c026d3'], [1, '#fb923c']])}
    <radialGradient id="${bulan}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7d6"/><stop offset=".45" stop-color="#ffe38a"/><stop offset=".5" stop-color="#ffe38a55"/><stop offset="1" stop-color="#ffe38a00"/></radialGradient>
    ${gradLinier(gunung, [[0, '#6d28d9'], [1, '#2e1065']])}
    ${gradLinier(pulau, [[0, '#7c3aed'], [1, '#3b0764']])}
  </defs>
  <rect width="400" height="300" fill="url(#${langit})"/>
  ${bintang(400, 300, 60, 99, 160)}
  <circle class="denyut-cahaya" cx="318" cy="64" r="52" fill="url(#${bulan})"/>
  <circle cx="318" cy="64" r="22" fill="#fff4c4"/>
  <path d="M0 220 L50 170 L90 200 L140 150 L190 205 L240 165 L290 210 L340 160 L400 200 L400 300 L0 300Z" fill="url(#${gunung})" opacity=".55"/>
  <path d="M0 250 L70 205 L120 235 L180 195 L250 240 L310 210 L400 245 L400 300 L0 300Z" fill="#2e1065" opacity=".8"/>`;
  // pulau-pulau melayang membentuk tangga barisan aritmatika
  const pulauData = [[170, 214, 2], [222, 186, 5], [274, 158, 8], [326, 130, 11]];
  pulauData.forEach(([x, y, v], i) => {
    s += `<g class="melayang" style="animation-delay:${i * 0.5}s">
      <path d="M${x - 24} ${y} L${x + 24} ${y} L${x + 6} ${y + 26} L${x - 4} ${y + 30}Z" fill="url(#${pulau})"/>
      <ellipse cx="${x}" cy="${y}" rx="24" ry="8" fill="#4ade80"/><ellipse cx="${x - 4}" cy="${y - 2}" rx="14" ry="4" fill="#86efac"/>
      <circle cx="${x}" cy="${y - 20}" r="11" fill="#fff" opacity=".95"/><text x="${x}" y="${y - 15}" text-anchor="middle" font-size="12" font-weight="800" fill="#7e22ce">${v}</text></g>`;
    if (i < 3) s += `<path d="M${x + 10} ${y - 28} Q${x + 26} ${y - 52} ${x + 44} ${y - 50}" stroke="#ffd18a" stroke-width="2" fill="none" stroke-dasharray="3 4"/>`;
  });
  // istana di pulau terakhir
  s += `<g class="melayang" style="animation-delay:1.5s"><rect x="336" y="96" width="14" height="26" fill="#f5d0fe"/><rect x="352" y="88" width="14" height="34" fill="#f0abfc"/><path d="M334 96 L343 80 L352 96Z M350 88 L359 70 L368 88Z" fill="#ec4899"/><rect x="341" y="104" width="4" height="6" fill="#fde047"/><rect x="357" y="98" width="4" height="6" fill="#fde047"/></g>`;
  s += `<ellipse class="awan-hero" cx="70" cy="120" rx="46" ry="10" fill="#ffffff" opacity=".18"/><ellipse class="awan-hero" style="animation-delay:-8s" cx="230" cy="96" rx="36" ry="8" fill="#ffffff" opacity=".14"/>`;
  s += kilau(110, 60, 6) + kilau(200, 40, 4, '#ffe066') + kilau(380, 150, 5);
  return `${s}</svg>`;
}

// ===================================================================== MASKOT "ARI"
// Ari: makhluk bintang kecil dari Negeri Aritmatika. Orisinal, digambar dengan SVG.
export function ari({ ukuran = 120, kelas = '' } = {}) {
  const b = uid('ab'), sy = uid('as'), bt = uid('at');
  return `<svg class="ari ${kelas}" viewBox="0 -8 120 140" width="${ukuran}" height="${Math.round(ukuran * 1.17)}" role="img" aria-label="Ari, maskot DeretKu">
  <defs>
    <radialGradient id="${b}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffe0f2"/><stop offset=".35" stop-color="#ff7ac6"/><stop offset=".75" stop-color="#c026d3"/><stop offset="1" stop-color="#6d28d9"/></radialGradient>
    <linearGradient id="${sy}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0f2fe" stop-opacity=".9"/><stop offset="1" stop-color="#a5b4fc" stop-opacity=".5"/></linearGradient>
    <radialGradient id="${bt}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#fde047"/><stop offset="1" stop-color="#f59e0b"/></radialGradient>
  </defs>
  <g class="ari-tubuh">
    <ellipse cx="60" cy="124" rx="26" ry="4" fill="#00000022" class="ari-bayang"/>
    <g class="ari-sayap-k"><path d="M24 66 C2 50 2 82 22 80Z" fill="url(#${sy})"/></g>
    <g class="ari-sayap-n"><path d="M96 66 C118 50 118 82 98 80Z" fill="url(#${sy})"/></g>
    <g class="ari-antena"><path d="M60 28 Q56 16 62 8" stroke="#a21caf" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M62 -4 L65.5 4 L74 4.5 L67.5 10 L69.5 18 L62 13.5 L54.5 18 L56.5 10 L50 4.5 L58.5 4Z" fill="url(#${bt})" stroke="#f59e0b" stroke-width=".8"/>
      <text x="62" y="12" text-anchor="middle" font-size="8" font-weight="900" fill="#9a3412">+</text></g>
    <ellipse cx="44" cy="116" rx="10" ry="6" fill="#a21caf"/><ellipse cx="76" cy="116" rx="10" ry="6" fill="#a21caf"/>
    <circle cx="60" cy="70" r="44" fill="url(#${b})"/>
    <ellipse cx="42" cy="44" rx="13" ry="8" fill="#fff" opacity=".45" transform="rotate(-25 42 44)"/>
    <g class="ari-mata">
      <ellipse cx="44" cy="68" rx="10" ry="12" fill="#fff"/><ellipse cx="76" cy="68" rx="10" ry="12" fill="#fff"/>
      <circle cx="46" cy="70" r="7" fill="#2a1040"/><circle cx="78" cy="70" r="7" fill="#2a1040"/>
      <circle cx="49" cy="66" r="2.8" fill="#fff"/><circle cx="81" cy="66" r="2.8" fill="#fff"/>
      <circle cx="43" cy="73" r="1.2" fill="#fff"/><circle cx="75" cy="73" r="1.2" fill="#fff"/>
    </g>
    <ellipse cx="32" cy="86" rx="7" ry="4.5" fill="#ff4fa3" opacity=".55"/><ellipse cx="88" cy="86" rx="7" ry="4.5" fill="#ff4fa3" opacity=".55"/>
    <path d="M52 86 Q60 95 68 86 Q60 90 52 86Z" fill="#6b0f3a"/><path d="M55 88 Q60 93 65 88" fill="#ff8fc7"/>
    <g class="ari-tangan"><ellipse cx="18" cy="84" rx="8" ry="11" fill="#d946ef" transform="rotate(30 18 84)"/></g>
    <ellipse cx="102" cy="84" rx="8" ry="11" fill="#d946ef" transform="rotate(-30 102 84)"/>
  </g></svg>`;
}
