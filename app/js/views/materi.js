import { h, visualBarisan, tombolNarasi, kotakUmpan, batangProgres, tanyaBeban } from '../ui.js';
import { ambil, aturPosisi, tandaiMateri } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { UNIT, cariUnit } from '../data/materi.js';
import { maskot, sorak } from '../maskot.js';

// ------------------------------------------------------------------ daftar unit
export function tampilDaftar(root) {
  const d = ambil();
  root.append(
    h('h1', {}, '📚 Materi'),
    h('p', { class: 'muted' }, 'Pelajari secara berurutan. Setiap unit berisi kartu-kartu singkat, jadi kamu bisa berhenti kapan saja.'),
    h('div', { class: 'daftar' }, UNIT.map((u, i) => {
      const selesai = !!d.materiSelesai[u.id];
      const posisi = d.posisiKartu[u.id] || 0;
      const status = selesai ? '✓ Selesai' : posisi > 0 ? `Kartu ${posisi + 1}/${u.kartu.length}` : `${u.kartu.length} kartu · ±${u.menit} menit`;
      return h('a', { class: `kartu item-daftar ${selesai ? 'selesai' : ''}`, href: `#/materi/${u.id}` },
        h('span', { class: 'item-ikon', 'aria-hidden': 'true' }, u.ikon),
        h('span', { class: 'item-teks' },
          h('span', { class: 'kecil muted' }, `Unit ${i + 1} · ${u.tp}`),
          h('span', { class: 'tebal' }, u.judul),
          h('span', { class: 'kecil muted' }, u.ket)),
        h('span', { class: `lencana ${selesai ? 'lencana-ok' : ''}` }, status));
    })),
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
  root.append(kepala, wadah, nav);

  function render() {
    hentikanNarasi();
    aturPosisi(id, i);
    st = { langkah: 0, cekSelesai: false, percobaan: 0, elLangkah: null };
    const k = unit.kartu[i];
    kepala.replaceChildren(
      h('div', { class: 'unit-judul' }, h('span', { 'aria-hidden': 'true' }, unit.ikon), ' ', unit.judul),
      h('div', { class: 'kecil muted' }, `Kartu ${i + 1} dari ${total}`),
      batangProgres(i + 1, total, `Kartu ${i + 1} dari ${total}`));
    wadah.replaceChildren(buatKartu(k));
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
      } else {
        umpan.replaceChildren(kotakUmpan(false, `${k.salah} Coba lagi, ya!`));
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
    const m = maskot({ pesan: 'Hore, kamu hebat! 🎉', kecil: true });
    setTimeout(() => sorak(m), 200);
    root.replaceChildren(h('section', { class: 'kartu layar-selesai' },
      m,
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
