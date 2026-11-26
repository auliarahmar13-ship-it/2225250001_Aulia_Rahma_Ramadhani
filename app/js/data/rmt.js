// Fondasi Rigorous Mathematical Thinking (RMT) untuk DeretKu.
// Sumber: Kinard & Kozulin, "Rigorous Mathematical Thinking: Conceptual Formation in the
// Mathematics Classroom" (Cambridge University Press). Analisis & rencana: docs/08-analisis-rmt.md.
// "hlm" = halaman cetak buku (halaman PDF = hlm + 8).
//
// ISTILAH: `istilahAsli` disalin persis dari buku (diverifikasi dengan teks PDF).
// `nama` adalah TERJEMAHAN KERJA (terjemahan: 'kerja'), karena tidak tersedia terjemahan resmi
// berbahasa Indonesia di sumber proyek. Bila dosen/literatur memakai istilah lain, ubah di sini saja.
// `namaSiswa` adalah sebutan ramah siswa untuk antarmuka. `catatan` menjelaskan nuansa makna.
//
// Aturan pakai (CLAUDE.md → Aturan RMT): nama fungsi di antarmuka SELALU dari kamus ini.
// Semua teks di sini teks biasa (bukan HTML). Definisi = parafrase bebas, BUKAN salinan buku
// atau materi Instrumental Enrichment.

export const KETERANGAN_TERJEMAHAN = 'Istilah berbahasa Indonesia adalah terjemahan kerja dari buku Kinard & Kozulin. Istilah aslinya (bahasa Inggris) dicantumkan agar maknanya tidak bergeser.';

// ------------------------------------------------------------------ tingkat fungsi kognitif (Tabel 4.1, hlm. 85–88)
export const TINGKAT = [
  { id: 1, nama: 'Tingkat 1: Berpikir umum', ket: 'Dasar untuk mengamati dan memahami apa saja.', hlm: '86',
    istilahAsli: 'Level 1 - General cognitive functions for qualitative thinking',
    namaKerja: 'Fungsi kognitif umum untuk berpikir kualitatif', terjemahan: 'kerja' },
  { id: 2, nama: 'Tingkat 2: Berpikir tentang jumlah dengan teliti', ket: 'Untuk bekerja dengan angka secara tepat.', hlm: '86',
    istilahAsli: 'Level 2 - Cognitive functions for quantitative thinking with precision',
    namaKerja: 'Fungsi kognitif untuk berpikir kuantitatif dengan presisi', terjemahan: 'kerja' },
  { id: 3, nama: 'Tingkat 3: Berpikir logis matematis', ket: 'Untuk menalar, membuktikan, dan menemukan aturan.', hlm: '87–88',
    istilahAsli: 'Level 3 - Cognitive functions for generalized, logical abstract relational thinking in the mathematics culture',
    namaKerja: 'Fungsi kognitif untuk berpikir relasional abstrak, logis, dan tergeneralisasi dalam budaya matematika', terjemahan: 'kerja' },
];

