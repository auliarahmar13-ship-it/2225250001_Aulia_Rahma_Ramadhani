// Sinkronisasi local-first (docs/13 §7): data di perangkat tetap utama; Supabase = cadangan + antarperangkat.
// - Catatan riwayat (aktivitas) hanya BERTAMBAH: dikirim sekali per `idCatatan`, kiriman ulang dilewati server.
// - Progres digabung, tidak ditimpa: selesai = gabungan, level/rekor = tertinggi, pengaturan = terbaru.
// - Tidak ada data belajar yang dihapus. Data akun lain di perangkat yang sama disimpan terpisah.
// - Gagal/offline/Supabase dijeda → aplikasi tetap jalan; dicoba lagi saat online.

import { ambil, simpan, saatBerubah, DAFTAR_AKTIVITAS, pisahkanData, ambilCadangan, lepasCadangan } from './state.js';
import { penggunaAktif, rest, akunTersedia, siapkanKonfig, saatAkunBerubah, GalatAkun } from './akun.js';

const JENIS_KE_DAFTAR = Object.fromEntries(Object.entries(DAFTAR_AKTIVITAS).map(([k, v]) => [v, k]));
const KOLOM = [ // state.js ↔ kolom tabel progres
  ['materiSelesai', 'materi_selesai'], ['posisiKartu', 'posisi_kartu'], ['levelLatihan', 'level_latihan'],
  ['literasiSelesai', 'literasi_selesai'], ['pemanasanSelesai', 'pemanasan_selesai'], ['permainan', 'permainan'],
];
const SELESAI = ['materiSelesai', 'literasiSelesai', 'pemanasanSelesai'];
const MAKS_DATA = 12000; // byte JSON; batas server 16 KB untuk teks jsonb (yang sedikit lebih panjang)
const PER_KIRIM = 100;
const PER_TARIK = 1000;

const objek = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const angka = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);

// ------------------------------------------------------------------ penggabungan (fungsi murni, diuji)
export function gabungProgres(a, b) {
  const hasil = {};
  for (const k of SELESAI) {
    hasil[k] = {};
    for (const [id, v] of [...Object.entries(objek(a[k])), ...Object.entries(objek(b[k]))]) if (v) hasil[k][id] = true;
  }
  for (const k of ['levelLatihan', 'posisiKartu']) {
    hasil[k] = { ...objek(a[k]) };
    for (const [id, v] of Object.entries(objek(b[k]))) hasil[k][id] = Math.max(angka(hasil[k][id]), angka(v));
  }
  hasil.permainan = {};
  const pa = objek(a.permainan), pb = objek(b.permainan);
  for (const id of new Set([...Object.keys(pa), ...Object.keys(pb)])) {
    const x = objek(pa[id]), y = objek(pb[id]);
    const terakhir = [x.terakhir, y.terakhir].filter((t) => typeof t === 'string').sort().pop();
    hasil.permainan[id] = { rekor: Math.max(angka(x.rekor), angka(y.rekor)), main: Math.max(angka(x.main), angka(y.main)), ...(terakhir ? { terakhir } : {}) };
  }
  return hasil;
}

// Pengaturan: yang terakhir diubah menang (waktu ISO dapat dibandingkan sebagai teks)
export function gabungPengaturan(lokal, waktuLokal, jauh) {
  const j = objek(jauh);
  const waktuJauh = typeof j._diubah === 'string' ? j._diubah : null;
  if (waktuJauh && (!waktuLokal || waktuJauh > waktuLokal)) {
    const { _diubah, ...nilai } = j;
    return { pengaturan: { ...lokal, ...nilai }, waktu: waktuJauh, dariAkun: true };
  }
  return { pengaturan: lokal, waktu: waktuLokal, dariAkun: false };
}

const progresDari = (d) => Object.fromEntries(KOLOM.map(([k]) => [k, objek(d[k])]));
const progresDariBaris = (r) => Object.fromEntries(KOLOM.map(([k, kol]) => [k, objek(r && r[kol])]));

function urutkanKunci(x) {
  if (Array.isArray(x)) return x.map(urutkanKunci);
  if (x && typeof x === 'object') return Object.fromEntries(Object.keys(x).sort().map((k) => [k, urutkanKunci(x[k])]));
  return x;
}
const sama = (a, b) => JSON.stringify(urutkanKunci(a)) === JSON.stringify(urutkanKunci(b));

