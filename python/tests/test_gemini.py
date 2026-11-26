"""Uji python/gemini.py TANPA internet dan TANPA API key asli (aman untuk CI GitHub)."""

import io
import json
import logging
import os
import sys
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest import mock

DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DIR))

import gemini  # noqa: E402

KUNCI_PALSU = "kunci-palsu-untuk-tes"
logging.getLogger("deretku.gemini").setLevel(logging.CRITICAL)  # jangan kotori keluaran tes


class ResponsPalsu:
    def __init__(self, data):
        self._isi = json.dumps(data).encode("utf-8")

    def read(self):
        return self._isi

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def respons_teks(teks):
    return {"candidates": [{"content": {"parts": [{"text": teks}]}, "finishReason": "STOP"}]}


class TestBacaEnv(unittest.TestCase):
    def test_format_umum(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / ".env"
            p.write_text(
                "# komentar\n\nGEMINI_API_KEY=abc123\nexport GEMINI_MODEL=\"model-x\"\nRUSAK\n",
                encoding="utf-8",
            )
            env = gemini.baca_env(p)
        self.assertEqual(env, {"GEMINI_API_KEY": "abc123", "GEMINI_MODEL": "model-x"})

    def test_berkas_tidak_ada(self):
        self.assertEqual(gemini.baca_env(Path("tidak/ada/.env")), {})


class TestKunci(unittest.TestCase):
    def test_kunci_kosong_memberi_galat(self):
        with mock.patch.dict(os.environ, {"GEMINI_API_KEY": ""}), \
                mock.patch.object(gemini, "baca_env", return_value={}):
            with self.assertRaises(gemini.GeminiError):
                gemini.ambil_kunci()

    def test_env_sistem_diutamakan(self):
        with mock.patch.dict(os.environ, {"GEMINI_API_KEY": "dari-sistem"}), \
                mock.patch.object(gemini, "baca_env", return_value={"GEMINI_API_KEY": "dari-berkas"}):
            self.assertEqual(gemini.ambil_kunci(), "dari-sistem")


class TestPermintaan(unittest.TestCase):
    def test_validasi_panjang(self):
        with self.assertRaises(gemini.GeminiError):
            gemini.susun_permintaan("")
        with self.assertRaises(gemini.GeminiError):
            gemini.susun_permintaan("x" * (gemini.MAKS_PERTANYAAN + 1))
        with self.assertRaises(gemini.GeminiError):
            gemini.susun_permintaan("tanya", "k" * (gemini.MAKS_KONTEKS + 1))

    def test_konteks_digabung(self):
        isi = gemini.susun_permintaan("Berapa bedanya?", "Barisan 2, 5, 8")
        teks = isi["contents"][0]["parts"][0]["text"]
        self.assertIn("2, 5, 8", teks)
        self.assertIn("Berapa bedanya?", teks)
        self.assertIn("SMP", isi["system_instruction"]["parts"][0]["text"])

    def test_riwayat_menjadi_percakapan_bergantian(self):
        riwayat = [{"peran": "siswa", "teks": "Aku bingung"}, {"peran": "ai", "teks": "Apa yang ditanyakan?"}]
        isi = gemini.susun_permintaan("Suku ke-10", "Barisan 3, 7, 11", riwayat)
        self.assertEqual([c["role"] for c in isi["contents"]], ["user", "model", "user"])
        self.assertIn("3, 7, 11", isi["contents"][0]["parts"][0]["text"])   # konteks di pesan pertama
        self.assertNotIn("3, 7, 11", isi["contents"][2]["parts"][0]["text"])
        self.assertEqual(isi["contents"][2]["parts"][0]["text"], "Suku ke-10")
        self.assertNotIn("3, 7, 11", isi["system_instruction"]["parts"][0]["text"])  # konteks siswa tidak masuk instruksi

    def test_riwayat_tidak_valid(self):
        buruk = [
            "teks", {"peran": "siswa"}, [{"peran": "ai", "teks": "x"}], [{"peran": "siswa", "teks": "x"}],
            [{"peran": "siswa", "teks": "x"}, {"peran": "siswa", "teks": "y"}],
            [{"peran": "siswa", "teks": "x"}, {"peran": "ai", "teks": 5}],
            [{"peran": "siswa", "teks": "x" * (gemini.MAKS_PERTANYAAN + 1)}, {"peran": "ai", "teks": "y"}],
            [{"peran": "siswa", "teks": "x"}, {"peran": "ai", "teks": "y" * (gemini.MAKS_TEKS_AI + 1)}],
            [{"peran": "siswa", "teks": "x"}, {"peran": "ai", "teks": "y"}] * (gemini.MAKS_RIWAYAT // 2 + 1),
        ]
        for r in buruk:
            with self.subTest(r=str(r)[:40]):
                with self.assertRaises(gemini.GeminiError):
                    gemini.susun_permintaan("halo", "", r)
        self.assertEqual(gemini.periksa_riwayat(None), [])


class TestInstruksiMediator(unittest.TestCase):
    """Pola mediator RMT/MLE (docs/08 §5) harus ada di instruksi sistem."""

    def test_nama_fungsi_dibaca_dari_kamus_rmt(self):
        fungsi = gemini.daftar_fungsi()
        self.assertEqual(len(fungsi), 24)
        self.assertIn(("B1", "Mencari yang tetap"), fungsi)
        for _, nama in fungsi:
            self.assertIn(f"- {nama}", gemini.INSTRUKSI_SISTEM)

    def test_pola_mediasi_ada(self):
        teks = gemini.INSTRUKSI_SISTEM
        for wajib in ("JANGAN PERNAH memberikan jawaban akhir", "TEPAT SATU pertanyaan", "Jadi maksudmu",
                      "Bagaimana kamu tahu", "MENGAPA benar", "aturan umum", gemini.LABEL_FUNGSI,
                      "Guru tetap pembimbing utama"):
            self.assertIn(wajib, teks)
        self.assertNotIn("{DAFTAR_FUNGSI}", teks)

    def test_kamus_tidak_terbaca_tetap_aman(self):
        self.assertEqual(gemini.daftar_fungsi(Path("tidak/ada.js")), [])


def galat_429(harian=True, tunggu="69741s", model="model-tes"):
    """HTTPError 429 dengan isi seperti respons Google sungguhan."""
    isi = {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "details": [
        {"@type": "type.googleapis.com/google.rpc.QuotaFailure", "violations": [{
            "quotaId": "GenerateRequestsPerDayPerProjectPerModel-FreeTier" if harian
            else "GenerateRequestsPerMinutePerProjectPerModel-FreeTier",
            "quotaValue": "20" if harian else "5", "quotaDimensions": {"model": model}}]},
        {"@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": tunggu}]}}
    return urllib.error.HTTPError("url", 429, "Too Many Requests", {}, io.BytesIO(json.dumps(isi).encode()))


class TestTanya(unittest.TestCase):
    def setUp(self):
        # Satu model saja (cadangan dimatikan) agar perilaku dasar teruji terpisah.
        p1 = mock.patch.dict(os.environ, {"GEMINI_API_KEY": KUNCI_PALSU, "GEMINI_MODEL": "model-tes",
                                          "GEMINI_MODEL_CADANGAN": "tidak"})
        p1.start()
        self.addCleanup(p1.stop)
        gemini.lupakan_kuota()
        self.addCleanup(gemini.lupakan_kuota)

    def test_berhasil_dan_kunci_di_header(self):
        with mock.patch("urllib.request.urlopen", return_value=ResponsPalsu(respons_teks("Bedanya 3."))) as m:
            self.assertEqual(gemini.tanya_gemini("Berapa beda 2, 5, 8?"), "Bedanya 3.")
        req = m.call_args[0][0]
        self.assertEqual(req.get_header("X-goog-api-key"), KUNCI_PALSU)
        self.assertNotIn(KUNCI_PALSU, req.full_url)  # kunci tidak boleh ada di URL
        self.assertIn("model-tes", req.full_url)

    def test_coba_ulang_sekali_saat_503(self):
        err = urllib.error.HTTPError("url", 503, "sibuk", {}, None)
        with mock.patch("urllib.request.urlopen", side_effect=[err, ResponsPalsu(respons_teks("Oke."))]) as m, \
                mock.patch.object(gemini.time, "sleep"):
            self.assertEqual(gemini.tanya_gemini("halo"), "Oke.")
        self.assertEqual(m.call_count, 2)

    def test_jawaban_terpotong_ditolak(self):
        terpotong = {"candidates": [{"content": {"parts": [{"text": "Dari barisan 5, 8"}]}, "finishReason": "MAX_TOKENS"}]}
        with mock.patch("urllib.request.urlopen", return_value=ResponsPalsu(terpotong)):
            with self.assertRaises(gemini.GeminiError):
                gemini.tanya_gemini("halo")

    def test_400_dicoba_ulang_tanpa_thinking_config(self):
        err = urllib.error.HTTPError("url", 400, "param tak dikenal", {}, None)
        with mock.patch("urllib.request.urlopen", side_effect=[err, ResponsPalsu(respons_teks("Oke."))]) as m:
            self.assertEqual(gemini.tanya_gemini("halo"), "Oke.")
        pertama, kedua = (json.loads(c.args[0].data) for c in m.call_args_list)
        self.assertIn("thinkingConfig", pertama["generationConfig"])
        self.assertNotIn("thinkingConfig", kedua["generationConfig"])

    def test_400_kedua_tetap_galat(self):
        err = urllib.error.HTTPError("url", 400, "buruk", {}, None)
        with mock.patch("urllib.request.urlopen", side_effect=[err, err]) as m:
            with self.assertRaises(gemini.GeminiError):
                gemini.tanya_gemini("halo")
        self.assertEqual(m.call_count, 2)

    def test_tidak_coba_ulang_saat_429(self):
        err = urllib.error.HTTPError("url", 429, "kuota", {}, None)
        with mock.patch("urllib.request.urlopen", side_effect=err) as m:
            with self.assertRaises(gemini.GeminiError):
                gemini.tanya_gemini("halo")
        self.assertEqual(m.call_count, 1)

    def test_galat_http_tidak_membocorkan_kunci(self):
        for kode in (400, 403, 404, 429, 500):
            err = urllib.error.HTTPError("url", kode, "galat", {}, None)
            with mock.patch("urllib.request.urlopen", side_effect=err), \
                    mock.patch.object(gemini.time, "sleep"):
                with self.assertRaises(gemini.GeminiError) as c:
                    gemini.tanya_gemini("halo")
            self.assertNotIn(KUNCI_PALSU, str(c.exception))

    def test_tanpa_internet(self):
        with mock.patch("urllib.request.urlopen", side_effect=urllib.error.URLError("offline")):
            with self.assertRaises(gemini.GeminiError):
                gemini.tanya_gemini("halo")

    def test_respons_diblokir_atau_kosong(self):
        with self.assertRaises(gemini.GeminiError):
            gemini.ambil_teks({"promptFeedback": {"blockReason": "SAFETY"}})
        with self.assertRaises(gemini.GeminiError):
            gemini.ambil_teks({"candidates": [{"content": {"parts": []}, "finishReason": "MAX_TOKENS"}]})


class TestKuotaDanCadangan(unittest.TestCase):
    """Galat 429 Google dibaca rinci; model cadangan dipakai tanpa mengganti API key."""

    def setUp(self):
        p1 = mock.patch.dict(os.environ, {"GEMINI_API_KEY": KUNCI_PALSU, "GEMINI_MODEL": "utama",
                                          "GEMINI_MODEL_CADANGAN": "cadangan-1, cadangan-2"})
        p1.start()
        self.addCleanup(p1.stop)
        gemini.lupakan_kuota()
        self.addCleanup(gemini.lupakan_kuota)

    @staticmethod
    def model_dipanggil(m):
        return [c.args[0].full_url.split("/models/")[1].split(":")[0] for c in m.call_args_list]

    def test_urutan_model(self):
        self.assertEqual(gemini.daftar_model(), ["utama", "cadangan-1", "cadangan-2"])
        with mock.patch.dict(os.environ, {"GEMINI_MODEL_CADANGAN": "tidak"}):
            self.assertEqual(gemini.daftar_model(), ["utama"])
        with mock.patch.dict(os.environ, {"GEMINI_MODEL_CADANGAN": "utama,cadangan-1"}):
            self.assertEqual(gemini.daftar_model(), ["utama", "cadangan-1"])  # tanpa duplikat

    def test_kuota_harian_habis_pindah_ke_cadangan(self):
        with mock.patch("urllib.request.urlopen", side_effect=[galat_429(), ResponsPalsu(respons_teks("Oke."))]) as m:
            self.assertEqual(gemini.tanya_gemini("halo"), "Oke.")
        self.assertEqual(self.model_dipanggil(m), ["utama", "cadangan-1"])
        self.assertIn("utama", gemini.status_kuota())

    def test_model_habis_dilewati_tanpa_dipanggil(self):
        with mock.patch("urllib.request.urlopen", side_effect=[galat_429(), ResponsPalsu(respons_teks("A"))]):
            gemini.tanya_gemini("halo")
        with mock.patch("urllib.request.urlopen", return_value=ResponsPalsu(respons_teks("B"))) as m:
            self.assertEqual(gemini.tanya_gemini("halo lagi"), "B")
        self.assertEqual(self.model_dipanggil(m), ["cadangan-1"])  # "utama" tidak dipanggil lagi

    def test_semua_kuota_harian_habis(self):
        errs = [galat_429(tunggu="70000s"), galat_429(tunggu="3600s"), galat_429(tunggu="7200s")]
        with mock.patch("urllib.request.urlopen", side_effect=errs):
            with self.assertRaises(gemini.GeminiError) as c:
                gemini.tanya_gemini("halo")
        e = c.exception
        self.assertEqual(e.jenis, "kuota_harian")
        self.assertEqual(e.tunggu, 3600.0)  # model yang paling cepat pulih
        self.assertIn("Kuota harian Teman AI sudah habis", str(e))
        self.assertIn("sekitar 1 jam", str(e))
        self.assertNotIn(KUNCI_PALSU, str(e) + e.rincian)

    def test_kuota_per_menit(self):
        errs = [galat_429(harian=False, tunggu="30s")] * 3
        with mock.patch("urllib.request.urlopen", side_effect=errs):
            with self.assertRaises(gemini.GeminiError) as c:
                gemini.tanya_gemini("halo")
        self.assertEqual(c.exception.jenis, "kuota_menit")
        self.assertIn("30 detik", str(c.exception))

    def test_429_tanpa_rincian_tetap_aman(self):
        err = urllib.error.HTTPError("url", 429, "x", {}, io.BytesIO(b"bukan json"))
        with mock.patch("urllib.request.urlopen", side_effect=[err, ResponsPalsu(respons_teks("Oke."))]):
            self.assertEqual(gemini.tanya_gemini("halo"), "Oke.")

    def test_sibuk_dan_404_pindah_ke_cadangan(self):
        e503 = urllib.error.HTTPError("url", 503, "sibuk", {}, None)
        e404 = urllib.error.HTTPError("url", 404, "pensiun", {}, None)
        with mock.patch("urllib.request.urlopen", side_effect=[e503, e404, ResponsPalsu(respons_teks("Oke."))]) as m, \
                mock.patch.object(gemini.time, "sleep"):
            self.assertEqual(gemini.tanya_gemini("halo"), "Oke.")
        self.assertEqual(self.model_dipanggil(m), ["utama", "cadangan-1", "cadangan-2"])

    def test_kunci_ditolak_tidak_mencoba_cadangan(self):
        with mock.patch("urllib.request.urlopen", side_effect=urllib.error.HTTPError("url", 403, "x", {}, None)) as m:
            with self.assertRaises(gemini.GeminiError) as c:
                gemini.tanya_gemini("halo")
        self.assertEqual(c.exception.jenis, "kunci")
        self.assertEqual(m.call_count, 1)

    def test_instruksi_mediator_sama_di_model_cadangan(self):
        with mock.patch("urllib.request.urlopen", side_effect=[galat_429(), ResponsPalsu(respons_teks("Oke."))]) as m:
            gemini.tanya_gemini("halo", "Soal 2, 5, 8")
        badan = [json.loads(c.args[0].data) for c in m.call_args_list]
        self.assertEqual(badan[0]["system_instruction"], badan[1]["system_instruction"])
        self.assertEqual(badan[0]["contents"], badan[1]["contents"])

    def test_batas_waktu_per_model(self):
        """Model yang masih punya cadangan diberi waktu singkat agar cepat pindah (Tahap 2 hosting)."""
        e503 = urllib.error.HTTPError("url", 503, "sibuk", {}, None)
        with mock.patch("urllib.request.urlopen", side_effect=[e503, e503, ResponsPalsu(respons_teks("Oke."))]) as m:
            gemini.tanya_gemini("halo")
        waktu = [c.kwargs["timeout"] for c in m.call_args_list]
        self.assertEqual(waktu, [gemini.BATAS_MODEL_AWAL, gemini.BATAS_MODEL_AWAL, gemini.BATAS_WAKTU])
        self.assertLessEqual(3 * gemini.BATAS_MODEL_AWAL + gemini.BATAS_WAKTU, 60)  # < maxDuration Vercel

    def test_teks_waktu(self):
        self.assertEqual(gemini._teks_waktu(69741), "sekitar 19 jam")
        self.assertEqual(gemini._teks_waktu(125), "sekitar 3 menit")
        self.assertEqual(gemini._teks_waktu(29.2), "30 detik")


if __name__ == "__main__":
    unittest.main()
