import { h, visualBarisan, tombolNarasi, kotakUmpan, tanyaBeban, toast, fmt } from '../ui.js';
import { ambil, aturLevel, catatLatihan } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { JENIS, NAMA_LEVEL, buatSoal, bacaJawaban } from '../generator.js';
import { bannerDunia } from '../dunia.js';

const NAIK_SETELAH = 3; // benar berturut-turut tanpa petunjuk
const TURUN_SETELAH = 2; // salah berturut-turut

// ------------------------------------------------------------------ daftar jenis
export function tampilDaftar(root) {
  const d = ambil();
  root.append(
    bannerDunia('latihan', 'Latihan Adaptif', 'Soal acak tanpa batas waktu. Level naik otomatis!', 'Pelan-pelan saja 🌱'),
    h('p', { class: 'kecil muted' }, 'Jawab benar 3 kali berturut-turut tanpa petunjuk untuk naik level.'),
    h('div', { class: 'daftar' }, JENIS.map((j) => {
      const riwayat = d.latihan.filter((l) => l.jenis === j.id);
      const benar = riwayat.filter((l) => l.benar).length;
      const level = d.levelLatihan[j.id] || 1;
      return h('a', { class: 'kartu item-daftar', href: `#/latihan/${j.id}` },
        h('span', { class: 'item-ikon', 'aria-hidden': 'true' }, j.ikon),
        h('span', { class: 'item-teks' },
          h('span', { class: 'tebal' }, j.judul),
          h('span', { class: 'kecil muted' }, riwayat.length ? `${benar}/${riwayat.length} benar` : j.ket)),
        h('span', { class: `lencana level-${level}` }, NAMA_LEVEL[level]));
    })),
  );
}