const urutWaktu = (x, y) => String(x.waktu || '').localeCompare(String(y.waktu || ''));

// Gabungkan data `lain` ke `utama` (mengubah `utama`). Catatan dengan idCatatan sama tidak digandakan.
export function gabungData(utama, lain) {
  for (const nama of Object.keys(DAFTAR_AKTIVITAS)) {
    const ada = new Set(utama[nama].map((e) => e.idCatatan));
    const tambahan = (lain[nama] || []).filter((e) => e && !ada.has(e.idCatatan));
    if (tambahan.length) { utama[nama].push(...tambahan); utama[nama].sort(urutWaktu); }
  }
  Object.assign(utama, gabungProgres(progresDari(utama), progresDari(lain)));
  if (!utama.profil.nama && !utama.profil.kelas && lain.profil) utama.profil = { ...utama.profil, ...lain.profil };
  return utama;
}

export function adaDataBelajar(d) {
  return Object.keys(DAFTAR_AKTIVITAS).some((n) => d[n].length)
    || KOLOM.some(([k]) => Object.keys(objek(d[k])).length > 0);
}

// Catatan lokal → baris tabel aktivitas. idCatatan menjadi kolom `id`, sisanya = isi ekspor (kontrak CLAUDE.md).
export function keBaris(e, jenis, userId, idPerangkat) {
  const { idCatatan, ...isi } = e;
  const w = Date.parse(e.waktu);
  return { id: idCatatan, user_id: userId, jenis, waktu: new Date(Number.isNaN(w) ? Date.now() : w).toISOString(),
    data: isi, id_perangkat: idPerangkat ? String(idPerangkat).slice(0, 40) : null };
}

export function dariBaris(r) {
  const isi = objek(r.data);
  return { ...isi, waktu: typeof isi.waktu === 'string' ? isi.waktu : r.waktu, idCatatan: r.id };
}

// ------------------------------------------------------------------ status (untuk tampilan)
let status = { keadaan: 'keluar', pesan: '', waktu: null };
const pendengarStatus = new Set();
export function saatStatus(f) { pendengarStatus.add(f); return () => pendengarStatus.delete(f); }

export function jumlahMenunggu() {
  const d = ambil();
  let n = 0;
  for (const nama of Object.keys(DAFTAR_AKTIVITAS)) for (const e of d[nama]) if (e && !d.sinkron.terkirim[e.idCatatan]) n++;
  return n;
}

export function statusSinkron() { return { ...status, menunggu: penggunaAktif() ? jumlahMenunggu() : 0 }; }

function aturStatus(keadaan, pesan = '', waktu = status.waktu) {
  status = { keadaan, pesan, waktu };
  pendengarStatus.forEach((f) => { try { f(statusSinkron()); } catch (e) { /* abaikan */ } });
}

// ------------------------------------------------------------------ kepemilikan data di perangkat
let diam = false; // perubahan oleh sinkronisasi sendiri tidak memicu sinkronisasi baru
function simpanDiam() { diam = true; try { simpan(); } finally { diam = false; } }

function aturPemilik(id) {
  const d = ambil();
  d.sinkron.pemilik = id;
  d.sinkron.profilDiubah = false; // nama/kelas di akun (dari pendaftaran) diutamakan; kosong → diisi dari perangkat
  simpanDiam();
}

// Simpan data saat ini terpisah sebagai `nama` (digabung bila cadangan bernama sama sudah ada),
// lalu pakai data milik akun `idBaru` yang pernah disimpan terpisah di perangkat ini (bila ada).
function simpanTerpisah(nama, idBaru) {
  const sudahAda = ambilCadangan(nama);
  const isi = sudahAda ? gabungData(sudahAda, JSON.parse(JSON.stringify(ambil()))) : null;
  const milikku = ambilCadangan(idBaru);
  diam = true;
  let ok;
  try { ok = pisahkanData(nama, milikku, isi); } finally { diam = false; }
  if (!ok) throw new GalatAkun('Penyimpanan perangkat penuh. Data tidak dipindahkan. Kosongkan sedikit ruang lalu coba lagi.');
  if (milikku) lepasCadangan(idBaru); // sudah dipulihkan & tersimpan sebagai data utama
}

