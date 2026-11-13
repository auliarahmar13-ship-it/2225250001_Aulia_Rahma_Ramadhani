// Beranda bergaya "layanan streaming": banner sinematik + baris poster yang bisa digeser.

import { h } from '../ui.js';
import { ambil } from '../state.js';
import { efek } from '../audio.js';
import { UNIT } from '../data/materi.js';
import { LITERASI } from '../data/literasi.js';
import { JENIS, NAMA_LEVEL } from '../generator.js';
import { TEMAN, gambarTeman, peranTeman } from '../teman.js';
import { adeganHero, ari, POSTER_UNIT, posterEmoji, posterGame, posterLiterasi } from '../ilustrasi.js';
import { barisKartu, poster, kartuLebar } from '../dunia.js';
import { bisaPasang, pasang, sudahTerpasang, iOS } from '../pasang.js';

const WARNA_LATIHAN = [['#4c1d95', '#ec4899'], ['#0f766e', '#a3e635'], ['#1e3a8a', '#38bdf8'], ['#7c2d12', '#f59e0b'], ['#701a75', '#c084fc']];
const GAMES = [
  { id: 'balon', judul: 'Balon Pola', sub: 'Pecahkan balon yang benar!' },
  { id: 'katak', judul: 'Lompat Katak', sub: 'Lompat tepat ke bunga 🌸' },
  { id: 'susun', judul: 'Menara Angka', sub: 'Temukan si penyusup 🕵️' },
];
const SAPAAN_ARI = ['Hai! Aku Ari ✨', 'Ayo bertualang!', 'Kamu hebat! 💪', 'Ketuk aku lagi!', 'Beda itu selisih tetap!'];

export function langkahBelajar() {
  const d = ambil();
  const langkah = UNIT.map((u, i) => ({
    no: i + 1, judul: u.judul, ikon: u.ikon, ket: u.ket, href: `#/materi/${u.id}`, selesai: !!d.materiSelesai[u.id],
  }));
  langkah.push({ no: 5, judul: 'Latihan', ikon: '✏️', ket: 'Minimal 10 soal', href: '#/latihan', selesai: d.latihan.length >= 10 });
  const litSelesai = LITERASI.filter((l) => d.literasiSelesai[l.id]).length;
  langkah.push({ no: 6, judul: 'Literasi Matematika', ikon: '📖', ket: `${litSelesai}/${LITERASI.length} masalah`, href: '#/literasi', selesai: litSelesai >= 3 });
  langkah.push({ no: 7, judul: 'Kuis', ikon: '🏆', ket: '15 soal', href: '#/kuis', selesai: d.kuis.length > 0 });
  return langkah;
}

function heroBanner(d, langkah, berikut) {
  const nama = d.profil.nama.trim();
  const jumlahSelesai = langkah.filter((l) => l.selesai).length;
  const gelembung = h('div', { class: 'hero-gelembung' }, nama ? `Hai, ${nama}! ✨` : 'Hai! Aku Ari ✨');
  const elAri = h('button', { class: 'hero-ari', type: 'button', 'aria-label': 'Ari, maskot. Ketuk untuk menyapa', html: ari({ ukuran: 120 }) });
  let iSapa = 0;
  elAri.addEventListener('click', () => {
    const s = elAri.querySelector('.ari');
    s.classList.remove('ari-loncat'); void s.getBoundingClientRect(); s.classList.add('ari-loncat');
    gelembung.textContent = SAPAAN_ARI[++iSapa % SAPAAN_ARI.length];
    gelembung.classList.remove('pop'); void gelembung.offsetWidth; gelembung.classList.add('pop');
    efek('boing');
  });

  const label = berikut ? (jumlahSelesai ? 'Lanjutkan' : 'Mulai Belajar') : 'Ulangi Kuis';
  return h('section', { class: 'hero' },
    h('div', { class: 'hero-latar', html: adeganHero() }),
    h('div', { class: 'hero-vinyet', 'aria-hidden': 'true' }),
    h('div', { class: 'hero-maskot' }, gelembung, elAri),
    h('div', { class: 'hero-isi' },
      h('span', { class: 'hero-label' }, '✨ Petualangan Matematika'),
      h('h1', { class: 'hero-judul' }, 'Negeri ', h('span', {}, 'Aritmatika')),
      h('div', { class: 'hero-meta' },
        h('span', { class: 'meta-cocok' }, `${Math.round((jumlahSelesai / langkah.length) * 100)}% selesai`),
        h('span', {}, '7 langkah'), h('span', { class: 'meta-kotak' }, 'SMP'), h('span', {}, 'Barisan & Deret')),
      h('p', { class: 'hero-desk' }, berikut
        ? `Langkah ${berikut.no}: ${berikut.judul}. Bantu Ari menyusun tangga angka ajaib menuju istana!`
        : 'Semua langkah selesai! Kamu sudah jadi Juara Negeri Aritmatika 👑'),
      h('div', { class: 'hero-progres', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(langkah.length), 'aria-valuenow': String(jumlahSelesai), 'aria-label': 'Kemajuan petualangan' },
        h('span', { style: `width:${(jumlahSelesai / langkah.length) * 100}%` })),
      h('div', { class: 'hero-tombol' },
        h('a', { class: 'btn-hero utama', href: berikut ? berikut.href : '#/kuis' }, h('span', { 'aria-hidden': 'true' }, '▶'), ` ${label}`),
        h('button', {
          class: 'btn-hero kaca', type: 'button',
          onclick: () => document.getElementById('peta-petualangan')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        }, h('span', { 'aria-hidden': 'true' }, '🗺️'), ' Peta'))));
}

