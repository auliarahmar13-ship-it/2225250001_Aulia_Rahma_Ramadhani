# 08 — Analisis Model Rigorous Mathematical Thinking (RMT) untuk DeretKu

Dokumen ini menganalisis model pembelajaran **Rigorous Mathematical Thinking (RMT)** sesuai
sumber yang diwajibkan dosen, menilai kesesuaian DeretKu versi saat ini (v1.4, dengan Teman AI),
dan menyusun rencana implementasi RMT secara bertahap pada seluruh fitur pembelajaran.

## 0. Sumber dan Cara Verifikasi

| Aspek | Keterangan |
|---|---|
| Sumber | Kinard, J. T., & Kozulin, A. *Rigorous Mathematical Thinking: Conceptual Formation in the Mathematics Classroom*. Cambridge University Press. |
| Berkas | `docs/rmt/RIGOROUS MATHEMATICAL THINKING.pdf` (217 halaman PDF). **Tidak diunggah ke GitHub** (`docs/rmt/` ada di `.gitignore`) karena berhak cipta. |
| Penomoran | Semua rujukan memakai **nomor halaman cetak buku** ("hlm."). Di penampil PDF: **halaman PDF = halaman buku + 8**. |
| Bagian yang dibaca utuh | Pendahuluan (hlm. 1–15); ZPD & asesmen dinamis (58–61); MLE & fungsi kognitif (76–92); alat psikologis & proses RMT (107–126); dialog mediator (137–143); tabel sebagai alat (152–154); penerapan & asesmen (159–167); *progressions* (183–186); Kesimpulan (193–196). |
| Bagian yang hanya ditelusuri | Bab 1 (sejarah budaya matematika), Bab 2 (kebijakan pendidikan AS), vinyet pecahan & aljabar lain di Bab 5, data penelitian lain di Bab 6. Tidak dikutip di dokumen ini. |
| Verifikasi | Teks PDF diekstrak, lalu **61 frasa kunci** dicocokkan otomatis dengan halaman yang dirujuk: **61/61 cocok** (lihat Lampiran A). |

Kutipan berbahasa Inggris diterjemahkan bebas ke Bahasa Indonesia. Bagian bertanda
**[Sintesis]** adalah pendapat penulis aplikasi, bukan isi buku.

---

## 1. Pengertian RMT

- RMT dibangun di atas dua landasan teori: **teori alat psikologis Vygotsky** dan **teori
  pengalaman belajar termediasi (Mediated Learning Experience, MLE) Feuerstein** (hlm. 2, 193).
- **Rigor mental** adalah kualitas berpikir yang muncul ketika keterlibatan kritis siswa didorong
  oleh keinginan yang kuat, gigih, dan tidak mudah goyah untuk mengetahui dan memahami secara
  mendalam. Cirinya: fokus dan persepsi yang tajam; definisi yang jelas dan lengkap; pemilahan
  atribut penting; presisi; akurasi; dan kedalaman pemahaman (hlm. 4, 123).
- Pemikir yang rigor memiliki dua komponen (hlm. 124):
  1. **Disposisi**: gigih menghadapi tantangan dan kompleksitas, termotivasi dan berdisiplin untuk
     bertahan dalam perjuangan yang berorientasi tujuan.
  2. **Kualitas**: ketajaman fokus, kejelasan definisi, presisi, akurasi, kedalaman pemahaman.
- **Tiga syarat** agar sebuah tindakan di kelas disebut aktivitas belajar matematika. Ketiganya
  wajib terpenuhi (hlm. 2–3; diulang hlm. 124):
  1. menghasilkan **perubahan struktural** dalam pemahaman siswa;
  2. menjadi bagian dari **proses sistemik membangun konsep**;
  3. memperkenalkan siswa pada **bahasa dan aturan budaya matematika**.
- Pengetahuan matematika ada pada **tiga tingkat**: prosedur dan operasi, konsep, dan
  wawasan (*insight*) (hlm. 3).
- Contoh soal "umur kapten" (26 domba dan 10 kambing di kapal, berapa umur kaptennya?)
  menunjukkan bahwa kesulitan siswa sering bukan pada pengetahuan matematika, tetapi pada
  **fungsi kognitif umum** seperti orientasi terhadap data dan perumusan masalah (hlm. 1).

## 2. Prinsip-Prinsip RMT

| No | Prinsip | Isi menurut sumber | Hlm. |
|---|---|---|---|
| P1 | Alat psikologis umum | Pengodean, daftar, tabel, rencana, gambar. Sekolah sering menganggap alat ini dikuasai siswa dengan sendirinya. | 6–7 |
| P2 | Alat psikologis khas matematika | Sistem nilai tempat, **garis bilangan**, **tabel**, bidang koordinat x-y, persamaan, dan **bahasa matematika**. | 3, 11, 194 |
| P3 | Alat, bukan sekadar "representasi" | Garis bilangan dan representasi lain harus diajarkan sebagai **instrumen aktif** untuk analisis, perencanaan, dan refleksi. Bila hanya disajikan sebagai informasi, siswa menerimanya secara pasif. Istilah *symbolic tools* dianggap lebih tepat daripada *representation*. | 58, 108–109 |
| P4 | Struktur menentukan fungsi | Setiap alat punya struktur unik yang menentukan kegunaannya. Siswa perlu memahami hubungan struktur–fungsi itu. | 11, 108 |
| P5 | Proses, bukan produk | Pembelajaran yang lazim menyajikan konsep jadi lalu demonstrasi algoritmik dan soal penerapan. RMT menekankan proses penalaran matematis. | 4, 92, 107 |
| P6 | Inti aktivitas belajar | **Analisis tugas, perencanaan tindakan, dan refleksi**. Refleksi menjadi "ciri khas". | 8 |
| P7 | Internalisasi | Alat eksternal harus menjadi alat batin. Contoh: siswa memakai garis bilangan "di kepala" (hlm. 166). | 58, 166, 194 |
| P8 | Mediasi | Fungsi kognitif dibentuk melalui pemerolehan, internalisasi, dan pemakaian alat psikologis dengan dinamika interaksi MLE. | 8 |
| P9 | Enam konsep inti | Kuantitas, relasi, representasi, generalisasi-abstraksi, presisi, logika/bukti. | 120, 159 |
| P10 | Dari konsep sehari-hari ke konsep ilmiah | Konsep sehari-hari kaya pengalaman tetapi episodik. Mediasi menghubungkannya dengan konsep "ilmiah" yang sistemik. | 85, 89 |

## 3. Tahapan Pembelajaran RMT: 3 Fase, 6 Langkah (hlm. 123)

| Fase | Langkah | Isi |
|---|---|---|
| **I. Pengembangan Kognitif** (*Cognitive Development*) | 1 | Siswa dimediasi untuk memakai model dalam tugas kognitif sebagai **alat psikologis umum**, berdasarkan hubungan struktur–fungsinya. |
| | 2 | Siswa dimediasi untuk mengerjakan tugas kognitif dengan alat tersebut guna membangun proses kognitif tingkat tinggi. |
| **II. Konten sebagai Proses** (*Content as Process Development*) | 3 | Siswa dimediasi untuk membangun konsep dasar matematika dari **pengalaman dan bahasa sehari-hari**. |
| | 4 | Siswa dimediasi untuk **menemukan dan merumuskan pola serta relasi** matematis dalam latihan kognitif. |
| | 5 | Siswa dimediasi untuk menguasai **alat khas matematika** (nilai tempat, garis bilangan, tabel, bidang x-y, bahasa matematika). |
| **III. Praktik Konstruksi Konseptual-Kognitif** (*Cognitive Conceptual Construction Practice*) | 6 | Siswa dimediasi untuk berlatih memakai setiap alat khas matematika guna mengatur fungsi kognitif dan membangun pemahaman konsep. |

