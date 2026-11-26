import { h, visualBarisan, tombolNarasi, kotakUmpan, tanyaBeban, toast, fmt, acakUrutan } from '../ui.js';
import { ambil, aturLevel, catatLatihan } from '../state.js';
import { efek, hentikanNarasi } from '../audio.js';
import { JENIS, NAMA_LEVEL, OPSI_DITANYA, buatSoal, bacaJawaban } from '../generator.js';
import { bannerDunia } from '../dunia.js';
import { temanBelajar } from '../teman.js';
import { panelTanyaAI } from '../ai.js';
import { FUNGSI_LANGKAH, FUNGSI_LATIHAN, cariFungsi } from '../data/rmt.js';

// RMT (docs/08 Tahap 2): setiap soal = Langkah 1 "Apa yang ditanyakan?" (C3) → Langkah 2 hitung →
// Langkah 3 "Buktikan" (C2, hanya bila jawaban angka benar). Umpan balik menyebut fungsi berpikir.
function labelFungsi(kode) {
  const f = cariFungsi(kode);
  return f ? h('div', { class: 'label-fungsi', title: `${f.kode} · ${f.nama} (${f.istilahAsli})` },
    `🧠 Fungsi berpikir: ${f.ikon} ${f.namaSiswa}`) : null;
}

const NAIK_SETELAH = 3; // benar berturut-turut tanpa petunjuk
const TURUN_SETELAH = 2; // salah berturut-turut

