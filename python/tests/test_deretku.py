"""Uji otomatis: python -m unittest discover python/tests"""

import json
import sys
import unittest
from pathlib import Path

DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DIR))

import analisis_statistik as an  # noqa: E402
import generate_bank_soal as gb  # noqa: E402


class TestRumus(unittest.TestCase):
    def test_suku_dan_jumlah(self):
        self.assertEqual(gb.U(5, 3, 50), 152)
        self.assertEqual(gb.S(1, 1, 100), 5050)
        self.assertEqual(gb.S(3, 4, 10), 210)
        self.assertEqual(gb.S(12, -1, 12), 78)

    def test_aritmatika(self):
        self.assertTrue(gb.adalah_aritmatika([20, 17, 14]))
        self.assertFalse(gb.adalah_aritmatika([1, 2, 4]))


class TestBankSoal(unittest.TestCase):
    def test_validasi(self):
        data = gb.bangun()
        self.assertEqual(len(data["soal"]), 15)

    def test_berkas_app_mutakhir(self):
        """bank-soal.json di app/ harus sama dengan hasil generator (kecuali tanggal)."""
        berkas = json.loads(gb.KELUARAN.read_text(encoding="utf-8"))
        baru = gb.bangun()
        self.assertEqual(berkas["soal"], baru["soal"],
                         "Jalankan ulang: python python/generate_bank_soal.py")


class TestStatistik(unittest.TestCase):
    def test_pearson(self):
        self.assertAlmostEqual(an.pearson([1, 2, 3, 4], [2, 4, 6, 8]), 1.0)
        self.assertAlmostEqual(an.pearson([1, 2, 3, 4], [8, 6, 4, 2]), -1.0)
        self.assertIsNone(an.pearson([1, 1, 1], [1, 2, 3]))

    def test_p_value(self):
        # r = 0,5; n = 20 → p ≈ 0,0248 (tabel)
        self.assertAlmostEqual(an.p_value_korelasi(0.5, 20), 0.0248, places=3)

    def test_kr20(self):
        m = [[1, 1, 1], [1, 1, 0], [1, 0, 0], [0, 0, 0]]
        self.assertAlmostEqual(an.kr20(m), 0.75, places=6)


class TestLatihanRMT(unittest.TestCase):
    """versiData 2: definisiMasalah & bukti; data versiData 1 tetap terbaca."""

    def test_persentase_v2_dan_v1_campur(self):
        bank = gb.bangun()
        v1 = {"aplikasi": "DeretKu", "versiData": 1, "idPerangkat": "lama", "profil": {}, "kuis": [], "literasi": [], "bebanKognitif": [],
              "latihan": [{"jenis": "beda", "level": 1, "benar": True, "petunjuk": 0, "durasiDetik": 10}]}
        v2 = {"aplikasi": "DeretKu", "versiData": 2, "idPerangkat": "baru", "profil": {}, "kuis": [], "literasi": [], "bebanKognitif": [],
              "latihan": [
                  {"jenis": "beda", "level": 1, "benar": True, "petunjuk": 0, "durasiDetik": 10, "definisiMasalah": True, "bukti": True},
                  {"jenis": "beda", "level": 1, "benar": True, "petunjuk": 0, "durasiDetik": 10, "definisiMasalah": False, "bukti": False},
                  {"jenis": "beda", "level": 1, "benar": False, "petunjuk": 2, "durasiDetik": 10, "definisiMasalah": True, "bukti": None},
              ]}
        h = an.analisis([v1, v2], bank, "terakhir", 75)["latihan"]["beda"]
        self.assertEqual(h["n"], 4)
        self.assertEqual(h["n_definisi"], 3)                 # entri v1 dilewati
        self.assertAlmostEqual(h["definisi_tepat"], 200 / 3)
        self.assertEqual(h["n_bukti"], 2)                    # bukti null tidak dihitung
        self.assertAlmostEqual(h["bukti_tepat"], 50.0)

    def test_hanya_v1_menghasilkan_tanda_strip(self):
        bank = gb.bangun()
        v1 = {"aplikasi": "DeretKu", "versiData": 1, "idPerangkat": "lama", "profil": {}, "kuis": [], "literasi": [], "bebanKognitif": [],
              "latihan": [{"jenis": "jumlah", "level": 2, "benar": False, "petunjuk": 1, "durasiDetik": 40}]}
        h = an.analisis([v1], bank, "terakhir", 75)
        self.assertIsNone(h["latihan"]["jumlah"]["definisi_tepat"])
        self.assertEqual(an.f2(h["latihan"]["jumlah"]["bukti_tepat"]), "-")


