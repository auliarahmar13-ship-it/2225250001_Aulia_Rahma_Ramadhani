// Penyimpanan data di perangkat (localStorage) + ekspor untuk analisis Python.
// Semua akses localStorage HANYA lewat modul ini.
//
// Local-first (docs/13): data di perangkat tetap sumber utama. Akun Supabase hanya cadangan +
// sinkronisasi (js/sinkron.js). TIDAK ADA data belajar yang dihapus oleh login, logout, atau migrasi:
// - versi 2: setiap catatan riwayat diberi `idCatatan` (UUID) agar bisa dikirim tanpa duplikasi
//   (bukan `id`, karena pemanasan[].id = "P1" dan literasi[].id = "L1" sudah dipakai);
// - data akun lain di perangkat yang sama disimpan TERPISAH (cadangan), bukan dihapus.

const KUNCI = 'deretku:v1';
const KUNCI_SESI = 'deretku:sesi';        // token login Supabase (bukan data belajar)
const KUNCI_KONFIG = 'deretku:konfig';    // URL + kunci publishable Supabase (agar tetap ada saat offline)
const AWALAN_CADANGAN = 'deretku:cadangan:';

// Daftar riwayat (hanya bertambah) → nilai `jenis` di tabel Supabase `aktivitas`
export const DAFTAR_AKTIVITAS = {
  pretes: 'pretes', pemanasan: 'pemanasan', latihan: 'latihan', kuis: 'kuis',
  literasi: 'literasi', jurnal: 'jurnal', bebanKognitif: 'beban',
};