Catatan dari sumber:
- Fase dan langkah **tidak berjalan kaku dan linear**, tetapi semuanya penting (hlm. 122, 124).
- Selama proses, sifat rigor terus dibangkitkan, dengan aktivitas metakognitif yang tinggi (hlm. 123).

**Perencanaan pembelajaran RMT** (hlm. 124–125, 160–161):
1. Analisis struktur konsep besar, lalu susun komponennya dari yang paling dasar ke yang paling kompleks.
2. Pilih fungsi kognitif terpenting untuk tiap komponen.
3. Pilih tugas kognitif beserta artefak simboliknya. Rencanakan penerapan kriteria MLE.
4. Tentukan konsep inti. Rencanakan cara membangunnya dari konsep dan bahasa sehari-hari.
5. Rencanakan penguasaan alat khas matematika dan kesempatan berlatih.
6. Rancang asesmen dan evaluasi **sebelum** rencana dijalankan (hlm. 161).

Pertanyaan reflektif guru saat merencanakan (hlm. 160–161), antara lain: apa yang saya ketahui
tentang kelas dan tiap siswa; apa niat saya dan bagaimana siswa ikut berbagi niat itu; fungsi
kognitif apa yang selaras dengan konsep inti mana; bagaimana mengukur pertumbuhan kognitif; apa
yang dilakukan bila siswa kesulitan; kriteria MLE apa yang dibutuhkan; dan bagaimana menilai tugas.

## 4. Fungsi Kognitif

Fungsi kognitif adalah tindakan berpikir yang spesifik dan disengaja, dilakukan dengan kesadaran
dan niat (hlm. 9). Setiap fungsi memiliki tiga komponen (hlm. 9, 85, 120):
- **Konseptual**: "kemudi" yang mendefinisikan sifat tindakan.
- **Aksi**: tindakan mental yang dilakukan.
- **Motivasional**: kesadaran akan manfaat tindakan, dibangun lewat mediasi makna dan rasa mampu.

Tabel 4.1 membagi fungsi kognitif menjadi tiga tingkat (hlm. 85–88). Kolom **Istilah asli** disalin
persis dari buku dan sudah diverifikasi dengan teks PDF. Kolom **Terjemahan kerja** adalah
terjemahan penulis, karena sumber proyek tidak menyediakan terjemahan resmi berbahasa Indonesia
(lihat §4.1). Definisinya diparafrasekan bebas.

### Tingkat 1: *General cognitive functions for qualitative thinking* (hlm. 86)

| Kode | Istilah asli | Terjemahan kerja | Definisi (ringkas) | Kaitan dengan barisan/deret |
|---|---|---|---|---|
| A1 | *Labeling-visualizing* | Melabeli–memvisualkan | Memberi nama berdasarkan atribut penting sambil membentuk gambaran di pikiran, dan sebaliknya | Menamai a, b, n, Uₙ, Sₙ dan membayangkan barisannya |
| A2 | *Comparing* | Membandingkan | Mencari persamaan dan perbedaan dua objek/kejadian atau lebih | Membandingkan suku-suku berurutan |
| A3 | *Searching systematically to gather clear and complete information* | Mencari secara sistematis untuk mengumpulkan informasi yang jelas dan lengkap | Mencari dengan tujuan, teratur, dan terencana | Memeriksa semua selisih, bukan hanya satu |
| A4 | *Using more than one source of information* | Memakai lebih dari satu sumber informasi | Mengolah dua konsep atau lebih sekaligus, atau melihat dari lebih dari satu sudut | Memakai a, b, dan n bersamaan; teks dan visual |
| A5 | *Encoding-decoding* | Menyandi–membaca sandi | Memasukkan makna ke dalam kode (simbol) dan mengeluarkannya | Membaca dan menulis Uₙ = a + (n − 1)b |

### Tingkat 2: *Cognitive functions for quantitative thinking with precision* (hlm. 86)

| Kode | Istilah asli | Terjemahan kerja | Definisi (ringkas) | Kaitan dengan barisan/deret |
|---|---|---|---|---|
| B1 | *Conserving constancy* | **Konservasi keajekan** | Mengenali apa yang tetap sementara hal lain berubah | **Beda b tetap** sementara sukunya berubah: inti barisan aritmatika |
| B2 | *Quantifying space and spatial relationships* | Mengkuantifikasi ruang dan hubungan spasial | Memakai sistem acuan untuk mengukur ruang berdasarkan hubungan bagian–keseluruhan | Lompatan sama panjang pada garis bilangan |
| B3 | *Quantifying time and temporal relationships* | Mengkuantifikasi waktu dan hubungan temporal | Membuat acuan untuk mengurutkan dan mengukur waktu | Konteks mingguan atau bulanan (tabungan, jadwal) |
| B4 | *Analyzing-integrating* | Menganalisis–mengintegrasikan | Mengurai keseluruhan menjadi bagian dan menyusun keseluruhan dari bagian | Sₙ sebagai jumlah suku; pasangan Gauss |
| B5 | *Generalizing* | Menggeneralisasi | Mengamati dan menjelaskan sifat suatu objek atau kelompok tanpa merujuk ke rincian | Dari beberapa suku ke aturan umum |
| B6 | *Being precise* | Bersikap presisi | Berusaha fokus dan tepat | Membedakan n dan (n − 1), tanda negatif |

### Tingkat 3: *Cognitive functions for generalized, logical abstract relational thinking in the mathematics culture* (hlm. 87–88)

| Kode | Istilah asli | Terjemahan kerja | Definisi (ringkas) | Kaitan dengan barisan/deret |
|---|---|---|---|---|
| C1 | *Activating prior mathematically related knowledge* | Mengaktifkan pengetahuan sebelumnya yang terkait matematika | Memanggil pengalaman lalu untuk dikaitkan dengan masalah sekarang | Memakai konsep pola (u1) di u2–u4 |
| C2 | *Providing and articulating mathematical logical evidence* | **Memberikan dan mengartikulasikan bukti logis matematis** | Memberi rincian, petunjuk, dan bukti yang masuk akal secara matematis untuk mendukung pernyataan | "Ini aritmatika karena selisihnya selalu 4" |
| C3 | *Defining the problem* | **Mendefinisikan masalah** | Melihat di balik permukaan untuk menentukan dengan tepat apa yang harus dikerjakan | Membedakan pertanyaan Uₙ (satu suku) dan Sₙ (total) |
| C4 | *Inferential-hypothetical thinking* | Berpikir inferensial–hipotetis | Membuat dugaan dan mencari bukti untuk mendukung atau menolaknya | "Jika b = 3, suku ke-10 adalah …; cek dengan menghitung" |
| C5 | *Projecting and restructuring relationships* | Memproyeksikan dan menata ulang hubungan | Menghubungkan hal yang tampak terpisah dan menata ulang hubungan untuk masalah baru | Mengenali barisan dalam cerita literasi |
| C6 | *Forming proportional quantitative relationships* | Membentuk hubungan kuantitatif proporsional | Hubungan korespondensi kuantitatif antara dua besaran | Hubungan banyak langkah dan total kenaikan |
| C7 | *Forming a functional relationship* | Membentuk hubungan fungsional | Menghubungkan dua hal yang berubah secara saling bergantung | Uₙ bergantung pada n |
| C8 | *Forming a unit functional relationship* | **Membentuk hubungan fungsional satuan** | Perubahan variabel terikat akibat **satu satuan** perubahan variabel bebas | b = perubahan Uₙ untuk setiap kenaikan n sebesar 1 |
| C9 | *Mathematical inductive-deductive thinking* | Berpikir induktif–deduktif matematis | Dari rincian yang berpola ke aturan umum, dan dari aturan umum ke kasus khusus | Menurunkan rumus Uₙ, lalu menerapkannya |
| C10 | *Mathematical analogical thinking* | Berpikir analogis matematis | Memetakan struktur yang sudah dipahami ke struktur baru | Cara Gauss untuk 1 + … + 100 ke deret lain |
| C11 | *Mathematical syllogistic thinking* | Berpikir silogistik matematis | Dari relasi A–B dan A–C menyimpulkan relasi B–C | U₃ = U₁ + 2b dan U₅ = U₁ + 4b, maka U₅ = U₃ + 2b |
| C12 | *Mathematical transitive relational thinking* | Berpikir relasional transitif matematis | Dari urutan A–B dan A–C menyimpulkan urutan B–C | Membandingkan urutan suku-suku |
| C13 | *Elaborating mathematical activity through cognitive categories* | **Mengelaborasi aktivitas matematis melalui kategori kognitif** | Merefleksikan aktivitas, lalu menemukan, menamai, dan mengartikulasikan prinsip secara lisan dan tertulis dengan bahasa matematika dan nama fungsi kognitif | Menulis refleksi: "Aku memakai *membandingkan* untuk menemukan b" |