// ------------------------------------------------------------------ 24 fungsi kognitif (urutan sesuai Tabel 4.1)
// kode: A = tingkat 1, B = tingkat 2, C = tingkat 3
export const FUNGSI = [
  // Tingkat 1
  { kode: 'A1', tingkat: 1, ikon: '🏷️', istilahAsli: 'Labeling-visualizing', terjemahan: 'kerja',
    nama: 'Melabeli–memvisualkan', namaSiswa: 'Memberi nama & membayangkan',
    definisi: 'Memberi nama sesuatu berdasarkan ciri pentingnya sambil membayangkan bentuknya di pikiran, dan sebaliknya membayangkan bendanya saat mendengar namanya.',
    contoh: 'Menyebut 3 sebagai suku pertama (a) dan membayangkan barisannya.', hlm: '86' },
  { kode: 'A2', tingkat: 1, ikon: '⚖️', istilahAsli: 'Comparing', terjemahan: 'kerja',
    nama: 'Membandingkan', namaSiswa: 'Membandingkan',
    definisi: 'Mencari persamaan dan perbedaan antara dua benda, kejadian, atau keadaan atau lebih.',
    contoh: 'Membandingkan suku-suku yang berurutan: 7 dengan 3, lalu 11 dengan 7.', hlm: '86' },
  { kode: 'A3', tingkat: 1, ikon: '🔍', istilahAsli: 'Searching systematically to gather clear and complete information', terjemahan: 'kerja',
    nama: 'Mencari secara sistematis untuk mengumpulkan informasi yang jelas dan lengkap', namaSiswa: 'Mencari dengan teratur',
    definisi: 'Mencari dengan tujuan, teratur, dan terencana agar informasi yang terkumpul jelas dan lengkap.',
    contoh: 'Memeriksa SEMUA selisih, bukan hanya selisih pertama.', hlm: '86' },
  { kode: 'A4', tingkat: 1, ikon: '🧩', istilahAsli: 'Using more than one source of information', terjemahan: 'kerja',
    nama: 'Memakai lebih dari satu sumber informasi', namaSiswa: 'Memakai beberapa informasi sekaligus',
    definisi: 'Memikirkan dua konsep atau lebih pada saat yang sama, atau melihat keadaan dari lebih dari satu sudut pandang.',
    contoh: 'Memakai a, b, dan n bersama-sama untuk mencari Uₙ.', hlm: '86' },
  { kode: 'A5', tingkat: 1, ikon: '🔣', istilahAsli: 'Encoding-decoding', terjemahan: 'kerja',
    nama: 'Menyandi–membaca sandi', namaSiswa: 'Menulis & membaca simbol',
    definisi: 'Memasukkan makna ke dalam kode (simbol atau tanda) dan mengeluarkan makna dari kode.',
    contoh: 'Membaca Uₙ = a + (n − 1)b sebagai kalimat yang bermakna.', hlm: '86',
    catatan: 'Padanan lain yang sering dipakai: mengode–mendekode.' },

  // Tingkat 2
  { kode: 'B1', tingkat: 2, ikon: '📌', istilahAsli: 'Conserving constancy', terjemahan: 'kerja',
    nama: 'Konservasi keajekan', namaSiswa: 'Mencari yang tetap',
    definisi: 'Mengenali dan menjelaskan apa yang tetap sama (ciri, konsep, atau hubungan) ketika hal-hal lain berubah.',
    contoh: 'Sukunya terus berubah, tetapi bedanya selalu 4.', hlm: '86',
    catatan: '"Conserving" bermakna mengenali sesuatu yang tetap/invarian (seperti istilah konservasi pada Piaget), BUKAN "mempertahankan" atau "menjaga".' },
  { kode: 'B2', tingkat: 2, ikon: '📏', istilahAsli: 'Quantifying space and spatial relationships', terjemahan: 'kerja',
    nama: 'Mengkuantifikasi ruang dan hubungan spasial', namaSiswa: 'Mengukur jarak & tempat',
    definisi: 'Memakai sistem acuan (di dalam diri atau di luar) untuk mengatur, menganalisis, dan mengukur ruang berdasarkan hubungan keseluruhan dan bagian.',
    contoh: 'Melihat lompatan yang sama panjang pada garis bilangan.', hlm: '86' },
  { kode: 'B3', tingkat: 2, ikon: '📅', istilahAsli: 'Quantifying time and temporal relationships', terjemahan: 'kerja',
    nama: 'Mengkuantifikasi waktu dan hubungan temporal', namaSiswa: 'Mengukur & mengurutkan waktu',
    definisi: 'Membuat acuan untuk mengelompokkan, mengukur, dan mengurutkan waktu berdasarkan hubungan keseluruhan dan bagian.',
    contoh: 'Tabungan minggu ke-1, ke-2, ke-3, dan seterusnya.', hlm: '86' },
  { kode: 'B4', tingkat: 2, ikon: '🧱', istilahAsli: 'Analyzing-integrating', terjemahan: 'kerja',
    nama: 'Menganalisis–mengintegrasikan', namaSiswa: 'Mengurai & menggabungkan',
    definisi: 'Memecah keseluruhan atau suatu jumlah menjadi bagian-bagiannya, dan menyusun keseluruhan dengan menggabungkan bagian-bagian itu.',
    contoh: 'Sₙ adalah gabungan dari semua suku; cara Gauss memasangkan suku.', hlm: '86' },
  { kode: 'B5', tingkat: 2, ikon: '🌐', istilahAsli: 'Generalizing', terjemahan: 'kerja',
    nama: 'Menggeneralisasi', namaSiswa: 'Membuat aturan umum',
    definisi: 'Mengamati dan menjelaskan sifat atau perilaku suatu benda atau kelompok benda tanpa merujuk pada rincian tertentu.',
    contoh: 'Dari beberapa suku, menyimpulkan "setiap suku ditambah 3".', hlm: '86' },
  { kode: 'B6', tingkat: 2, ikon: '🎯', istilahAsli: 'Being precise', terjemahan: 'kerja',
    nama: 'Bersikap presisi', namaSiswa: 'Teliti & tepat',
    definisi: 'Berusaha fokus dan tepat.',
    contoh: 'Membedakan n dengan (n − 1) dan memperhatikan tanda negatif.', hlm: '86' },

  // Tingkat 3
  { kode: 'C1', tingkat: 3, ikon: '💭', istilahAsli: 'Activating prior mathematically related knowledge', terjemahan: 'kerja',
    nama: 'Mengaktifkan pengetahuan sebelumnya yang terkait matematika', namaSiswa: 'Mengingat yang sudah dipelajari',
    definisi: 'Memanggil pengetahuan matematika yang pernah dipelajari dan mengaitkannya dengan hal yang sedang dipikirkan.',
    contoh: 'Memakai cara mencari beda saat belajar rumus suku ke-n.', hlm: '87' },
  { kode: 'C2', tingkat: 3, ikon: '🧾', istilahAsli: 'Providing and articulating mathematical logical evidence', terjemahan: 'kerja',
    nama: 'Memberikan dan mengartikulasikan bukti logis matematis', namaSiswa: 'Memberi bukti',
    definisi: 'Memberi alasan, petunjuk, dan bukti yang masuk akal secara matematis untuk mendukung pernyataan atau dugaan, sesuai aturan matematika dan konsisten secara logis.',
    contoh: '"Ini barisan aritmatika karena selisih setiap dua suku selalu 4."', hlm: '87' },
  { kode: 'C3', tingkat: 3, ikon: '❓', istilahAsli: 'Defining the problem', terjemahan: 'kerja',
    nama: 'Mendefinisikan masalah', namaSiswa: 'Memahami apa yang ditanyakan',
    definisi: 'Melihat di balik permukaan dengan menganalisis hubungan untuk menentukan dengan tepat apa yang harus dikerjakan secara matematis.',
    contoh: 'Yang ditanya satu suku (Uₙ) atau jumlah semuanya (Sₙ)?', hlm: '87' },
  { kode: 'C4', tingkat: 3, ikon: '🧪', istilahAsli: 'Inferential-hypothetical thinking', terjemahan: 'kerja',
    nama: 'Berpikir inferensial–hipotetis', namaSiswa: 'Menduga lalu menguji',
    definisi: 'Membuat dugaan matematis lalu mencari bukti logis untuk menerima atau menolaknya.',
    contoh: '"Kurasa suku ke-10 adalah 39." Lalu mengujinya dengan rumus.', hlm: '87' },
  { kode: 'C5', tingkat: 3, ikon: '🔗', istilahAsli: 'Projecting and restructuring relationships', terjemahan: 'kerja',
    nama: 'Memproyeksikan dan menata ulang hubungan', namaSiswa: 'Menghubungkan hal yang terpisah',
    definisi: 'Membentuk hubungan antara hal-hal yang tampak terpisah, dan menata ulang hubungan yang sudah ada untuk memecahkan masalah baru.',
    contoh: 'Mengenali barisan aritmatika di dalam cerita tabungan.', hlm: '87',
    catatan: '"Projecting" bermakna menarik/membayangkan hubungan yang belum tampak (virtual) di antara objek (lihat hlm. 10).' },
  { kode: 'C6', tingkat: 3, ikon: '➗', istilahAsli: 'Forming proportional quantitative relationships', terjemahan: 'kerja',
    nama: 'Membentuk hubungan kuantitatif proporsional', namaSiswa: 'Melihat hubungan kelipatan',
    definisi: 'Membentuk hubungan jumlah yang sebanding antara dua besaran, lalu menguji bahwa kelipatan yang sama tetap berlaku.',
    contoh: 'Jika 1 langkah menambah 3, maka 5 langkah menambah 15.', hlm: '87' },
  { kode: 'C7', tingkat: 3, ikon: '🔄', istilahAsli: 'Forming a functional relationship', terjemahan: 'kerja',
    nama: 'Membentuk hubungan fungsional', namaSiswa: 'Melihat dua hal yang berubah bersama',
    definisi: 'Menghubungkan dua hal atau lebih yang nilainya berubah dan saling bergantung.',
    contoh: 'Nilai Uₙ bergantung pada urutan suku n.', hlm: '87' },
  { kode: 'C8', tingkat: 3, ikon: '👣', istilahAsli: 'Forming a unit functional relationship', terjemahan: 'kerja',
    nama: 'Membentuk hubungan fungsional satuan', namaSiswa: 'Perubahan per satu langkah',
    definisi: 'Menghubungkan besar perubahan variabel terikat dengan perubahan satu satuan variabel bebas.',
    contoh: 'Setiap n bertambah 1, Uₙ bertambah sebesar beda b.', hlm: '88' },
  { kode: 'C9', tingkat: 3, ikon: '🔁', istilahAsli: 'Mathematical inductive-deductive thinking', terjemahan: 'kerja',
    nama: 'Berpikir induktif–deduktif matematis', namaSiswa: 'Dari pola ke aturan, dari aturan ke contoh',
    definisi: 'Menyusun aturan atau rumus umum dari rincian yang berpola, dan memakai aturan umum itu untuk kasus tertentu.',
    contoh: 'Menemukan rumus Uₙ dari tabel, lalu memakainya untuk suku ke-50.', hlm: '88' },
  { kode: 'C10', tingkat: 3, ikon: '🪞', istilahAsli: 'Mathematical analogical thinking', terjemahan: 'kerja',
    nama: 'Berpikir analogis matematis', namaSiswa: 'Mencari kemiripan cara',
    definisi: 'Memetakan hubungan dari struktur yang sudah dipahami ke struktur baru untuk memahami hal baru.',
    contoh: 'Memakai cara Gauss (1 + … + 100) untuk deret lain.', hlm: '88' },
  { kode: 'C11', tingkat: 3, ikon: '🧠', istilahAsli: 'Mathematical syllogistic thinking', terjemahan: 'kerja',
    nama: 'Berpikir silogistik matematis', namaSiswa: 'Menyimpulkan dari dua pernyataan',
    definisi: 'Dari hubungan A dengan B dan hubungan A dengan C, menyimpulkan hubungan B dengan C yang sebelumnya belum diketahui.',
    contoh: 'U₃ = U₁ + 2b dan U₅ = U₁ + 4b, maka U₅ = U₃ + 2b.', hlm: '88' },
  { kode: 'C12', tingkat: 3, ikon: '🪜', istilahAsli: 'Mathematical transitive relational thinking', terjemahan: 'kerja',
    nama: 'Berpikir relasional transitif matematis', namaSiswa: 'Membandingkan urutan berantai',
    definisi: 'Dari hubungan urutan (>, <, =) antara A dan B serta antara A dan C, menyimpulkan urutan antara B dan C.',
    contoh: 'Jika U₅ > U₃ dan U₃ > U₁, maka U₅ > U₁.', hlm: '88' },
  { kode: 'C13', tingkat: 3, ikon: '📓', istilahAsli: 'Elaborating mathematical activity through cognitive categories', terjemahan: 'kerja',
    nama: 'Mengelaborasi aktivitas matematis melalui kategori kognitif', namaSiswa: 'Merenungkan cara berpikirku',
    definisi: 'Merenungkan aktivitas matematis, lalu menemukan, menamai, dan menjelaskan (lisan dan tulisan) prinsip serta fungsi kognitif yang dipakai.',
    contoh: '"Aku memakai Membandingkan untuk menemukan bedanya."', hlm: '88' },
];

