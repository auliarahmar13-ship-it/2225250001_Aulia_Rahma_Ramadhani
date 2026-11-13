import { h, tombolNarasi, kotakUmpan, tanyaBeban } from '../ui.js';
import { ambil, catatLiterasi, tandaiLiterasi } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { LITERASI, TAHAP, cariLiterasi } from '../data/literasi.js';
import { temanBelajar } from '../teman.js';
import { bannerDunia, poster } from '../dunia.js';
import { posterLiterasi } from '../ilustrasi.js';

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

  function tampilTahap() {
    const t = m.tahap[indeks];
    const info = TAHAP[indeks];
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
          catatLiterasi({ id: m.id, tahap: info.nama, benar: percobaan === 1, percobaan });
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

    const kartu = h('section', { class: 'kartu kartu-tahap muncul' },
      h('div', { class: 'tahap-label' }, h('span', { class: 'tahap-no' }, String(indeks + 1)), ` ${info.ikon} ${info.nama}`, h('span', { class: 'kecil muted' }, ` · ${info.ket}`)),
      tanya,
      h('div', { class: 'daftar-opsi' }, opsi),
      umpan);
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
  return () => hentikanNarasi();
}
