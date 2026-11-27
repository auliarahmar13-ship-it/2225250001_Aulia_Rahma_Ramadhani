import { h, toast, konfirmasi } from '../ui.js';
import { ambil, aturProfil, aturPengaturan, hapusSemua, bagikanEkspor } from '../state.js';
import { mulaiMusik, hentikanMusik, perbaruiVolume, narasiTersedia, efek } from '../audio.js';
import { UNIT } from '../data/materi.js';
import { LITERASI } from '../data/literasi.js';
import { bisaPasang, pasang, sudahTerpasang } from '../pasang.js';
import { TINGKAT, fungsiTingkat, cariFungsi, KETERANGAN_TERJEMAHAN } from '../data/rmt.js';
import { catatJurnal } from '../state.js';
import { akunTersedia, penggunaAktif, siapkanKonfig } from '../akun.js';
import { statusSinkron, saatStatus } from '../sinkron.js';
import { teksStatus } from './akun.js';

// Kartu Akun (hosting Tahap 6): hanya tampil bila server menyediakan Supabase (bukan di hosting statis)
function kartuAkun() {
  const wadah = h('div', {});
  const isi = () => {
    const u = penggunaAktif();
    if (!u && !akunTersedia()) { wadah.replaceChildren(); return; }
    const surel = h('strong', {});
    surel.textContent = u ? (u.email || 'akunmu') : '';
    wadah.replaceChildren(h('section', { class: 'kartu' },
      h('h2', {}, '☁️ Akun'),
      u ? h('p', { class: 'kecil' }, 'Masuk sebagai ', surel, '. ', teksStatus(statusSinkron()))
        : h('p', { class: 'kecil' }, 'Simpan progresmu di cloud agar bisa dibuka di HP atau laptop lain. Tidak wajib.'),
      h('a', { class: 'btn btn-sekunder lebar', href: '#/akun' }, u ? 'Kelola akun & sinkronisasi' : 'Masuk / Daftar')));
  };
  isi();
  if (!akunTersedia()) siapkanKonfig().then(isi);
  const lepas = saatStatus(() => { if (wadah.isConnected) isi(); else lepas(); }); // status ikut diperbarui
  return wadah;
}

