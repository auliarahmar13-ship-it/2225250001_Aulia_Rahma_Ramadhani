"""Uji statis berkas SQL Supabase (tanpa database & tanpa internet). docs/13-rancangan-supabase.md"""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SQL = (ROOT / "supabase" / "migrations" / "20261127000000_skema_awal.sql").read_text(encoding="utf-8")
UJI = (ROOT / "supabase" / "uji_rls.sql").read_text(encoding="utf-8")
# Tanpa komentar, huruf kecil, dan spasi dirapatkan (SQL sengaja dirapikan dengan banyak spasi)
TANPA_KOMENTAR = re.sub(r"\s+", " ", re.sub(r"--[^\n]*", "", SQL)).lower()
TABEL = re.findall(r"create table public\.(\w+)", TANPA_KOMENTAR)


class TestSkemaSupabase(unittest.TestCase):
    def test_tiga_tabel_dalam_transaksi(self):
        self.assertEqual(sorted(TABEL), ["aktivitas", "profil", "progres"])
        self.assertTrue(TANPA_KOMENTAR.strip().startswith("begin;"))
        self.assertTrue(TANPA_KOMENTAR.strip().endswith("commit;"))

    def test_rls_aktif_di_semua_tabel(self):
        for t in TABEL:
            self.assertIn(f"alter table public.{t}", TANPA_KOMENTAR)
            self.assertRegex(TANPA_KOMENTAR, rf"alter table public\.{t}\s+enable row level security")

    def test_hak_anon_dicabut_dan_tidak_diberikan(self):
        self.assertRegex(TANPA_KOMENTAR, r"revoke all on table public\.profil, public\.progres, public\.aktivitas from anon, authenticated")
        self.assertNotRegex(TANPA_KOMENTAR, r"grant [^;]* to [^;]*anon")

    def test_setiap_policy_untuk_authenticated_dan_auth_uid(self):
        policy = re.findall(r"create policy [^;]+;", TANPA_KOMENTAR)
        self.assertEqual(len(policy), 8)
        for p in policy:
            self.assertIn("to authenticated", p, p)
            self.assertIn("(select auth.uid())", p, p)
        self.assertNotIn("auth.uid() is null", TANPA_KOMENTAR)  # celah klasik: membuka semua baris
        self.assertNotRegex(TANPA_KOMENTAR, r"using\s*\(\s*true\s*\)")

    def test_peran_tidak_bisa_diubah_siswa(self):
        self.assertIn("grant update (nama_panggilan, kelas) on table public.profil to authenticated", TANPA_KOMENTAR)
        self.assertNotRegex(TANPA_KOMENTAR, r"grant update\s+on table public\.profil")
        fungsi = TANPA_KOMENTAR.split("create function public.buat_profil_baru()", 1)[1].split("$$;", 1)[0]
        self.assertNotIn("peran", fungsi, "peran tidak boleh diambil dari metadata pendaftaran")

    def test_aktivitas_tanpa_update(self):
        self.assertIn("grant select, insert, delete on table public.aktivitas", TANPA_KOMENTAR)
        self.assertNotRegex(TANPA_KOMENTAR, r"grant [^;]*update[^;]* on table public\.aktivitas")

    def test_fungsi_security_definer_aman(self):
        self.assertRegex(TANPA_KOMENTAR, r"security definer\s+set search_path = ''")
        self.assertIn("revoke execute on function public.buat_profil_baru() from public, anon, authenticated", TANPA_KOMENTAR)

    def test_jenis_aktivitas_sesuai_state_js(self):
        jenis = re.search(r"jenis in \(([^)]*)\)", TANPA_KOMENTAR).group(1)
        self.assertEqual(sorted(re.findall(r"'(\w+)'", jenis)),
                         sorted(["pretes", "pemanasan", "latihan", "kuis", "literasi", "jurnal", "beban"]))

    def test_tidak_ada_kunci_di_berkas_supabase(self):
        for isi in (SQL, UJI, (ROOT / ".env.example").read_text(encoding="utf-8")):
            self.assertNotRegex(isi, r"sb_secret_[A-Za-z0-9]|sb_publishable_[A-Za-z0-9]{8}|eyJhbGciOi")
            self.assertNotRegex(isi, r"https://[a-z0-9]{12,}\.supabase\.co")  # URL proyek asli tidak di repositori

    def test_uji_rls_selalu_rollback(self):
        bersih = re.sub(r"--[^\n]*", "", UJI).lower()
        self.assertTrue(bersih.strip().startswith("begin;"))
        self.assertIn("rollback;", bersih)
        self.assertNotIn("commit;", bersih)
        for nomor in range(1, 8):
            self.assertIn(f"uji {nomor} gagal", bersih)


if __name__ == "__main__":
    unittest.main()