// ------------------------------------------------------------------ enam konsep inti (Tabel 5.5, hlm. 120; hlm. 159)
export const KONSEP_INTI = [
  { id: 'kuantitas', istilahAsli: 'Quantity', nama: 'Kuantitas', ket: 'Berapa banyak? Jumlah, nilai, besar.', terjemahan: 'kerja' },
  { id: 'relasi', istilahAsli: 'Relationship', nama: 'Relasi', ket: 'Bagaimana dua hal saling berhubungan.', terjemahan: 'kerja' },
  { id: 'representasi', istilahAsli: 'Representation', nama: 'Representasi', ket: 'Cara menuliskan atau menggambarkan dengan simbol, tabel, atau gambar.', terjemahan: 'kerja' },
  { id: 'generalisasi', istilahAsli: 'Generalization-abstraction', nama: 'Generalisasi–abstraksi', ket: 'Aturan umum yang berlaku untuk banyak kasus.', terjemahan: 'kerja' },
  { id: 'presisi', istilahAsli: 'Precision', nama: 'Presisi', ket: 'Ketepatan dan ketelitian.', terjemahan: 'kerja' },
  { id: 'logika', istilahAsli: 'Logic/proof', nama: 'Logika/bukti', ket: 'Alasan yang masuk akal secara matematis.', terjemahan: 'kerja' },
];