### 4.1 Status terjemahan dan catatan makna

- **Tidak ada terjemahan resmi** berbahasa Indonesia di sumber proyek (`docs/rmt/` hanya berisi
  buku berbahasa Inggris). Semua istilah Indonesia di dokumen ini dan di aplikasi adalah
  **terjemahan kerja** penulis. Kalau dosen atau literatur rujukan berbahasa Indonesia memakai
  istilah lain, cukup ubah di `app/js/data/rmt.js`.
- Antarmuka siswa memakai **nama ramah siswa** (`namaSiswa`, mis. "Mencari yang tetap" untuk B1),
  dengan istilah kerja dan istilah asli tetap ditampilkan di Kamus Fungsi Berpikir (halaman Saya).
- Istilah yang rawan bergeser makna:
  - **B1 *Conserving constancy***: "conserving" bermakna **mengenali sesuatu yang tetap (invarian)**
    seperti istilah *konservasi* pada Piaget, **bukan** "mempertahankan" atau "menjaga".
    Terjemahan awal ("mempertahankan …") sudah diganti menjadi "konservasi keajekan".
  - **C5 *Projecting***: bermakna **menarik atau membayangkan hubungan yang belum tampak (virtual)**
    di antara objek (hlm. 10), bukan "memproyeksikan gambar".
  - **A5 *Encoding-decoding***: padanan lain yang lazim adalah "mengode–mendekode".
- Istilah lain yang dipakai di dokumen ini:

| Istilah asli | Terjemahan kerja | Hlm. |
|---|---|---|
| *Rigorous Mathematical Thinking* | Berpikir Matematis yang Rigor (nama model tetap ditulis RMT) | 2 |
| *Mediated Learning Experience (MLE)* | Pengalaman belajar termediasi | 8, 77 |
| *Intentionality/reciprocity* | Intensionalitas–resiprositas | 8, 77 |
| *Transcendence* | Transendensi | 8, 78 |
| *Mediation of meaning* | Mediasi makna | 8, 80 |
| *Mediation of the feeling of competence* | Mediasi rasa mampu | 81 |
| *Psychological tools* / *mathematically specific psychological tools* | Alat psikologis / alat psikologis khas matematika | 3, 6, 107 |
| *Phase I: Cognitive Development* | Fase I: Pengembangan Kognitif | 123 |
| *Phase II: Content as Process Development* | Fase II: Pengembangan Konten sebagai Proses | 123 |
| *Phase III: Cognitive Conceptual Construction Practice* | Fase III: Praktik Konstruksi Konseptual-Kognitif | 123 |
| *Quantity, Relationship, Representation, Generalization-abstraction, Precision, Logic/proof* | Kuantitas, Relasi, Representasi, Generalisasi–abstraksi, Presisi, Logika/bukti | 120 |
| *Dynamic assessment* ("sandwich" / "cake") | Asesmen dinamis (format "sandwich" / "cake") | 60 |
| *Instrumental Enrichment (IE)* | (nama program, tidak diterjemahkan) | 9 |

**Rujukan langsung ke materi barisan di dalam buku:**
- Barisan **2, 5, 8, 11, 14, 17** dengan rumus Xₙ₊₁ = Xₙ + 3, sebagai contoh berpikir analogis lintas modalitas (Gambar 5.1, hlm. 110).
- Unit *Numerical Progressions* dipakai untuk membangun pemahaman kemiringan sebagai perubahan variabel terikat akibat perubahan variabel bebas (hlm. 10, 13).
- Tabel y = 3x + 4 dengan kolom perubahan x, perubahan y, dan **relasi fungsional satuan** yang tetap 3, sebagai bukti logis bahwa fungsinya linear (Tabel 5.7, hlm. 154).
- Siswa menyusun **barisan**, lalu **relasi dalam barisan** (selisih), lalu **"relasi antar-relasi"** (selisih dari selisih), sampai menemukan percepatan yang tetap (hlm. 183–186).

## 5. Peran Mediator

### 5.1 Kriteria MLE

| Kriteria | Isi menurut sumber | Hlm. |
|---|---|---|
| **Intensionalitas–resiprositas** | Mediator terus menyesuaikan perilakunya untuk menarik dan menjaga perhatian anak, membuat tugas terjangkau, dan menyadarkan anak bahwa interaksi ini disengaja. Penyajian "karena begitu tertulis di buku" adalah contoh tidak adanya intensionalitas. | 77–78 |
| **Transendensi** | Interaksi diperluas melampaui situasi "di sini dan saat ini" ke sistem, kategori, dan prinsip yang lebih luas. Contoh negatif: siswa yang hanya diajari memilih rumus dan memasukkan angka tidak akan terbantu di topik lain. Transfer tidak terjadi dengan sendirinya. | 78–80 |
| **Mediasi makna** | Menjawab pertanyaan *mengapa*. Jawaban "karena ada di kurikulum" tidak bermakna. Siswa perlu memahami motivasi setiap langkah dan alasan suatu unsur berada di posisinya dalam struktur pengetahuan. | 80–81 |
| **Mediasi rasa mampu** (kriteria tambahan) | Mediator menyoroti aspek positif kinerja siswa, menjelaskan *mengapa* bagian itu benar, dan memakainya sebagai pijakan memperbaiki bagian lain. | 81 |

Pendekatan RMT mengisi **semua** interaksi guru dan siswa dengan intensionalitas, transendensi,
dan makna. Ada dua sasaran (hlm. 81): (1) fungsi kognitif umum yang efisien, dan (2) penguasaan
alat psikologis khas matematika.

### 5.2 Tugas mediator

- Guru RMT adalah "**pertama-tama seorang mediator**" (hlm. 160).
- Mediator menuntun siswa agar makin **sadar akan tindakan pemecahan masalahnya** sambil
  membantu di titik-titik sulit (hlm. 92).
- Mediator tidak menganggap fungsi kognitif siswa sudah ada. Ia **menggali status kognitif siswa**,
  mengajar secara konseptual (bukan hanya prosedural), dan melibatkan siswa secara aktif tanpa
  mengorbankan rigor (hlm. 195). Ia peka terhadap kebutuhan kognitif siswa (hlm. 194).
