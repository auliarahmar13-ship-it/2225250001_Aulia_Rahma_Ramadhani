import { h, visualBarisan, tombolNarasi, kotakUmpan, batangProgres, tanyaBeban, garisBilangan, fmt } from '../ui.js';
import { ambil, aturPosisi, tandaiMateri } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { UNIT, cariUnit } from '../data/materi.js';
import { MAKNA_UNIT, FUNGSI_UNIT, cariFungsi } from '../data/rmt.js';

// RMT Tahap 3 (docs/08): makna unit, alat interaktif (garis bilangan, tabel), kartu jembatan,
// dan fungsi berpikir di ringkasan. Nama fungsi selalu dari kamus rmt.js.
function labelFungsi(kode) {
  const f = cariFungsi(kode);
  return f ? h('span', { class: 'label-fungsi', title: `${f.kode} · ${f.nama} (${f.istilahAsli})` },
    `${f.ikon} ${f.namaSiswa}`) : null;
}
import { temanBelajar } from '../teman.js';
import { bannerDunia, poster } from '../dunia.js';
import { POSTER_UNIT } from '../ilustrasi.js';

// ------------------------------------------------------------------ daftar unit
export function tampilDaftar(root) {
  const d = ambil();
  root.append(...[ // filter: append(null) menulis teks "null"
    bannerDunia('materi', 'Episode Materi', 'Setiap episode berisi kartu singkat. Kamu bisa berhenti kapan saja.', 'Hai! Yuk, belajar bareng kami! 📚'),
    Object.keys(d.pemanasanSelesai || {}).length ? null
      : h('a', { class: 'kartu item-daftar', href: '#/pemanasan' },
        h('span', { class: 'item-ikon', 'aria-hidden': 'true' }, '🧠'),
        h('span', { class: 'item-teks' }, h('span', { class: 'tebal' }, 'Belum pemanasan? Mulai dari sini'),
          h('span', { class: 'kecil muted' }, 'Latih cara berpikir dengan pola gambar sebelum masuk ke angka.'))),
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
  ].filter(Boolean));
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
    garis: ['Pakai garis bilangan ini sebagai alat, ya!'],
    tabel: ['Isi tabelnya sendiri. Kamu yang menemukan rumusnya!'],
  };
  root.append(kepala, wadah, nav, teman);

  function render() {
    hentikanNarasi();
    aturPosisi(id, i);
    st = { langkah: 0, cekSelesai: false, alatSelesai: false, percobaan: 0, elLangkah: null, sapaPertama: st.sapaPertama };
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
    const el = h('article', { class: `kartu kartu-materi jenis-${k.jenis}${k.jembatan ? ' kartu-jembatan' : ''}` },
      h('header', { class: 'kartu-kepala' },
        h('div', {},
          k.jembatan ? h('div', { class: 'label-jembatan' }, '🌉 Jembatan: hubungkan ke hal yang lebih luas') : null,
          h('h2', {}, k.judul)),
        tombolNarasi(() => isi)),
      isi);

    // Mediasi makna (hlm. 80): mengapa unit ini penting, hanya di kartu pertama
    if (i === 0 && MAKNA_UNIT[unit.id]) {
      isi.append(h('p', { class: 'makna-unit', 'data-tanpa-narasi': true }, h('strong', {}, '💡 Mengapa ini penting? '), MAKNA_UNIT[unit.id]));
    }

    if (k.jenis === 'garis') {
      isi.append(h('div', { html: k.isi }));
      buatGaris(k, isi);
    } else if (k.jenis === 'tabel') {
      isi.append(h('div', { html: k.isi }));
      buatTabel(k, isi);
    } else if (k.jenis === 'teks') {
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
      const kode = FUNGSI_UNIT[unit.id] || [];
      if (kode.length) {
        isi.append(h('div', { class: 'fungsi-unit', 'data-tanpa-narasi': true },
          h('div', { class: 'kecil tebal' }, '🧠 Fungsi berpikir yang kamu latih di unit ini:'),
          h('div', { class: 'baris-label' }, kode.map(labelFungsi)),
          h('div', { class: 'kecil muted' }, 'Lihat artinya di Saya → Kamus Fungsi Berpikir.')));
      }
    }
    return el;
  }

  // ---- Alat: garis bilangan interaktif (hlm. 11, 58). Selesai setelah k.lompat kali melompat.
  function buatGaris(k, isi) {
    const titik = [k.a];
    const maks = k.a + (k.lompat + 1) * k.b;
    const gambar = h('div', { class: 'wadah-vis' });
    const umpan = h('div', { 'aria-live': 'polite' });
    const tombol = h('button', { class: 'btn btn-sekunder lebar', type: 'button' }, `Lompat ${k.b >= 0 ? '+' : '−'}${fmt(Math.abs(k.b))} ↷`);
    const gambarUlang = () => { gambar.innerHTML = garisBilangan(Math.min(0, k.a), maks, titik, k.b); };
    tombol.addEventListener('click', () => {
      if (titik.length > k.lompat) return;
      titik.push(titik[titik.length - 1] + k.b);
      efek('klik');
      gambarUlang();
      if (titik.length > k.lompat) {
        tombol.disabled = true;
        st.alatSelesai = true;
        umpan.replaceChildren(
          kotakUmpan(true, `Suku-sukunya ${titik.map(fmt).join(', ')}. Setiap lompatan <strong>sama panjang</strong> (${fmt(k.b)}): itulah beda yang <strong>tetap</strong>.`),
          h('div', { class: 'baris-label' }, labelFungsi('B2'), labelFungsi('B1')));
        efek('benar');
        renderNav();
      }
    });
    gambarUlang();
    isi.append(gambar, tombol, umpan);
  }

  // ---- Alat: tabel interaktif (hlm. 152–154). Isi perubahan Uₙ → temukan b tetap → pilih rumus.
  function buatTabel(k, isi) {
    const umpan = h('div', { 'aria-live': 'polite' });
    const kotak = k.suku.slice(1).map((_, j) => h('input', {
      type: 'text', inputmode: 'numeric', autocomplete: 'off', class: 'input-sel',
      'aria-label': `Perubahan dari U${j + 1} ke U${j + 2}`,
    }));
    const tabel = h('table', { class: 'tabel-pola tabel-interaktif' },
      h('thead', {}, h('tr', {}, h('th', { html: '<span class="vn">n</span>' }), h('th', { html: '<span class="vu">U<sub>n</sub></span>' }), h('th', {}, 'Perubahan'))),
      h('tbody', {}, k.suku.map((v, j) => h('tr', {},
        h('td', {}, String(j + 1)), h('td', {}, fmt(v)), h('td', {}, j === 0 ? '–' : kotak[j - 1])))));
    const periksa = h('button', { class: 'btn btn-sekunder lebar', type: 'button' }, 'Periksa tabel');
    const langkahRumus = h('div', { hidden: true });
    periksa.addEventListener('click', () => {
      let semua = true;
      kotak.forEach((inp, j) => {
        const nilai = Number(inp.value.trim().replace('−', '-'));
        const ok = inp.value.trim() !== '' && nilai === k.suku[j + 1] - k.suku[j];
        inp.classList.toggle('salah', !ok);
        inp.classList.toggle('benar', ok);
        semua = semua && ok;
      });
      if (!semua) {
        efek('salah');
        umpan.replaceChildren(kotakUmpan(false, `Kurangi setiap ${'U<sub>n</sub>'} dengan suku <strong>di atasnya</strong>. Misalnya ${fmt(k.suku[1])} − ${fmt(k.suku[0])}.`));
        return;
      }
      const b = k.suku[1] - k.suku[0];
      efek('benar');
      kotak.forEach((inp) => { inp.disabled = true; });
      periksa.disabled = true;
      umpan.replaceChildren(
        kotakUmpan(true, `Setiap <span class="vn">n</span> naik 1, U<sub>n</sub> selalu naik ${fmt(b)}. Perubahan per satu langkah ini tetap: itulah <span class="vb">b</span> = ${fmt(b)}.`),
        h('div', { class: 'baris-label' }, labelFungsi('C8')));
      langkahRumus.hidden = false;
    });

    // Merumuskan sendiri sebelum rumus ditampilkan (hlm. 107: proses, bukan produk jadi)
    const umpanRumus = h('div', { 'aria-live': 'polite' });
    let salahRumus = 0;
    const opsi = k.opsi.map((teks, j) => h('button', {
      class: 'opsi', type: 'button',
      onclick: (e) => {
        if (st.alatSelesai) return;
        const btn = e.currentTarget;
        if (j === k.kunci) {
          btn.classList.add('benar');
          opsi.forEach((x) => { x.disabled = true; });
          st.alatSelesai = true;
          efek('benar');
          umpanRumus.replaceChildren(kotakUmpan(true, `Kamu menemukan rumusnya sendiri! ${k.kesimpulan}`),
            h('div', { class: 'baris-label' }, labelFungsi('C9')));
          renderNav();
        } else {
          btn.classList.add('salah');
          btn.disabled = true;
          efek('salah');
          salahRumus++;
          umpanRumus.replaceChildren(kotakUmpan(false, salahRumus >= 2
            ? `Rumus yang tepat ditandai ✓. ${k.kesimpulan}`
            : `Uji dulu rumus itu pada U<sub>2</sub>: apakah hasilnya ${fmt(k.suku[1])}?`),
          h('div', { class: 'baris-label' }, labelFungsi('C4')));
          if (salahRumus >= 2) {
            opsi[k.kunci].classList.add('benar');
            opsi.forEach((x) => { x.disabled = true; });
            st.alatSelesai = true;
            renderNav();
          }
        }
      },
    }, h('span', { html: teks })));
    langkahRumus.append(h('p', { class: 'tebal' }, 'Sekarang, rumus mana yang cocok untuk semua baris tabel?'),
      h('div', { class: 'daftar-opsi' }, opsi), umpanRumus);
    isi.append(h('div', { class: 'wadah-tabel' }, tabel), periksa, umpan, langkahRumus);
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
    } else if ((k.jenis === 'garis' || k.jenis === 'tabel') && !st.alatSelesai) {
      utama = h('button', { class: 'btn btn-utama', disabled: true }, 'Pakai alatnya dulu');
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
