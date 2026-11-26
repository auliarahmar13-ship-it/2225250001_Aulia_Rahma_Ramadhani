"""Uji endpoint POST /api/tanya di serve.py (server sungguhan di port acak, Gemini tiruan)."""

import functools
import http.client
import json
import sys
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest import mock

DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DIR))

import gemini  # noqa: E402
import serve  # noqa: E402


class HandlerSenyap(serve.Handler):
    def log_message(self, *a):  # jangan kotori keluaran tes
        pass


class TestApiTanya(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = functools.partial(HandlerSenyap, directory=str(serve.APP))
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.port = cls.server.server_address[1]
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        p1 = mock.patch.object(serve.api_tanya, "PEMBATAS", serve.PembatasLaju(serve.MAKS_PER_IP, serve.MAKS_TOTAL))
        p2 = mock.patch.object(gemini, "ambil_kunci", return_value="kunci-palsu")
        p3 = mock.patch.object(gemini, "tanya_gemini", return_value="Bedanya 3.")
        p1.start(), p2.start()
        self.tanya = p3.start()
        for p in (p1, p2, p3):
            self.addCleanup(p.stop)

    def kirim(self, metode="POST", jalur="/api/tanya", isi=None, header=None):
        h = {"Content-Type": "application/json"}
        h.update(header or {})
        if isinstance(isi, (dict, list)):
            isi = json.dumps(isi)
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        c.request(metode, jalur, body=isi, headers=h)
        r = c.getresponse()
        mentah = r.read()
        c.close()
        data = json.loads(mentah) if r.getheader("Content-Type", "").startswith("application/json") and mentah else None
        return r.status, data, r

    def test_berhasil(self):
        status, data, _ = self.kirim(isi={"pertanyaan": "Berapa beda 2, 5, 8?", "konteks": "Latihan"})
        self.assertEqual(status, 200)
        self.assertEqual(data, {"jawaban": "Bedanya 3."})
        self.tanya.assert_called_once_with("Berapa beda 2, 5, 8?", "Latihan", [])

    def test_field_lain_tidak_diteruskan(self):
        self.kirim(isi={"pertanyaan": "halo", "nama": "Budi", "kelas": "8A"})
        self.tanya.assert_called_once_with("halo", "", [])

    def test_riwayat_diteruskan(self):
        riwayat = [{"peran": "siswa", "teks": "Aku bingung"}, {"peran": "ai", "teks": "Apa yang ditanyakan?"}]
        status, _, _ = self.kirim(isi={"pertanyaan": "Suku ke-10", "konteks": "Soal", "riwayat": riwayat})
        self.assertEqual(status, 200)
        self.tanya.assert_called_once_with("Suku ke-10", "Soal", riwayat)

    def test_riwayat_tidak_valid_ditolak(self):
        kasus = [
            "bukan daftar",
            [{"peran": "ai", "teks": "mulai dari AI"}],
            [{"peran": "siswa", "teks": "berakhir di siswa"}],
            [{"peran": "siswa", "teks": "a"}, {"peran": "guru", "teks": "peran asing"}],
            [{"peran": "siswa", "teks": "a"}, {"peran": "ai", "teks": ""}],
            [{"peran": "siswa", "teks": "a"}, {"peran": "ai", "teks": "b"}] * 5,  # 10 > MAKS_RIWAYAT
        ]
        for riwayat in kasus:
            with self.subTest(riwayat=str(riwayat)[:50]):
                status, data, _ = self.kirim(isi={"pertanyaan": "halo", "riwayat": riwayat})
                self.assertEqual(status, 400)
                self.assertIn("galat", data)
        self.tanya.assert_not_called()

    def test_jawaban_tidak_memuat_kunci(self):
        _, _, r = self.kirim(isi={"pertanyaan": "halo"})
        self.assertNotIn("kunci-palsu", str(r.getheaders()))

    def test_validasi_input(self):
        kasus = [
            ({"pertanyaan": ""}, 400),
            ({"pertanyaan": "   "}, 400),
            ({"pertanyaan": 123}, 400),
            ({}, 400),
            ({"pertanyaan": "x" * (gemini.MAKS_PERTANYAAN + 1)}, 400),
            ({"pertanyaan": "halo", "konteks": ["bukan", "teks"]}, 400),
            (["bukan", "objek"], 400),
            ("{json rusak", 400),
        ]
        for isi, kode in kasus:
            with self.subTest(isi=str(isi)[:40]):
                status, data, _ = self.kirim(isi=isi)
                self.assertEqual(status, kode)
                self.assertIn("galat", data)
        self.tanya.assert_not_called()

    def test_content_type_salah(self):
        status, _, _ = self.kirim(isi="pertanyaan=halo", header={"Content-Type": "text/plain"})
        self.assertEqual(status, 415)

    def test_terlalu_besar(self):
        isi = json.dumps({"pertanyaan": "x" * (serve.MAKS_BYTE_PERMINTAAN + 10)})
        status, _, _ = self.kirim(isi=isi)
        self.assertEqual(status, 413)

    def test_asal_situs_lain_ditolak(self):
        status, _, _ = self.kirim(isi={"pertanyaan": "halo"}, header={"Origin": "https://situs-lain.com"})
        self.assertEqual(status, 403)
        ok, _, _ = self.kirim(isi={"pertanyaan": "halo"}, header={"Origin": f"http://127.0.0.1:{self.port}"})
        self.assertEqual(ok, 200)

    def test_rate_limit(self):
        for _ in range(serve.MAKS_PER_IP):
            self.assertEqual(self.kirim(isi={"pertanyaan": "halo"})[0], 200)
        status, data, r = self.kirim(isi={"pertanyaan": "halo"})
        self.assertEqual(status, 429)
        self.assertTrue(int(r.getheader("Retry-After")) > 0)
        self.assertIn("Terlalu banyak", data["galat"])

    def test_kunci_belum_diisi(self):
        with mock.patch.object(gemini, "ambil_kunci", side_effect=gemini.GeminiError("x")):
            status, data, _ = self.kirim(isi={"pertanyaan": "halo"})
        self.assertEqual(status, 503)
        self.tanya.assert_not_called()

    def test_galat_gemini(self):
        self.tanya.side_effect = gemini.GeminiError("Kuota Gemini habis (429).")
        status, data, _ = self.kirim(isi={"pertanyaan": "halo"})
        self.assertEqual(status, 502)
        self.assertEqual(data["galat"], "Kuota Gemini habis (429).")

    def test_kuota_habis_jadi_503_dengan_retry_after(self):
        self.tanya.side_effect = gemini.GeminiError("Kuota harian Teman AI sudah habis.", jenis="kuota_harian", tunggu=3599.2)
        status, data, r = self.kirim(isi={"pertanyaan": "halo"})
        self.assertEqual(status, 503)
        self.assertEqual(r.getheader("Retry-After"), "3600")
        self.assertIn("Kuota harian", data["galat"])

    def test_sibuk_jadi_503(self):
        self.tanya.side_effect = gemini.GeminiError("Server Gemini sedang sibuk (503).", jenis="sibuk", tunggu=30)
        status, _, r = self.kirim(isi={"pertanyaan": "halo"})
        self.assertEqual((status, r.getheader("Retry-After")), (503, "30"))

    def test_galat_tak_terduga(self):
        self.tanya.side_effect = RuntimeError("rahasia internal")
        with mock.patch.object(HandlerSenyap, "log_error"):
            status, data, _ = self.kirim(isi={"pertanyaan": "halo"})
        self.assertEqual(status, 500)
        self.assertNotIn("rahasia", data["galat"])

    def test_jalur_dan_metode_lain(self):
        self.assertEqual(self.kirim(jalur="/api/lain", isi={"pertanyaan": "halo"})[0], 404)
        self.assertEqual(self.kirim(metode="GET", isi=None)[0], 405)

    def test_berkas_statis_tetap_jalan(self):
        status, _, r = self.kirim(metode="GET", jalur="/index.html", isi=None)
        self.assertEqual(status, 200)
        self.assertIn("text/html", r.getheader("Content-Type"))
        status, _, r = self.kirim(metode="GET", jalur="/js/app.js", isi=None)
        self.assertEqual(r.getheader("Content-Type"), "text/javascript")


def muat_handler_vercel():
    """Muat api/tanya.py (fungsi Vercel) sebagai modul, persis seperti yang dijalankan Vercel."""
    import importlib.util
    spec = importlib.util.spec_from_file_location("vercel_tanya", DIR.parent / "api" / "tanya.py")
    modul = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modul)
    return modul.handler