// ------------------------------------------------------------------ daftar jenis
export function tampilDaftar(root) {
  const d = ambil();
  root.append(
    bannerDunia('latihan', 'Latihan Adaptif', 'Soal acak tanpa batas waktu. Level naik otomatis!', 'Semangat! Kita latihan bareng ✏️'),
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
  let ai = null; // panel Teman AI untuk soal yang sedang tampil
  let simpanTertunda = null; // menyimpan catatan soal yang menunggu langkah "Buktikan"

  const kepala = h('div', { class: 'sesi-kepala' });
  const area = h('div');
  const bawah = h('div', { class: 'tumpuk-tombol' },
    h('button', { class: 'btn btn-ghost', onclick: selesai }, 'Selesai latihan'));
  const teman = temanBelajar('latihan', 'Semangat! Coba perhatikan pola bilangan pada soal ini, ya!', { tenang: true, kelas: 'teman-bawah' });
  const SAPA_MULAI = ['Semangat! Coba perhatikan pola bilangan pada soal ini, ya!', 'Soal baru! Cari dulu a dan b-nya 🔍', 'Pelan-pelan saja, tidak ada batas waktu 🌱', 'Butuh bantuan? Ada tombol 💡 Petunjuk, lho!'];
  const SAPA_BENAR = ['Mantap! Jawabanmu benar! 🎉', 'Keren! Kamu makin jago! ⭐', 'Yes! Tepat sekali! 🙌'];
  root.append(kepala, area, teman, bawah);

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
    if (dijawab > 0) teman.bicara(SAPA_MULAI[dijawab % SAPA_MULAI.length]);
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
    // Langkah RMT: hasilnya ikut dicatat (definisiMasalah, bukti) → ekspor versiData 2
    let hasilDitanya = null; // true/false: pilihan pertama "Apa yang ditanyakan?" tepat
    let hasilBukti = null;   // true/false/null (null = tidak diminta, mis. jawaban salah 2×)
    let catatan = null;      // isi catatLatihan yang menunggu langkah Buktikan
    let langkah = 'ditanya'; // 'ditanya' | 'hitung' | 'bukti' | 'selesai' (untuk konteks Teman AI)
    let contohDibuka = false; // lapisan bantuan (asesmen dinamis "cake", hlm. 60)
    const simpan = () => {
      if (!catatan) return;
      catatLatihan({ ...catatan, definisiMasalah: hasilDitanya, bukti: hasilBukti });
      catatan = null;
    };
    simpanTertunda = simpan;

    // Teman AI (mediator RMT): konteks = teks soal + status jawaban siswa. Kunci jawaban TIDAK dikirim.
    let terakhir = null; // { nilai, benar } jawaban terakhir yang sudah diperiksa aplikasi
    if (ai) ai.hentikan();
    ai = panelTanyaAI(() => {
      const status = !terakhir ? 'Siswa belum memeriksa jawaban.'
        : terakhir.benar ? `Jawaban siswa ${fmt(terakhir.nilai)} sudah diperiksa aplikasi: BENAR.`
          : `Jawaban siswa ${fmt(terakhir.nilai)} sudah diperiksa aplikasi: belum tepat${tuntas ? '; pembahasan sudah ditampilkan' : ''}.`;
      const NAMA_LANGKAH = {
        ditanya: 'menentukan apa yang ditanyakan soal', hitung: 'menghitung jawaban',
        bukti: 'memilih alasan (bukti) mengapa jawabannya benar', selesai: 'soal sudah selesai',
      };
      return `Latihan "${info.judul}", level ${NAMA_LEVEL[level]}. Soal: ${h('div', { html: soal.teks }).textContent} ${status} Langkah siswa sekarang: ${NAMA_LANGKAH[langkah]}. Petunjuk yang sudah dibuka: ${petunjuk} dari ${soal.petunjuk.length}.`;
    });

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
      if (!tuntas) contohDibuka = true;
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
      terakhir = { nilai, benar };
      percobaan++;
      if (benar) {
        efek('benar');
        teman.bicara(percobaan === 1 ? SAPA_BENAR[dijawab % SAPA_BENAR.length] : 'Bagus! Kamu berhasil memperbaikinya! 💪', 'senang');
        umpan.replaceChildren(kotakUmpan(true, percobaan === 1 ? 'Mantap!' : 'Bagus, kamu berhasil memperbaikinya!'),
          labelFungsi(FUNGSI_LATIHAN[jenis]), pembahasan());
        akhiri(percobaan === 1, true);
      } else if (percobaan < 2) {
        efek('salah');
        teman.bicara('Tidak apa-apa, salah itu bagian dari belajar! Coba buka 💡 Petunjuk, ya 😊', 'semangat');
        umpan.replaceChildren(kotakUmpan(false, 'Coba periksa lagi langkahmu. Butuh bantuan? Buka <strong>💡 Petunjuk</strong>.'));
        input.select();
      } else {
        efek('salah');
        teman.bicara('Ayo kita pelajari pembahasannya bersama. Soal berikutnya pasti bisa! 🌟', 'semangat');
        umpan.replaceChildren(kotakUmpan(false, `Jawaban yang benar adalah <strong>${fmt(soal.jawaban)}</strong>. Pelajari langkahnya:`), pembahasan(true));
        akhiri(false, false);
      }
    }

    function pembahasan(terbuka = false) {
      return h('details', { class: 'pembahasan', open: terbuka },
        h('summary', {}, 'Pembahasan'),
        h('ol', { class: 'langkah' }, soal.pembahasan.map((p) => h('li', { html: p }))));
    }

    // perluBukti: jawaban angka benar → lanjut ke Langkah 3 "Buktikan" sebelum soal berikutnya
    function akhiri(benarPertama, perluBukti) {
      tuntas = true;
      input.disabled = true;
      tombolPeriksa.disabled = true;
      tombolPetunjuk.disabled = true;
      dijawab++;
      if (benarPertama) benarSesi++;
      // Lapisan bantuan dihitung SAAT jawaban diperiksa (bantuan sesudahnya bukan bantuan menjawab)
      const aiPesan = ai ? ai.jumlahPesan() : 0;
      catatan = {
        jenis, level, benar: benarPertama, petunjuk,
        durasiDetik: Math.round((Date.now() - mulai) / 1000),
        contoh: contohDibuka, aiPesan, lapisanBantuan: petunjuk + (contohDibuka ? 1 : 0) + aiPesan,
      };
      // Adaptif: naik/turun level
      if (benarPertama && petunjuk === 0) {
        beruntun++; salahBeruntun = 0;
        if (beruntun >= NAIK_SETELAH && level < 3) {
          level++; beruntun = 0; aturLevel(jenis, level);
          toast(`🚀 Naik ke level ${NAMA_LEVEL[level]}!`);
          teman.bicara(`Wah, kamu naik ke level ${NAMA_LEVEL[level]}! Hebat! 🚀`, 'senang');
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
      if (perluBukti) { tampilBukti(); return; }
      langkah = 'selesai';
      simpan();
      tampilLanjut();
    }

    function tampilLanjut() {
      const lanjut = h('button', { class: 'btn btn-utama lebar', onclick: soalBaru }, 'Soal berikutnya →');
      wadahLanjut.replaceChildren(lanjut);
      lanjut.focus({ preventScroll: true });
    }

    // ---- Langkah 1: Apa yang ditanyakan? (C3 mendefinisikan masalah; hlm. 87, 92, 137)
    const umpanDitanya = h('div', { 'aria-live': 'polite' });
    const opsiDitanya = acakUrutan(OPSI_DITANYA).map((o) => h('button', {
      class: 'opsi', type: 'button', 'data-ditanya': o.id,
      onclick: (e) => pilihDitanya(o.id, e.currentTarget),
    }, h('span', { html: o.html }))); // satu span: .opsi = flex, agar teks tidak terpecah
    const langkahDitanya = h('section', { class: 'langkah-rmt', 'data-tanpa-narasi': true },
      h('div', { class: 'langkah-judul' }, h('span', { class: 'tahap-no' }, '1'), ' ❓ Apa yang ditanyakan?'),
      h('p', { class: 'kecil muted' }, 'Sebelum menghitung, pastikan dulu apa yang dicari soal ini.'),
      h('div', { class: 'daftar-opsi' }, opsiDitanya),
      umpanDitanya);
    const langkahHitung = h('section', { class: 'langkah-rmt', hidden: true },
      h('div', { class: 'langkah-judul' }, h('span', { class: 'tahap-no' }, '2'), ' 🧮 Hitung jawabanmu'),
      form);

    function pilihDitanya(id, tombol) {
      if (hasilDitanya !== null) return;
      hasilDitanya = id === soal.ditanya;
      opsiDitanya.forEach((b) => {
        b.disabled = true;
        if (b.dataset.ditanya === soal.ditanya) b.classList.add('benar');
      });
      if (!hasilDitanya) tombol.classList.add('salah');
      efek(hasilDitanya ? 'benar' : 'salah');
      umpanDitanya.replaceChildren(
        kotakUmpan(hasilDitanya, hasilDitanya ? soal.alasanDitanya : `Perhatikan kata kunci di soal. ${soal.alasanDitanya}`),
        labelFungsi(FUNGSI_LANGKAH.ditanya));
      langkah = 'hitung';
      langkahHitung.hidden = false;
      input.focus({ preventScroll: true });
    }

    // ---- Langkah 3: Buktikan (C2 bukti logis matematis; hlm. 87, 166). Satu kali pilih.
    const langkahBukti = h('section', { class: 'langkah-rmt', hidden: true, 'data-tanpa-narasi': true });
    const wadahLanjut = h('div');

    function tampilBukti() {
      langkah = 'bukti';
      const umpanBukti = h('div', { 'aria-live': 'polite' });
      const pilihan = acakUrutan([{ teks: soal.bukti.benar, benar: true }, ...soal.bukti.pengecoh]);
      const tombol = pilihan.map((p) => h('button', {
        class: 'opsi', type: 'button',
        onclick: (e) => {
          if (hasilBukti !== null) return;
          hasilBukti = !!p.benar;
          tombol.forEach((b, i) => { b.disabled = true; if (pilihan[i].benar) b.classList.add('benar'); });
          if (!hasilBukti) e.currentTarget.classList.add('salah');
          efek(hasilBukti ? 'benar' : 'salah');
          umpanBukti.replaceChildren(
            kotakUmpan(hasilBukti, hasilBukti
              ? 'Buktimu tepat! Kamu menunjukkan aturan dan perhitungannya, bukan sekadar menebak.'
              : `Jawaban angkamu sudah benar, tetapi alasan ini belum tepat. ${p.kenapa} Alasan yang tepat ditandai ✓.`),
            labelFungsi(FUNGSI_LANGKAH.bukti));
          langkah = 'selesai';
          simpan();
          tampilLanjut();
        },
      }, h('span', { html: p.teks })));
      langkahBukti.replaceChildren(
        h('div', { class: 'langkah-judul' }, h('span', { class: 'tahap-no' }, '3'), ' 🧾 Buktikan: mengapa jawabanmu benar?'),
        h('p', { class: 'kecil muted' }, 'Pilih alasan matematis yang paling tepat.'),
        h('div', { class: 'daftar-opsi' }, tombol),
        umpanBukti);
      langkahBukti.hidden = false;
      tombol[0].focus({ preventScroll: true });
    }

    isi.append(...[ // filter: Element.append(null) menulis teks "null" (kerangka hanya ada di level 1)
      h('div', { class: 'wadah-vis', html: visualBarisan(soal.suku) }),
      h('p', { class: 'teks-soal', html: soal.teks }),
      level === 1 ? h('div', { class: 'kerangka', 'data-tanpa-narasi': true }, h('span', { class: 'kecil muted' }, 'Kerangka rumus: '), h('span', { html: soal.kerangka })) : null,
      elPetunjuk,
      langkahDitanya,
      langkahHitung,
      umpan,
      langkahBukti,
      wadahLanjut,
      h('div', { class: 'baris-tombol' }, tombolPetunjuk, tombolContoh, ai.tombol),
      panelContoh,
      ai.panel].filter(Boolean));

    area.replaceChildren(h('article', { class: 'kartu' },
      h('header', { class: 'kartu-kepala' }, h('h2', {}, 'Soal'), tombolNarasi(() => isi.querySelector('.teks-soal'))),
      isi));
  }

  async function selesai() {
    hentikanNarasi();
    if (simpanTertunda) simpanTertunda(); // soal yang belum sempat dibuktikan tetap tercatat (bukti: null)
    if (dijawab >= 3) await tanyaBeban(`latihan:${jenis}`, `Latihan ${info.judul}`);
    location.hash = '#/latihan';
  }

  soalBaru();
  return () => { hentikanNarasi(); if (simpanTertunda) simpanTertunda(); if (ai) ai.hentikan(); };
}
