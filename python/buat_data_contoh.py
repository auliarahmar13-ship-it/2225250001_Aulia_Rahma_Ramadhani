"""
Membuat data SIMULASI siswa untuk mencoba analisis_statistik.py.

⚠️ Data ini BUKAN data penelitian. Hapus folder python/data_siswa/ sebelum
memasukkan data asli siswa.

Model: kemampuan siswa θ ~ N(0,6; 1); peluang benar butir = logistik(1,7(θ − d)),
dengan d tingkat kesulitan butir. Beban kognitif cenderung lebih tinggi
pada siswa berkemampuan rendah.

Jalankan:  python python/buat_data_contoh.py [--n 30]
"""

from __future__ import annotations

import argparse
import json
import math
import random
from datetime import datetime, timedelta
from pathlib import Path

DIR = Path(__file__).resolve().parent
BANK = DIR.parent / "app" / "data" / "bank-soal.json"
KESULITAN = {"mudah": -1.2, "sedang": 0.0, "sulit": 0.9}
JENIS_LATIHAN = ["beda", "berikutnya", "suku-n", "cari-n", "jumlah"]
TAHAP = ["Memahami", "Merumuskan", "Menghitung", "Menafsirkan"]


def logistik(x: float) -> float:
    return 1 / (1 + math.exp(-x))


def beban(theta: float, dasar: float, rng: random.Random) -> int:
    return max(1, min(9, round(dasar - 1.2 * theta + rng.gauss(0, 1))))


def satu_siswa(i: int, bank: dict, rng: random.Random, mulai: datetime) -> dict:
    theta = rng.gauss(0.6, 1)
    t = mulai + timedelta(minutes=rng.randint(0, 600))
    iso = lambda: t.isoformat(timespec="seconds")  # noqa: E731

    data = {
        "aplikasi": "DeretKu", "versiData": 1, "simulasi": True,
        "idPerangkat": f"sim{i:03d}", "diekspor": iso(),
        "profil": {"nama": f"Siswa Simulasi {i:02d}", "kelas": rng.choice(["VIII-A", "VIII-B"])},
        "materiSelesai": [], "latihan": [], "kuis": [], "literasi": [], "bebanKognitif": [],
    }
    for u, dasar in zip(["u1", "u2", "u3", "u4"], [3, 4, 5.5, 6]):
        if rng.random() < 0.9:
            data["materiSelesai"].append(u)
            data["bebanKognitif"].append({"waktu": iso(), "konteks": f"materi:{u}", "nilai": beban(theta, dasar, rng)})

    for _ in range(rng.randint(8, 25)):
        jenis = rng.choice(JENIS_LATIHAN)
        level = rng.choice([1, 1, 2, 2, 3])
        p = logistik(1.5 * (theta - (level - 2) * 0.8) + 0.5)
        data["latihan"].append({"waktu": iso(), "jenis": jenis, "level": level, "benar": rng.random() < p,
                                "petunjuk": rng.choice([0, 0, 0, 1, 2, 3]) if theta < 0.5 else rng.choice([0, 0, 1]),
                                "durasiDetik": rng.randint(15, 120)})
    data["bebanKognitif"].append({"waktu": iso(), "konteks": "latihan:campuran", "nilai": beban(theta, 5, rng)})

    for lid in ["L1", "L2", "L3"]:
        for k, tahap in enumerate(TAHAP):
            p = logistik(1.5 * (theta - (k - 1.5) * 0.4) + 0.6)
            data["literasi"].append({"waktu": iso(), "id": lid, "tahap": tahap, "benar": rng.random() < p,
                                     "percobaan": 1 if rng.random() < p else 2})
        data["bebanKognitif"].append({"waktu": iso(), "konteks": f"literasi:{lid}", "nilai": beban(theta, 5.5, rng)})

    jawaban = []
    for s in bank["soal"]:
        benar = rng.random() < logistik(1.7 * (theta - KESULITAN[s["level"]]))
        salah = [o for o in s["opsi"] if not o["benar"]]
        jawaban.append({"id": s["id"], "benar": benar,
                        "miskonsepsi": None if benar else rng.choice(salah)["miskonsepsi"],
                        "durasiDetik": rng.randint(15, 90)})
    nb = sum(j["benar"] for j in jawaban)
    data["kuis"].append({"waktu": iso(), "skor": round(nb / len(jawaban) * 100), "benar": nb,
                         "total": len(jawaban), "durasiDetik": sum(j["durasiDetik"] for j in jawaban),
                         "jawaban": jawaban})
    data["bebanKognitif"].append({"waktu": iso(), "konteks": "kuis", "nilai": beban(theta, 5.5, rng)})
    return data


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=30)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    bank = json.loads(BANK.read_text(encoding="utf-8"))
    rng = random.Random(args.seed)
    folder = DIR / "data_siswa"
    folder.mkdir(exist_ok=True)
    mulai = datetime(2026, 11, 11, 8, 0, 0)
    for i in range(1, args.n + 1):
        d = satu_siswa(i, bank, rng, mulai)
        (folder / f"simulasi_{i:02d}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ {args.n} data siswa simulasi → {folder}")
    print("  Lanjutkan: python python/analisis_statistik.py")


if __name__ == "__main__":
    main()
