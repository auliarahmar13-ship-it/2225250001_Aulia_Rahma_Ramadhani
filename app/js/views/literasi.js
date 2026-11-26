import { h, tombolNarasi, kotakUmpan, tanyaBeban } from '../ui.js';
import { ambil, catatLiterasi, tandaiLiterasi } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { LITERASI, TAHAP, cariLiterasi } from '../data/literasi.js';
import { temanBelajar } from '../teman.js';
import { bannerDunia, poster } from '../dunia.js';
import { posterLiterasi } from '../ilustrasi.js';
import { FUNGSI_LITERASI, cariFungsi } from '../data/rmt.js';
import { panelTanyaAI } from '../ai.js';

// RMT Tahap 5 (docs/08): fungsi berpikir tiap tahap + tafsiran TERTULIS sebelum pilihan di tahap
// Menafsirkan (penjelasan tertulis, hlm. 167; bukti logis C2 & menghubungkan C5, hlm. 87).
const MIN_TAFSIRAN = 10; // karakter: cukup untuk satu kalimat pendek
function labelFungsi(kode) {
  const f = cariFungsi(kode);
  return f ? h('span', { class: 'label-fungsi', title: `${f.kode} · ${f.nama} (${f.istilahAsli})` }, `${f.ikon} ${f.namaSiswa}`) : null;
}

export function tampilDaftar(root) {
  const d = ambil();
  root.append(
    bannerDunia('literasi', 'Misi Literasi', 'Pecahkan masalah sehari-hari dengan 4 tahap.', 'Yuk, baca ceritanya bareng kami! 📖'),
    h('ol', { class: 'tahap-ringkas' }, TAHAP.map((t) => h('li', {}, h('span', { 'aria-hidden': 'true' }, t.ikon), ' ', h('strong', {}, t.nama), ` (${t.ket})`))),
    h('div', { class: 'grid-poster' }, LITERASI.map((l, i) => poster({
      href: `#/literasi/${l.id}`, ilustrasi: posterLiterasi(l.id, i), judul: l.judul, label: `Misi ${i + 1}`,
      sub: `Konteks ${l.konteks} · 4 tahap`, selesai: !!d.literasiSelesai[l.id],
    }))),
  );
}

