// Halaman Akun (#/akun): daftar, masuk, keluar, profil, dan status sinkronisasi (hosting Tahap 6, docs/13).
// Tanpa animasi dekoratif (halaman formulir). Data diri yang diminta hanya: email, kata sandi,
// nama panggilan, kelas (opsional). Teks dari pengguna/server ditampilkan sebagai teks (bukan HTML).

import { h, toast, pilihan } from '../ui.js';
import { ambil, aturProfil } from '../state.js';
import { siapkanKonfig, akunTersedia, penggunaAktif, daftar, masuk, keluar, periksaIsian, saatAkunBerubah } from '../akun.js';
import { hubungkanAkun, sinkronkan, statusSinkron, saatStatus, adaDataTamu, gabungkanDataTamu } from '../sinkron.js';

let pesanAwal = null; // dari tautan email (app.js → tangkapTautanAuth)
export function aturPesanAwal(p) { pesanAwal = p; }

const jam = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export function teksStatus(s) {
  const tunggu = s.menunggu ? ` ${s.menunggu} catatan menunggu dikirim.` : '';
  switch (s.keadaan) {
    case 'menyinkron': return '⏳ Sedang menyinkronkan…';
    case 'tersinkron': return `✅ Tersinkron pukul ${jam(s.waktu)}.${tunggu}`;
    case 'offline': return `📴 ${s.pesan || 'Menunggu internet.'}${tunggu}`;
    case 'galat': return `⚠️ ${s.pesan}${tunggu}`;
    case 'belum-terhubung': return 'Menunggu pilihanmu tentang data di perangkat ini.';
    default: return s.waktu ? `Terakhir tersinkron pukul ${jam(s.waktu)}.${tunggu}` : `Belum disinkronkan.${tunggu}`;
  }
}

// Setelah masuk: tentukan nasib data yang sudah ada di perangkat (tidak ada yang dihapus), lalu sinkron.
let janjiHubung = null; // satu dialog saja walau dipanggil dari beberapa tempat
export function setelahMasuk() {
  if (!janjiHubung) janjiHubung = hubungkan().finally(() => { janjiHubung = null; });
  return janjiHubung;
}
async function hubungkan() {
  const hasil = await hubungkanAkun(() => pilihan(
    'Ada data belajar di perangkat ini',
    ['Gabungkan ke akunmu agar bisa dibuka di perangkat lain?',
      'Jika tidak, data ini disimpan terpisah di perangkat ini (tidak dihapus).'],
    'Ya, gabungkan', 'Tidak, pisahkan'));
  if (hasil === 'gabung') toast('Data perangkat ini digabung ke akunmu');
  else if (hasil === 'pisah') toast('Data lama disimpan terpisah di perangkat ini');
  else if (hasil === 'ganti') toast('Data akun sebelumnya disimpan terpisah di perangkat ini');
  sinkronkan();
  return hasil;
}

function isian(label, attrs) {
  const input = h('input', attrs);
  return [h('label', { class: 'isian' }, h('span', {}, label), input), input];
}

let sibuk = false; // formulir sedang memproses masuk/daftar (jangan gambar ulang dari pendengar akun)