- Kegiatan yang dimediasi (hlm. 12):
  1. Mendefinisikan masalah.
  2. Menganalisis alat dan atribut pentingnya.
  3. Menghubungkan alat dengan masalah.
  4. Memakai alat.
  5. **Mengidentifikasi dan mendefinisikan fungsi kognitif yang dipakai**.
  6. **Berbagi dan merefleksikan strategi** serta tantangannya.
  7. Menemukan prinsip yang mendasari.

### 5.3 Repertoar pertanyaan mediator (dari dialog kelas dalam buku)

| Pola | Contoh di sumber | Hlm. |
|---|---|---|
| Mendefinisikan masalah lebih dulu | "Apa keseluruhannya (*the whole*)?" sebelum menghitung pecahan; "jangan selesaikan dulu" | 137 |
| Menuntut bahasa yang presisi | "Berikan jawaban yang lengkap dan tepat" | 139 |
| Meminta bukti logis | "*Can you provide me with your logical evidence?*" | 166 |
| Memparafrasekan untuk memeriksa pemahaman | "*Am I hearing you correctly? Are you saying that …*" | 142 |
| Meminta penjelasan atau cara lain | "*Explain.*" / "*Could you explain this in a different way?*" | 184–185 |
| Meminta rangkuman | "*Who can summarize all of this for us?*" | 143 |
| Memperbaiki miskonsepsi lewat diskusi | Kelompok kecil mempresentasikan hasil; mediator memediasi respons untuk memperbaiki miskonsepsi | 137 |
| Menamai fungsi kognitif & mencatatnya | "Tuliskan fungsi kognitif baru ini di **jurnal RMT**" | 152 |

## 6. Asesmen dan Evaluasi RMT

- **Yang diukur**: kemajuan pemakaian bahasa kognitif dan matematis; pemakaian pengetahuan
  sebelumnya secara sadar; berpikir strategis dan perencanaan; **disposisi terhadap rigor dan
  tantangan**; partisipasi dan keterlibatan (hlm. 166–167).
- **Tiga bentuk asesmen**: **formatif** (informal, menyatu dengan pembelajaran), **sumatif**
  (setelah pembelajaran), dan **evaluatif** (nilai, dengan mempertimbangkan formatif dan
  sumatif) (hlm. 167).
- **Instrumen yang cocok**: rubrik (terutama analitik), esai, **entri jurnal**, survei, tugas
  kinerja, studi kasus, dan **penjelasan tertulis siswa tentang cara menyelesaikan
  masalah** (hlm. 167).
- **Asesmen dinamis** (hlm. 59–60, 194–195):
  - Asesmen ini mengukur zona perkembangan proksimal, bukan hanya kemampuan saat ini.
  - **Format "sandwich"**: pretes, intervensi, lalu postes.
  - **Format "cake"**: soal diberikan satu per satu. Bila siswa salah, langsung diberi bantuan
    bertahap sampai berhasil. Banyaknya "lapisan" bantuan berbeda tiap siswa dan menunjukkan
    potensi belajar.
  - Buku menyebut asesmen dinamis **berbantuan komputer** untuk **deret bilangan** (*number series*) sebagai salah satu perkembangan di bidang matematika (hlm. 61).

---

## 7. Kesesuaian DeretKu Saat Ini dengan RMT

Penilaian: ✅ sesuai · 🟡 sebagian · ❌ belum ada.

### 7.1 Materi (`js/data/materi.js`, `js/views/materi.js`)

| Aspek RMT | Kondisi DeretKu | Nilai | Hlm. |
|---|---|---|---|
| Melabeli & menyandi (A1, A5) | Warna sinyal konsisten a/b/n/Uₙ dan notasi baku | ✅ | 86 |
| Keteguhan beda (B1) | Visual busur "+b" di antara suku | ✅ | 86 |
| Konsep dari pengalaman sehari-hari (Fase II langkah 3) | Kartu "Pola ada di sekitar kita", konteks Indonesia | ✅ | 123 |
| Tabel sebagai alat (Fase II langkah 5) | u3 memakai tabel pola sebelum rumus, tetapi tabelnya **sudah jadi** dan tidak disusun siswa | 🟡 | 152–154 |
| Proses, bukan produk | Rumus akhirnya disajikan **jadi**, lalu diikuti contoh | 🟡 | 107 |
| Mediasi makna | Hanya u3 (kartu "Masalah") yang menjelaskan *mengapa* rumus dibutuhkan | 🟡 | 80 |
| Transendensi | Belum ada jembatan ke fungsi linear, grafik, atau barisan non-aritmatika | ❌ | 78–79, 154 |
| Fase I (pengembangan kognitif) | Langsung masuk ke konten angka | ❌ | 123 |
| Menamai fungsi kognitif (C13) | Tidak pernah disebutkan kepada siswa | ❌ | 12, 88, 152 |

### 7.2 Latihan (`js/views/latihan.js`, `js/generator.js`)

| Aspek RMT | Kondisi DeretKu | Nilai | Hlm. |
|---|---|---|---|
| Asesmen dinamis "cake" | Petunjuk bertahap; jumlah petunjuk tercatat; pembahasan setelah 2 kali salah | ✅ | 60 |
| Tanpa tekanan waktu (mendukung refleksi) | Tidak ada batas waktu | ✅ | 92 |
| Umpan balik bermakna | Menjelaskan alasan, bukan hanya benar/salah | ✅ | 80 |
| Mendefinisikan masalah (C3) & perencanaan | Siswa langsung menghitung; tidak ada langkah "apa yang ditanyakan?" | ❌ | 8, 87, 92 |
| Bukti logis (C2) | Jawaban hanya angka; alasan tidak diminta | ❌ | 87, 166 |
| Refleksi strategi | Tidak ada | ❌ | 8, 12 |

### 7.3 Literasi (`js/data/literasi.js`, `js/views/literasi.js`)

| Aspek RMT | Kondisi DeretKu | Nilai | Hlm. |
|---|---|---|---|
| Analisis, perencanaan, refleksi | 4 tahap: Memahami, Merumuskan, Menghitung, Menafsirkan | ✅ | 8, 92 |
| Orientasi data & mendefinisikan masalah | Membedakan data yang termasuk barisan dan yang tidak (mis. harga sepatu), mirip soal "umur kapten" | ✅ | 1, 87 |
| Penjelasan tertulis | Semua tahap pilihan ganda; tafsiran tidak ditulis siswa | 🟡 | 167 |

### 7.4 Games (`js/games/*.js`)

| Aspek RMT | Kondisi DeretKu | Nilai | Hlm. |
|---|---|---|---|
| Garis bilangan sebagai alat | Lompat Katak: lompatan sama panjang sebesar b | ✅ | 11, 58 |
| Membandingkan & konservasi keajekan | Menara Angka: mencari "penyusup" yang merusak keajekan beda | ✅ | 86 |
| Proses & presisi | Balon Pola "makin lama makin cepat" lebih menekankan kecepatan dan produk | 🟡 | 4, 92 |
| Refleksi | Layar selesai hanya menampilkan skor dan bintang | ❌ | 8 |

### 7.5 Evaluasi (`js/views/kuis.js`, `python/analisis_statistik.py`)