// Jurnal RMT (Tahap 7; hlm. 152, 167): rekap fungsi berpikir + refleksi mandiri. Teks siswa = textContent.
const LABEL_KONTEKS = { pemanasan: '🧠 Pemanasan', games: '🎮 Games', mandiri: '✍️ Refleksimu' };
function jurnalRMT(d) {
  const sekarang = h('section', { class: 'kartu jurnal-rmt' });
  const gambar = () => {
    const hitung = {};
    d.jurnal.forEach((j) => (j.fungsiKognitif || []).forEach((k) => { hitung[k] = (hitung[k] || 0) + 1; }));
    const urut = Object.entries(hitung).sort((x, y) => y[1] - x[1]);
    const definisi = d.latihan.filter((l) => l.definisiMasalah === true).length;
    const bukti = d.latihan.filter((l) => l.bukti === true).length;

    const pilihFungsi = h('select', { class: 'pilih-fungsi', 'aria-label': 'Fungsi berpikir yang kamu pakai' },
      h('option', { value: '' }, 'Pilih fungsi berpikir…'),
      TINGKAT.map((t) => h('optgroup', { label: t.nama }, fungsiTingkat(t.id).map((f) => h('option', { value: f.kode }, `${f.ikon} ${f.namaSiswa}`)))));
    const tulisan = h('textarea', { class: 'input-tafsir', rows: '2', maxlength: '300', placeholder: 'Contoh: Aku membandingkan selisih tiap suku untuk menemukan beda.', 'aria-label': 'Refleksimu' });
    const pesan = h('div', { 'aria-live': 'polite', class: 'kecil' });
    const simpanBtn = h('button', { class: 'btn btn-sekunder lebar', type: 'button' }, 'Simpan ke jurnal');
    simpanBtn.addEventListener('click', () => {
      const isi = tulisan.value.trim();
      if (!pilihFungsi.value || isi.length < 10) { pesan.textContent = 'Pilih fungsi berpikir dan tulis satu kalimat, ya.'; return; }
      catatJurnal({ konteks: 'mandiri', fungsiKognitif: [pilihFungsi.value], refleksi: isi });
      toast('Refleksi tersimpan di jurnal');
      gambar();
    });

    const terbaru = d.jurnal.slice().reverse().slice(0, 5).map((j) => {
      const teks = h('div', {});
      teks.textContent = j.refleksi;
      const nama = (j.fungsiKognitif || []).map(cariFungsi).filter(Boolean).map((f) => `${f.ikon} ${f.namaSiswa}`).join(', ');
      return h('li', {},
        h('div', { class: 'kecil muted' }, `${new Date(j.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · ${LABEL_KONTEKS[String(j.konteks).split(':')[0]] || j.konteks}`),
        teks, nama ? h('div', { class: 'kecil' }, `🧠 ${nama}`) : null);
    });

    sekarang.replaceChildren(...[ // filter: replaceChildren(null) menulis teks "null"
      h('h2', {}, '📓 Jurnal RMT'),
      h('p', { class: 'kecil muted' }, 'Catatan cara berpikirmu dari Pemanasan, Games, dan refleksimu sendiri.'),
      h('div', { class: 'tebal kecil' }, 'Fungsi berpikir yang sudah kamu pakai:'),
      urut.length
        ? h('div', { class: 'baris-label' }, urut.slice(0, 8).map(([k, n]) => { const f = cariFungsi(k); return f ? h('span', { class: 'label-fungsi', title: `${f.kode} · ${f.nama}` }, `${f.ikon} ${f.namaSiswa} ×${n}`) : null; }))
        : h('p', { class: 'kecil muted' }, 'Belum ada catatan. Coba Pemanasan Berpikir atau Games, ya!'),
      h('p', { class: 'kecil' }, `❓ Memahami apa yang ditanyakan: ${definisi}× tepat · 🧾 Memberi bukti: ${bukti}× tepat (di Latihan)`),
      terbaru.length ? h('details', { class: 'pembahasan' }, h('summary', {}, `Catatan terbaru (${terbaru.length})`), h('ul', { class: 'langkah' }, terbaru)) : null,
      h('details', { class: 'pembahasan' }, h('summary', {}, '✍️ Tulis refleksi'),
        h('p', { class: 'kecil muted' }, 'Fungsi berpikir apa yang kamu pakai hari ini, dan bagaimana?'), pilihFungsi, tulisan, simpanBtn, pesan),
    ].filter(Boolean));
  };
  gambar();
  return sekarang;
}

// Kamus Fungsi Berpikir (RMT, Tabel 4.1). Tertutup secara bawaan agar tidak menambah beban.
function kamusFungsi() {
  return h('section', { class: 'kartu kamus-fungsi' },
    h('h2', {}, '📖 Kamus Fungsi Berpikir'),
    h('p', { class: 'kecil muted' }, 'Saat belajar matematika, pikiranmu melakukan "tindakan berpikir". Kenali namanya agar kamu sadar cara berpikirmu sendiri.'),
    TINGKAT.map((t) => h('details', { class: 'pembahasan' },
      h('summary', {}, t.nama),
      h('p', { class: 'kecil muted' }, `${t.ket} (${t.istilahAsli})`),
      h('ul', { class: 'langkah' }, fungsiTingkat(t.id).map((f) => h('li', {},
        h('div', { class: 'tebal' }, `${f.ikon} ${f.namaSiswa}`),
        h('div', { class: 'kecil muted' }, `${f.kode} · ${f.nama} · `, h('i', { lang: 'en' }, f.istilahAsli)),
        h('div', {}, f.definisi),
        h('div', { class: 'kecil' }, `Contoh: ${f.contoh}`),
        f.catatan ? h('div', { class: 'kecil muted' }, `Catatan istilah: ${f.catatan}`) : null))))),
    h('p', { class: 'kecil muted' }, KETERANGAN_TERJEMAHAN));
}

