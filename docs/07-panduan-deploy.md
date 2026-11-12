# 07 — Panduan Deploy (Link Permanen) & Instalasi

Tujuan: aplikasi punya **link web tetap** yang bisa dibuka kapan saja dan bisa
**dipasang di HP tanpa Play Store**.

## Pilihan Hosting yang Disarankan: GitHub Pages

- Gratis, HTTPS otomatis (wajib untuk PWA), tidak ada masa kedaluwarsa selama
  repositori dan akun GitHub tetap ada.
- Link berbentuk: `https://<username>.github.io/<nama-repo>/`

### Langkah (sekali saja)

1. Buat akun di <https://github.com> (jika belum).
2. Buat repositori baru, misalnya `deretku`, dengan visibilitas **Public**.
3. Unggah seluruh isi folder proyek ini. Cara termudah dari VS Code:
   - Buka panel **Source Control**, pilih *Initialize Repository*, lalu *Commit*.
   - Pilih *Publish Branch* dan pilih repositori GitHub Anda.

   Atau lewat terminal:
   ```bash
   git init
   git add .
   git commit -m "DeretKu v1.0"
   git branch -M main
   git remote add origin https://github.com/<username>/deretku.git
   git push -u origin main
   ```
4. Di GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. Workflow `.github/workflows/deploy.yml` otomatis menerbitkan folder `app/`.
   Tunggu ± 1 menit, lalu buka tab **Actions** untuk melihat link.
6. Setiap kali ada perubahan, cukup *commit + push*; situs diperbarui otomatis.

> Ingat: setelah mengubah file di `app/`, naikkan `CACHE_VERSION` di `app/sw.js`
> agar HP siswa memperoleh versi baru.

### Cadangan (opsional)
- **Netlify Drop**: <https://app.netlify.com/drop>, seret folder `app/` ke halaman itu.
- **Vercel / Cloudflare Pages**: hubungkan repositori GitHub, *output directory* = `app`.

Karena aplikasi adalah PWA, siswa yang **sudah memasang** tetap dapat memakainya
secara offline meskipun internet mati.

## Memasang Aplikasi di HP

### Android (Chrome)
1. Buka link aplikasi di Chrome.
2. Ketuk tombol **Pasang Aplikasi** di Beranda, atau menu ⋮ → **Instal aplikasi /
   Tambahkan ke layar utama**.
3. Ikon DeretKu muncul di layar utama, dan aplikasi terbuka layar penuh seperti aplikasi biasa.

### iPhone (Safari)
1. Buka link di Safari, ketuk tombol **Bagikan** (kotak dengan panah).
2. Pilih **Tambah ke Layar Utama**.

### Ingin berkas APK sungguhan? (opsional)
Gunakan <https://www.pwabuilder.com>: masukkan link GitHub Pages, lalu pilih
**Android → Generate**. Hasilnya berkas `.apk` yang dapat dibagikan langsung
(misalnya lewat WhatsApp/Google Drive) dan dipasang tanpa Play Store
(aktifkan "Izinkan dari sumber ini").

## Menjalankan di Komputer (pengembangan)

```bash
python python/serve.py
```
Buka <http://localhost:8000>. HP pada Wi-Fi yang sama dapat membuka alamat IP yang
ditampilkan untuk melihat tampilan, tetapi fitur **instal/offline hanya aktif di
HTTPS** (GitHub Pages) atau `localhost`.
