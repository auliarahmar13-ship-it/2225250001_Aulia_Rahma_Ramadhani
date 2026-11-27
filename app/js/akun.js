// Akun siswa (Supabase Auth: email + kata sandi) tanpa pustaka luar: fetch ke REST API Supabase.
// Rancangan: docs/13-rancangan-supabase.md. Keamanan:
// - Frontend hanya memakai URL + kunci PUBLISHABLE dari GET api/konfigurasi (aman karena RLS).
//   Kunci secret TIDAK PERNAH ada di browser.
// - Token sesi disimpan lewat state.js (penyimpanan perangkat). Keluar = token dihapus; data belajar TETAP ada.
// - Data yang diminta saat daftar: email, kata sandi, nama panggilan, kelas (opsional). Tidak lebih.

import { ambilSesi, simpanSesi, ambilKonfig, simpanKonfig } from './state.js';

export class GalatAkun extends Error {
  constructor(pesan, { kode = '', status = 0, jaringan = false } = {}) {
    super(pesan);
    this.kode = kode;
    this.status = status;
    this.jaringan = jaringan;
  }
}

const PESAN = {
  invalid_credentials: 'Email atau kata sandi salah.',
  email_not_confirmed: 'Email belum dikonfirmasi. Buka email dari DeretKu/Supabase, klik tautannya, lalu masuk lagi.',
  user_already_exists: 'Email ini sudah terdaftar. Silakan pilih "Masuk".',
  email_exists: 'Email ini sudah terdaftar. Silakan pilih "Masuk".',
  weak_password: 'Kata sandi terlalu lemah. Pakai minimal 8 karakter, campur huruf dan angka.',
  email_address_invalid: 'Alamat email tidak valid.',
  validation_failed: 'Periksa lagi email dan kata sandimu.',
  signup_disabled: 'Pendaftaran akun sedang ditutup. Tanyakan ke gurumu.',
  email_provider_disabled: 'Masuk dengan email sedang dinonaktifkan. Tanyakan ke gurumu.',
  over_request_rate_limit: 'Terlalu banyak percobaan. Tunggu beberapa menit, lalu coba lagi.',
  over_email_send_rate_limit: 'Terlalu banyak email dikirim. Tunggu sekitar satu jam, lalu coba lagi.',
  refresh_token_not_found: 'Sesi sudah berakhir. Silakan masuk lagi.',
  refresh_token_already_used: 'Sesi sudah berakhir. Silakan masuk lagi.',
  session_not_found: 'Sesi sudah berakhir. Silakan masuk lagi.',
};

const JEDA = 15000; // ms per permintaan (Supabase gratis bisa lambat saat baru dibangunkan)

async function ambilJson(url, opsi = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), JEDA);
  let res;
  try {
    res = await fetch(url, { ...opsi, signal: ctrl.signal, cache: 'no-store' });
  } catch (e) {
    throw new GalatAkun('Tidak tersambung ke server akun. Periksa internetmu, lalu coba lagi.', { jaringan: true });
  } finally {
    clearTimeout(t);
  }
  const teks = await res.text().catch(() => '');
  let isi = null;
  try { isi = teks ? JSON.parse(teks) : null; } catch (e) { isi = null; }
  if (!res.ok) {
    const kode = (isi && (isi.error_code || isi.code || isi.error)) || '';
    const pesan = PESAN[kode]
      || (res.status === 429 ? PESAN.over_request_rate_limit : '')
      || (res.status >= 500 ? 'Server akun sedang bermasalah. Coba lagi nanti.' : 'Permintaan ke server akun gagal.');
    throw new GalatAkun(pesan, { kode: String(kode), status: res.status });
  }
  return isi;
}

// ------------------------------------------------------------------ konfigurasi
let konfig = ambilKonfig(); // { url, kunci } atau null; tersimpan agar akun tetap dikenali saat offline
let janjiKonfig = null;

