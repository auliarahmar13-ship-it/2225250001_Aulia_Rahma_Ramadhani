"""Uji fondasi RMT (app/js/data/rmt.js) dan pendaftaran aset di service worker."""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "app"
RMT = (APP / "js" / "data" / "rmt.js").read_text(encoding="utf-8")
SW = (APP / "sw.js").read_text(encoding="utf-8")

# Istilah asli Tabel 4.1 (hlm. 86–88), diverifikasi terhadap teks PDF buku Kinard & Kozulin.
ISTILAH_BUKU = {
    "A1": "Labeling-visualizing", "A2": "Comparing",
    "A3": "Searching systematically to gather clear and complete information",
    "A4": "Using more than one source of information", "A5": "Encoding-decoding",
    "B1": "Conserving constancy", "B2": "Quantifying space and spatial relationships",
    "B3": "Quantifying time and temporal relationships", "B4": "Analyzing-integrating",
    "B5": "Generalizing", "B6": "Being precise",
    "C1": "Activating prior mathematically related knowledge",
    "C2": "Providing and articulating mathematical logical evidence", "C3": "Defining the problem",
    "C4": "Inferential-hypothetical thinking", "C5": "Projecting and restructuring relationships",
    "C6": "Forming proportional quantitative relationships", "C7": "Forming a functional relationship",
    "C8": "Forming a unit functional relationship", "C9": "Mathematical inductive-deductive thinking",
    "C10": "Mathematical analogical thinking", "C11": "Mathematical syllogistic thinking",
    "C12": "Mathematical transitive relational thinking",
    "C13": "Elaborating mathematical activity through cognitive categories",
}
KODE_WAJIB = list(ISTILAH_BUKU)  # urutan: A1–A5, B1–B6, C1–C13


def blok(nama_const):
    return RMT.split(f"export const {nama_const} = [", 1)[1].split("\n];", 1)[0]


def butir_fungsi():
    """Kembalikan dict kode → teks butir objek fungsi."""
    bagian = re.split(r"\n\s*\{ kode: ", blok("FUNGSI"))[1:]
    return {re.match(r"'([ABC]\d+)'", b).group(1): b for b in bagian}


def kolom(teks, nama):
    m = re.search(rf"\b{nama}: '([^']*)'", teks)
    return m.group(1) if m else None


class TestKamusFungsiKognitif(unittest.TestCase):
    def test_24_kode_lengkap_berurutan(self):
        self.assertEqual(list(butir_fungsi()), KODE_WAJIB)

    def test_istilah_asli_persis_sesuai_buku(self):
        for kode, isi in butir_fungsi().items():
            self.assertEqual(kolom(isi, "istilahAsli"), ISTILAH_BUKU[kode], kode)

    def test_ditandai_terjemahan_kerja(self):
        for nama_const in ("FUNGSI", "TINGKAT", "KONSEP_INTI", "FASE", "KRITERIA_MLE"):
            isi = blok(nama_const)
            jumlah_butir = isi.count("istilahAsli:")
            self.assertGreater(jumlah_butir, 0, nama_const)
            self.assertEqual(isi.count("terjemahan: 'kerja'"), jumlah_butir, f"{nama_const}: tiap butir wajib terjemahan: 'kerja'")
        self.assertIn("terjemahan kerja", RMT.split("KETERANGAN_TERJEMAHAN", 1)[1].split(";", 1)[0])

    def test_tingkat_sesuai_huruf_kode(self):
        for kode, isi in butir_fungsi().items():
            self.assertEqual(int(re.search(r"tingkat: (\d)", isi).group(1)), "ABC".index(kode[0]) + 1, kode)

    def test_setiap_fungsi_lengkap_dan_berhalaman(self):
        for kode, isi in butir_fungsi().items():
            for k in ("ikon", "nama", "namaSiswa", "definisi", "contoh", "hlm"):
                self.assertTrue(kolom(isi, k), f"{kode} tanpa {k}")
            self.assertTrue(86 <= int(kolom(isi, "hlm").split("–")[0]) <= 88, f"{kode} halaman di luar Tabel 4.1")

    def test_istilah_rawan_diberi_catatan(self):
        self.assertIn("BUKAN", kolom(butir_fungsi()["B1"], "catatan"))  # conserving ≠ mempertahankan
        self.assertNotIn("Mempertahankan", RMT)

    def test_teks_bukan_html(self):
        self.assertNotRegex(blok("FUNGSI"), r"<[a-z]+[ >]", "kamus harus teks biasa (aman untuk textContent)")

    def test_fungsi_unit_memakai_kode_yang_ada(self):
        blok_unit = RMT.split("export const FUNGSI_UNIT = {", 1)[1].split("};", 1)[0]
        blok_makna = RMT.split("export const MAKNA_UNIT = {", 1)[1].split("};", 1)[0]
        for kode in re.findall(r"'([ABC]\d+)'", blok_unit):
            self.assertIn(kode, KODE_WAJIB)
        for unit in ("u1", "u2", "u3", "u4"):
            self.assertIn(f"{unit}:", blok_unit)
            self.assertIn(f"{unit}:", blok_makna)