class TestIndikatorRMT(unittest.TestCase):
    """versiData 3 (Tahap 7): sandwich pretes→kuis, lapisan bantuan, pemanasan, jurnal, tafsiran."""

    def siswa(self, pre_benar, post_benar, versi=3):
        bank = gb.bangun()
        ids = bank["pretes"]
        kuis_jaw = [{"id": s["id"], "benar": s["id"] in post_benar} for s in bank["soal"]]
        d = {"aplikasi": "DeretKu", "versiData": versi, "idPerangkat": f"s{len(pre_benar)}{len(post_benar)}", "profil": {},
             "latihan": [{"jenis": "beda", "benar": True, "petunjuk": 1, "lapisanBantuan": 2},
                         {"jenis": "beda", "benar": True, "petunjuk": 0, "lapisanBantuan": 0}],
             "kuis": [{"waktu": "2026-11-20", "skor": 0, "jawaban": kuis_jaw}], "literasi": [], "bebanKognitif": [],
             "pretes": [{"jawaban": [{"id": i, "benar": i in pre_benar} for i in ids]}],
             "pemanasan": [{"id": "P1", "definisi": True, "benar": False, "fungsiTepat": True}],
             "jurnal": [{"konteks": "games:balon", "fungsiKognitif": ["A2", "B1"], "refleksi": "uji"}]}
        return bank, d

    def test_gain_sandwich(self):
        bank, d = self.siswa(pre_benar={"K02"}, post_benar={"K02", "K01", "K04"})
        s = an.analisis([d], bank, "terakhir", 75)["rmt"]["sandwich"]
        self.assertEqual((s["n"], s["pre"], s["post"]), (1, 20.0, 60.0))
        self.assertAlmostEqual(s["gain"], 0.5)  # (60 − 20) / (100 − 20)
        self.assertEqual(s["naik"], 1)

    def test_lapisan_pemanasan_jurnal(self):
        bank, d = self.siswa(set(), set())
        r = an.analisis([d], bank, "terakhir", 75)["rmt"]
        self.assertEqual(r["lapisan"]["beda"]["rata"], 1.0)
        self.assertEqual(r["lapisan"]["beda"]["tanpa_bantuan"], 50.0)
        self.assertEqual((r["pemanasan"]["definisi"], r["pemanasan"]["benar"]), (100.0, 0.0))
        self.assertEqual([k for k, _, _ in r["fungsi"]], ["A2", "B1"])
        self.assertEqual(r["fungsi"][0][1], "Membandingkan")  # nama dari rmt.js (sumber tunggal)

    def test_data_lama_tanpa_indikator_rmt(self):
        bank = gb.bangun()
        lama = {"aplikasi": "DeretKu", "versiData": 1, "idPerangkat": "lama", "profil": {}, "kuis": [], "literasi": [],
                "bebanKognitif": [], "latihan": [{"jenis": "jumlah", "benar": False, "petunjuk": 1, "durasiDetik": 40}]}
        r = an.analisis([lama], bank, "terakhir", 75)["rmt"]
        self.assertEqual(r["sandwich"]["n"], 0)
        self.assertEqual(r["lapisan"], {})
        self.assertEqual(r["pemanasan"]["n"], 0)

    def test_bank_pretes_mencakup_tp1_sampai_tp5(self):
        bank = gb.bangun()
        tp = sorted(next(s["indikator"] for s in bank["soal"] if s["id"] == i) for i in bank["pretes"])
        self.assertEqual(tp, ["TP1", "TP2", "TP3", "TP4", "TP5"])


if __name__ == "__main__":
    unittest.main()