// Dipanggil setelah masuk. `tanya()` → true (gabungkan data perangkat ke akun) / false (simpan terpisah).
// → 'sama' | 'gabung' | 'pisah' | 'ganti' | 'baru'
export async function hubungkanAkun(tanya) {
  const u = penggunaAktif();
  if (!u) return null;
  const d = ambil();
  const pemilik = d.sinkron.pemilik;
  if (pemilik === u.id) return 'sama';
  let hasil = 'baru';
  if (pemilik) { // data akun lain: disimpan terpisah (tidak dihapus), dipulihkan saat akun itu masuk lagi
    simpanTerpisah(pemilik, u.id);
    hasil = 'ganti';
  } else if (adaDataBelajar(d) || d.profil.nama) {
    if (await tanya()) hasil = 'gabung';
    else { simpanTerpisah('tamu', u.id); hasil = 'pisah'; }
  } else if (ambilCadangan(u.id)) {
    simpanTerpisah('tamu', u.id); // data kosong; pulihkan data akun ini yang pernah disimpan terpisah
  }
  aturPemilik(u.id);
  return hasil;
}

export const adaDataTamu = () => !!ambilCadangan('tamu');

// Gabungkan data tamu yang disimpan terpisah ke akun yang sedang masuk (lalu dikirim saat sinkron)
export function gabungkanDataTamu() {
  const c = ambilCadangan('tamu');
  if (!c) return false;
  gabungData(ambil(), c);
  simpanDiam();
  lepasCadangan('tamu');
  jadwalkan(300);
  return true;
}

// ------------------------------------------------------------------ satu putaran sinkronisasi
async function kirimAktivitas(d, u) {
  const antre = [];
  for (const [nama, jenis] of Object.entries(DAFTAR_AKTIVITAS)) {
    for (const e of d[nama]) {
      if (!e || !e.idCatatan || d.sinkron.terkirim[e.idCatatan]) continue;
      const baris = keBaris(e, jenis, u.id, d.idPerangkat);
      if (JSON.stringify(baris.data).length > MAKS_DATA) { d.sinkron.terkirim[e.idCatatan] = 2; continue; } // tetap di perangkat & ekspor
      antre.push(baris);
    }
  }
  if (!antre.length) return;
  for (let i = 0; i < antre.length; i += PER_KIRIM) {
    const potong = antre.slice(i, i + PER_KIRIM);
    await rest('POST', 'aktivitas?on_conflict=id', potong, 'resolution=ignore-duplicates,return=minimal');
    potong.forEach((b) => { d.sinkron.terkirim[b.id] = 1; });
    simpanDiam();
  }
}

async function tarikAktivitas(d) {
  // Mundur 10 menit dari unduhan terakhir: transaksi yang selesai belakangan tetap terambil (duplikat dilewati)
  const dari = d.sinkron.ditarikSampai ? new Date(Date.parse(d.sinkron.ditarikSampai) - 600000).toISOString() : null;
  const ada = new Set();
  for (const nama of Object.keys(DAFTAR_AKTIVITAS)) d[nama].forEach((e) => ada.add(e.idCatatan));
  let terbaru = d.sinkron.ditarikSampai ? Date.parse(d.sinkron.ditarikSampai) : 0;
  const berubah = new Set();
  for (let offset = 0; ; offset += PER_TARIK) {
    const baris = await rest('GET', `aktivitas?select=id,jenis,waktu,data,dibuat_pada&order=dibuat_pada.asc,id.asc&limit=${PER_TARIK}&offset=${offset}`
      + (dari ? `&dibuat_pada=gte.${encodeURIComponent(dari)}` : ''));
    for (const r of baris || []) {
      const t = Date.parse(r.dibuat_pada);
      if (t > terbaru) terbaru = t;
      d.sinkron.terkirim[r.id] = 1;
      const nama = JENIS_KE_DAFTAR[r.jenis];
      if (ada.has(r.id) || !nama) continue;
      d[nama].push(dariBaris(r));
      ada.add(r.id);
      berubah.add(nama);
    }
    if (!baris || baris.length < PER_TARIK) break;
  }
  berubah.forEach((nama) => d[nama].sort(urutWaktu));
  if (terbaru) d.sinkron.ditarikSampai = new Date(terbaru).toISOString();
  simpanDiam();
}

function terapkanTampilan(p) {
  document.documentElement.dataset.teks = p.ukuranTeks || 'normal';
  document.documentElement.dataset.animasi = p.animasi === false ? 'mati' : 'nyala';
}