// ------------------------------------------------------------------ tiga fase RMT (hlm. 123) → fitur DeretKu (docs/08 §9.1)
export const FASE = [
  { id: 1, istilahAsli: 'Phase I: Cognitive Development', nama: 'Pengembangan Kognitif', terjemahan: 'kerja', fitur: ['pemanasan'] },
  { id: 2, istilahAsli: 'Phase II: Content as Process Development', nama: 'Pengembangan Konten sebagai Proses', terjemahan: 'kerja', fitur: ['materi'] },
  { id: 3, istilahAsli: 'Phase III: Cognitive Conceptual Construction Practice', nama: 'Praktik Konstruksi Konseptual-Kognitif', terjemahan: 'kerja', fitur: ['latihan', 'literasi', 'games'] },
];

// ------------------------------------------------------------------ kriteria MLE (hlm. 8, 77–81) → dipakai Teman AI (Tahap 1)
export const KRITERIA_MLE = [
  { id: 'intensionalitas', istilahAsli: 'Intentionality/reciprocity', nama: 'Intensionalitas–resiprositas', terjemahan: 'kerja',
    ket: 'Menarik dan menjaga perhatian, membuat tugas terjangkau, dan mengajak siswa ikut menjawab.', hlm: '77–78' },
  { id: 'transendensi', istilahAsli: 'Transcendence', nama: 'Transendensi', terjemahan: 'kerja',
    ket: 'Menghubungkan pelajaran saat ini dengan prinsip yang lebih umum dan situasi lain.', hlm: '78–80' },
  { id: 'makna', istilahAsli: 'Mediation of meaning', nama: 'Mediasi makna', terjemahan: 'kerja',
    ket: 'Menjelaskan mengapa sebuah langkah perlu dilakukan.', hlm: '80–81' },
  { id: 'rasa-mampu', istilahAsli: 'Mediation of the feeling of competence', nama: 'Mediasi rasa mampu', terjemahan: 'kerja',
    ket: 'Menunjukkan bagian yang sudah benar dan alasannya, sebagai pijakan langkah berikutnya.', hlm: '81' },
];

