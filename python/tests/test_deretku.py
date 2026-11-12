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


if __name__ == "__main__":
    unittest.main()