| Aspek RMT | Kondisi DeretKu | Nilai | Hlm. |
|---|---|---|---|
| Sumatif | Kuis 15 soal | ✅ | 167 |
| Informasi formatif untuk guru | Deteksi miskonsepsi dan ekspor data untuk analisis Python | 🟡 | 167 |
| Instrumen kualitatif (jurnal, rubrik, penjelasan) | Belum ada | ❌ | 167 |
| Asesmen dinamis "sandwich" (pretes–postes) | Belum ada pretes | ❌ | 60 |
| Disposisi rigor | Belum diukur. Skala beban kognitif Paas mengukur hal lain. | ❌ | 166 |

### 7.6 Teman AI (`js/ai.js`, `python/gemini.py`)

| Aspek RMT | Kondisi DeretKu | Nilai | Hlm. |
|---|---|---|---|
| Intensionalitas | Petunjuk, bukan jawaban; istilah konsisten; menolak topik lain | 🟡 | 77–78 |
| Resiprositas | **Satu kali tanya-jawab tanpa ingatan percakapan**; tidak ada tanya-balik | ❌ | 77 |
| Bukti logis & parafrasa | Tidak meminta bukti; tidak memparafrasekan | ❌ | 142, 166 |
| Menamai fungsi kognitif | Tidak ada | ❌ | 12, 152 |
| Transendensi, makna, rasa mampu | Tidak diarahkan secara eksplisit | ❌ | 78–81 |

**Batasan penting:** buku memandang mediator sebagai **guru manusia** (hlm. 160, 195) dan
**tidak membahas kecerdasan buatan**. Teman AI diposisikan sebagai **alat bantu mediasi** yang
melengkapi guru, bukan menggantikannya. Peran komputer yang disebut buku hanya dalam asesmen
dinamis (hlm. 61).

---

## 8. Rekomendasi Pengembangan

| No | Rekomendasi | Fitur | Dasar (hlm.) |
|---|---|---|---|
| R1 | Teman AI sebagai mediator MLE: tanya-balik, minta bukti logis, parafrasa, menyebut fungsi kognitif, menunjukkan bagian yang sudah benar, dan menutup dengan jembatan ke prinsip umum. Dibuat multi-giliran. | Teman AI | 77–81, 92, 142, 166, 184–185 |
| R2 | Langkah **"Apa yang ditanyakan?"** (mendefinisikan masalah) sebelum menghitung, dan **"Buktikan"** (bukti logis) setelah menjawab | Latihan, Literasi | 8, 87, 92, 166 |
| R3 | Siswa **menyusun alat sendiri**: tabel interaktif (n, Uₙ, perubahan n, perubahan Uₙ, perubahan per 1) dan garis bilangan interaktif | Materi, Latihan | 58, 107–109, 152–154 |
| R4 | **Jurnal RMT**: refleksi singkat berisi fungsi kognitif yang dipakai, strategi, dan kesulitan; ikut diekspor untuk dinilai dengan rubrik | Saya, Evaluasi | 8, 12, 152, 167 |
| R5 | **Pemanasan Berpikir** (Fase I): tugas pola nonangka buatan sendiri untuk membandingkan, mencari sistematis, dan konservasi keajekan | Fitur baru | 9–10, 123 |
| R6 | **Kartu jembatan** (transendensi): Uₙ sebagai fungsi linear dari n; perbandingan dengan barisan non-aritmatika (2, 6, 18, 54); "selisih dari selisih" pada Sₙ | Materi | 78–79, 110, 154, 183–186 |
| R7 | **Mediasi makna** satu kalimat di awal setiap unit: mengapa konsep ini dibutuhkan | Materi | 80 |
| R8 | **Asesmen dinamis eksplisit**: pretes singkat dan kuis membentuk format "sandwich"; lapisan petunjuk dianalisis sebagai potensi belajar | Evaluasi, Python | 59–61, 194–195 |
| R9 | **Mode Teliti** tanpa percepatan dan **satu pertanyaan refleksi** di layar selesai games | Games | 4, 8, 92 |
| R10 | **Daftar periksa RMT** (tiga syarat aktivitas belajar matematika) di CLAUDE.md untuk setiap fitur baru | Proses pengembangan | 2–3, 124 |
| R11 | **Panduan guru-mediator** agar guru memakai aplikasi sesuai RMT | Dokumen | 160–161, 195 |

**Catatan khusus R5:** program *Instrumental Enrichment* terdiri atas 14 buklet tersendiri
(hlm. 9) dan **tidak boleh disalin**. Semua tugas Fase I di DeretKu harus buatan sendiri.

---

## 9. Rencana Implementasi RMT Bertahap

### 9.1 Pemetaan fitur DeretKu ke fase RMT

| Fase RMT (hlm. 123) | Fitur DeretKu | Perubahan utama |
|---|---|---|
| Fase I: Pengembangan Kognitif | **Pemanasan Berpikir** (baru) | Tugas pola nonangka dengan mediasi |
| Fase II: Konten sebagai Proses | **Materi** u1–u4 | Penemuan pola, tabel dan garis bilangan interaktif, makna, jembatan |
| Fase III: Praktik Konstruksi Konseptual-Kognitif | **Latihan, Literasi, Games** | Definisi masalah, bukti logis, refleksi, mode teliti |
| Asesmen formatif/sumatif/evaluatif/dinamis (hlm. 60, 167) | **Pretes, Kuis, Jurnal, analisis Python** | Format "sandwich", lapisan bantuan, rubrik |
| Mediasi MLE (hlm. 77–81) | **Teman AI, Teman Belajar, guru** | Pola tanya mediator; panduan guru |

### 9.2 Prinsip pelaksanaan

1. **Bertahap dan bisa diuji**: setiap tahap selesai, diuji, dan bisa dipakai sebelum tahap berikutnya.
2. **Tetap mematuhi aturan beban kognitif** di CLAUDE.md:
   - satu ide per kartu, sekitar 60 kata;
   - tanpa batas waktu di latihan dan kuis;
   - animasi hanya di tempat yang diizinkan;
   - signaling warna a/b/n/Uₙ.
3. **Kontrak data JS ↔ Python**: setiap tambahan data ekspor menaikkan `versiData` dan
   memperbarui `analisis_statistik.py` beserta tesnya.
4. **Setiap perubahan `app/`** menaikkan `CACHE_VERSION` dan mendaftarkan berkas baru di `ASET` (`sw.js`).
5. **Tanpa dependensi baru**: tetap JavaScript vanilla dan Python pustaka standar.

### 9.3 Tahapan

#### Tahap 0: Fondasi RMT
- **Tujuan**: menyiapkan acuan bersama agar semua fitur memakai istilah RMT yang sama.
- **Pekerjaan**:
  - `js/data/rmt.js` (baru): kamus 24 fungsi kognitif (kode A1–C13, nama ramah siswa, definisi
    singkat, ikon), daftar enam konsep inti, dan kalimat mediasi makna per unit.
  - CLAUDE.md: tambahkan **daftar periksa RMT** (tiga syarat aktivitas belajar, hlm. 2–3) dan
    cara menyelaraskan RMT dengan aturan beban kognitif.
  - Rancang skema data `versiData: 2` (lihat Tahap 7) supaya tahap-tahap berikutnya konsisten.
- **Rujukan**: hlm. 2–3, 85–88, 120, 124.
- **Selesai bila**: kamus terpakai di minimal satu tampilan dan daftar periksa tercantum di CLAUDE.md.
- **Status (2026-11-25): ✅ selesai, belum di-commit.**
  - `app/js/data/rmt.js` memuat 24 fungsi dengan `istilahAsli` persis dari buku dan tanda
    `terjemahan: 'kerja'` (§4.1), ditambah konsep inti, fase, kriteria MLE, dan makna unit.
  - Kamus tampil di halaman Saya (Kamus Fungsi Berpikir).
  - Daftar periksa RMT ada di CLAUDE.md.
  - Tes: `python/tests/test_rmt.py`.
  - Skema data ekspor: `versiData: 2` dipakai Tahap 2; tambahan Tahap 7 menjadi `versiData: 3`.

