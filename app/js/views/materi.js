import { h, visualBarisan, tombolNarasi, kotakUmpan, batangProgres, tanyaBeban } from '../ui.js';
import { ambil, aturPosisi, tandaiMateri } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { UNIT, cariUnit } from '../data/materi.js';
import { temanBelajar } from '../teman.js';
import { bannerDunia, poster } from '../dunia.js';
import { POSTER_UNIT } from '../ilustrasi.js';

// ------------------------------------------------------------------ daftar unit
export function tampilDaftar(root) {
  const d = ambil();
  root.append(
    bannerDunia('materi', 'Episode Materi', 'Setiap episode berisi kartu singkat. Kamu bisa berhenti kapan saja.', 'Hai! Yuk, belajar bareng kami! 📚'),
    h('div', { class: 'grid-poster' }, UNIT.map((u, i) => {
      const selesai = !!d.materiSelesai[u.id];
      const posisi = d.posisiKartu[u.id] || 0;
      return poster({
        href: `#/materi/${u.id}`, ilustrasi: POSTER_UNIT[u.id](), judul: u.judul, label: `Episode ${i + 1} · ${u.tp}`,
        sub: selesai ? '✓ Selesai, tonton ulang' : posisi > 0 ? `Kartu ${posisi + 1}/${u.kartu.length}` : `${u.kartu.length} kartu · ±${u.menit} menit`,
        progres: selesai ? 1 : posisi ? posisi / u.kartu.length : null, selesai,
      });
    })),
    h('p', { class: 'kecil muted tengah' }, UNIT.map((u, i) => `${i + 1}. ${u.ket}`).join(' · ')),
  );
}

