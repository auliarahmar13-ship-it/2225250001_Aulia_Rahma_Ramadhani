# 13 — Rancangan Integrasi Supabase (local-first)

Tujuan: data belajar siswa **tersimpan aman di cloud** dan **tersinkron antarperangkat**, tanpa
mengubah cara DeretKu bekerja offline. Rencana besar: [09-rencana-hosting-pwa.md](09-rencana-hosting-pwa.md) (Tahap 5–7).

Status: **Tahap 5 selesai (2026-11-27)**: skema dijalankan, `uji_rls.sql` → "SEMUA UJI RLS LOLOS".
**Tahap 6 dibuat & diuji lokal (2026-11-27)** dengan login **email + kata sandi** (pilihan pengguna):
`app/js/akun.js`, `app/js/sinkron.js`, halaman `#/akun`, endpoint `GET /api/konfigurasi`. Belum di-deploy.

## 1. Prinsip "local-first"

1. **HP siswa tetap tempat simpan utama** (`localStorage` lewat `app/js/state.js`). Semua fitur,
   termasuk RMT, tetap jalan tanpa internet dan tanpa login.
2. **Supabase = cadangan + sinkronisasi.** Saat online dan login, perubahan dikirim ke cloud dan
   data dari perangkat lain digabungkan.
3. **Tidak ada data lokal yang dihapus.** Migrasi hanya *menambahkan* tanda pengenal (`id`) pada
   catatan lama.
4. Bila Supabase sedang **dijeda** (paket gratis dijeda setelah 1 minggu tanpa aktivitas) atau
   gangguan, aplikasi tetap berjalan; sinkronisasi ditunda.

## 2. Pemetaan data lokal → tabel

| Data di `state.js` | Sifat | Tabel Supabase |
|---|---|---|
| `profil.nama`, `profil.kelas` | jarang berubah | `profil` (`nama_panggilan`, `kelas`) |
| `materiSelesai`, `posisiKartu`, `levelLatihan`, `literasiSelesai`, `pemanasanSelesai`, `permainan`, `pengaturan` | keadaan terkini (ditimpa) | `progres` (satu kolom JSON per kelompok) |
| `pretes`, `pemanasan`, `latihan`, `kuis`, `literasi`, `jurnal`, `bebanKognitif` | riwayat (hanya bertambah) | `aktivitas` (satu baris per catatan; `jenis` = nama daftar; `bebanKognitif` → `beban`) |
| `idPerangkat` | penanda perangkat | `aktivitas.id_perangkat` |
| `versi` | internal | tidak disimpan |

Isi kolom `aktivitas.data` **sama persis** dengan entri di ekspor JSON (kontrak di CLAUDE.md),
sehingga analisis Python tetap bisa dipakai.

## 3. Struktur database (berkas: `supabase/migrations/20261127000000_skema_awal.sql`)

```
auth.users (akun Supabase)
   │ 1 : 1                         │ 1 : 1                        │ 1 : banyak
   ▼                               ▼                              ▼
profil                          progres                         aktivitas
 id (PK, = auth.users.id)        user_id (PK)                    id (PK, UUID dari perangkat)
 nama_panggilan ≤ 40             materi_selesai  jsonb           user_id → auth.users
 kelas ≤ 12                      posisi_kartu    jsonb           jenis (pretes|pemanasan|latihan|
 peran 'siswa'|'guru'            level_latihan   jsonb                  kuis|literasi|jurnal|beban)
 dibuat_pada, diperbarui_pada    literasi_selesai jsonb          waktu, data jsonb ≤ 16 KB
                                 pemanasan_selesai jsonb         id_perangkat, dibuat_pada
                                 permainan, pengaturan jsonb
                                 diperbarui_pada
```

- Menghapus akun di Supabase otomatis menghapus profil, progres, dan aktivitasnya (`on delete cascade`).
- **Trigger** `saat_akun_dibuat`: saat akun baru dibuat, profil dan progres kosong ikut dibuat.
  Nama dan kelas boleh dikirim saat mendaftar. **Peran selalu "siswa"**.