#### Tahap 1: Teman AI sebagai Mediator MLE (R1)
- **Pekerjaan**:
  - `python/gemini.py`: ubah instruksi sistem menjadi pola mediator, yaitu:
    1. tanya-balik satu pertanyaan;
    2. minta bukti logis;
    3. parafrasa "Apakah maksudmu …?";
    4. sebut fungsi kognitif dengan nama ramah siswa;
    5. sorot bagian yang sudah benar dan alasannya;
    6. tutup dengan jembatan ke prinsip umum;
    7. tetap tidak membocorkan jawaban akhir.
  - `python/serve.py` dan `js/ai.js`: **percakapan multi-giliran** per soal (riwayat maksimal
    sekitar 6 giliran, dikirim ulang ke server). Batas ukuran dan rate limit disesuaikan.
    Riwayat tidak disimpan di server.
  - Tes: `test_gemini.py` dan `test_serve_api.py` untuk format riwayat dan batasnya.
- **Rujukan**: hlm. 77–81, 92, 137, 142–143, 166, 184–185.
- **Selesai bila**: pada uji dengan 5 skenario soal, jawaban AI memuat tanya-balik dan
  permintaan bukti, dan tidak ada yang memberikan jawaban akhir; semua tes lulus.
- **Status (2026-11-25): ✅ selesai, belum di-commit.**
  - Riwayat maksimal 8 pesan (4 giliran).
  - Konteks soal kini memuat status jawaban yang sudah diperiksa aplikasi, tanpa kunci jawaban.
  - Evaluasi dengan Gemini asli: 6/6 skenario lulus. Skenarionya: bingung, minta jawaban
    langsung, jawaban tanpa alasan, jawaban salah, di luar topik, dan multi-giliran. Semuanya
    menyertakan pertanyaan balik, label fungsi berpikir yang valid, dan tidak membocorkan
    jawaban; skenario "jawaban tanpa alasan" memparafrasekan dan meminta bukti.
  - Temuan & perbaikan: token "berpikir" model Gemini 3.x membuat jawaban terpotong pada batas
    1024. Sekarang memakai `thinkingLevel: "low"` + batas 4096, dan jawaban terpotong ditolak.

#### Tahap 2: Latihan sebagai Praktik Konstruksi Konseptual (R2, R3)
- **Pekerjaan**:
  - Langkah **"Apa yang ditanyakan?"** sebelum isian angka, berupa pilihan singkat: "satu suku
    (Uₙ) / total (Sₙ) / beda (b) / banyak suku (n)". Ini melatih C3 dan menangkap miskonsepsi U vs S.
  - Langkah **"Buktikan"** setelah jawaban benar: memilih alasan yang tepat dari 3 opsi. Ini melatih C2.
  - Umpan balik menyebut fungsi kognitif yang dipakai: "Kamu sedang *mencari yang
    tetap* (konservasi keajekan): bedanya selalu 4".
  - Petunjuk bertahap tetap ada (asesmen "cake"); level 1 boleh memakai **tabel interaktif**.
- **Berkas**: `js/views/latihan.js`, `js/generator.js` (alasan benar dan pengecoh per jenis
  soal), `css/style.css`, `sw.js`.
- **Rujukan**: hlm. 8, 60, 86–88, 92, 152–154, 166.
- **Selesai bila**: kelima jenis latihan memiliki langkah definisi masalah dan bukti; data
  `latihan` mencatat hasil kedua langkah itu.
- **Status (2026-11-25): ✅ selesai, belum di-commit.**
  - **Alur per soal**: Langkah 1 "❓ Apa yang ditanyakan?" (4 pilihan diacak) → Langkah 2 hitung →
    Langkah 3 "🧾 Buktikan" (3 alasan diacak, satu kali pilih; hanya bila jawaban angka benar) →
    Soal berikutnya. Tiap langkah baru tampil setelah langkah sebelumnya selesai (segmentasi).
  - **Pengecoh "Buktikan"**:
    - Mewakili miskonsepsi bank soal (n vs n − 1, lupa bagi 2, U vs S, beda terbalik, lupa a)
      atau kekeliruan penalaran: bukti tidak lengkap (A3) atau "terlihat cocok" tanpa perhitungan (C2).
    - Kandidat yang angkanya kebetulan sama dengan jawaban dibuang otomatis.
    - Uji 15.000 soal acak: 0 masalah.
  - **Umpan balik**:
    - Menyebut fungsi berpikir dari `FUNGSI_LANGKAH` (C3, C2) dan `FUNGSI_LATIHAN` di `rmt.js`
      (beda → B1, berikutnya → B5, suku-n → C9, cari-n → C5, jumlah → B4).
    - Bila jawaban angka benar tetapi alasan keliru, umpan balik mengakui bagian yang benar
      (mediasi rasa mampu, hlm. 81) lalu menjelaskan *mengapa* alasan itu keliru.
  - **Ekspor `versiData: 2`**: `latihan[].definisiMasalah` dan `latihan[].bukti` (`null` bila
    tidak diminta). Python melaporkan "Definisi masalah tepat (%)" dan "Bukti logis tepat (%)"
    per jenis; data v1 tetap terbaca.
  - **Tidak berubah**: level adaptif, petunjuk bertahap, contoh, pembahasan, Teman AI (konteks
    kini menyertakan langkah siswa), dan tanpa batas waktu.
  - **Ditunda ke Tahap 3**: tabel interaktif (opsional di rencana), karena komponen tabel
    dibangun di Tahap 3.
  - **Bug lama ikut diperbaiki**: teks "null" di bawah soal level Sedang/Sulit, dan teks tebal
    di kotak umpan balik yang terpecah ke baris baru (CSS `.umpan strong` → `.umpan > strong`).

#### Tahap 3: Materi sebagai Konten-sebagai-Proses (R3, R6, R7)
- **Pekerjaan**:
  - Kalimat **mediasi makna** di awal setiap unit.
  - **Tabel interaktif** di u3: siswa mengisi kolom perubahan sampai menemukan b tetap, lalu
    merumuskan Uₙ sebelum rumus ditampilkan.
  - **Garis bilangan interaktif** di u2: lompatan +b.
  - **Kartu jembatan**:
    - u2: bandingkan 2, 5, 8 (aritmatika) dengan 2, 6, 18 (bukan aritmatika);
    - u3: Uₙ sebagai fungsi linear dari n, dengan b sebagai perubahan per satu n;
    - u4: "selisih dari selisih" pada barisan Sₙ.
  - Kartu ringkasan menyebut fungsi kognitif yang dilatih di unit itu.
- **Berkas**: `js/data/materi.js`, `js/views/materi.js`, `js/ui.js` (komponen tabel dan garis
  bilangan), `css/style.css`, `sw.js`. Revisi `docs/04-konten-materi.md`.
- **Rujukan**: hlm. 58, 78–80, 107–110, 123, 152–154, 183–186.
- **Selesai bila**: setiap unit memiliki makna, minimal satu alat yang disusun siswa, dan satu
  jembatan; teks tiap kartu tetap sekitar 60 kata.
