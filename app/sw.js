// Service worker DeretKu: membuat aplikasi bisa dipasang dan berjalan offline.
// NAIKKAN CACHE_VERSION setiap kali ada perubahan file di folder app/.

const CACHE_VERSION = 'deretku-v1.2.0';

const ASET = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/state.js',
  'js/audio.js',
  'js/ui.js',
  'js/pasang.js',
  'js/generator.js',
  'js/data/materi.js',
  'js/data/literasi.js',
  'js/views/beranda.js',
  'js/views/materi.js',
  'js/views/latihan.js',
  'js/views/kuis.js',
  'js/views/literasi.js',
  'js/views/saya.js',
  'js/views/games.js',
  'js/maskot.js',
  'js/ilustrasi.js',
  'js/dunia.js',
  'fonts/fredoka-latin.woff2',
  'js/games/umum.js',
  'js/games/balon.js',
  'js/games/katak.js',
  'js/games/susun.js',
  'data/bank-soal.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(ASET)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Navigasi halaman → selalu index.html dari cache (aplikasi satu halaman)
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then((r) => r || fetch(req)));
    return;
  }
  // Aset: cache dulu, lalu jaringan (dan simpan salinannya)
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res.ok) {
        const salin = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, salin));
      }
      return res;
    })),
  );
});