// ------------------------------------------------------------------ satu unit
export function tampilUnit(root, [id]) {
  const unit = cariUnit(id);
  if (!unit) {
    root.append(h('p', {}, 'Unit tidak ditemukan.'), h('a', { class: 'btn btn-utama', href: '#/materi' }, 'Kembali ke Materi'));
    return;
  }
  const total = unit.kartu.length;
  let i = Math.min(ambil().posisiKartu[id] || 0, total - 1);
  let st = {};

  const kepala = h('div', { class: 'unit-kepala' });
  const wadah = h('div', { class: 'kartu-wadah' });
  const nav = h('div', { class: 'nav-bawah' });
  // Teman belajar di bawah navigasi: tidak menutupi rumus/teks; tanpa animasi melayang (prinsip CLT)
  const teman = temanBelajar('materi', 'Hai! Yuk, kita pelajari barisan aritmetika bersama-sama!', { tenang: true, kelas: 'teman-bawah' });
  const SAPA = {
    teks: ['Baca pelan-pelan, ya. Lihat juga gambarnya!', 'Perhatikan warnanya: a, b, dan n punya warna sendiri.'],
    contoh: ['Buka langkahnya satu per satu, ya!'],
    cek: ['Coba jawab dulu. Salah juga tidak apa-apa!'],
    ringkasan: ['Ini ringkasannya. Ingat poin-poin pentingnya, ya!'],
  };
  root.append(kepala, wadah, nav, teman);

  function render() {
    hentikanNarasi();
    aturPosisi(id, i);
    st = { langkah: 0, cekSelesai: false, percobaan: 0, elLangkah: null, sapaPertama: st.sapaPertama };
    const k = unit.kartu[i];
    kepala.replaceChildren(
      h('div', { class: 'unit-judul' }, h('span', { 'aria-hidden': 'true' }, unit.ikon), ' ', unit.judul),
      h('div', { class: 'kecil muted' }, `Kartu ${i + 1} dari ${total}`),
      batangProgres(i + 1, total, `Kartu ${i + 1} dari ${total}`));
    wadah.replaceChildren(buatKartu(k));
    if (i > 0 || st.sapaPertama) { const s = SAPA[k.jenis]; teman.bicara(s[i % s.length]); }
    st.sapaPertama = true;
    renderNav();
    window.scrollTo({ top: 0 });
  }

  function buatKartu(k) {
    const isi = h('div', { class: 'kartu-isi' });
    const el = h('article', { class: `kartu kartu-materi jenis-${k.jenis}` },
      h('header', { class: 'kartu-kepala' },
        h('h2', {}, k.judul),
        tombolNarasi(() => isi)),
      isi);

    if (k.jenis === 'teks') {
      isi.append(h('div', { html: k.isi }));
      if (k.visual) isi.append(h('div', { class: 'wadah-vis', html: visualBarisan(k.visual) }));
    } else if (k.jenis === 'contoh') {
      isi.append(h('div', { class: 'soal-contoh', html: k.soal }));
      st.elLangkah = h('ol', { class: 'langkah' });
      isi.append(st.elLangkah);
    } else if (k.jenis === 'cek') {
      isi.append(h('div', { html: k.tanya }));
      const umpan = h('div', { 'aria-live': 'polite' });
      const tombol = k.opsi.map((teks, j) => h('button', {
        class: 'opsi', type: 'button',
        onclick: (e) => jawabCek(k, j, e.currentTarget, tombol, umpan),
      }, teks));
      isi.append(h('div', { class: 'daftar-opsi' }, tombol), umpan);
    } else if (k.jenis === 'ringkasan') {
      isi.append(h('ul', { class: 'ringkasan' }, k.poin.map((p) => h('li', { html: p }))));
    }
    return el;
  }

  function bukaLangkah() {
    const k = unit.kartu[i];
    const li = h('li', { class: 'muncul', html: k.langkah[st.langkah] });
    st.elLangkah.append(li);
    st.langkah++;
    efek('buka');
    li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    renderNav();
  }

  function jawabCek(k, j, btn, semua, umpan) {
    if (st.cekSelesai) return;
    if (j === k.kunci) {
      btn.classList.add('benar');
      efek('benar');
      st.cekSelesai = true;
      semua.forEach((b) => { b.disabled = true; });
      umpan.replaceChildren(kotakUmpan(true, k.benar));
      teman.bicara('Hebat! Jawabanmu tepat! 🎉', 'senang');
    } else {
      btn.classList.add('salah');
      btn.disabled = true;
      efek('salah');
      st.percobaan++;
      if (st.percobaan >= 2) {
        semua[k.kunci].classList.add('benar');
        semua.forEach((b) => { b.disabled = true; });
        st.cekSelesai = true;
        umpan.replaceChildren(kotakUmpan(false, `Jawaban yang benar: <strong>${k.opsi[k.kunci]}</strong>. ${k.benar}`));
        teman.bicara('Tidak apa-apa! Baca penjelasannya, lalu kita lanjut bersama 😊', 'semangat');
      } else {
        umpan.replaceChildren(kotakUmpan(false, `${k.salah} Coba lagi, ya!`));
        teman.bicara('Hampir! Baca petunjuknya, lalu coba sekali lagi 💪', 'semangat');
      }
    }
    renderNav();
  }

  function renderNav() {
    const k = unit.kartu[i];
    const kembali = h('button', { class: 'btn btn-sekunder', disabled: i === 0, onclick: () => { i--; render(); } }, '← Kembali');
    let utama;
    if (k.jenis === 'contoh' && st.langkah < k.langkah.length) {
      utama = h('button', { class: 'btn btn-utama', onclick: bukaLangkah },
        st.langkah === 0 ? 'Lihat langkah 1' : `Langkah ${st.langkah + 1} ↓`);
    } else if (k.jenis === 'cek' && !st.cekSelesai) {
      utama = h('button', { class: 'btn btn-utama', disabled: true }, 'Pilih jawaban dulu');
    } else if (i === total - 1) {
      utama = h('button', { class: 'btn btn-utama', onclick: selesai }, 'Selesai ✓');
    } else {
      utama = h('button', { class: 'btn btn-utama', onclick: () => { i++; render(); } }, 'Lanjut →');
    }
    nav.replaceChildren(kembali, utama);
  }

  async function selesai() {
    hentikanNarasi();
    tandaiMateri(id);
    aturPosisi(id, 0);
    efek('selesai');
    await tanyaBeban(`materi:${id}`, unit.judul);
    const idx = UNIT.indexOf(unit);
    const lanjut = UNIT[idx + 1];
    root.replaceChildren(h('section', { class: 'kartu layar-selesai' },
      temanBelajar('materi', `Hore! Kita sudah menyelesaikan "${unit.judul}" bersama! 🎉`, { kelas: 'teman-tengah' }),
      h('h1', {}, 'Unit selesai!'),
      h('p', {}, `Kamu telah menyelesaikan "${unit.judul}". Kerja bagus!`),
      h('div', { class: 'tumpuk-tombol' },
        lanjut ? h('a', { class: 'btn btn-utama', href: `#/materi/${lanjut.id}` }, `Lanjut: ${lanjut.judul} →`)
          : h('a', { class: 'btn btn-utama', href: '#/latihan' }, 'Mulai Latihan →'),
        idx >= 2 ? h('a', { class: 'btn btn-sekunder', href: '#/latihan' }, '✏️ Latihan soal') : null,
        h('a', { class: 'btn btn-ghost', href: '#/materi' }, 'Daftar materi'))));
    window.scrollTo({ top: 0 });
  }

  render();
  return () => hentikanNarasi();
}