function formulir(gambarUlang) {
  let mode = 'masuk';
  const wadah = h('section', { class: 'kartu' });
  const gambar = () => {
    const daftarMode = mode === 'daftar';
    const [lNama, nama] = isian('Nama panggilan', { type: 'text', maxlength: '40', autocomplete: 'nickname', placeholder: 'Contoh: Ani' });
    const [lKelas, kelas] = isian('Kelas (opsional)', { type: 'text', maxlength: '12', placeholder: 'Contoh: VIII-A' });
    const [lEmail, email] = isian('Email', { type: 'email', autocomplete: 'email', inputmode: 'email', required: true, maxlength: '254' });
    const [lSandi, sandi] = isian(daftarMode ? 'Kata sandi (minimal 8 karakter)' : 'Kata sandi',
      { type: 'password', autocomplete: daftarMode ? 'new-password' : 'current-password', required: true, maxlength: '72' });
    const lihat = h('input', { type: 'checkbox', role: 'switch' });
    lihat.addEventListener('change', () => { sandi.type = lihat.checked ? 'text' : 'password'; });
    const pesan = h('p', { class: 'kecil', role: 'alert', 'aria-live': 'polite' });
    const kirim = h('button', { class: 'btn btn-utama lebar', type: 'submit' }, daftarMode ? 'Daftar' : 'Masuk');

    const form = h('form', { novalidate: true },
      daftarMode ? [lNama, lKelas] : null, lEmail, lSandi,
      h('label', { class: 'baris-saklar' }, h('span', {}, '👁️ Tampilkan kata sandi'), lihat),
      daftarMode ? h('p', { class: 'kecil muted' }, 'Yang disimpan hanya email, nama panggilan, dan kelas. Jangan tulis nama lengkap, NISN, alamat, atau nomor HP.') : null,
      kirim, pesan);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isi = { email: email.value, sandi: sandi.value, nama: nama.value, kelas: kelas.value };
      const salah = periksaIsian(isi, daftarMode);
      if (salah) { pesan.textContent = salah; return; }
      kirim.disabled = true;
      sibuk = true;
      pesan.textContent = daftarMode ? 'Membuat akun…' : 'Masuk…';
      try {
        if (daftarMode) {
          const r = await daftar(isi);
          if (r.perluKonfirmasi) {
            pesan.textContent = 'Akun dibuat. Buka email dari Supabase, klik tautan konfirmasinya, lalu masuk di sini.';
            kirim.disabled = false;
            return;
          }
        } else {
          await masuk(isi);
        }
        await setelahMasuk();
        toast(daftarMode ? 'Akun dibuat. Selamat datang!' : 'Berhasil masuk');
        gambarUlang();
      } catch (err) {
        pesan.textContent = (err && err.message) || 'Terjadi kesalahan. Coba lagi.';
        kirim.disabled = false;
      } finally {
        sibuk = false;
      }
    });

    const segmen = h('div', { class: 'segmen', role: 'tablist', 'aria-label': 'Masuk atau daftar' },
      [['masuk', 'Masuk'], ['daftar', 'Daftar']].map(([nilai, label]) => h('button', {
        type: 'button', role: 'tab', 'aria-selected': mode === nilai ? 'true' : 'false', class: mode === nilai ? 'aktif' : '',
        onclick: () => { if (mode !== nilai) { mode = nilai; gambar(); } },
      }, label)));

    wadah.replaceChildren(
      h('div', { class: 'baris-segmen' }, segmen),
      h('h2', {}, daftarMode ? 'Buat akun baru' : 'Masuk ke akunmu'),
      form);
  };
  gambar();
  return wadah;
}

function halamanMasuk(root, gambarUlang) {
  root.append(
    h('section', { class: 'kartu' },
      h('h2', {}, 'Simpan progresmu di cloud'),
      h('p', {}, 'Dengan akun, progres belajarmu tersimpan aman dan bisa dibuka di HP atau laptop lain.'),
      h('p', { class: 'kecil muted' }, 'Tanpa akun pun DeretKu tetap bisa dipakai, juga saat offline. Datamu tersimpan di perangkat ini.')),
    formulir(gambarUlang));
}

