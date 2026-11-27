"""Uji hosting Tahap 6 (akun Supabase): GET /api/konfigurasi (lokal & Vercel) + pemeriksaan statis frontend.

Tanpa internet dan tanpa kunci asli: nilai Supabase diganti variabel lingkungan tiruan.
"""

import base64
import functools
import http.client
import importlib.util
import json
import os
import re
import sys
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest import mock

DIR = Path(__file__).resolve().parent.parent
ROOT = DIR.parent
APP = ROOT / "app"
sys.path.insert(0, str(DIR))

import api_tanya  # noqa: E402
import serve  # noqa: E402

URL_TIRUAN = "https://contohproyek.supabase.co"
KUNCI_TIRUAN = "sb_publishable_TIRUAN_bukan_kunci_asli"


def jwt(peran: str) -> str:
    bagian = lambda o: base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip("=")  # noqa: E731
    return f"{bagian({'alg': 'HS256'})}.{bagian({'role': peran, 'iss': 'supabase'})}.tandatangan"


def muat_handler_vercel(nama="konfigurasi"):
    spec = importlib.util.spec_from_file_location(f"vercel_{nama}", ROOT / "api" / f"{nama}.py")
    modul = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modul)
    return modul.handler


class TestKonfigurasiPublik(unittest.TestCase):
    def nilai(self, url, kunci):
        env = {"SUPABASE_URL": url, "SUPABASE_PUBLISHABLE_KEY": kunci}
        with mock.patch.dict(os.environ, env), mock.patch.object(api_tanya.gemini, "baca_env", return_value={}):
            return api_tanya.konfigurasi_publik()["supabase"]

    def test_kunci_publishable_dikirim(self):
        self.assertEqual(self.nilai(URL_TIRUAN + "/", KUNCI_TIRUAN), {"url": URL_TIRUAN, "kunci": KUNCI_TIRUAN})

    def test_kunci_rahasia_ditolak(self):
        self.assertIsNone(self.nilai(URL_TIRUAN, "sb_secret_JANGAN_DIKIRIM"))
        self.assertIsNone(self.nilai(URL_TIRUAN, jwt("service_role")))
        self.assertIsNone(self.nilai(URL_TIRUAN, "acak-tanpa-format"))

    def test_kunci_anon_lama_diterima(self):
        self.assertIsNotNone(self.nilai(URL_TIRUAN, jwt("anon")))

    def test_url_harus_https(self):
        self.assertIsNone(self.nilai("http://contohproyek.supabase.co", KUNCI_TIRUAN))
        self.assertIsNone(self.nilai(URL_TIRUAN + "/rest/v1", KUNCI_TIRUAN))
        self.assertIsNotNone(self.nilai("http://127.0.0.1:9999", KUNCI_TIRUAN))  # uji lokal saja

    def test_kosong(self):
        self.assertIsNone(self.nilai("", ""))


class TestApiKonfigurasi(unittest.TestCase):
    handler = None

    @classmethod
    def setUpClass(cls):
        if cls.handler is None:
            class Senyap(serve.Handler):
                def log_message(self, *a):
                    pass
            h = functools.partial(Senyap, directory=str(serve.APP))
        else:
            class Senyap(cls.handler):  # noqa: F811
                def log_message(self, *a):
                    pass
            h = Senyap
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), h)
        cls.port = cls.server.server_address[1]
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        env = {"SUPABASE_URL": URL_TIRUAN, "SUPABASE_PUBLISHABLE_KEY": KUNCI_TIRUAN, "GEMINI_API_KEY": "AIzaRAHASIA_GEMINI_TIDAK_BOLEH_BOCOR"}
        for p in (mock.patch.dict(os.environ, env), mock.patch.object(api_tanya.gemini, "baca_env", return_value={})):
            p.start()
            self.addCleanup(p.stop)

    def minta(self, metode="GET", jalur="/api/konfigurasi"):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        c.request(metode, jalur, body=b"{}" if metode == "POST" else None,
                  headers={"Content-Type": "application/json"} if metode == "POST" else {})
        r = c.getresponse()
        mentah = r.read()
        c.close()
        return r.status, mentah, r

    def test_get(self):
        status, mentah, r = self.minta()
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(mentah), {"supabase": {"url": URL_TIRUAN, "kunci": KUNCI_TIRUAN}})
        self.assertIn("no-store", r.getheader("Cache-Control"))
        self.assertNotIn(b"AIza", mentah)
        self.assertNotIn(b"GEMINI", mentah)

    def test_metode_lain_ditolak(self):
        status, _, r = self.minta("POST")
        self.assertEqual(status, 405)
        self.assertEqual(r.getheader("Allow"), "GET")

    def test_kunci_rahasia_tidak_pernah_dikirim(self):
        with mock.patch.dict(os.environ, {"SUPABASE_PUBLISHABLE_KEY": "sb_secret_RAHASIA"}):
            status, mentah, _ = self.minta()
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(mentah), {"supabase": None})
        self.assertNotIn(b"sb_secret_", mentah)


