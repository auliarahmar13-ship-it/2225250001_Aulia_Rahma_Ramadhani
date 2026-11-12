"""
Pembuat bank soal kuis DeretKu.

Setiap kunci jawaban DIHITUNG dengan rumus (bukan diketik manual), lalu
diverifikasi: tepat satu opsi benar, opsi tidak kembar, dan nilai kunci sama
dengan hasil rumus. Pengecoh (opsi salah) disusun dari miskonsepsi siswa yang
umum, sehingga jawaban salah dapat dianalisis oleh analisis_statistik.py.

Jalankan:  python python/generate_bank_soal.py
Keluaran:  app/data/bank-soal.json
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KELUARAN = ROOT / "app" / "data" / "bank-soal.json"

MISKONSEPSI = {
    "M-n-bukan-n-1": "Memakai n, padahal seharusnya (n − 1) pada rumus Uₙ = a + (n − 1)b.",
    "M-lupa-bagi-2": "Lupa membagi 2 pada rumus Sₙ = n/2 (a + Uₙ).",
    "M-U-vs-S": "Tertukar antara suku ke-n (Uₙ) dan jumlah n suku pertama (Sₙ).",
    "M-beda-terbalik": "Menghitung beda terbalik (U₁ − U₂), sehingga tandanya salah.",
    "M-a-sebagai-b": "Mengira suku pertama (a) sebagai beda (b), atau sebaliknya.",
    "M-lupa-tambah-1": "Lupa menambah 1 saat menghitung banyak suku: n = (Uₙ − a)/b + 1.",
    "M-tanpa-bagi-b": "Tidak membagi dengan beda saat mencari banyak suku.",
    "M-tanpa-a": "Lupa menambahkan suku pertama (a).",
    "M-suku-lanjut": "Menjawab suku lain, bukan suku yang ditanyakan.",
    "M-operasi-terbalik": "Memakai operasi yang terbalik (menambah, padahal seharusnya mengurangi).",
    "M-lupa-bagi": "Lupa membagi selisih suku dengan selisih urutannya.",
    "M-pola-kali": "Mengira pola dikali (geometri) sebagai barisan aritmatika.",
    "M-pola-kuadrat": "Mengira pola bilangan kuadrat sebagai barisan aritmatika.",
    "M-selisih-berubah": "Tidak memeriksa bahwa selisih harus selalu sama.",
    "M-hitung": "Kesalahan operasi hitung.",
}


# ---------------------------------------------------------------------------
# Rumus
# ---------------------------------------------------------------------------
def U(a: int, b: int, n: int) -> int:
    """Suku ke-n barisan aritmatika."""
    return a + (n - 1) * b


def S(a: int, b: int, n: int) -> int:
    """Jumlah n suku pertama deret aritmatika (selalu bulat untuk a, b bulat)."""
    hasil = n * (2 * a + (n - 1) * b)
    assert hasil % 2 == 0
    return hasil // 2


def barisan(a: int, b: int, k: int) -> list[int]:
    return [U(a, b, i) for i in range(1, k + 1)]


def adalah_aritmatika(deret: list[int]) -> bool:
    selisih = {deret[i + 1] - deret[i] for i in range(len(deret) - 1)}
    return len(selisih) == 1


def rp(x: int) -> str:
    return "Rp" + f"{x:,}".replace(",", ".")


def angka(x: int) -> str:
    s = f"{abs(x):,}".replace(",", ".")
    return ("−" + s) if x < 0 else s


def daftar(xs: list[int]) -> str:
    return ", ".join(angka(x) for x in xs)


def opsi(benar, *salah):
    """benar: teks; salah: pasangan (teks, kode_miskonsepsi)."""
    hasil = [{"teks": str(benar), "benar": True, "miskonsepsi": None}]
    for teks, kode in salah:
        assert kode in MISKONSEPSI, kode
        hasil.append({"teks": str(teks), "benar": False, "miskonsepsi": kode})
    return hasil


# ---------------------------------------------------------------------------
# Butir soal
# ---------------------------------------------------------------------------
def buat_soal() -> list[dict]:
    soal: list[dict] = []

    def tambah(id_, indikator, level, pertanyaan, opsi_, pembahasan, kunci_hitung=None):
        if kunci_hitung is not None:
            kunci_teks = next(o["teks"] for o in opsi_ if o["benar"])
            assert kunci_teks == str(kunci_hitung), f"{id_}: kunci {kunci_teks} ≠ {kunci_hitung}"
        soal.append({
            "id": id_, "indikator": indikator, "level": level,
            "pertanyaan": pertanyaan, "opsi": opsi_, "pembahasan": pembahasan,
        })

    # K01 — beda
    a, b = 4, 5
    s = barisan(a, b, 4)
    tambah("K01", "TP2", "mudah",
           f"Beda dari barisan {daftar(s)}, ... adalah ....",
           opsi(angka(b), (angka(-b), "M-beda-terbalik"), (angka(a), "M-a-sebagai-b"),
                (angka(U(a, b, 5)), "M-suku-lanjut")),
           [f"b = U₂ − U₁ = {s[1]} − {s[0]} = {b}",
            f"Periksa: {s[2]} − {s[1]} = {b}, {s[3]} − {s[2]} = {b}. Selisihnya selalu sama."],
           kunci_hitung=angka(b))

    # K02 — suku berikutnya (barisan turun)
    a, b = 31, -4
    s = barisan(a, b, 4)
    tambah("K02", "TP1", "mudah",
           f"Bilangan berikutnya dari barisan {daftar(s)}, ... adalah ....",
           opsi(angka(U(a, b, 5)), (angka(17), "M-hitung"), (angka(U(a, -b, 4)), "M-beda-terbalik"),
                (angka(U(a, b, 6)), "M-suku-lanjut")),
           [f"Selisihnya: {s[1]} − {s[0]} = {angka(b)} (barisan turun 4).",
            f"Bilangan berikutnya: {s[3]} − 4 = {U(a, b, 5)}"],
           kunci_hitung=angka(U(a, b, 5)))

    # K03 — mengenali barisan aritmatika
    pilihan = {
        "benar": [2, 6, 10, 14],
        "M-pola-kali": [2, 4, 8, 16],
        "M-pola-kuadrat": [1, 4, 9, 16],
        "M-selisih-berubah": [3, 5, 8, 12],
    }
    assert adalah_aritmatika(pilihan["benar"])
    assert not any(adalah_aritmatika(v) for k, v in pilihan.items() if k != "benar")
    tambah("K03", "TP2", "mudah",
           "Manakah yang merupakan barisan aritmatika?",
           opsi(daftar(pilihan["benar"]),
                *[(daftar(v), k) for k, v in pilihan.items() if k != "benar"]),
           ["Barisan aritmatika memiliki selisih yang selalu sama.",
            "2, 6, 10, 14 → selisihnya 4, 4, 4 (selalu sama).",
            "2, 4, 8, 16 dikali 2; 1, 4, 9, 16 bilangan kuadrat; 3, 5, 8, 12 selisihnya 2, 3, 4."])

    # K04 — suku ke-n
    a, b, n = 3, 4, 15
    tambah("K04", "TP3", "sedang",
           f"Suku ke-{n} dari barisan {daftar(barisan(a, b, 3))}, ... adalah ....",
           opsi(U(a, b, n), (a + n * b, "M-n-bukan-n-1"), (n * b, "M-tanpa-a"),
                ((n - 1) * b, "M-tanpa-a")),
           [f"a = {a}, b = {b}, n = {n}",
            f"U₁₅ = a + (n − 1)b = {a} + ({n} − 1) × {b}",
            f"U₁₅ = {a} + {n - 1} × {b} = {a} + {(n - 1) * b} = {U(a, b, n)}"],
           kunci_hitung=U(a, b, n))

    # K05 — rumus suku ke-n
    a, b = 6, 4
    rumus = {
        "4n + 2": lambda n: 4 * n + 2,
        "4n + 6": lambda n: 4 * n + 6,
        "6n + 4": lambda n: 6 * n + 4,
        "4n − 2": lambda n: 4 * n - 2,
    }
    benar = [k for k, f in rumus.items() if [f(i) for i in (1, 2, 3)] == barisan(a, b, 3)]
    assert benar == ["4n + 2"]
    tambah("K05", "TP3", "sedang",
           f"Rumus suku ke-n dari barisan {daftar(barisan(a, b, 3))}, ... adalah Uₙ = ....",
           opsi("4n + 2", ("4n + 6", "M-n-bukan-n-1"), ("6n + 4", "M-a-sebagai-b"),
                ("4n − 2", "M-hitung")),
           [f"a = {a}, b = {b}",
            "Uₙ = a + (n − 1)b = 6 + (n − 1) × 4",
            "Uₙ = 6 + 4n − 4 = 4n + 2",
            "Periksa: n = 1 → 4(1) + 2 = 6 ✓"])

    # K06 — banyak suku
    a, b, akhir = 5, 4, 101
    n = (akhir - a) // b + 1
    assert U(a, b, n) == akhir
    tambah("K06", "TP3", "sedang",
           f"Banyak suku pada barisan {daftar(barisan(a, b, 3))}, ..., {akhir} adalah ....",
           opsi(n, (n - 1, "M-lupa-tambah-1"), (akhir - a, "M-tanpa-bagi-b"), (n + 1, "M-hitung")),
           [f"Uₙ = {akhir}, a = {a}, b = {b}",
            f"{akhir} = {a} + (n − 1) × {b}",
            f"{akhir - a} = (n − 1) × {b} → n − 1 = {(akhir - a) // b}",
            f"n = {n}"],
           kunci_hitung=n)

    # K07 — mencari a
    n, un, b = 8, 30, 3
    a = un - (n - 1) * b
    assert U(a, b, n) == un
    tambah("K07", "TP3", "sulit",
           f"Suku ke-{n} suatu barisan aritmatika adalah {un} dan bedanya {b}. Suku pertamanya adalah ....",
           opsi(a, (un - n * b, "M-n-bukan-n-1"), (un - b, "M-hitung"),
                (un + (n - 1) * b, "M-operasi-terbalik")),
           [f"U₈ = a + 7b → {un} = a + 7 × {b}",
            f"{un} = a + {7 * b}",
            f"a = {un} − {7 * b} = {a}"],
           kunci_hitung=a)

    # K08 — mencari b dari dua suku
    a, b = 3, 4
    u3, u7 = U(a, b, 3), U(a, b, 7)
    tambah("K08", "TP3", "sulit",
           f"Diketahui U₃ = {u3} dan U₇ = {u7} pada suatu barisan aritmatika. Bedanya adalah ....",
           opsi(b, (u7 - u3, "M-lupa-bagi"), (5, "M-hitung"), (a, "M-a-sebagai-b")),
           [f"Dari U₃ ke U₇ ada 7 − 3 = 4 langkah beda.",
            f"4b = U₇ − U₃ = {u7} − {u3} = {u7 - u3}",
            f"b = {u7 - u3} : 4 = {b}"],
           kunci_hitung=b)

    # K09 — jumlah n suku
    a, b, n = 2, 3, 10
    tambah("K09", "TP4", "sedang",
           f"Jumlah {n} suku pertama deret {' + '.join(map(str, barisan(a, b, 3)))} + ... adalah ....",
           opsi(S(a, b, n), (2 * S(a, b, n), "M-lupa-bagi-2"), (U(a, b, n), "M-U-vs-S"),
                (n * (2 * a + n * b) // 2, "M-n-bukan-n-1")),
           [f"a = {a}, b = {b}, n = {n}",
            f"Sₙ = n/2 (2a + (n − 1)b) = {n}/2 × (2 × {a} + 9 × {b})",
            f"S₁₀ = 5 × ({2 * a} + {9 * b}) = 5 × {2 * a + 9 * b} = {S(a, b, n)}"],
           kunci_hitung=S(a, b, n))

    # K10 — Gauss
    n = 50
    tambah("K10", "TP4", "sedang",
           "Hasil dari 1 + 2 + 3 + ... + 50 adalah ....",
           opsi(angka(S(1, 1, n)), (angka(2 * S(1, 1, n)), "M-lupa-bagi-2"),
                (angka(n * n // 2), "M-hitung"), (angka(n), "M-U-vs-S")),
           ["a = 1, Uₙ = 50, n = 50",
            "Sₙ = n/2 (a + Uₙ) = 50/2 × (1 + 50)",
            f"S₅₀ = 25 × 51 = {angka(S(1, 1, n))}"],
           kunci_hitung=angka(S(1, 1, n)))

    # K11 — bilangan genap
    a, b, n = 2, 2, 20
    assert U(a, b, n) == 40
    tambah("K11", "TP4", "sulit",
           "Jumlah semua bilangan genap dari 2 sampai 40 adalah ....",
           opsi(S(a, b, n), (2 * S(a, b, n), "M-lupa-bagi-2"), (40, "M-U-vs-S"),
                (400, "M-hitung")),
           ["Barisannya 2, 4, 6, ..., 40 → a = 2, b = 2",
            "Banyak suku: 40 = 2 + (n − 1) × 2 → n = 20",
            f"S₂₀ = 20/2 × (2 + 40) = 10 × 42 = {S(a, b, n)}"],
           kunci_hitung=S(a, b, n))

    # K12–K13 — konteks tabungan
    a, b, n = 10_000, 5_000, 8
    cerita = ("Doni menabung setiap minggu. Minggu pertama ia menabung Rp10.000, dan setiap minggu "
              "berikutnya ia menabung Rp5.000 lebih banyak daripada minggu sebelumnya. ")
    tambah("K12", "TP5", "sedang",
           cerita + "Berapa uang yang ditabung Doni pada minggu ke-8?",
           opsi(rp(U(a, b, n)), (rp(a + n * b), "M-n-bukan-n-1"), (rp(S(a, b, n)), "M-U-vs-S"),
                (rp(40_000), "M-hitung")),
           ["Yang ditanya: tabungan pada SATU minggu (minggu ke-8) → suku ke-8 (U₈).",
            "U₈ = 10.000 + (8 − 1) × 5.000 = 10.000 + 35.000",
            f"U₈ = {rp(U(a, b, n))}"],
           kunci_hitung=rp(U(a, b, n)))
    tambah("K13", "TP5", "sulit",
           cerita + "Berapa JUMLAH seluruh tabungan Doni selama 8 minggu?",
           opsi(rp(S(a, b, n)), (rp(2 * S(a, b, n)), "M-lupa-bagi-2"), (rp(U(a, b, n)), "M-U-vs-S"),
                (rp(n * (2 * a + n * b) // 2), "M-n-bukan-n-1")),
           ["Yang ditanya: JUMLAH selama 8 minggu → deret (S₈).",
            "U₈ = 45.000 (tabungan minggu ke-8)",
            f"S₈ = 8/2 × (10.000 + 45.000) = 4 × 55.000 = {rp(S(a, b, n))}"],
           kunci_hitung=rp(S(a, b, n)))

    # K14 — kursi
    a, b, n = 12, 2, 20
    tambah("K14", "TP5", "sulit",
           "Sebuah aula memiliki 20 baris kursi. Baris pertama berisi 12 kursi, dan setiap baris "
           "berikutnya bertambah 2 kursi. Banyak kursi seluruhnya di aula itu adalah ....",
           opsi(S(a, b, n), (2 * S(a, b, n), "M-lupa-bagi-2"), (U(a, b, n), "M-U-vs-S"),
                (n * (2 * a + n * b) // 2, "M-n-bukan-n-1")),
           ["a = 12, b = 2, n = 20",
            f"Baris terakhir: U₂₀ = 12 + 19 × 2 = {U(a, b, n)}",
            f"S₂₀ = 20/2 × (12 + {U(a, b, n)}) = 10 × {a + U(a, b, n)} = {S(a, b, n)}"],
           kunci_hitung=S(a, b, n))

    # K15 — beda dari rumus
    f = lambda n: 3 * n + 1  # noqa: E731
    beda = f(2) - f(1)
    tambah("K15", "TP3", "sulit",
           "Suatu barisan aritmatika memiliki rumus Uₙ = 3n + 1. Beda barisan tersebut adalah ....",
           opsi(beda, (1, "M-hitung"), (f(1), "M-a-sebagai-b"), (f(2), "M-suku-lanjut")),
           [f"U₁ = 3(1) + 1 = {f(1)}, U₂ = 3(2) + 1 = {f(2)}",
            f"b = U₂ − U₁ = {f(2)} − {f(1)} = {beda}",
            "Cara cepat: beda = koefisien n pada rumus Uₙ."],
           kunci_hitung=beda)

    return soal


def validasi(soal: list[dict]) -> None:
    ids = [s["id"] for s in soal]
    assert len(ids) == len(set(ids)), "ID soal kembar"
    for s in soal:
        assert sum(o["benar"] for o in s["opsi"]) == 1, f"{s['id']}: harus tepat satu kunci"
        teks = [o["teks"] for o in s["opsi"]]
        assert len(teks) == len(set(teks)), f"{s['id']}: opsi kembar {teks}"
        assert len(s["opsi"]) == 4, f"{s['id']}: harus 4 opsi"


def bangun() -> dict:
    soal = buat_soal()
    validasi(soal)
    return {
        "versi": 1,
        "dibuat": date.today().isoformat(),
        "keterangan": "Dibuat otomatis oleh python/generate_bank_soal.py. Jangan diedit manual.",
        "miskonsepsi": MISKONSEPSI,
        "soal": soal,
    }


def main() -> None:
    data = bangun()
    KELUARAN.parent.mkdir(parents=True, exist_ok=True)
    KELUARAN.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ {len(data['soal'])} soal terverifikasi → {KELUARAN.relative_to(ROOT)}")
    for s in data["soal"]:
        kunci = next(o["teks"] for o in s["opsi"] if o["benar"])
        print(f"  {s['id']} [{s['indikator']}, {s['level']:6}] kunci: {kunci}")


if __name__ == "__main__":
    main()