class TestPemetaanLatihan(unittest.TestCase):
    """Tahap 2: fungsi kognitif langkah & jenis latihan harus ada di kamus (sumber tunggal)."""

    def blok_objek(self, nama):
        return RMT.split(f"export const {nama} = {{", 1)[1].split("};", 1)[0]

    def test_langkah_memakai_c3_dan_c2(self):
        blok = self.blok_objek("FUNGSI_LANGKAH")
        self.assertIn("ditanya: 'C3'", blok)
        self.assertIn("bukti: 'C2'", blok)

    def test_semua_jenis_latihan_terpetakan_ke_kode_valid(self):
        gen = (APP / "js" / "generator.js").read_text(encoding="utf-8")
        jenis = re.findall(r"\{ id: '([\w-]+)', judul:", gen.split("export const JENIS = [", 1)[1].split("];", 1)[0])
        self.assertEqual(len(jenis), 5)
        peta = dict(re.findall(r"'?([\w-]+)'?: '([ABC]\d+)'", self.blok_objek("FUNGSI_LATIHAN")))
        for j in jenis:
            self.assertIn(j, peta, f"jenis {j} belum dipetakan di FUNGSI_LATIHAN")
            self.assertIn(peta[j], KODE_WAJIB)

    def test_generator_membawa_data_rmt_tiap_jenis(self):
        gen = (APP / "js" / "generator.js").read_text(encoding="utf-8")
        for kasus in ("'beda'", "'berikutnya'", "'suku-n'", "'cari-n'", "'jumlah'"):
            blok = gen.split(f"case {kasus}:", 1)[1].split("case '", 1)[0]
            for wajib in ("ditanya:", "alasanDitanya:", "bukti:", "benar:", "pengecoh:", "kenapa:"):
                self.assertIn(wajib, blok, f"{kasus} tanpa {wajib}")


class TestMateriRMT(unittest.TestCase):
    """Tahap 3: alat interaktif, jembatan, dan aturan segmentasi (±60 kata per kartu, CLAUDE.md)."""

    MATERI = (APP / "js" / "data" / "materi.js").read_text(encoding="utf-8")

    def kartu(self):
        t = self.MATERI
        for k, v in {"${a}": "a", "${b}": "b", "${n}": "n", "${Un}": "Un", "${Sn}": "Sn"}.items():
            t = t.replace(k, v)
        pola = r"jenis: '(\w+)'(?:, jembatan: true)?, judul: '([^']+)'(.*?)(?=\n      \},?\n)"
        return [(m.group(1), m.group(2), m.group(3)) for m in re.finditer(pola, t, re.S)]

    def test_maksimal_60_kata_per_kartu(self):
        for jenis, judul, isi in self.kartu():
            teks = " ".join(x for pasang in re.findall(
                r"(?:isi|tanya|soal|kesimpulan): `([^`]*)`|(?:isi|tanya|soal|kesimpulan): '([^']*)'", isi) for x in pasang if x)
            teks = re.sub(r"<svg.*?</svg>", " ", teks, flags=re.S)
            self.assertLessEqual(len(re.sub(r"<[^>]+>", " ", teks).split()), 60, f"kartu '{judul}' lebih dari 60 kata")

    def test_alat_dan_jembatan_ada(self):
        jenis = [j for j, _, _ in self.kartu()]
        self.assertIn("garis", jenis)
        self.assertIn("tabel", jenis)
        self.assertGreaterEqual(self.MATERI.count("jembatan: true"), 3)  # u2, u3, u4


class TestServiceWorker(unittest.TestCase):
    def test_semua_berkas_app_terdaftar_di_aset(self):
        """CLAUDE.md: SEMUA berkas di app/ (JS, CSS, JSON, gambar, font, manifest) wajib masuk ASET
        di sw.js agar aplikasi jalan offline. Kecuali sw.js sendiri dan berkas lisensi .txt."""
        aset = set(re.findall(r"'([^']+)'", SW.split("const ASET = [", 1)[1].split("];", 1)[0]))
        for berkas in APP.rglob("*"):
            if not berkas.is_file():
                continue
            rel = berkas.relative_to(APP).as_posix()
            if rel == "sw.js" or rel.endswith(".txt"):
                continue
            self.assertIn(rel, aset, f"{rel} belum didaftarkan di ASET (app/sw.js)")

    def test_aset_tidak_menunjuk_berkas_hilang(self):
        aset = re.findall(r"'([^']+)'", SW.split("const ASET = [", 1)[1].split("];", 1)[0])
        for a in aset:
            if a != "./":
                self.assertTrue((APP / a).is_file(), f"ASET berisi '{a}' tetapi berkasnya tidak ada")


class TestKonfigurasiVercel(unittest.TestCase):
    """Tahap 2 hosting: vercel.json & fungsi api/tanya.py tanpa rahasia."""

    def test_vercel_json(self):
        import json
        cfg = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
        self.assertEqual(cfg["outputDirectory"], "app")
        fungsi = cfg["functions"]["api/tanya.py"]
        self.assertLessEqual(fungsi["maxDuration"], 300)  # batas paket Hobby
        self.assertIn("python/", fungsi["includeFiles"])
        self.assertIn("app/js/data/rmt.js", fungsi["includeFiles"])
        sumber = {h["source"] for h in cfg["headers"]}
        self.assertIn("/sw.js", sumber)

    def test_tidak_ada_rahasia_di_berkas_deploy(self):
        for berkas in [ROOT / "vercel.json", ROOT / "api" / "tanya.py", *APP.rglob("*.js")]:
            isi = berkas.read_text(encoding="utf-8")
            self.assertNotRegex(isi, r"AIza[0-9A-Za-z_\-]{20,}", f"pola API key Google di {berkas}")
            self.assertNotIn("GEMINI_API_KEY=", isi, berkas)


if __name__ == "__main__":
    unittest.main()