// UUID v4. crypto.randomUUID hanya ada di HTTPS/localhost; getRandomValues ada di mana saja.
export function buatId() {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const b = new Uint8Array(16);
  if (c && c.getRandomValues) c.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const x = [...b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

const sinkronBawaan = () => ({
  pemilik: null,          // id akun Supabase pemilik data di perangkat ini (null = belum terhubung)
  terkirim: {},           // { idCatatan: 1 } sudah ada di cloud
  ditarikSampai: null,    // penanda unduhan terakhir (dibuat_pada di server)
  profilDiubah: false,    // nama/kelas diubah di perangkat, belum dikirim
  pengaturanDiubah: null, // waktu pengaturan terakhir diubah (yang terbaru menang)
});

function bawaan() {
  return {
    versi: 2,
    idPerangkat: Math.random().toString(36).slice(2, 10),
    profil: { nama: '', kelas: '' },
    pengaturan: { musik: true, efek: true, volumeMusik: 0.35, narasi: true, ukuranTeks: 'normal', animasi: true },
    permainan: {},
    materiSelesai: {},
    posisiKartu: {},
    levelLatihan: {},
    literasiSelesai: {},
    pemanasanSelesai: {}, // RMT Fase I (Tahap 4): { P1: true, ... }
    // Setiap catatan riwayat di bawah punya `idCatatan` (UUID, versi 2) + `waktu`.
    pemanasan: [],        // [{ waktu, id: "P1", definisi, benar, fungsiTepat }] → diekspor mulai versiData 3
    jurnal: [],           // Jurnal RMT: [{ waktu, konteks, fungsiKognitif: [kode], refleksi }] (Tahap 6–7)
    pretes: [],           // Tes awal (asesmen dinamis "sandwich"): [{ waktu, skor, benar, total, durasiDetik, jawaban }]
    latihan: [],
    kuis: [],
    literasi: [],
    bebanKognitif: [],
    sinkron: sinkronBawaan(),
  };
}

// Lengkapi objek tersimpan dengan nilai bawaan + migrasi versi 1 → 2 (tambah `idCatatan`, tidak menghapus apa pun)
function rapikan(o) {
  const b = bawaan();
  const d = {
    ...b, ...o,
    profil: { ...b.profil, ...(o.profil || {}) },
    pengaturan: { ...b.pengaturan, ...(o.pengaturan || {}) },
    sinkron: { ...b.sinkron, ...(o.sinkron || {}) },
  };
  for (const nama of Object.keys(DAFTAR_AKTIVITAS)) {
    if (!Array.isArray(d[nama])) d[nama] = [];
    d[nama].forEach((e) => { if (e && typeof e === 'object' && !e.idCatatan) e.idCatatan = buatId(); });
  }
  d.versi = 2;
  return d;
}

function baca(kunci) {
  try {
    const s = localStorage.getItem(kunci);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

function tulis(kunci, nilai) {
  try {
    if (nilai == null) localStorage.removeItem(kunci);
    else localStorage.setItem(kunci, JSON.stringify(nilai));
    return true;
  } catch (e) {
    return false; // penyimpanan penuh/diblokir
  }
}

function muat() {
  const o = baca(KUNCI);
  if (!o || typeof o !== 'object') return bawaan();
  const d = rapikan(o);
  if (o.versi !== 2) tulis(KUNCI, d); // simpan hasil migrasi (idCatatan baru) agar tetap sama di kunjungan berikutnya
  return d;
}

let data = muat();
const pendengar = new Set();

export function ambil() { return data; }

export function simpan() {
  const ok = tulis(KUNCI, data);
  pendengar.forEach((f) => f(data));
  return ok;
}

export function saatBerubah(f) { pendengar.add(f); return () => pendengar.delete(f); }

const sekarang = () => new Date().toISOString();

export function aturPengaturan(kunci, nilai) {
  data.pengaturan[kunci] = nilai;
  data.sinkron.pengaturanDiubah = sekarang();
  simpan();
}
export function aturProfil(kunci, nilai) { data.profil[kunci] = nilai; data.sinkron.profilDiubah = true; simpan(); }
export function aturPosisi(unitId, i) { data.posisiKartu[unitId] = i; simpan(); }
export function tandaiMateri(unitId) { data.materiSelesai[unitId] = true; simpan(); }
export function aturLevel(jenis, level) { data.levelLatihan[jenis] = level; simpan(); }
export function tandaiLiterasi(id) { data.literasiSelesai[id] = true; simpan(); }

// Games: simpan skor tertinggi. Mengembalikan true bila rekor baru.
export function catatPermainan(id, skor) {
  const p = data.permainan[id] || { rekor: 0, main: 0 };
  const rekorBaru = skor > p.rekor;
  data.permainan[id] = { rekor: Math.max(p.rekor, skor), main: p.main + 1, terakhir: sekarang() };
  simpan();
  return rekorBaru;
}

const baru = (e) => ({ waktu: sekarang(), ...e, idCatatan: buatId() });

// Jurnal RMT (hlm. 152, 167): refleksi singkat + fungsi berpikir yang dipakai
export function catatJurnal({ konteks, fungsiKognitif = [], refleksi = '' }) {
  data.jurnal.push(baru({ konteks, fungsiKognitif, refleksi: String(refleksi).slice(0, 300) }));
  simpan();
}

export function catatPemanasan(e) {
  data.pemanasan.push(baru(e));
  data.pemanasanSelesai[e.id] = true;
  simpan();
}

export function catatLatihan(e) { data.latihan.push(baru(e)); simpan(); }
export function catatPretes(e) { data.pretes.push(baru(e)); simpan(); }
export function catatKuis(e) { data.kuis.push(baru(e)); simpan(); }
export function catatLiterasi(e) { data.literasi.push(baru(e)); simpan(); }
export function catatBeban(konteks, nilai) { data.bebanKognitif.push(baru({ konteks, nilai })); simpan(); }

// Hapus data belajar di perangkat ini (atas permintaan siswa). Data di akun cloud TIDAK ikut terhapus;
// pemilik tetap dicatat sehingga data akun diunduh lagi pada sinkronisasi berikutnya.
export function hapusSemua() {
  const id = data.idPerangkat;
  const pemilik = data.sinkron.pemilik;
  data = bawaan();
  data.idPerangkat = id;
  data.sinkron.pemilik = pemilik;
  simpan();
}

// Format ekspor = kontrak dengan python/analisis_statistik.py (lihat CLAUDE.md)
export function eksporData() {
  return {
    aplikasi: 'DeretKu',
    // v2: latihan[].definisiMasalah & bukti (Tahap 2).
    // v3: pretes, pemanasan, jurnal; latihan[].lapisanBantuan/contoh/aiPesan; literasi[].tafsiran (Tahap 4–7)
    // v4: setiap catatan riwayat punya `idCatatan` (UUID) untuk sinkronisasi akun (hosting Tahap 6)
    versiData: 4,
    diekspor: sekarang(),
    idPerangkat: data.idPerangkat,
    profil: data.profil,
    materiSelesai: Object.keys(data.materiSelesai).filter((k) => data.materiSelesai[k]),
    pretes: data.pretes,
    pemanasan: data.pemanasan,
    latihan: data.latihan,
    kuis: data.kuis,
    literasi: data.literasi,
    jurnal: data.jurnal,
    bebanKognitif: data.bebanKognitif,
  };
}

export async function bagikanEkspor() {
  const obj = eksporData();
  const slug = (data.profil.nama || 'siswa').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'siswa';
  const tgl = new Date().toISOString().slice(0, 10);
  const nama = `deretku_${slug}_${tgl}.json`;
  const isi = JSON.stringify(obj, null, 2);
  const blob = new Blob([isi], { type: 'application/json' });

  try {
    const file = new File([blob], nama, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Data DeretKu' });
      return 'dibagikan';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'batal';
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  return 'diunduh';
}

// ------------------------------------------------------------------ akun & sinkronisasi (docs/13)
export const ambilSesi = () => baca(KUNCI_SESI);
export const simpanSesi = (s) => tulis(KUNCI_SESI, s);          // null = keluar (data belajar TIDAK dihapus)
export const ambilKonfig = () => baca(KUNCI_KONFIG);
export const simpanKonfig = (k) => tulis(KUNCI_KONFIG, k);

// Data belajar yang disimpan terpisah di perangkat ini (milik akun lain / data tamu yang tidak diunggah)
export const ambilCadangan = (nama) => { const o = baca(AWALAN_CADANGAN + nama); return o ? rapikan(o) : null; };

// Simpan data saat ini (atau `isiCadangan`, mis. hasil gabungan dengan cadangan lama bernama sama) sebagai
// cadangan `nama`, lalu pakai `pengganti` (atau data kosong yang mempertahankan pengaturan & idPerangkat).
// Gagal menyimpan cadangan = TIDAK ada yang diganti. → true bila data utama baru juga tersimpan.
export function pisahkanData(nama, pengganti = null, isiCadangan = null) {
  if (!tulis(AWALAN_CADANGAN + nama, isiCadangan || data)) return false;
  const lama = data;
  data = pengganti ? rapikan(pengganti) : bawaan();
  data.idPerangkat = lama.idPerangkat;
  if (!pengganti) { data.pengaturan = { ...lama.pengaturan }; data.sinkron.pengaturanDiubah = lama.sinkron.pengaturanDiubah; }
  return simpan();
}

// Hapus kunci cadangan. HANYA dipanggil setelah isinya dipulihkan/digabung ke data utama dan tersimpan.
export function lepasCadangan(nama) { return tulis(AWALAN_CADANGAN + nama, null); }