export function tampil(root) {
  const d = ambil();
  const langkah = langkahBelajar();
  const berikut = langkah.find((l) => !l.selesai);

  const posterUnit = UNIT.map((u, i) => {
    const selesai = !!d.materiSelesai[u.id];
    const pos = d.posisiKartu[u.id] || 0;
    return poster({
      href: `#/materi/${u.id}`, ilustrasi: POSTER_UNIT[u.id](), judul: u.judul, label: `Episode ${i + 1}`,
      sub: selesai ? 'Tonton ulang' : pos ? `Lanjut kartu ${pos + 1}` : `±${u.menit} menit`,
      progres: selesai ? 1 : pos ? pos / u.kartu.length : null, selesai, baru: !selesai && !pos && i === 0,
    });
  });

  const kartuGames = GAMES.map((g, i) => kartuLebar({
    href: `#/games/${g.id}`, ilustrasi: posterGame(g.id), judul: g.judul, sub: g.sub, peringkat: i + 1, rekor: d.permainan[g.id]?.rekor,
  }));

  const posterLit = LITERASI.map((l, i) => poster({
    href: `#/literasi/${l.id}`, ilustrasi: posterLiterasi(l.id, i), judul: l.judul,
    label: `Misi ${i + 1}`, sub: `Konteks ${l.konteks}`, selesai: !!d.literasiSelesai[l.id],
  }));

  const terbaik = d.kuis.length ? Math.max(...d.kuis.map((k) => k.skor)) : null;
  const posterTantangan = [
    poster({ href: '#/kuis', ilustrasi: posterEmoji({ atas: '#3b0764', bawah: '#facc15', emoji: '🏆', chip: ['15 soal', 'Final', '⭐'], benih: 90 }), judul: 'Kuis Juara', label: 'Final', sub: terbaik !== null ? `Skor terbaik ${terbaik}` : 'Belum dicoba', selesai: d.kuis.length > 0 }),
    ...JENIS.map((j, i) => poster({
      href: `#/latihan/${j.id}`, ilustrasi: posterEmoji({ atas: WARNA_LATIHAN[i][0], bawah: WARNA_LATIHAN[i][1], emoji: j.ikon, chip: ['Mudah', 'Sedang', 'Sulit'], benih: 70 + i }),
      judul: j.judul, label: 'Latihan', sub: `Level ${NAMA_LEVEL[d.levelLatihan[j.id] || 1]}`,
    })),
  ];

  root.append(
    heroBanner(d, langkah, berikut),
    h('div', { class: 'beranda-isi' },
      sambutanAri(berikut),
      barisKartu('Episode Materi', posterUnit, { lihatSemua: '#/materi', sub: 'Tonton berurutan, satu ide setiap kartu' }),
      barisKartu('🔥 Arena Games', kartuGames, { lihatSemua: '#/games', kelas: 'rel-lebar', sub: 'Paling seru minggu ini' }),
      barisKartu('Misi Literasi', posterLit, { lihatSemua: '#/literasi', sub: 'Pecahkan masalah sehari-hari' }),
      barisKartu('Tantangan', posterTantangan, { sub: 'Latihan adaptif & kuis' }),

      h('section', { class: 'baris peta-bagian', id: 'peta-petualangan' },
        h('header', { class: 'baris-kepala' }, h('div', {}, h('h2', {}, '🗺️ Peta Petualangan'), h('p', { class: 'baris-sub' }, 'Ikuti jalurnya dari langkah 1 sampai 7'))),
        h('ol', { class: 'peta jalur' }, langkah.map((l) => h('li', {},
          h('a', { href: l.href, class: `peta-item ${l.selesai ? 'selesai' : ''} ${l === berikut ? 'aktif' : ''}` },
            h('span', { class: 'peta-no', 'aria-hidden': 'true' }, l.selesai ? '✓' : String(l.no)),
            h('span', { class: 'peta-teks' }, h('span', { class: 'tebal' }, `${l.ikon} ${l.judul}`), h('span', { class: 'kecil muted' }, l.ket)),
            l === berikut ? h('span', { class: 'peta-kamu' }, 'Kamu di sini') : null,
            l.selesai ? h('span', { class: 'sr-only' }, '(selesai)') : null))))),

      kartuPasang(),

      h('div', { class: 'kartu kartu-tips' },
        h('strong', {}, '💡 Tips belajar'),
        h('ul', {},
          h('li', {}, 'Belajar 5–10 menit, lalu istirahat sebentar.'),
          h('li', {}, 'Tekan 🔊 untuk mendengarkan penjelasan.'),
          h('li', {}, 'Musik bisa dimatikan lewat tombol 🎵 di atas.'),
          h('li', {}, 'Selesai belajar? Main games untuk istirahat sambil berlatih! 🎮')))),
  );
}