class TestApiVercel(TestApiTanya):
    """Semua uji endpoint di atas dijalankan ulang terhadap handler Vercel (api/tanya.py)."""

    @classmethod
    def setUpClass(cls):
        class Senyap(muat_handler_vercel()):
            def log_message(self, *a):
                pass
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), Senyap)
        cls.port = cls.server.server_address[1]
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    def test_berkas_statis_tetap_jalan(self):
        self.skipTest("Di Vercel, berkas statis disajikan CDN (outputDirectory app), bukan fungsi ini.")

    def test_rate_limit_memakai_ip_dari_vercel(self):
        # Dua "perangkat" berbeda (X-Forwarded-For dari proxy Vercel) punya jatah masing-masing.
        for _ in range(serve.MAKS_PER_IP):
            self.assertEqual(self.kirim(isi={"pertanyaan": "halo"}, header={"X-Forwarded-For": "1.1.1.1"})[0], 200)
        self.assertEqual(self.kirim(isi={"pertanyaan": "halo"}, header={"X-Forwarded-For": "1.1.1.1"})[0], 429)
        self.assertEqual(self.kirim(isi={"pertanyaan": "halo"}, header={"X-Forwarded-For": "2.2.2.2"})[0], 200)


class TestPembatasLaju(unittest.TestCase):
    def test_jendela_geser(self):
        jam = [0.0]
        p = serve.PembatasLaju(2, 3, jendela=60, jam=lambda: jam[0])
        self.assertEqual(p.izinkan("a"), 0)
        self.assertEqual(p.izinkan("a"), 0)
        self.assertGreater(p.izinkan("a"), 0)      # batas per IP
        self.assertEqual(p.izinkan("b"), 0)
        self.assertGreater(p.izinkan("c"), 0)      # batas total (3)
        jam[0] = 61
        self.assertEqual(p.izinkan("a"), 0)        # jendela sudah lewat


if __name__ == "__main__":
    unittest.main()