// Ambil konfigurasi publik dari server sendiri (Vercel/serve.py). null = fitur akun tidak tersedia.
export function siapkanKonfig() {
  if (!janjiKonfig) {
    janjiKonfig = (async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch('api/konfigurasi', { cache: 'no-store', signal: ctrl.signal });
        clearTimeout(t);
        if (res.ok) {
          const isi = await res.json();
          const s = isi && isi.supabase;
          konfig = s && typeof s.url === 'string' && typeof s.kunci === 'string' ? { url: s.url.replace(/\/+$/, ''), kunci: s.kunci } : null;
          simpanKonfig(konfig);
        } else if (res.status === 404 || res.status === 405) {
          konfig = null; // server statis tanpa endpoint (mis. GitHub Pages)
        }
      } catch (e) { /* offline: pakai konfigurasi tersimpan */ }
      return konfig;
    })();
  }
  return janjiKonfig;
}

export const akunTersedia = () => !!konfig;

function wajibKonfig() {
  if (!konfig) throw new GalatAkun('Fitur akun belum tersedia di server ini.');
  return konfig;
}

// ------------------------------------------------------------------ sesi
const pendengar = new Set();
export function saatAkunBerubah(f) { pendengar.add(f); return () => pendengar.delete(f); }
const kabari = () => pendengar.forEach((f) => { try { f(penggunaAktif()); } catch (e) { /* abaikan */ } });

// Hanya bagian yang perlu disimpan (bukan seluruh objek pengguna)
function rapikanSesi(s) {
  if (!s || !s.access_token || !s.refresh_token || !s.user || !s.user.id) return null;
  const kedaluwarsa = Number(s.expires_at) || Math.floor(Date.now() / 1000) + (Number(s.expires_in) || 3600);
  return { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: kedaluwarsa,
    user: { id: s.user.id, email: s.user.email || '' } };
}

function pasangSesi(s) {
  const r = rapikanSesi(s);
  simpanSesi(r);
  kabari();
  return r;
}

// { id, email } bila ada sesi tersimpan (walau token perlu diperpanjang), selain itu null
export function penggunaAktif() {
  const s = ambilSesi();
  return s && s.user ? { id: s.user.id, email: s.user.email } : null;
}