export function tampilMasalah(root, [id]) {
  const m = cariLiterasi(id);
  if (!m) {
    root.append(h('p', {}, 'Masalah tidak ditemukan.'), h('a', { class: 'btn btn-utama', href: '#/literasi' }, 'Kembali'));
    return;
  }
  const stimulus = h('div', { class: 'stimulus', html: m.stimulus });
  root.append(
    h('article', { class: 'kartu kartu-stimulus' },
      h('header', { class: 'kartu-kepala' }, h('h1', { class: 'judul-sesi' }, `${m.ikon} ${m.judul}`), tombolNarasi(() => stimulus)),
      stimulus),
    // teman di bawah cerita (tidak menutupi teks), tanpa animasi melayang
    temanBelajar('literasi', 'Yuk, baca ceritanya pelan-pelan dan cari informasi pentingnya, ya! 🔎', { tenang: true, kelas: 'teman-bawah' }));
  const teman = root.querySelector('.teman');
  const daftarTahap = h('div', { class: 'daftar-tahap' });
  root.append(daftarTahap);

  let indeks = 0;
  const mulaiWaktu = Date.now();
  let ai = null;

  function tampilTahap() {
    const t = m.tahap[indeks];
    const info = TAHAP[indeks];
    const menafsirkan = info.nama === 'Menafsirkan';
    let tafsiran = '';
    let percobaan = 0;
    const umpan = h('div', { 'aria-live': 'polite' });
    const tanya = h('p', { html: t.tanya });
    const opsi = t.opsi.map((teks, j) => h('button', {
      class: 'opsi', type: 'button',
      onclick: (e) => {
        percobaan++;
        const btn = e.currentTarget;
        if (j === t.kunci) {
          btn.classList.add('benar');
          opsi.forEach((b) => { b.disabled = true; });
          efek('benar');
          catatLiterasi({ id: m.id, tahap: info.nama, benar: percobaan === 1, percobaan, ...(menafsirkan ? { tafsiran } : {}) });
          umpan.replaceChildren(kotakUmpan(true, t.penjelasan));
          teman.bicara(indeks < m.tahap.length - 1 ? `Tahap ${info.nama} beres! Lanjut ke tahap berikutnya, yuk! ✨` : 'Yeay, semua tahap selesai! 🎉', 'senang');
          kartu.classList.add('tuntas');
          indeks++;
          if (indeks < m.tahap.length) {
            const lanjut = h('button', { class: 'btn btn-utama lebar', onclick: () => { lanjut.remove(); tampilTahap(); } }, `Lanjut ke tahap ${TAHAP[indeks].nama} →`);
            umpan.append(lanjut);
          } else {
            selesai();
          }
        } else {
          btn.classList.add('salah');
          btn.disabled = true;
          efek('salah');
          umpan.replaceChildren(kotakUmpan(false, `${t.petunjuk} Coba lagi!`));
          teman.bicara('Coba baca lagi ceritanya di atas. Kamu pasti menemukannya! 💡', 'semangat');
        }
      },
    }, teks));

    const daftarOpsi = h('div', { class: 'daftar-opsi', hidden: menafsirkan });

    // ---- Menafsirkan: tulis dulu tafsiranmu sendiri, baru pilihan & penjelasan muncul
    let bagianTafsir = null;
    if (menafsirkan) {
      const kotak = h('textarea', {
        class: 'input-tafsir', rows: '3', maxlength: '300',
        'aria-label': 'Tafsiranmu dalam satu kalimat', placeholder: 'Contoh: Artinya, ... karena ...',
      });
      const simpanBtn = h('button', { class: 'btn btn-sekunder lebar', type: 'button' }, '✍️ Simpan tafsiranku');
      const umpanTafsir = h('div', { 'aria-live': 'polite' });
      if (ai) ai.hentikan();
      ai = panelTanyaAI(() => {
        const cerita = h('div', { html: m.stimulus }).textContent.replace(/\s+/g, ' ').slice(0, 450);
        return `Misi literasi "${m.judul}". Cerita: ${cerita} Tahap: Menafsirkan. Pertanyaan: ${h('div', { html: t.tanya }).textContent} Tafsiran tertulis siswa: ${tafsiran || '(belum ditulis)'}.`;
      });
      simpanBtn.addEventListener('click', () => {
        const isi = kotak.value.trim();
        if (isi.length < MIN_TAFSIRAN) {
          umpanTafsir.replaceChildren(kotakUmpan(false, 'Tulis satu kalimat lengkap, ya: apa arti jawabannya dalam cerita, dan mengapa?'));
          kotak.focus();
          return;
        }
        tafsiran = isi;
        kotak.disabled = true;
        simpanBtn.disabled = true;
        efek('buka');
        const p = h('p', {});
        p.textContent = `Tafsiranmu: "${isi}"`; // teks siswa → textContent (aman)
        umpanTafsir.replaceChildren(h('div', { class: 'kotak-jembatan' }, p,
          h('p', { class: 'kecil muted' }, 'Sekarang bandingkan dengan pilihan di bawah. Mau pendapat Teman AI tentang tafsiranmu? Tekan 🤖 Tanya Teman AI.')));
        daftarOpsi.hidden = false;
        teman.bicara('Bagus, kamu sudah menulis alasanmu sendiri! Sekarang pilih jawaban yang paling tepat ✍️', 'senang');
      });
      bagianTafsir = h('div', { class: 'tafsir-tulis' },
        h('p', { class: 'kecil tebal' }, '✍️ Tulis dulu tafsiranmu sendiri dalam satu kalimat:'),
        kotak, simpanBtn, umpanTafsir,
        h('div', { class: 'baris-tombol' }, ai.tombol), ai.panel);
    }

    const kartu = h('section', { class: 'kartu kartu-tahap muncul' }, ...[
      h('div', { class: 'tahap-label' }, h('span', { class: 'tahap-no' }, String(indeks + 1)), ` ${info.ikon} ${info.nama}`, h('span', { class: 'kecil muted' }, ` · ${info.ket}`)),
      h('div', { class: 'baris-label', 'data-tanpa-narasi': true }, h('span', { class: 'kecil muted' }, '🧠 Fungsi berpikir:'), (FUNGSI_LITERASI[info.nama] || []).map(labelFungsi)),
      tanya,
      bagianTafsir,
      daftarOpsi,
      umpan].filter(Boolean));
    daftarOpsi.append(...opsi);
    daftarTahap.append(kartu);
    kartu.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function selesai() {
    tandaiLiterasi(m.id);
    efek('selesai');
    await tanyaBeban(`literasi:${m.id}`, m.judul);
    const berikut = LITERASI[LITERASI.indexOf(m) + 1];
    const menit = Math.max(1, Math.round((Date.now() - mulaiWaktu) / 60000));
    const hasil = h('section', { class: 'kartu layar-selesai' },
      temanBelajar('literasi', 'Kita berhasil memecahkan masalahnya bersama! 🌟', { kelas: 'teman-tengah' }),
      h('h2', {}, 'Masalah terpecahkan!'),
      h('p', {}, `Kamu sudah melewati keempat tahap dalam ±${menit} menit.`),
      h('p', { class: 'muted kecil' }, 'Ingat: memahami → merumuskan → menghitung → menafsirkan. Pakai langkah ini untuk setiap soal cerita.'),
      h('div', { class: 'tumpuk-tombol' },
        berikut ? h('a', { class: 'btn btn-utama', href: `#/literasi/${berikut.id}` }, `Masalah berikutnya: ${berikut.judul} →`)
          : h('a', { class: 'btn btn-utama', href: '#/kuis' }, 'Coba Kuis →'),
        h('a', { class: 'btn btn-ghost', href: '#/literasi' }, 'Daftar masalah')));
    daftarTahap.append(hasil);
    hasil.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  tampilTahap();
  window.scrollTo({ top: 0 });
  return () => { hentikanNarasi(); if (ai) ai.hentikan(); };
}