// ------------------------------------------------------------------ sesi latihan
export function tampilSesi(root, [jenis]) {
  const info = JENIS.find((j) => j.id === jenis);
  if (!info) {
    root.append(h('p', {}, 'Jenis latihan tidak ditemukan.'), h('a', { class: 'btn btn-utama', href: '#/latihan' }, 'Kembali'));
    return;
  }
  let level = ambil().levelLatihan[jenis] || 1;
  let beruntun = 0, salahBeruntun = 0, dijawab = 0, benarSesi = 0;
  let soal, petunjuk, mulai, percobaan, tuntas;

  const kepala = h('div', { class: 'sesi-kepala' });
  const area = h('div');
  const bawah = h('div', { class: 'tumpuk-tombol' },
    h('button', { class: 'btn btn-ghost', onclick: selesai }, 'Selesai latihan'));
  root.append(kepala, area, bawah);

  function renderKepala() {
    const titik = Array.from({ length: NAIK_SETELAH }, (_, k) => h('span', { class: `titik ${k < beruntun ? 'isi' : ''}` }));
    kepala.replaceChildren(
      h('div', { class: 'baris-antara' },
        h('h1', { class: 'judul-sesi' }, `${info.ikon} ${info.judul}`),
        h('span', { class: `lencana level-${level}` }, `Level ${NAMA_LEVEL[level]}`)),
      h('div', { class: 'baris-antara kecil muted' },
        h('span', {}, `Sesi ini: ${benarSesi}/${dijawab} benar`),
        level < 3 ? h('span', { class: 'titik-wadah', title: 'Menuju level berikutnya' }, 'Naik level: ', titik) : h('span', {}, '⭐ Level tertinggi')));
  }

  function soalBaru() {
    hentikanNarasi();
    soal = buatSoal(jenis, level);
    petunjuk = 0;
    percobaan = 0;
    tuntas = false;
    mulai = Date.now();
    render();
  }

  function render() {
    renderKepala();
    const isi = h('div', { class: 'kartu-isi' });
    const elPetunjuk = h('ol', { class: 'petunjuk' });
    const umpan = h('div', { 'aria-live': 'polite' });
    const input = h('input', {
      type: 'text', inputmode: 'numeric', autocomplete: 'off', enterkeyhint: 'done',
      class: 'input-angka', 'aria-label': 'Jawabanmu', placeholder: 'Jawabanmu',
    });
    const tombolPeriksa = h('button', { class: 'btn btn-utama', type: 'submit' }, 'Periksa');
    const tombolPetunjuk = h('button', { class: 'btn btn-sekunder', type: 'button' }, `💡 Petunjuk (${petunjuk}/${soal.petunjuk.length})`);
    const panelContoh = h('div', { class: 'panel-contoh', hidden: true });
    const tombolContoh = h('button', { class: 'btn btn-sekunder', type: 'button' }, '📘 Lihat contoh');

    const form = h('form', { class: 'baris-input', onsubmit: (e) => { e.preventDefault(); periksa(); } },
      h('button', {
        class: 'btn btn-pm', type: 'button', 'aria-label': 'Ubah tanda positif/negatif',
        onclick: () => {
          const v = input.value.trim();
          input.value = v.startsWith('-') || v.startsWith('−') ? v.slice(1) : `-${v}`;
          input.focus();
        },
      }, '±'),
      input, tombolPeriksa);

    tombolPetunjuk.addEventListener('click', () => {
      if (petunjuk >= soal.petunjuk.length || tuntas) return;
      elPetunjuk.append(h('li', { class: 'muncul', html: soal.petunjuk[petunjuk] }));
      petunjuk++;
      efek('buka');
      tombolPetunjuk.textContent = `💡 Petunjuk (${petunjuk}/${soal.petunjuk.length})`;
      if (petunjuk >= soal.petunjuk.length) tombolPetunjuk.disabled = true;
    });

    tombolContoh.addEventListener('click', () => {
      if (!panelContoh.hidden) { panelContoh.hidden = true; tombolContoh.textContent = '📘 Lihat contoh'; return; }
      const c = buatSoal(jenis, 1);
      panelContoh.replaceChildren(
        h('div', { class: 'tebal' }, 'Contoh terselesaikan (angka berbeda)'),
        h('p', { html: c.teks }),
        h('ol', { class: 'langkah' }, c.pembahasan.map((p) => h('li', { html: p }))),
        h('p', { class: 'tebal' }, `Jawaban: ${fmt(c.jawaban)}`));
      panelContoh.hidden = false;
      tombolContoh.textContent = 'Tutup contoh';
      efek('buka');
    });

    function periksa() {
      if (tuntas) return;
      const nilai = bacaJawaban(input.value);
      if (nilai === null) { toast('Tulis jawabanmu berupa angka, ya.'); input.focus(); return; }
      const benar = nilai === soal.jawaban;
      percobaan++;
      if (benar) {
        efek('benar');
        akhiri(percobaan === 1);
        umpan.replaceChildren(kotakUmpan(true, percobaan === 1 ? 'Mantap!' : 'Bagus, kamu berhasil memperbaikinya!'), pembahasan());
      } else if (percobaan < 2) {
        efek('salah');
        umpan.replaceChildren(kotakUmpan(false, 'Coba periksa lagi langkahmu. Butuh bantuan? Buka <strong>💡 Petunjuk</strong>.'));
        input.select();
      } else {
        efek('salah');
        akhiri(false);
        umpan.replaceChildren(kotakUmpan(false, `Jawaban yang benar adalah <strong>${fmt(soal.jawaban)}</strong>. Pelajari langkahnya:`), pembahasan(true));
      }
    }

    function pembahasan(terbuka = false) {
      return h('details', { class: 'pembahasan', open: terbuka },
        h('summary', {}, 'Pembahasan'),
        h('ol', { class: 'langkah' }, soal.pembahasan.map((p) => h('li', { html: p }))));
    }

    function akhiri(benarPertama) {
      tuntas = true;
      input.disabled = true;
      tombolPeriksa.disabled = true;
      tombolPetunjuk.disabled = true;
      dijawab++;
      if (benarPertama) benarSesi++;
      catatLatihan({
        jenis, level, benar: benarPertama, petunjuk,
        durasiDetik: Math.round((Date.now() - mulai) / 1000),
      });
      // Adaptif: naik/turun level
      if (benarPertama && petunjuk === 0) {
        beruntun++; salahBeruntun = 0;
        if (beruntun >= NAIK_SETELAH && level < 3) {
          level++; beruntun = 0; aturLevel(jenis, level);
          toast(`🚀 Naik ke level ${NAMA_LEVEL[level]}!`);
          efek('selesai');
        }
      } else if (!benarPertama) {
        salahBeruntun++; beruntun = 0;
        if (salahBeruntun >= TURUN_SETELAH && level > 1) {
          level--; salahBeruntun = 0; aturLevel(jenis, level);
          toast(`Level kembali ke ${NAMA_LEVEL[level]}. Pelan-pelan saja, kamu pasti bisa! 💪`);
        }
      } else {
        beruntun = 0; salahBeruntun = 0;
      }
      renderKepala();
      const lanjut = h('button', { class: 'btn btn-utama lebar', onclick: soalBaru }, 'Soal berikutnya →');
      umpan.after(lanjut);
      lanjut.focus({ preventScroll: true });
    }

    isi.append(
      h('div', { class: 'wadah-vis', html: visualBarisan(soal.suku) }),
      h('p', { class: 'teks-soal', html: soal.teks }),
      level === 1 ? h('div', { class: 'kerangka', 'data-tanpa-narasi': true }, h('span', { class: 'kecil muted' }, 'Kerangka rumus: '), h('span', { html: soal.kerangka })) : null,
      elPetunjuk,
      form,
      umpan,
      h('div', { class: 'baris-tombol' }, tombolPetunjuk, tombolContoh),
      panelContoh);

    area.replaceChildren(h('article', { class: 'kartu' },
      h('header', { class: 'kartu-kepala' }, h('h2', {}, 'Soal'), tombolNarasi(() => isi.querySelector('.teks-soal'))),
      isi));
  }

  async function selesai() {
    hentikanNarasi();
    if (dijawab >= 3) await tanyaBeban(`latihan:${jenis}`, `Latihan ${info.judul}`);
    location.hash = '#/latihan';
  }

  soalBaru();
  return () => hentikanNarasi();
}