- Batas ukuran (nama 40, kelas 12, data 16 KB) mencegah penyalahgunaan penyimpanan.

## 4. Keamanan: Row Level Security (RLS)

| Aturan | Arti sederhana |
|---|---|
| RLS aktif di ketiga tabel | Tanpa aturan, tidak ada yang bisa membaca apa pun |
| `auth.uid() = id / user_id` di setiap aturan | **Siswa hanya bisa melihat dan mengubah datanya sendiri** |
| Hak `anon` dicabut | Pengunjung yang belum login tidak bisa membaca tabel sama sekali |
| `UPDATE` profil hanya kolom `nama_panggilan` dan `kelas` | Siswa **tidak bisa** mengubah dirinya menjadi guru |
| `aktivitas` tanpa `UPDATE` | Riwayat belajar tidak bisa dipalsukan setelah tercatat; boleh dihapus pemiliknya (hak privasi) |
| Fungsi trigger `security definer` + `search_path = ''` | Praktik aman yang disarankan Supabase |

Akses **guru** ke data satu kelas sengaja **belum** dibuat. Guru tetap memakai **Ekspor Data** +
analisis Python. Akses guru bisa ditambahkan nanti dengan tabel kelas dan aturan khusus.

**Uji RLS** (`supabase/uji_rls.sql`): membuat dua akun uji, memeriksa 7 aturan di atas, lalu
**membatalkan semuanya** (`rollback`).

## 5. Kunci dan konfigurasi

| Nama | Di mana | Rahasia? |
|---|---|---|
| `SUPABASE_URL` | `.env` (lokal) + Environment Variables Vercel | Tidak (alamat publik) |
| `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`) | `.env` + Vercel | **Tidak rahasia**: dirancang untuk browser, aman **karena RLS** |
| Kunci *secret* / `service_role` | **Tidak dipakai sama sekali** | **Sangat rahasia**: melewati RLS. Jangan disalin ke mana pun |

Rencana Tahap 6: aplikasi mengambil URL dan publishable key dari endpoint kecil
`GET /api/konfigurasi`, yang membaca `.env` atau Vercel. Dengan begitu nilainya tidak ditulis di
kode, cukup diubah di satu tempat, dan ikut tersimpan offline oleh service worker. Endpoint ini
**hanya** mengirim dua nilai publik itu, bukan `GEMINI_API_KEY`.

## 6. Pilihan login siswa (diputuskan di Tahap 6)

Supabase mendukung email+kata sandi, telepon, dan anonim. **Login hanya dengan username tidak
didukung bawaan.**

| Opsi | Cara siswa masuk | Kelebihan | Kekurangan |
|---|---|---|---|
| **1. Email + kata sandi** | Daftar sendiri dengan email | Paling standar; bisa "lupa kata sandi" sendiri | Tidak semua siswa SMP punya email; verifikasi email bisa merepotkan |
| **2. Akun dibuat guru** (email semu, mis. `kode@siswa.deretku`, verifikasi dimatikan) | Siswa mengetik **kode siswa + kata sandi** | Tanpa email siswa; data per kelas rapi | Guru membuat akun (sekali); lupa kata sandi direset guru; perlu cara aman membuat akun (dikerjakan di Tahap 6) |
| **3. Anonim** | Tanpa formulir | Paling mudah | Data hilang bila aplikasi dihapus; **tidak bisa pindah perangkat** (tidak memenuhi kebutuhan sinkronisasi) |

Skema database di atas **cocok untuk ketiga opsi**, jadi keputusan bisa ditunda tanpa mengubah SQL.

## 7. Cara kerja sinkronisasi (Tahap 6, sudah dibuat)

Implementasi: `app/js/sinkron.js`. Penyesuaian terhadap rancangan awal:
- Penanda catatan bernama **`idCatatan`** (bukan `id`, karena `pemanasan[].id` dan `literasi[].id` sudah dipakai).
- Bila siswa memilih **tidak** menggabungkan data perangkat, atau akun lain masuk di perangkat yang sama,
  data sebelumnya **disimpan terpisah di perangkat** (bukan dihapus) dan dipulihkan saat akun itu masuk
  lagi. Data tamu yang dipisahkan bisa digabung kapan saja dari halaman Akun.