// ------------------------------------------------------------------ mediasi makna per unit (hlm. 80) → dipakai Tahap 3
export const MAKNA_UNIT = {
  u1: 'Pola membantumu menebak apa yang terjadi berikutnya tanpa harus mencoba satu per satu.',
  u2: 'Banyak hal bertambah dengan tetap, seperti tabungan atau barisan kursi. Mengenalinya membuatmu bisa berhitung dengan rapi.',
  u3: 'Dengan rumus suku ke-n, kamu bisa langsung tahu suku ke-50 atau ke-100 tanpa menulis semuanya.',
  u4: 'Rumus deret membantumu menghitung total, misalnya total tabungan berbulan-bulan, dengan cepat dan tepat.',
};

// Fungsi kognitif utama yang dilatih tiap unit (rencana Tahap 3; boleh disesuaikan)
export const FUNGSI_UNIT = {
  u1: ['A2', 'A3', 'B1', 'B5'],
  u2: ['A1', 'A5', 'B1', 'B6'],
  u3: ['C1', 'C7', 'C8', 'C9'],
  u4: ['B4', 'C2', 'C10'],
};

// Latihan (Tahap 2): fungsi kognitif tiap langkah dan tiap jenis soal
export const FUNGSI_LANGKAH = {
  ditanya: 'C3', // "Apa yang ditanyakan?" → mendefinisikan masalah (hlm. 87, 92, 137)
  bukti: 'C2',   // "Buktikan" → bukti logis matematis (hlm. 87, 166)
};
export const FUNGSI_LATIHAN = {
  beda: 'B1',        // beda tetap di antara suku yang berubah → konservasi keajekan
  berikutnya: 'B5',  // memakai aturan umum "+b" untuk suku baru → menggeneralisasi
  'suku-n': 'C9',    // dari aturan umum Uₙ ke kasus khusus → induktif–deduktif
  'cari-n': 'C5',    // menata ulang hubungan Uₙ = a + (n − 1)b untuk mencari n
  jumlah: 'B4',      // Sₙ = gabungan semua suku → menganalisis–mengintegrasikan
};

