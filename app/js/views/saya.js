import { h, toast, konfirmasi } from '../ui.js';
import { ambil, aturProfil, aturPengaturan, hapusSemua, bagikanEkspor } from '../state.js';
import { mulaiMusik, hentikanMusik, perbaruiVolume, narasiTersedia, efek } from '../audio.js';
import { UNIT } from '../data/materi.js';
import { LITERASI } from '../data/literasi.js';
import { bisaPasang, pasang, sudahTerpasang } from '../pasang.js';

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

    h('section', { class: 'kartu' },
      h('h2', {}, 'Profil'),
      h('label', { class: 'isian' }, h('span', {}, 'Nama'), nama),
      h('label', { class: 'isian' }, h('span', {}, 'Kelas'), kelas),
      h('p', { class: 'kecil muted' }, 'Opsional. Hanya tersimpan di HP ini, dan ikut terkirim saat kamu mengekspor data ke guru.')),

    h('section', { class: 'kartu' },
      h('h2', {}, 'Kemajuanku'),
      h('div', { class: 'grid-stat' },
        stat(`${UNIT.filter((u) => d.materiSelesai[u.id]).length}/${UNIT.length}`, 'Unit materi'),
        stat(`${latBenar}/${d.latihan.length}`, 'Latihan benar'),
        stat(`${LITERASI.filter((l) => d.literasiSelesai[l.id]).length}/${LITERASI.length}`, 'Literasi'),
        stat(terbaik, 'Skor kuis terbaik'),
        stat(rataBeban, 'Rata-rata usaha pikiran (1–9)'),
        stat(d.kuis.length, 'Kali kuis')),
      d.kuis.length ? h('div', {},
        h('h3', {}, 'Riwayat kuis'),
        h('ul', { class: 'riwayat' }, d.kuis.slice().reverse().slice(0, 10).map((k) => h('li', {},
          h('span', {}, new Date(k.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })),
          h('strong', {}, `${k.skor}`))))) : null),

    h('section', { class: 'kartu' },
      h('h2', {}, 'Pengaturan'),
      saklar('🎵 Musik latar', 'musik', (on) => (on ? mulaiMusik() : hentikanMusik())),
      h('label', { class: 'baris-saklar' }, h('span', {}, '🔉 Volume musik'), volume),
      saklar('🔔 Efek suara', 'efek', (on) => on && efek('benar')),
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
          if (await konfirmasi('Hapus semua data?', 'Progres, riwayat latihan, dan kuis akan dihapus dari HP ini. Tindakan ini tidak bisa dibatalkan.', 'Hapus')) {
            hapusSemua();
            document.documentElement.dataset.teks = 'normal';
            toast('Data dihapus');
            root.replaceChildren(); tampil(root);
          }
        },
      }, '🗑️ Hapus semua data')),

    h('section', { class: 'kartu' },
      h('h2', {}, 'Tentang'),
      h('p', {}, h('strong', {}, 'DeretKu'), ' v1.0. Media belajar barisan & deret aritmatika untuk SMP, dirancang berdasarkan Teori Beban Kognitif dan kerangka literasi matematika PISA.'),
      !sudahTerpasang() && bisaPasang() ? h('button', { class: 'btn btn-sekunder lebar', onclick: pasang }, '📲 Pasang Aplikasi') : null,
      h('p', { class: 'kecil muted' }, sudahTerpasang() ? '✓ Aplikasi sudah terpasang.' : 'Android: menu ⋮ → "Instal aplikasi". iPhone: Bagikan → "Tambah ke Layar Utama".')),
  );
}