- **Status (2026-11-25): ✅ selesai, belum di-commit.**
  - Makna di keempat unit.
  - Alat: garis bilangan di u2 dan tabel di u3 (komponen `garisBilangan` di `ui.js` untuk dipakai ulang).
  - Jembatan di u2, u3, u4. u1 adalah unit pemanasan pola; jembatannya menuju u2 lewat ringkasan.
  - Fungsi berpikir di ringkasan.
  - Uji browser alur Materi: 0 masalah.
  - Batas 60 kata kini diuji otomatis (`TestMateriRMT`).

#### Tahap 4: Pemanasan Berpikir (Fase I) (R5)
- **Pekerjaan**: halaman baru `#/pemanasan` berisi sekitar 6 tugas pola **nonangka buatan
  sendiri**, misalnya deret bentuk dengan jumlah titik bertambah tetap, warna berpola, atau
  "temukan yang tidak tetap". Tiap tugas mengikuti siklus hlm. 12 dan 92:
  1. definisikan masalah;
  2. amati alat dan model;
  3. kerjakan;
  4. sebutkan fungsi kognitif yang dipakai;
  5. refleksi.
  Tugas terakhir menjembatani ke barisan angka (masuk ke Fase II).
- **Berkas**: `js/views/pemanasan.js` (baru), `js/data/pemanasan.js` (baru), `js/app.js` (rute),
  `js/views/beranda.js` (poster "Mulai dari sini"), `css/style.css`, `sw.js`.
- **Rujukan**: hlm. 9–12, 86, 92, 123. **Tidak menyalin materi Instrumental Enrichment** (hlm. 9).
- **Selesai bila**: alur Beranda mengarahkan siswa baru ke Pemanasan sebelum Materi, dan
  catatan fungsi kognitifnya tersimpan.
- **Status (2026-11-25): ✅ selesai, belum di-commit.**
  - **6 tugas nonangka buatan sendiri** (`data/pemanasan.js`): P1 membandingkan, P2 mencari
    dengan teratur, P3 konservasi keajekan, P4 menggeneralisasi, P5 menyandi–membaca sandi,
    P6 jembatan ke angka (menghubungkan).
  - Siklus tiap tugas: ❓ definisikan → 👀 amati → ✋ kerjakan → 🧠 namai fungsi (C13) → 🌉 jembatan.
  - **Beranda**: langkah 1 dari 8 adalah Pemanasan, dengan poster "Mulai dari sini". Daftar
    Materi menautkan Pemanasan bagi yang belum mencoba.
  - **Catatan** (`state.pemanasan`) disimpan di perangkat dan diekspor mulai versiData 3 (Tahap 7).
  - Uji browser: 0 masalah.

#### Tahap 5: Literasi dengan Penjelasan (R2)
- **Pekerjaan**:
  - Tahap **Menafsirkan** meminta siswa **menulis** satu kalimat tafsiran sebelum melihat penjelasan.
  - Teman AI (Tahap 1) dapat memberi umpan balik mediator atas tafsiran itu.
  - Setiap tahap menampilkan fungsi kognitif terkait:
    - Memahami → A3 dan C3;
    - Merumuskan → A5 dan C9;
    - Menghitung → B6;
    - Menafsirkan → C2 dan C5.
- **Berkas**: `js/views/literasi.js`, `js/data/literasi.js`, `sw.js`.
- **Rujukan**: hlm. 8, 87, 92, 167.
- **Selesai bila**: kelima misi menyimpan tafsiran tertulis yang ikut ekspor.
- **Status (2026-11-25): ✅ selesai, belum di-commit.**
  - Fungsi berpikir tiap tahap (`FUNGSI_LITERASI`).
  - Tahap Menafsirkan: tafsiran tertulis (minimal satu kalimat) sebelum pilihan muncul,
    ditampilkan sebagai teks biasa. Teman AI tersedia dengan tafsiran sebagai konteks.
  - Tafsiran tersimpan di catatan tahap Menafsirkan (`literasi[].tafsiran`), diekspor mulai versiData 3.
  - Uji browser 5 misi: 0 masalah.

#### Tahap 6: Games yang Reflektif (R9)
- **Pekerjaan**:
  - **Mode Teliti** di Balon Pola: kecepatan tetap dan skor bonus untuk ketepatan.
  - Satu pertanyaan refleksi berupa pilihan di layar selesai ketiga games, misalnya "Bagaimana
    kamu menemukan bedanya?". Jawabannya masuk Jurnal RMT.
  - Lompat Katak diberi label sebagai garis bilangan.
- **Berkas**: `js/games/balon.js`, `js/games/umum.js`, `js/games/katak.js`, `sw.js`.
- **Rujukan**: hlm. 4, 8, 11, 58, 92.
- **Selesai bila**: ketiga games memiliki refleksi akhir, dan mode cepat tetap tersedia sebagai pilihan.
- **Status (2026-11-25): ✅ selesai, belum di-commit.**
  - Balon Pola: pilihan **Mode Cepat** (lama) dan **Mode Teliti** (kecepatan tetap, tanpa kombo,
    bonus ketepatan); rekor Mode Teliti disimpan di `balon-teliti`.
  - Refleksi strategi di layar akhir ketiga games (`REFLEKSI_GAME` di `rmt.js`) → **Jurnal RMT**
    (`catatJurnal`). Refleksi tidak dinilai benar/salah: strategi "menebak" dimediasi maknanya.
  - Lompat Katak disebut sebagai garis bilangan.
  - Uji browser: 0 masalah. Mode Cepat diuji sampai mulai; animasinya tidak deterministik di
    browser tanpa layar dan alurnya tidak berubah.

#### Tahap 7: Evaluasi RMT (R4, R8)
- **Pekerjaan**:
  - **Jurnal RMT** di halaman Saya: daftar fungsi kognitif yang pernah dipakai beserta refleksi.
  - **Pretes** singkat (5 soal paralel dengan kuis) sebelum Materi, sehingga bersama kuis
    membentuk asesmen dinamis "sandwich".
  - **Ekspor `versiData: 3`** (v2 sudah dipakai Tahap 2 untuk `definisiMasalah` & `bukti`), ditambah: `pretes`, `jurnal`
    (`{waktu, konteks, fungsiKognitif[], refleksi}`), dan pada `latihan`: `lapisanBantuan`
    (`definisiMasalah` dan `bukti` sudah ada sejak v2).
  - `python/analisis_statistik.py`:
    - gain pretes ke postes;
    - rata-rata lapisan bantuan per jenis (potensi belajar);
    - frekuensi fungsi kognitif;
    - ketepatan bukti logis.
    Data `versiData: 1` tetap bisa dibaca, dan tesnya diperbarui.
  - Buat **rubrik analitik** jurnal dan penjelasan tertulis, misalnya 4 kriteria × 4 tingkat:
    ketepatan bahasa matematika, bukti logis, kesadaran fungsi kognitif, kegigihan.
- **Berkas**: `js/state.js`, `js/views/saya.js`, `js/views/kuis.js` atau `js/views/pretes.js`,
  `python/analisis_statistik.py`, `python/buat_data_contoh.py`, `python/tests/`, `sw.js`,
  CLAUDE.md (format ekspor).
