import { h, acakUrutan, tanyaBeban, batangProgres, konfirmasi, tombolNarasi } from '../ui.js';
import { ambil, catatKuis } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';

let cacheBank = null;
async function muatBank() {
  if (cacheBank) return cacheBank;
  const r = await fetch('data/bank-soal.json');
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  cacheBank = await r.json();
  return cacheBank;
}

export function tampil(root) {
  const riwayat = ambil().kuis;
  const terbaik = riwayat.length ? Math.max(...riwayat.map((k) => k.skor)) : null;

  root.append(
    h('h1', {}, '🏆 Kuis'),
    h('div', { class: 'kartu' },
      h('ul', { class: 'info-kuis' },
        h('li', {}, '📝 15 soal pilihan ganda'),
        h('li', {}, '⏳ Tanpa batas waktu, jadi kerjakan dengan tenang'),
        h('li', {}, '↩️ Kamu boleh kembali ke soal sebelumnya'),
        h('li', {}, '📊 Skor dan pembahasan muncul di akhir')),
      terbaik !== null ? h('p', { class: 'muted' }, `Skor terbaikmu: ${terbaik} (${riwayat.length}× mencoba)`) : null,
      h('button', { class: 'btn btn-utama lebar', onclick: () => mulai(root) }, 'Mulai Kuis')),
  );
}

async function mulai(root) {
  let bank;
  try {
    bank = await muatBank();
  } catch (e) {
    root.replaceChildren(h('div', { class: 'kartu' }, h('p', {}, 'Soal kuis gagal dimuat. Periksa koneksi internet, lalu coba lagi.'),
      h('button', { class: 'btn btn-utama', onclick: () => mulai(root) }, 'Coba lagi')));
    return;
  }
  const soal = bank.soal.map((s) => ({ ...s, opsi: acakUrutan(s.opsi) }));
  const pilihan = new Array(soal.length).fill(null);
  const durasi = new Array(soal.length).fill(0);
  const waktuMulai = Date.now();
  let i = 0;
  let masuk = Date.now();

  const wadah = h('div');
  root.replaceChildren(wadah);

  function catatWaktu() { durasi[i] += (Date.now() - masuk) / 1000; masuk = Date.now(); }

  function render() {
    hentikanNarasi();
    const s = soal[i];
    const teks = h('p', { class: 'teks-soal' }, s.pertanyaan);
    const opsi = s.opsi.map((o, j) => h('button', {
      class: `opsi ${pilihan[i] === j ? 'dipilih' : ''}`, type: 'button', role: 'radio',
      'aria-checked': pilihan[i] === j ? 'true' : 'false',
      onclick: () => { pilihan[i] = j; efek('klik'); render(); },
    }, h('span', { class: 'opsi-huruf' }, 'ABCD'[j]), h('span', {}, o.teks)));
    const terjawab = pilihan.filter((p) => p !== null).length;

    wadah.replaceChildren(
      h('div', { class: 'baris-antara kecil muted' }, h('span', {}, `Soal ${i + 1} dari ${soal.length}`), h('span', {}, `${terjawab} terjawab`)),
      batangProgres(i + 1, soal.length),
      h('article', { class: 'kartu' },
        h('header', { class: 'kartu-kepala' }, h('h2', {}, `Soal ${i + 1}`), tombolNarasi(() => teks)),
        teks,
        h('div', { class: 'daftar-opsi', role: 'radiogroup', 'aria-label': 'Pilihan jawaban' }, opsi)),
      h('div', { class: 'nav-bawah' },
        h('button', { class: 'btn btn-sekunder', disabled: i === 0, onclick: () => { catatWaktu(); i--; render(); } }, '← Sebelumnya'),
        i < soal.length - 1
          ? h('button', { class: 'btn btn-utama', disabled: pilihan[i] === null, onclick: () => { catatWaktu(); i++; render(); } }, 'Berikutnya →')
          : h('button', { class: 'btn btn-utama', onclick: kumpulkan }, 'Selesai ✓')),
      h('div', { class: 'peta-soal', 'aria-label': 'Lompat ke soal' }, soal.map((_, k) => h('button', {
        class: `peta-soal-btn ${pilihan[k] !== null ? 'terisi' : ''} ${k === i ? 'kini' : ''}`,
        'aria-label': `Soal ${k + 1}${pilihan[k] !== null ? ' (terjawab)' : ''}`,
        onclick: () => { catatWaktu(); i = k; render(); },
      }, String(k + 1)))));
    window.scrollTo({ top: 0 });
  }

  async function kumpulkan() {
    const kosong = pilihan.filter((p) => p === null).length;
    if (kosong) {
      const ok = await konfirmasi('Masih ada soal kosong', `${kosong} soal belum dijawab. Tetap kumpulkan?`, 'Kumpulkan');
      if (!ok) return;
    }
    catatWaktu();
    hentikanNarasi();
    const jawaban = soal.map((s, k) => {
      const o = pilihan[k] === null ? null : s.opsi[pilihan[k]];
      return { id: s.id, benar: !!(o && o.benar), miskonsepsi: o && !o.benar ? o.miskonsepsi : null, durasiDetik: Math.round(durasi[k]) };
    });
    const benar = jawaban.filter((j) => j.benar).length;
    const skor = Math.round((benar / soal.length) * 100);
    catatKuis({ skor, benar, total: soal.length, durasiDetik: Math.round((Date.now() - waktuMulai) / 1000), jawaban });
    // Skala beban ditanyakan SEBELUM skor ditampilkan agar penilaian tidak terpengaruh skor
    await tanyaBeban('kuis', 'Kuis');
    efek(skor >= 75 ? 'selesai' : 'buka');
    tampilHasil(root, soal, pilihan, skor, benar, bank.miskonsepsi);
  }

  render();
}