async function sinkronProgres(d, u) {
  const r = ((await rest('GET', 'progres?select=*')) || [])[0] || null;
  Object.assign(d, gabungProgres(progresDari(d), progresDariBaris(r)));
  const g = gabungPengaturan(d.pengaturan, d.sinkron.pengaturanDiubah, r && r.pengaturan);
  if (g.dariAkun) { d.pengaturan = g.pengaturan; d.sinkron.pengaturanDiubah = g.waktu; terapkanTampilan(d.pengaturan); }
  simpanDiam();

  const baru = { user_id: u.id, ...Object.fromEntries(KOLOM.map(([k, kol]) => [kol, d[k]])),
    pengaturan: { ...d.pengaturan, ...(d.sinkron.pengaturanDiubah ? { _diubah: d.sinkron.pengaturanDiubah } : {}) } };
  const lama = r ? { user_id: r.user_id, ...Object.fromEntries(KOLOM.map(([, kol]) => [kol, r[kol]])), pengaturan: r.pengaturan } : null;
  if (!lama || !sama(lama, baru)) {
    await rest('POST', 'progres?on_conflict=user_id', baru, 'resolution=merge-duplicates,return=minimal');
  }
}

async function sinkronProfil(d, u) {
  const r = ((await rest('GET', 'profil?select=nama_panggilan,kelas')) || [])[0];
  if (!r) return;
  const nama = String(d.profil.nama || '').slice(0, 40), kelas = String(d.profil.kelas || '').slice(0, 12);
  const jauhKosong = !r.nama_panggilan && !r.kelas;
  if (d.sinkron.profilDiubah || (jauhKosong && (nama || kelas))) {
    if (r.nama_panggilan !== nama || r.kelas !== kelas) {
      await rest('PATCH', `profil?id=eq.${encodeURIComponent(u.id)}`, { nama_panggilan: nama, kelas }, 'return=minimal');
    }
    d.sinkron.profilDiubah = false;
  } else if (r.nama_panggilan !== d.profil.nama || r.kelas !== d.profil.kelas) {
    d.profil = { ...d.profil, nama: r.nama_panggilan || '', kelas: r.kelas || '' };
  }
  simpanDiam();
}

async function satuPutaran() {
  await siapkanKonfig();
  const u = penggunaAktif();
  if (!u || !akunTersedia()) { aturStatus('keluar'); return; }
  const d = ambil();
  if (d.sinkron.pemilik !== u.id) { aturStatus('belum-terhubung'); return; } // menunggu pilihan siswa
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { aturStatus('offline', 'Menunggu internet.'); return; }
  aturStatus('menyinkron');
  try {
    await kirimAktivitas(d, u);
    if (ambil() !== d) return; // data perangkat berganti akun di tengah jalan
    await tarikAktivitas(d);
    await sinkronProgres(d, u);
    await sinkronProfil(d, u);
    aturStatus('tersinkron', '', new Date().toISOString());
  } catch (e) {
    if (e && e.kode === 'sesi_berakhir') aturStatus('keluar', e.message);
    else if (e && e.jaringan) aturStatus('offline', 'Belum tersambung ke server. Data tetap aman di perangkat ini dan dikirim nanti.');
    else aturStatus('galat', (e && e.message) || 'Sinkronisasi gagal. Data tetap aman di perangkat ini.');
  }
}

let berjalan = null;
let ulangi = false;
export function sinkronkan() {
  if (berjalan) { ulangi = true; return berjalan; }
  berjalan = (async () => {
    try {
      do { ulangi = false; await satuPutaran(); } while (ulangi);
    } finally { berjalan = null; }
  })();
  return berjalan;
}

let pengatur = null;
let terakhir = 0;
export function jadwalkan(ms = 4000) {
  clearTimeout(pengatur);
  pengatur = setTimeout(() => { terakhir = Date.now(); sinkronkan(); }, ms);
}

let sudahMulai = false;
export function mulaiSinkronOtomatis() {
  if (sudahMulai) return;
  sudahMulai = true;
  saatBerubah(() => { if (!diam && penggunaAktif()) jadwalkan(4000); });
  saatAkunBerubah((u) => { if (!u) aturStatus('keluar'); });
  window.addEventListener('online', () => jadwalkan(1000));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - terakhir > 60000) jadwalkan(1000);
  });
  siapkanKonfig().then(() => { if (penggunaAktif()) jadwalkan(800); });
}