class TestApiKonfigurasiVercel(TestApiKonfigurasi):
    """Uji yang sama terhadap fungsi Vercel api/konfigurasi.py."""
    handler = muat_handler_vercel()


class TestFrontendAkun(unittest.TestCase):
    """Pemeriksaan statis aturan keamanan & local-first di frontend."""

    def baca(self, rel):
        return (APP / rel).read_text(encoding="utf-8")

    def test_tanpa_kunci_rahasia_atau_url_proyek_di_app(self):
        for berkas in APP.rglob("*.js"):
            isi = berkas.read_text(encoding="utf-8")
            self.assertIsNone(re.search(r"sb_secret_|sb_publishable_[A-Za-z0-9]|service_role|eyJhbGciOi", isi), berkas.name)
            self.assertNotRegex(isi, r"https://[a-z0-9]{12,}\.supabase\.co", berkas)

    def test_localstorage_hanya_di_state(self):
        for berkas in APP.rglob("*.js"):
            if berkas.name != "state.js":
                self.assertNotIn("localStorage", berkas.read_text(encoding="utf-8"), berkas.name)

    def test_tanpa_pustaka_luar(self):
        for berkas in ["js/akun.js", "js/sinkron.js", "js/views/akun.js"]:
            isi = self.baca(berkas)
            self.assertNotRegex(isi, r"""import [^;]*from ['"](https?:|@|supabase)""", berkas)

    def test_sinkron_tidak_menghapus_aktivitas(self):
        isi = self.baca("js/sinkron.js")
        self.assertNotRegex(isi, r"rest\('DELETE'")
        self.assertIn("resolution=ignore-duplicates", isi)  # kiriman ulang tidak menggandakan

    def test_keluar_tidak_menghapus_data_belajar(self):
        isi = self.baca("js/akun.js")
        fungsi = isi.split("export async function keluar()", 1)[1].split("\n}\n", 1)[0]
        self.assertIn("simpanSesi(null)", fungsi)
        self.assertNotRegex(fungsi, r"hapusSemua|pisahkanData")

    def test_cadangan_tidak_ditimpa(self):
        isi = self.baca("js/state.js")
        fungsi = isi.split("export function pisahkanData", 1)[1].split("\n}\n", 1)[0]
        # cadangan ditulis lebih dulu; bila gagal, data utama tidak diganti
        self.assertRegex(fungsi, r"if \(!tulis\(AWALAN_CADANGAN \+ nama, isiCadangan \|\| data\)\) return false;")

    def test_id_catatan_tidak_menimpa_id_tugas(self):
        isi = self.baca("js/state.js")
        self.assertIn("const baru = (e) => ({ waktu: sekarang(), ...e, idCatatan: buatId() });", isi)
        self.assertNotRegex(isi, r"\be\.id = buatId")

    def test_daftar_hanya_minta_data_perlu(self):
        isi = self.baca("js/akun.js")
        data = re.search(r"data: \{([^}]*)\}", isi).group(1)
        self.assertEqual(sorted(re.findall(r"(\w+):", data)), ["kelas", "nama_panggilan"])
        self.assertNotIn("peran", data)

    def test_versi_data_4(self):
        self.assertIn("versiData: 4,", self.baca("js/state.js"))

    def test_sw_tidak_cache_api(self):
        self.assertIn("url.pathname.includes('/api/')", self.baca("sw.js"))


if __name__ == "__main__":
    unittest.main()