- **Rujukan**: hlm. 59–61, 166–167, 194–195.
- **Selesai bila**: ekspor v3 terbaca Python, laporan memuat indikator RMT, dan semua tes lulus.
- **Status (2026-11-26): ✅ selesai, belum di-commit.**
  - **Tes Awal** `#/pretes`: 5 butir `bank["pretes"]` (TP1–TP5, juga di kuis), tanpa umpan balik,
    sekali saja; langkah 1 di Beranda.
  - **Lapisan bantuan** = petunjuk + contoh + pesan Teman AI sebelum jawaban diperiksa.
  - **Jurnal RMT** di Saya: rekap fungsi, catatan terbaru, refleksi mandiri. Diisi juga oleh
    Pemanasan dan Games.
  - **Ekspor `versiData: 3`**.
  - **Python** §8 Indikator RMT: gain sandwich (Hake), lapisan bantuan, Pemanasan, frekuensi
    fungsi, ditambah `tafsiran_rubrik.csv`, `jurnal_rubrik.csv`, `pretes_postes.csv`.
  - **Rubrik analitik** 4 kriteria × 4 tingkat: [10-rubrik-rmt.md](10-rubrik-rmt.md).
  - Uji: 75 tes Python + uji browser Tahap 7: 0 masalah.

#### Tahap 8: Panduan Guru, Validasi, dan Uji Coba (R10, R11)
- **Pekerjaan**:
  - `docs/11-panduan-guru-mediator.md`:
    - urutan fase;
    - pertanyaan mediator (hlm. 137–143, 166, 184–185);
    - pertanyaan perencanaan (hlm. 160–161);
    - cara membaca laporan Python;
    - catatan bahwa Teman AI hanya pelengkap guru.
  - Perbarui `docs/02-desain-pembelajaran.md`, `docs/05-rencana-pengembangan.md` (tahap ADDIE),
    dan `docs/06-rencana-pengujian.md` (uji fitur RMT).
  - Lembar validasi ahli materi dan media dengan butir kesesuaian RMT, lalu uji coba terbatas.
- **Rujukan**: hlm. 124–125, 160–161, 167, 195–196.
- **Selesai bila**: panduan guru tersedia, validasi ahli selesai, dan revisi diterapkan.
- **Status (2026-11-26): 🟡 bagian pengembang selesai, belum di-commit.**
  - Panduan guru: [11-panduan-guru-mediator.md](11-panduan-guru-mediator.md).
  - Lembar validasi (materi, media, model RMT): [12-lembar-validasi-ahli.md](12-lembar-validasi-ahli.md).
  - Diperbarui: `docs/02` (alur 3 fase), `docs/05`, `docs/06` (UF25–UF33).
  - Validasi ahli dan uji coba siswa dilakukan oleh peneliti dan validator (di luar kode).

#### Setelah Tahap 8: Hosting publik & PWA
Rencana, evaluasi, dan langkah D0–D8 ada di [09-rencana-hosting-pwa.md](09-rencana-hosting-pwa.md).
Seluruh penerapan RMT wajib tetap lulus uji di versi publik.

### 9.4 Ringkasan urutan dan ketergantungan

| Urutan | Tahap | Bergantung pada | Perkiraan ukuran |
|---|---|---|---|
| 1 | Tahap 0: Fondasi | – | Kecil |
| 2 | Tahap 1: Teman AI mediator | Tahap 0 | Sedang |
| 3 | Tahap 2: Latihan | Tahap 0 | Sedang |
| 4 | Tahap 3: Materi | Tahap 0, komponen tabel dari Tahap 2 | Besar |
| 5 | Tahap 4: Pemanasan Berpikir | Tahap 0 | Sedang |
| 6 | Tahap 5: Literasi | Tahap 1 | Kecil |
| 7 | Tahap 6: Games | Tahap 7 (jurnal), bisa paralel | Kecil |
| 8 | Tahap 7: Evaluasi & Python | Tahap 2–6 (data) | Besar |
| 9 | Tahap 8: Panduan & validasi | Semua | Sedang |

---

## 10. [Sintesis] Menyelaraskan RMT dengan Teori Beban Kognitif

RMT menuntut **usaha berpikir yang gigih**: rigor, perjuangan yang berorientasi tujuan, dan
konsentrasi yang terjaga (hlm. 4, 124). Aturan DeretKu saat ini berusaha **mengurangi beban
kognitif**. Keduanya dapat diselaraskan:

- **Kurangi beban yang tidak perlu**: tata letak, teks berlebih, *split-attention*, dan tekanan
  waktu. Aturan CLAUDE.md tetap berlaku.
- **Pertahankan dan tingkatkan tantangan bermakna**: mendefinisikan masalah, menyusun alat
  sendiri, memberi bukti logis, dan refleksi. Inilah inti RMT.
- **Fading**: bantuan berkurang seiring level naik. Ini sejalan dengan "lapisan bantuan" pada
  asesmen dinamis (hlm. 60).
- **Tanpa batas waktu**: mendukung refleksi dan presisi (hlm. 92).

Rumusan ini perlu didiskusikan dengan dosen pembimbing.

---

## Lampiran A. Tabel Verifikasi Rujukan

Setiap frasa dicari otomatis pada teks halaman yang dirujuk (setelah pemenggalan kata di akhir
baris dihapus). Hasil: **61/61 cocok**.

| Hlm. | Frasa kunci yang ditemukan |
|---|---|
| 1 | "ship's captain" |
| 2 | "Feuerstein's (1990) theory of mediated learning"; "three criteria must be met" |
| 3 | "language and rules of mathematics culture"; "three levels: mathematical procedures"; "place value systems, number line, table" |
| 4 | "We define mental rigor" |
| 6 | "general psychological tools" |
| 8 | "analysis of the task, planning of action, and reflection"; "intentionality/reciprocity, (2) transcendence" |
| 9 | "conceptual component and the action component"; "14 booklets" |
| 10 | "Numerical Pro[gressions]" |
| 11 | "structure dictates the purpose" |
| 12 | "identify and define the cognitive functions" |
| 13 | "Numerical Progressions" |
| 58 | "should be taught as a tool" |
| 60 | "sandwich"; "cake" |
| 61 | "number series" |
| 77 | "intentionality, transcendence, and meaning" |
| 78 | "transcendence" |
| 79 | "select an appropriate formula and put certain numbers" |
| 80 | "mediation of meaning" |
| 81 | "feeling of competence" |
| 85 | "motivational aspect of cognitive function"; "three levels of cognitive functions" |
| 86 | "Conserving constancy"; "Comparing" |
| 87 | "Providing and articulating"; "Defining the problem" |
| 88 | "Forming a unit functional"; "Elaborating mathematical" |
| 92 | "The role of the teacher is to lead students toward greater awareness" |
| 107 | "ready-made mathematical concepts" |
| 109 | "term symbolic tools is more appropriate" |
| 110 | "2 5 8 11 14 17" |
| 120 | "six core mathematical concepts" |
| 122 | "does not take place in a lockstep linear fashion" |
| 123 | "Phase I: Cognitive Development"; "Phase II: Content as Process Development"; "Phase III: Cognitive Conceptual Construction Practice" |
| 124 | "Disposition of a rigorous thinker" |
| 125 | "structural analy[sis]" |
| 137 | "What is the whole?"; "correct misconceptions" |
| 142 | "Am I hearing you correctly?" |
| 143 | "Who can summarize" |
| 152 | "RMT journal" |
| 154 | "Unit functional relationship" |
| 159 | "quantity, relationship, representation, abstraction/generalization, precision, and logic/proof" |
| 160 | "first and foremost a mediator" |
| 161 | "How do I measure cognitive growth" |
| 166 | "provide me with your logical evidence" |
| 167 | "formative, summative, and evaluative"; "journal entries" |
| 184 | "relationship between relationships" |
| 185 | "Could you explain this in a different way?" |
| 194 | "dynamic or learning potential assessment" |
| 195 | "teacher-mediator" |
| 196 | "middle and high school" |