- Tombol "hapus data di perangkat bersama" belum dibuat (sesuai aturan "jangan menghapus data lokal").


1. **Pertama kali login di HP yang sudah berisi data:** muncul pertanyaan *"Unggah data belajar dari
   HP ini ke akunmu?"*. Bila setuju:
   - catatan lama yang belum punya `id` diberi `id` UUID, lalu disimpan kembali di HP (tidak ada yang dihapus);
   - semua catatan dikirim ke `aktivitas`. Catatan yang `id`-nya sudah ada di cloud otomatis
     dilewati, sehingga tidak ada duplikasi.
2. **Progres digabung**, tidak ditimpa begitu saja:
   - "selesai" digabung (selesai di salah satu perangkat = selesai);
   - level latihan diambil yang **lebih tinggi**;
   - rekor game diambil yang **lebih tinggi** dan jumlah main yang lebih besar;
   - posisi kartu dan pengaturan memakai yang **terbaru**.
3. **Setiap ada catatan baru:** disimpan di HP dulu, lalu masuk antrean kirim. Antrean dikirim saat
   online. Bila gagal, dicoba lagi nanti.
4. **Login di perangkat baru:** aktivitas dan progres diunduh dari cloud lalu digabung ke HP itu.
5. **Keluar (logout):** data di HP tidak dihapus otomatis. Ada tombol terpisah bila siswa ingin
   menghapus data di perangkat bersama, misalnya HP sekolah.

Perubahan format ekspor (tambahan `id` per catatan) akan menaikkan **`versiData` ke 4**, dan
dikerjakan bersama fitur XP, pencapaian, dan kalender.

### 7a. Konfirmasi email (pengaturan Supabase)

Saat ini **"Confirm email" aktif** di proyek (dicek 2026-11-27). Layanan email bawaan Supabase hanya
mengirim ke alamat anggota tim proyek dan dibatasi beberapa email per jam, jadi **siswa tidak akan
menerima email konfirmasi**. Pilihan:
1. **Matikan "Confirm email"** (Authentication → Sign In / Providers → Email): siswa langsung masuk
   setelah daftar. Kekurangannya, email tidak diverifikasi dan "lupa kata sandi" lewat email belum tersedia.
2. Tetap aktif + pasang **SMTP sendiri** (layanan email pihak ketiga) dan isi **Site URL** =
   `https://deretku.vercel.app`. Lebih rumit; bisa ditambahkan nanti.
Aplikasi menangani keduanya: bila konfirmasi wajib, siswa diminta membuka email, dan tautannya
(`#access_token=…`) langsung memasukkan siswa ke halaman Akun.

## 8. Privasi siswa

- Data yang diminta: **nama panggilan dan kelas saja**. Bukan nama lengkap, NISN, alamat, atau nomor HP.
- Tafsiran dan jurnal berisi tulisan bebas, jadi siswa diingatkan untuk tidak menulis data pribadi.
- Sebaiknya ada izin sekolah atau orang tua sebelum uji coba yang menyimpan data di cloud.
- Pilih **region** Supabase terdekat (mis. Singapore). Region sudah dipilih saat proyek dibuat.

## 9. Langkah berikutnya

| Langkah | Siapa | Butuh persetujuan? |
|---|---|---|
| 5a. Tinjau rancangan dan SQL ini | Anda | — |
| 5b. Jalankan `skema_awal.sql` di **SQL Editor** Supabase | Anda (dipandu) | ✅ Ya |
| 5c. Jalankan `uji_rls.sql`; hasil harus "SEMUA UJI RLS LOLOS" | Anda (dipandu) | ✅ Ya |
| 5d. Isi `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` di **Vercel** (Environment Variables) | Anda | — |
| 6. Pilih opsi login → login, sinkronisasi, dan migrasi di aplikasi | Claude + Anda | ✅ Ya (commit/push/deploy) |
| 7. Teman AI hanya untuk yang login + audit keamanan | Claude | ✅ Ya |