export function tampil(root) {
  const d = ambil();
  const p = d.pengaturan;

  // ---- ringkasan
  const latBenar = d.latihan.filter((l) => l.benar).length;
  const terbaik = d.kuis.length ? Math.max(...d.kuis.map((k) => k.skor)) : '–';
  const beban = d.bebanKognitif.map((b) => b.nilai);
  const rataBeban = beban.length ? (beban.reduce((a, b) => a + b, 0) / beban.length).toFixed(1).replace('.', ',') : '–';

  const stat = (nilai, label) => h('div', { class: 'stat' }, h('div', { class: 'stat-nilai' }, String(nilai)), h('div', { class: 'stat-label' }, label));

  // ---- pengaturan
  const saklar = (label, kunci, onUbah) => {
    const input = h('input', { type: 'checkbox', role: 'switch', checked: !!p[kunci] });
    input.addEventListener('change', () => { aturPengaturan(kunci, input.checked); onUbah && onUbah(input.checked); });
    return h('label', { class: 'baris-saklar' }, h('span', {}, label), input);
  };

  const volume = h('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(p.volumeMusik), 'aria-label': 'Volume musik' });
  volume.addEventListener('input', () => { aturPengaturan('volumeMusik', Number(volume.value)); perbaruiVolume(); });

  const ukuran = h('div', { class: 'segmen', role: 'radiogroup', 'aria-label': 'Ukuran teks' },
    [['normal', 'A'], ['besar', 'A+'], ['sangat-besar', 'A++']].map(([nilai, label]) => h('button', {
      type: 'button', role: 'radio', 'aria-checked': p.ukuranTeks === nilai ? 'true' : 'false',
      class: p.ukuranTeks === nilai ? 'aktif' : '',
      onclick: () => {
        aturPengaturan('ukuranTeks', nilai);
        document.documentElement.dataset.teks = nilai;
        root.replaceChildren(); tampil(root);
      },
    }, label)));

  const nama = h('input', { type: 'text', value: d.profil.nama, maxlength: '40', autocomplete: 'name', placeholder: 'Nama panggilan' });
  nama.addEventListener('change', () => { aturProfil('nama', nama.value.trim()); toast('Nama disimpan'); });
  const kelas = h('input', { type: 'text', value: d.profil.kelas, maxlength: '12', placeholder: 'Contoh: VIII-A' });
  kelas.addEventListener('change', () => { aturProfil('kelas', kelas.value.trim()); toast('Kelas disimpan'); });

  root.append(
    h('h1', {}, '👤 Saya'),
    kartuAkun(),

    h('section', { class: 'kartu' },
      h('h2', {}, 'Profil'),
      h('label', { class: 'isian' }, h('span', {}, 'Nama'), nama),
      h('label', { class: 'isian' }, h('span', {}, 'Kelas'), kelas),
      h('p', { class: 'kecil muted' }, penggunaAktif()
        ? 'Tersimpan di perangkat ini dan di akunmu, dan ikut terkirim saat kamu mengekspor data ke guru.'
        : 'Opsional. Hanya tersimpan di HP ini, dan ikut terkirim saat kamu mengekspor data ke guru.')),

    h('section', { class: 'kartu' },
      h('h2', {}, 'Kemajuanku'),
      h('div', { class: 'grid-stat' },
        stat(`${UNIT.filter((u) => d.materiSelesai[u.id]).length}/${UNIT.length}`, 'Unit materi'),
        stat(`${latBenar}/${d.latihan.length}`, 'Latihan benar'),
        stat(`${LITERASI.filter((l) => d.literasiSelesai[l.id]).length}/${LITERASI.length}`, 'Literasi'),
        stat(terbaik, 'Skor kuis terbaik'),
        stat(rataBeban, 'Rata-rata usaha pikiran (1–9)'),
        stat(d.kuis.length, 'Kali kuis'),
        stat(Object.values(d.permainan || {}).reduce((n, g) => n + g.main, 0), 'Kali main games')),
      d.kuis.length ? h('div', {},
        h('h3', {}, 'Riwayat kuis'),
        h('ul', { class: 'riwayat' }, d.kuis.slice().reverse().slice(0, 10).map((k) => h('li', {},
          h('span', {}, new Date(k.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })),
          h('strong', {}, `${k.skor}`))))) : null),

    jurnalRMT(d),
    kamusFungsi(),

    h('section', { class: 'kartu' },
      h('h2', {}, 'Pengaturan'),
      saklar('🎵 Musik latar', 'musik', (on) => (on ? mulaiMusik() : hentikanMusik())),
      h('label', { class: 'baris-saklar' }, h('span', {}, '🔉 Volume musik'), volume),
      saklar('🔔 Efek suara', 'efek', (on) => on && efek('benar')),
      saklar('🤸 Animasi maskot', 'animasi', (on) => { document.documentElement.dataset.animasi = on ? 'nyala' : 'mati'; }),
      narasiTersedia ? saklar('🔊 Tombol narasi', 'narasi', () => {}) : h('p', { class: 'kecil muted' }, 'Narasi suara tidak didukung di browser ini.'),
      h('div', { class: 'baris-saklar' }, h('span', {}, '🔤 Ukuran teks'), ukuran)),

    h('section', { class: 'kartu' },
      h('h2', {}, 'Data untuk Guru'),
      h('p', { class: 'kecil' }, 'Kirim data belajarmu ke guru (misalnya lewat WhatsApp). Guru akan menganalisisnya dengan program Python.'),
      h('button', {
        class: 'btn btn-utama lebar',
        onclick: async () => {
          const hasil = await bagikanEkspor();
          if (hasil === 'diunduh') toast('Berkas data tersimpan di folder Unduhan');
          else if (hasil === 'dibagikan') toast('Data berhasil dibagikan');
        },
      }, '📤 Ekspor Data'),
      h('button', {
        class: 'btn btn-bahaya-ghost lebar',
        onclick: async () => {
          const pesanHapus = penggunaAktif()
            ? 'Progres, riwayat latihan, dan kuis akan dihapus dari HP ini. Data yang sudah tersinkron di akunmu tetap ada dan diunduh lagi saat sinkronisasi.'
            : 'Progres, riwayat latihan, dan kuis akan dihapus dari HP ini. Tindakan ini tidak bisa dibatalkan.';
          if (await konfirmasi('Hapus semua data?', pesanHapus, 'Hapus')) {
            hapusSemua();
            document.documentElement.dataset.teks = 'normal';
            toast('Data dihapus');
            root.replaceChildren(); tampil(root);
          }
        },
      }, '🗑️ Hapus semua data')),

    h('section', { class: 'kartu' },
      h('h2', {}, 'Tentang'),
      h('p', {}, h('strong', {}, 'DeretKu'), ' v2.0. Media belajar barisan & deret aritmatika untuk SMP, dirancang dengan model Rigorous Mathematical Thinking (RMT), Teori Beban Kognitif, dan kerangka literasi matematika PISA.'),
      !sudahTerpasang() && bisaPasang() ? h('button', { class: 'btn btn-sekunder lebar', onclick: pasang }, '📲 Pasang Aplikasi') : null,
      h('p', { class: 'kecil muted' }, sudahTerpasang() ? '✓ Aplikasi sudah terpasang.' : 'Android: menu ⋮ → "Instal aplikasi". iPhone: Bagikan → "Tambah ke Layar Utama".')),
  );
}
