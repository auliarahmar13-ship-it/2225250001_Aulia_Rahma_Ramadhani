// Penyimpanan data di perangkat (localStorage) + ekspor untuk analisis Python.
// Semua akses localStorage HANYA lewat modul ini.

const KUNCI = 'deretku:v1';

function bawaan() {
  return {
    versi: 1,
    idPerangkat: Math.random().toString(36).slice(2, 10),
    profil: { nama: '', kelas: '' },
    pengaturan: { musik: true, efek: true, volumeMusik: 0.35, narasi: true, ukuranTeks: 'normal', animasi: true },
    permainan: {},
    materiSelesai: {},
    posisiKartu: {},
    levelLatihan: {},
    literasiSelesai: {},
    pemanasanSelesai: {}, // RMT Fase I (Tahap 4): { P1: true, ... }
    pemanasan: [],        // [{ waktu, id, definisi, benar, fungsiTepat }] → diekspor mulai versiData 3
    jurnal: [],           // Jurnal RMT: [{ waktu, konteks, fungsiKognitif: [kode], refleksi }] (Tahap 6–7)
    pretes: [],           // Tes awal (asesmen dinamis "sandwich"): [{ waktu, skor, benar, total, durasiDetik, jawaban }]
    latihan: [],
    kuis: [],
    literasi: [],
    bebanKognitif: [],
  };
}

function muat() {
  const b = bawaan();
  try {
    const s = localStorage.getItem(KUNCI);
    if (!s) return b;
    const o = JSON.parse(s);
    return {
      ...b, ...o,
      profil: { ...b.profil, ...(o.profil || {}) },
      pengaturan: { ...b.pengaturan, ...(o.pengaturan || {}) },
    };
  } catch (e) {
    return b;
  }
}

let data = muat();
const pendengar = new Set();

export function ambil() { return data; }

export function simpan() {
  try { localStorage.setItem(KUNCI, JSON.stringify(data)); } catch (e) { /* penyimpanan penuh/diblokir */ }
  pendengar.forEach((f) => f(data));
}

export function saatBerubah(f) { pendengar.add(f); return () => pendengar.delete(f); }

const sekarang = () => new Date().toISOString();

export function aturPengaturan(kunci, nilai) { data.pengaturan[kunci] = nilai; simpan(); }
export function aturProfil(kunci, nilai) { data.profil[kunci] = nilai; simpan(); }
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

// Jurnal RMT (hlm. 152, 167): refleksi singkat + fungsi berpikir yang dipakai
export function catatJurnal({ konteks, fungsiKognitif = [], refleksi = '' }) {
  data.jurnal.push({ waktu: sekarang(), konteks, fungsiKognitif, refleksi: String(refleksi).slice(0, 300) });
  simpan();
}

export function catatPemanasan(e) {
  data.pemanasan.push({ waktu: sekarang(), ...e });
  data.pemanasanSelesai[e.id] = true;
  simpan();
}

export function catatLatihan(e) { data.latihan.push({ waktu: sekarang(), ...e }); simpan(); }
export function catatPretes(e) { data.pretes.push({ waktu: sekarang(), ...e }); simpan(); }
export function catatKuis(e) { data.kuis.push({ waktu: sekarang(), ...e }); simpan(); }
export function catatLiterasi(e) { data.literasi.push({ waktu: sekarang(), ...e }); simpan(); }
export function catatBeban(konteks, nilai) {
  data.bebanKognitif.push({ waktu: sekarang(), konteks, nilai }); simpan();
}

export function hapusSemua() {
  const id = data.idPerangkat;
  data = bawaan();
  data.idPerangkat = id;
  simpan();
}

// Format ekspor = kontrak dengan python/analisis_statistik.py (lihat CLAUDE.md)
export function eksporData() {
  return {
    aplikasi: 'DeretKu',
    // v2: latihan[].definisiMasalah & bukti (Tahap 2).
    // v3: pretes, pemanasan, jurnal; latihan[].lapisanBantuan/contoh/aiPesan; literasi[].tafsiran (Tahap 4–7)
    versiData: 3,
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