// Ari menyambut dan memperkenalkan Teman Belajar (Ari = pemandu khusus Beranda)
function sambutanAri(berikut) {
  const elAri = h('div', { class: 'sambutan-ari-gambar', html: ari({ ukuran: 78 }) });
  elAri.addEventListener('click', () => {
    const s = elAri.querySelector('.ari');
    s.classList.remove('ari-loncat'); void s.getBoundingClientRect(); s.classList.add('ari-loncat');
    efek('boing');
  });
  return h('section', { class: 'sambutan', 'aria-labelledby': 'judul-sambutan' },
    h('div', { class: 'sambutan-kepala' },
      elAri,
      h('div', { class: 'sambutan-gelembung' },
        h('p', { class: 'sambutan-judul', id: 'judul-sambutan' }, 'Hai! Aku Ari! Selamat datang di DeretKu! ✨'),
        h('p', {}, 'Di sini kamu nggak akan belajar sendirian. Aku punya teman-teman yang siap menemanimu belajar, bermain, dan menyelesaikan berbagai tantangan matematika.'),
        h('p', {}, 'Yuk, belajar bersama teman-temanku dan jelajahi Negeri Aritmatika!'))),
    h('div', { class: 'sambutan-teman' }, Object.keys(TEMAN).map((id, i) => h('figure', { class: 'teman-kartu', style: `--i:${i}` },
      gambarTeman(id),
      h('figcaption', {}, h('strong', {}, TEMAN[id].nama), h('small', {}, `Menemanimu di ${peranTeman(id)}`))))),
    h('a', { class: 'btn-hero utama sambutan-tombol', href: berikut ? berikut.href : '#/materi' }, '🚀 Yuk, Mulai Petualangan!'));
}

function kartuPasang() {
  if (sudahTerpasang()) return null;
  if (bisaPasang()) {
    return h('div', { class: 'kartu kartu-pasang' },
      h('div', {}, h('strong', {}, '📲 Pasang DeretKu'), h('p', { class: 'kecil' }, 'Buka lebih cepat dari layar utama, dan bisa dipakai tanpa internet.')),
      h('button', { class: 'btn btn-utama', onclick: pasang }, 'Pasang'));
  }
  if (iOS()) {
    return h('div', { class: 'kartu kartu-pasang' },
      h('div', {}, h('strong', {}, '📲 Pasang di iPhone'),
        h('p', { class: 'kecil' }, 'Ketuk tombol Bagikan (kotak dengan panah) di Safari, lalu pilih "Tambah ke Layar Utama".')));
  }
  return null;
}