function tampilHasil(root, soal, pilihan, skor, benar, kamusMiskonsepsi) {
  const pesan = skor >= 90 ? 'Luar biasa! 🌟' : skor >= 75 ? 'Hebat, kamu tuntas! 🎉'
    : skor >= 50 ? 'Sudah bagus! Pelajari pembahasan lalu coba lagi. 💪' : 'Tidak apa-apa, ini bagian dari belajar. Ulangi materi dan latihan, ya. 🌱';
  const miskonsepsi = new Map();
  soal.forEach((s, k) => {
    const o = pilihan[k] === null ? null : s.opsi[pilihan[k]];
    if (o && !o.benar && o.miskonsepsi && o.miskonsepsi !== 'M-hitung') miskonsepsi.set(o.miskonsepsi, (miskonsepsi.get(o.miskonsepsi) || 0) + 1);
  });

  root.replaceChildren(
    h('section', { class: 'kartu hasil' },
      h('div', { class: `skor-lingkaran ${skor >= 75 ? 'tuntas' : ''}`, role: 'img', 'aria-label': `Skor ${skor}` }, String(skor)),
      h('h1', {}, pesan),
      h('p', { class: 'muted' }, `${benar} dari ${soal.length} soal benar`),
      h('div', { class: 'tumpuk-tombol' },
        h('button', { class: 'btn btn-utama', onclick: () => { root.replaceChildren(); tampil(root); } }, '🔁 Ulangi kuis'),
        h('a', { class: 'btn btn-sekunder', href: '#/' }, 'Ke Beranda'))),
    miskonsepsi.size ? h('section', { class: 'kartu kartu-perhatian' },
      h('h2', {}, '🔍 Yang perlu diperhatikan'),
      h('ul', {}, [...miskonsepsi.entries()].map(([kode]) => h('li', {}, kamusMiskonsepsi[kode] || kode)))) : null,
    h('h2', { class: 'judul-bagian' }, 'Pembahasan'),
    ...soal.map((s, k) => {
      const o = pilihan[k] === null ? null : s.opsi[pilihan[k]];
      const kunci = s.opsi.find((x) => x.benar);
      const ok = !!(o && o.benar);
      return h('details', { class: `kartu ulasan ${ok ? 'ok' : 'tidak'}` },
        h('summary', {}, h('span', { 'aria-hidden': 'true' }, ok ? '✅' : '❌'), ` Soal ${k + 1}`),
        h('p', {}, s.pertanyaan),
        h('p', { class: 'kecil' }, 'Jawabanmu: ', h('strong', {}, o ? o.teks : '(kosong)')),
        ok ? null : h('p', { class: 'kecil' }, 'Jawaban benar: ', h('strong', {}, kunci.teks)),
        o && !o.benar && o.miskonsepsi ? h('p', { class: 'kecil catatan' }, `💭 ${kamusMiskonsepsi[o.miskonsepsi] || ''}`) : null,
        h('ol', { class: 'langkah' }, s.pembahasan.map((p) => h('li', {}, p))));
    }),
  );
  window.scrollTo({ top: 0 });
}