let janjiSegar = null;
async function segarkan(s) {
  if (!janjiSegar) {
    janjiSegar = (async () => {
      const { url, kunci } = wajibKonfig();
      try {
        const baru = await ambilJson(`${url}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST', headers: { apikey: kunci, 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: s.refresh_token }),
        });
        return pasangSesi(baru);
      } catch (e) {
        // Token ditolak (bukan masalah jaringan) → sesi tidak berlaku lagi; data belajar tetap ada
        if (!e.jaringan && e.status >= 400 && e.status < 500) {
          simpanSesi(null);
          kabari();
          throw new GalatAkun(PESAN.session_not_found, { kode: 'sesi_berakhir', status: e.status });
        }
        throw e;
      }
    })().finally(() => { janjiSegar = null; });
  }
  return janjiSegar;
}

// Token akses yang masih berlaku (diperpanjang otomatis 2 menit sebelum habis)
export async function tokenAkses() {
  const s = ambilSesi();
  if (!s) throw new GalatAkun('Kamu belum masuk.', { kode: 'belum_masuk' });
  if (s.expires_at - 120 > Date.now() / 1000) return s;
  return segarkan(s);
}

// ------------------------------------------------------------------ daftar / masuk / keluar
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function periksaIsian({ email, sandi, nama, kelas }, daftar = false) {
  if (!EMAIL.test(String(email || '').trim())) return 'Tulis alamat email yang benar, ya.';
  if (!sandi || sandi.length < (daftar ? 8 : 6)) return daftar ? 'Kata sandi minimal 8 karakter.' : 'Tulis kata sandimu.';
  if (daftar && sandi.length > 72) return 'Kata sandi terlalu panjang (maksimal 72 karakter).';
  if (daftar && !String(nama || '').trim()) return 'Tulis nama panggilanmu, ya.';
  if (daftar && String(nama).trim().length > 40) return 'Nama panggilan maksimal 40 karakter.';
  if (daftar && String(kelas || '').trim().length > 12) return 'Kelas maksimal 12 karakter.';
  return '';
}

const alamatKembali = () => location.origin + location.pathname;

// → { sesi } bila langsung masuk, atau { perluKonfirmasi: true } bila Supabase mewajibkan konfirmasi email
export async function daftar({ email, sandi, nama, kelas = '' }) {
  const { url, kunci } = wajibKonfig();
  const isi = await ambilJson(`${url}/auth/v1/signup?redirect_to=${encodeURIComponent(alamatKembali())}`, {
    method: 'POST', headers: { apikey: kunci, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(), password: sandi,
      // dibaca trigger buat_profil_baru (nama & kelas saja; peran TIDAK dikirim)
      data: { nama_panggilan: String(nama).trim().slice(0, 40), kelas: String(kelas).trim().slice(0, 12) },
    }),
  });
  if (isi && isi.access_token) return { sesi: pasangSesi(isi) };
  return { perluKonfirmasi: true };
}

export async function masuk({ email, sandi }) {
  const { url, kunci } = wajibKonfig();
  const isi = await ambilJson(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: kunci, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password: sandi }),
  });
  const sesi = pasangSesi(isi);
  if (!sesi) throw new GalatAkun('Jawaban server akun tidak lengkap. Coba lagi.');
  return sesi;
}

// Keluar dari perangkat ini. Data belajar di perangkat TIDAK dihapus.
export async function keluar() {
  const s = ambilSesi();
  simpanSesi(null);
  kabari();
  if (!s || !konfig) return;
  try {
    await ambilJson(`${konfig.url}/auth/v1/logout?scope=local`, {
      method: 'POST', headers: { apikey: konfig.kunci, Authorization: `Bearer ${s.access_token}` },
    });
  } catch (e) { /* offline/token kedaluwarsa: token lokal sudah dihapus, cukup */ }
}

// Tautan dari email konfirmasi Supabase kembali ke aplikasi dengan #access_token=…&refresh_token=…
// (atau #error=…). Dipanggil app.js SEBELUM router membaca hash. → null | { masuk: true } | { galat }
export function tangkapTautanAuth() {
  const hash = location.hash.replace(/^#/, '');
  if (!/(^|&)(access_token|error)=/.test(hash)) return null;
  const p = new URLSearchParams(hash);
  history.replaceState(null, '', location.pathname + location.search + '#/akun'); // token tidak tertinggal di URL
  if (p.get('error')) {
    const kode = p.get('error_code') || p.get('error');
    return { galat: kode === 'otp_expired' ? 'Tautan email sudah kedaluwarsa. Silakan masuk atau daftar lagi.' : 'Tautan email tidak bisa dipakai. Silakan masuk lagi.' };
  }
  let id = '', email = '';
  try { // isi token (JWT) hanya dibaca untuk id & email; keabsahannya diperiksa server di setiap permintaan
    const o = JSON.parse(atob(p.get('access_token').split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    id = o.sub || ''; email = o.email || '';
  } catch (e) { /* format tidak dikenal */ }
  const sesi = pasangSesi({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'),
    expires_at: p.get('expires_at'), expires_in: p.get('expires_in'), user: { id, email } });
  return sesi ? { masuk: true } : { galat: 'Tautan email tidak lengkap. Silakan masuk lagi.' };
}

// ------------------------------------------------------------------ REST (PostgREST) dengan RLS
// jalur: mis. 'aktivitas?select=id' ; prefer: header Prefer. Token kedaluwarsa → diperpanjang & diulang sekali.
export async function rest(metode, jalur, isi, prefer) {
  const { url, kunci } = wajibKonfig();
  let s = await tokenAkses();
  for (let ulang = 0; ; ulang++) {
    const header = { apikey: kunci, Authorization: `Bearer ${s.access_token}` };
    if (isi !== undefined) header['Content-Type'] = 'application/json';
    if (prefer) header.Prefer = prefer;
    try {
      return await ambilJson(`${url}/rest/v1/${jalur}`, { method: metode, headers: header, body: isi === undefined ? undefined : JSON.stringify(isi) });
    } catch (e) {
      if (e.status === 401 && ulang === 0) { s = await segarkan(s); continue; }
      throw e;
    }
  }
}