// Literasi (Tahap 5): fungsi kognitif tiap tahap PISA (docs/08 §9.3 Tahap 5)
export const FUNGSI_LITERASI = {
  Memahami: ['A3', 'C3'],     // mencari informasi lengkap & mendefinisikan masalah
  Merumuskan: ['A5', 'C9'],   // menyandi ke simbol & memilih aturan umum (rumus)
  Menghitung: ['B6'],         // bersikap presisi
  Menafsirkan: ['C2', 'C5'],  // bukti logis & menghubungkan jawaban ke cerita
};

// Games (Tahap 6): refleksi strategi di layar akhir (refleksi, hlm. 8; C13 hlm. 88).
// fungsi: [] = strategi tanpa penalaran (mis. menebak) → umpan balik memediasi makna, bukan menyalahkan.
export const REFLEKSI_GAME = {
  balon: [
    { teks: 'Aku mencari beda (selisih) dulu, lalu menghitung suku yang hilang', fungsi: ['A2', 'B1'] },
    { teks: 'Aku memeriksa semua suku supaya yakin polanya tetap', fungsi: ['A3', 'B1'] },
    { teks: 'Aku menebak dengan cepat tanpa menghitung', fungsi: [] },
  ],
  katak: [
    { teks: 'Aku melihat lompatannya selalu sama panjang di garis bilangan', fungsi: ['B2', 'B1'] },
    { teks: 'Aku menghitung posisi dengan aturan a + (n − 1)b', fungsi: ['C9'] },
    { teks: 'Aku mencoba-coba sampai katak mendarat', fungsi: [] },
  ],
  susun: [
    { teks: 'Aku membandingkan selisih setiap pasangan balok', fungsi: ['A2', 'A3'] },
    { teks: 'Aku mencari balok yang membuat selisihnya tidak tetap', fungsi: ['B1', 'C4'] },
    { teks: 'Aku memilih balok yang angkanya terlihat paling aneh', fungsi: [] },
  ],
};

export function cariFungsi(kode) { return FUNGSI.find((f) => f.kode === kode) || null; }
export function fungsiTingkat(tingkat) { return FUNGSI.filter((f) => f.tingkat === tingkat); }