function halamanAkun(root, u, gambarUlang) {
  const d = ambil();
  const nama = h('input', { type: 'text', value: d.profil.nama, maxlength: '40', autocomplete: 'nickname', placeholder: 'Nama panggilan' });
  nama.addEventListener('change', () => { aturProfil('nama', nama.value.trim()); toast('Nama disimpan'); });
  const kelas = h('input', { type: 'text', value: d.profil.kelas, maxlength: '12', placeholder: 'Contoh: VIII-A' });
  kelas.addEventListener('change', () => { aturProfil('kelas', kelas.value.trim()); toast('Kelas disimpan'); });

  const status = h('p', { class: 'status-sinkron', 'aria-live': 'polite' }, teksStatus(statusSinkron()));
  const tombolSinkron = h('button', { class: 'btn btn-sekunder lebar', type: 'button' }, '🔄 Sinkronkan sekarang');
  tombolSinkron.addEventListener('click', () => sinkronkan());

  const tamu = adaDataTamu() ? h('section', { class: 'kartu' },
    h('h2', {}, 'Data terpisah di perangkat ini'),
    h('p', { class: 'kecil' }, 'Ada data belajar lama yang dulu kamu pilih untuk disimpan terpisah. Data itu belum masuk ke akunmu.'),
    h('button', { class: 'btn btn-sekunder lebar', type: 'button', onclick: () => { if (gabungkanDataTamu()) { toast('Data lama digabung ke akunmu'); gambarUlang(); } } }, '📥 Gabungkan ke akunku')) : null;

  const surel = h('strong', {});
  surel.textContent = u.email || 'akunmu';

  root.append(...[
    h('section', { class: 'kartu' },
      h('h2', {}, 'Profil'),
      h('p', { class: 'kecil muted' }, 'Masuk sebagai ', surel),
      h('label', { class: 'isian' }, h('span', {}, 'Nama panggilan'), nama),
      h('label', { class: 'isian' }, h('span', {}, 'Kelas'), kelas),
      h('p', { class: 'kecil muted' }, 'Tersimpan di perangkat ini dan di akunmu.')),
    h('section', { class: 'kartu' },
      h('h2', {}, 'Sinkronisasi'),
      h('p', { class: 'kecil' }, 'Progres dan riwayat belajarmu dikirim otomatis saat online. Saat offline, semuanya tetap tersimpan di perangkat ini.'),
      status, tombolSinkron),
    tamu,
    h('section', { class: 'kartu' },
      h('button', { class: 'btn btn-sekunder lebar', type: 'button', onclick: async () => { await keluar(); toast('Kamu sudah keluar'); gambarUlang(); } }, '🚪 Keluar'),
      h('p', { class: 'kecil muted' }, 'Keluar tidak menghapus data belajar di perangkat ini.')),
  ].filter(Boolean)); // filter: append(null) menulis teks "null"

  return saatStatus((s) => {
    status.textContent = teksStatus(s);
    tombolSinkron.disabled = s.keadaan === 'menyinkron';
    if (s.keadaan === 'tersinkron') { // nama/kelas mungkin diperbarui dari akun
      if (document.activeElement !== nama) nama.value = ambil().profil.nama;
      if (document.activeElement !== kelas) kelas.value = ambil().profil.kelas;
    }
  });
}

export function tampil(root) {
  const isi = h('div', {});
  root.append(h('h1', {}, '☁️ Akun'), isi);
  let lepasStatus = null;
  let idTampil; // gambar ulang hanya bila akun berganti (bukan saat token diperpanjang)

  const gambar = () => {
    if (lepasStatus) { lepasStatus(); lepasStatus = null; }
    isi.replaceChildren();
    if (pesanAwal) {
      const p = h('div', { class: `umpan ${pesanAwal.galat ? 'umpan-salah' : 'umpan-benar'}`, role: 'status' });
      p.textContent = pesanAwal.galat || 'Email terkonfirmasi. Kamu sudah masuk.';
      isi.append(p);
    }
    const u = penggunaAktif();
    idTampil = u ? u.id : null;
    if (u) {
      lepasStatus = halamanAkun(isi, u, gambar);
      if (ambil().sinkron.pemilik !== u.id) setelahMasuk().then(gambar, (e) => toast(e.message)); // mis. masuk lewat tautan email
    } else if (akunTersedia()) {
      halamanMasuk(isi, gambar);
    } else {
      isi.append(h('section', { class: 'kartu' },
        h('h2', {}, 'Akun belum tersedia'),
        h('p', {}, 'Fitur akun belum aktif di server ini, atau perangkatmu sedang offline saat pertama membuka aplikasi.'),
        h('p', { class: 'kecil muted' }, 'Kamu tetap bisa belajar seperti biasa. Datamu tersimpan di perangkat ini.')));
    }
    pesanAwal = null;
  };

  gambar();
  if (!akunTersedia()) siapkanKonfig().then(() => { if (akunTersedia() && root.isConnected) gambar(); });
  const lepasAkun = saatAkunBerubah((u) => { if (root.isConnected && !sibuk && (u ? u.id : null) !== idTampil) gambar(); });
  return () => { lepasAkun(); if (lepasStatus) lepasStatus(); };
}
