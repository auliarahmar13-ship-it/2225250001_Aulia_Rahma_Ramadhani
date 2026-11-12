"""
Analisis statistik data DeretKu (hasil ekspor dari menu "Saya → Ekspor Data").

Masukkan berkas JSON siswa ke folder python/data_siswa/, lalu jalankan:

    python python/analisis_statistik.py
    python python/analisis_statistik.py --data folder_lain --kuis terakhir

Analisis:
  1. Statistik deskriptif skor kuis + ketuntasan (KKTP)
  2. Analisis butir: tingkat kesukaran (p) dan daya beda (point-biserial terkoreksi)
  3. Reliabilitas KR-20
  4. Frekuensi miskonsepsi
  5. Beban kognitif (skala Paas 1–9) per konteks
  6. Korelasi Pearson beban kognitif vs skor (+ uji t, nilai p)
  7. Efisiensi instruksional E = (z_skor − z_beban) / √2  (Paas & van Merriënboer, 1993)
  8. Latihan per jenis & literasi per tahap

Keluaran di python/hasil/: laporan.md, rekap_siswa.csv, analisis_butir.csv,
dan grafik PNG bila matplotlib terpasang (pip install matplotlib).
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import statistics as st
import sys
from collections import Counter, defaultdict
from pathlib import Path

DIR = Path(__file__).resolve().parent
BANK = DIR.parent / "app" / "data" / "bank-soal.json"


# ---------------------------------------------------------------------------
# Fungsi statistik (pustaka standar)
# ---------------------------------------------------------------------------
def pearson(x: list[float], y: list[float]) -> float | None:
    n = len(x)
    if n < 3 or n != len(y):
        return None
    mx, my = st.fmean(x), st.fmean(y)
    sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    sxx = sum((a - mx) ** 2 for a in x)
    syy = sum((b - my) ** 2 for b in y)
    if sxx == 0 or syy == 0:
        return None
    return sxy / math.sqrt(sxx * syy)


def _betacf(a: float, b: float, x: float) -> float:
    """Pecahan berlanjut untuk fungsi beta tak lengkap (Numerical Recipes)."""
    maks, eps, fpmin = 200, 3e-14, 1e-300
    qab, qap, qam = a + b, a + 1, a - 1
    c, d = 1.0, 1 - qab * x / qap
    d = 1 / (d if abs(d) > fpmin else fpmin)
    h = d
    for m in range(1, maks + 1):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1 + aa * d
        d = 1 / (d if abs(d) > fpmin else fpmin)
        c = 1 + aa / c if abs(1 + aa / c) > fpmin else fpmin
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1 + aa * d
        d = 1 / (d if abs(d) > fpmin else fpmin)
        c = 1 + aa / c if abs(1 + aa / c) > fpmin else fpmin
        delta = d * c
        h *= delta
        if abs(delta - 1) < eps:
            break
    return h


def beta_tak_lengkap(a: float, b: float, x: float) -> float:
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    ln_bt = math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b) + a * math.log(x) + b * math.log(1 - x)
    bt = math.exp(ln_bt)
    if x < (a + 1) / (a + b + 2):
        return bt * _betacf(a, b, x) / a
    return 1 - bt * _betacf(b, a, 1 - x) / b


def p_value_korelasi(r: float, n: int) -> float | None:
    """Nilai p dua sisi untuk H0: ρ = 0 (uji t, df = n − 2)."""
    if r is None or n < 3:
        return None
    if abs(r) >= 1:
        return 0.0
    df = n - 2
    t = r * math.sqrt(df / (1 - r * r))
    return beta_tak_lengkap(df / 2, 0.5, df / (df + t * t))


def kr20(matriks: list[list[int]]) -> float | None:
    """Reliabilitas Kuder-Richardson 20. matriks[siswa][butir] bernilai 0/1."""
    if len(matriks) < 2:
        return None
    k = len(matriks[0])
    total = [sum(r) for r in matriks]
    var_total = st.pvariance(total)
    if k < 2 or var_total == 0:
        return None
    n = len(matriks)
    pq = sum((sum(r[j] for r in matriks) / n) * (1 - sum(r[j] for r in matriks) / n) for j in range(k))
    return k / (k - 1) * (1 - pq / var_total)


def zskor(xs: list[float]) -> list[float]:
    if len(xs) < 2 or st.pstdev(xs) == 0:
        return [0.0] * len(xs)
    m, s = st.fmean(xs), st.pstdev(xs)
    return [(x - m) / s for x in xs]


def ringkas(xs: list[float]) -> dict:
    if not xs:
        return {"n": 0}
    return {
        "n": len(xs), "rata": st.fmean(xs), "median": st.median(xs),
        "sb": st.stdev(xs) if len(xs) > 1 else 0.0, "min": min(xs), "maks": max(xs),
    }


def kategori_p(p: float) -> str:
    return "Sukar" if p <= 0.30 else ("Sedang" if p <= 0.70 else "Mudah")


def kategori_daya_beda(r: float | None) -> str:
    if r is None:
        return "-"
    if r >= 0.40:
        return "Sangat baik"
    if r >= 0.30:
        return "Baik"
    if r >= 0.20:
        return "Cukup (revisi)"
    return "Jelek (buang/revisi)"


def kategori_korelasi(r: float | None) -> str:
    if r is None:
        return "-"
    a = abs(r)
    kekuatan = ("sangat lemah" if a < 0.2 else "lemah" if a < 0.4 else "sedang" if a < 0.6
                else "kuat" if a < 0.8 else "sangat kuat")
    return f"{kekuatan}, {'positif' if r > 0 else 'negatif'}"


def kategori_beban(m: float) -> str:
    return "Rendah" if m <= 3 else ("Sedang" if m <= 6 else "Tinggi")


# ---------------------------------------------------------------------------
# Memuat data
# ---------------------------------------------------------------------------
def muat_siswa(folder: Path) -> list[dict]:
    data = []
    for f in sorted(folder.glob("*.json")):
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            print(f"  ! Lewati {f.name}: {e}", file=sys.stderr)
            continue
        if d.get("aplikasi") != "DeretKu":
            print(f"  ! Lewati {f.name}: bukan data DeretKu", file=sys.stderr)
            continue
        d["_berkas"] = f.name
        data.append(d)
    # Gabungkan ekspor ganda dari perangkat yang sama: ambil yang terbaru
    per_id: dict[str, dict] = {}
    for d in data:
        kunci = d.get("idPerangkat") or d["_berkas"]
        if kunci not in per_id or d.get("diekspor", "") > per_id[kunci].get("diekspor", ""):
            per_id[kunci] = d
    return list(per_id.values())


def pilih_kuis(d: dict, mode: str) -> dict | None:
    kuis = sorted(d.get("kuis", []), key=lambda k: k.get("waktu", ""))
    if not kuis:
        return None
    if mode == "pertama":
        return kuis[0]
    if mode == "terakhir":
        return kuis[-1]
    return max(kuis, key=lambda k: k.get("skor", 0))


def nama_siswa(d: dict) -> str:
    p = d.get("profil", {})
    return p.get("nama") or d.get("idPerangkat") or d["_berkas"]


# ---------------------------------------------------------------------------
# Analisis utama
# ---------------------------------------------------------------------------
def analisis(siswa: list[dict], bank: dict, mode_kuis: str, kktp: float) -> dict:
    ids_butir = [s["id"] for s in bank["soal"]]
    hasil: dict = {"n_berkas": len(siswa), "mode_kuis": mode_kuis, "kktp": kktp}

    # ---- Kuis ----
    rekap, matriks, salah_miskonsepsi = [], [], Counter()
    for d in siswa:
        k = pilih_kuis(d, mode_kuis)
        beban = [b["nilai"] for b in d.get("bebanKognitif", []) if isinstance(b.get("nilai"), (int, float))]
        beban_kuis = [b["nilai"] for b in d.get("bebanKognitif", []) if b.get("konteks") == "kuis"]
        baris = {
            "nama": nama_siswa(d), "kelas": d.get("profil", {}).get("kelas", ""),
            "materi_selesai": len(d.get("materiSelesai", [])),
            "jumlah_latihan": len(d.get("latihan", [])),
            "akurasi_latihan": (st.fmean([1 if l.get("benar") else 0 for l in d["latihan"]]) * 100
                                if d.get("latihan") else None),
            "skor_kuis": k.get("skor") if k else None,
            "beban_rata": st.fmean(beban) if beban else None,
            "beban_kuis": beban_kuis[0] if beban_kuis else None,
        }
        rekap.append(baris)
        if k:
            jaw = {j["id"]: j for j in k.get("jawaban", [])}
            matriks.append([1 if jaw.get(i, {}).get("benar") else 0 for i in ids_butir])
            for j in k.get("jawaban", []):
                if not j.get("benar") and j.get("miskonsepsi"):
                    salah_miskonsepsi[j["miskonsepsi"]] += 1

    skor = [r["skor_kuis"] for r in rekap if r["skor_kuis"] is not None]
    hasil["rekap"] = rekap
    hasil["skor"] = ringkas(skor)
    hasil["tuntas"] = sum(1 for s in skor if s >= kktp)
    hasil["matriks"] = matriks

    # ---- Analisis butir ----
    butir = []
    if matriks:
        total = [sum(r) for r in matriks]
        for j, id_ in enumerate(ids_butir):
            kolom = [r[j] for r in matriks]
            p = st.fmean(kolom)
            sisa = [t - x for t, x in zip(total, kolom)]
            r_pbis = pearson([float(x) for x in kolom], [float(s) for s in sisa])
            soal = bank["soal"][j]
            butir.append({
                "id": id_, "indikator": soal["indikator"], "level_rancangan": soal["level"],
                "p": p, "kategori_p": kategori_p(p), "daya_beda": r_pbis,
                "kategori_daya_beda": kategori_daya_beda(r_pbis),
            })
    hasil["butir"] = butir
    hasil["kr20"] = kr20(matriks)
    hasil["miskonsepsi"] = salah_miskonsepsi.most_common()

    # ---- Beban kognitif per konteks ----
    per_konteks: dict[str, list[float]] = defaultdict(list)
    for d in siswa:
        for b in d.get("bebanKognitif", []):
            if isinstance(b.get("nilai"), (int, float)):
                konteks = b.get("konteks", "?")
                kelompok = konteks.split(":")[0] if konteks.startswith(("latihan", "literasi")) else konteks
                per_konteks[kelompok].append(b["nilai"])
    hasil["beban"] = {k: ringkas(v) for k, v in sorted(per_konteks.items())}

    # ---- Korelasi & efisiensi ----
    pasangan = [(r["beban_rata"], r["skor_kuis"]) for r in rekap
                if r["beban_rata"] is not None and r["skor_kuis"] is not None]
    if pasangan:
        xb, ys = [p[0] for p in pasangan], [p[1] for p in pasangan]
        r = pearson(xb, ys)
        hasil["korelasi"] = {"n": len(pasangan), "r": r, "p": p_value_korelasi(r, len(pasangan)),
                             "kategori": kategori_korelasi(r)}
        zb, zs = zskor(xb), zskor(ys)
        efisiensi = [(s - b) / math.sqrt(2) for s, b in zip(zs, zb)]
        hasil["efisiensi"] = ringkas(efisiensi)
        i = 0
        for baris in rekap:
            if baris["beban_rata"] is not None and baris["skor_kuis"] is not None:
                baris["efisiensi"] = efisiensi[i]
                i += 1
    else:
        hasil["korelasi"] = None
        hasil["efisiensi"] = {"n": 0}

    # ---- Latihan ----
    lat: dict[str, list[dict]] = defaultdict(list)
    for d in siswa:
        for l in d.get("latihan", []):
            lat[l.get("jenis", "?")].append(l)
    hasil["latihan"] = {
        j: {"n": len(v), "akurasi": st.fmean([1 if x.get("benar") else 0 for x in v]) * 100,
            "petunjuk_rata": st.fmean([x.get("petunjuk", 0) for x in v]),
            "durasi_rata": st.fmean([x.get("durasiDetik", 0) for x in v])}
        for j, v in sorted(lat.items())
    }

    # ---- Literasi ----
    lit: dict[str, list[dict]] = defaultdict(list)
    for d in siswa:
        for l in d.get("literasi", []):
            lit[l.get("tahap", "?")].append(l)
    urutan = ["Memahami", "Merumuskan", "Menghitung", "Menafsirkan"]
    hasil["literasi"] = {
        t: {"n": len(lit[t]), "benar_percobaan_1": st.fmean([1 if x.get("benar") else 0 for x in lit[t]]) * 100}
        for t in urutan if lit.get(t)
    }
    return hasil


# ---------------------------------------------------------------------------
# Keluaran
# ---------------------------------------------------------------------------
def f2(x, d=2) -> str:
    return "-" if x is None else f"{x:.{d}f}".replace(".", ",")


def tulis_laporan(h: dict, bank: dict, folder: Path) -> str:
    L = []
    L.append("# Laporan Analisis Statistik DeretKu\n")
    L.append(f"Jumlah siswa (berkas unik): **{h['n_berkas']}** · Data kuis: percobaan **{h['mode_kuis']}** · "
             f"KKTP: **{h['kktp']:g}**\n")

    s = h["skor"]
    L.append("## 1. Statistik Deskriptif Skor Kuis\n")
    if s["n"]:
        L.append("| n | Rata-rata | Median | Simpangan baku | Min | Maks | Tuntas |")
        L.append("|---|-----------|--------|----------------|-----|------|--------|")
        L.append(f"| {s['n']} | {f2(s['rata'])} | {f2(s['median'])} | {f2(s['sb'])} | {s['min']:g} | "
                 f"{s['maks']:g} | {h['tuntas']} ({f2(h['tuntas'] / s['n'] * 100, 1)}%) |\n")
    else:
        L.append("_Belum ada data kuis._\n")

    L.append("## 2. Analisis Butir Soal\n")
    if h["butir"]:
        L.append("| Butir | TP | Level rancangan | p | Kesukaran | Daya beda (r_pbis) | Kategori |")
        L.append("|-------|----|-----------------|---|-----------|--------------------|----------|")
        for b in h["butir"]:
            L.append(f"| {b['id']} | {b['indikator']} | {b['level_rancangan']} | {f2(b['p'])} | {b['kategori_p']} | "
                     f"{f2(b['daya_beda'])} | {b['kategori_daya_beda']} |")
        L.append("")
        L.append(f"**Reliabilitas KR-20:** {f2(h['kr20'], 3)} "
                 f"({'reliabel' if (h['kr20'] or 0) >= 0.7 else 'perlu perbaikan'}; kriteria ≥ 0,70)\n")

    L.append("## 3. Miskonsepsi yang Paling Sering Muncul\n")
    if h["miskonsepsi"]:
        L.append("| Kode | Keterangan | Frekuensi |")
        L.append("|------|------------|-----------|")
        for kode, n in h["miskonsepsi"]:
            L.append(f"| {kode} | {bank['miskonsepsi'].get(kode, '')} | {n} |")
        L.append("")
    else:
        L.append("_Tidak ada._\n")

    L.append("## 4. Beban Kognitif (Skala Paas 1–9)\n")
    if h["beban"]:
        L.append("| Konteks | n | Rata-rata | SB | Kategori |")
        L.append("|---------|---|-----------|----|----------|")
        for k, v in h["beban"].items():
            L.append(f"| {k} | {v['n']} | {f2(v['rata'])} | {f2(v['sb'])} | {kategori_beban(v['rata'])} |")
        L.append("\nKategori: 1–3 rendah, >3–6 sedang, >6–9 tinggi.\n")

    L.append("## 5. Hubungan Beban Kognitif dan Skor Kuis\n")
    k = h["korelasi"]
    if k and k["r"] is not None:
        sig = "signifikan" if k["p"] is not None and k["p"] < 0.05 else "tidak signifikan"
        L.append(f"Korelasi Pearson: **r = {f2(k['r'], 3)}** (n = {k['n']}, p = {f2(k['p'], 4)}), "
                 f"hubungan {k['kategori']}, **{sig}** pada α = 0,05.\n")
        efisien = sum(1 for r in h["rekap"] if r.get("efisiensi", 0) > 0)
        L.append(f"Efisiensi instruksional: **{efisien} dari {k['n']} siswa** memiliki E > 0 "
                 "(skor relatif tinggi dengan beban relatif rendah). Nilai E tiap siswa ada di "
                 "`rekap_siswa.csv`.\n")
    else:
        L.append("_Data belum cukup (minimal 3 siswa dengan kuis dan skala beban)._\n")

    L.append("## 6. Latihan\n")
    if h["latihan"]:
        L.append("| Jenis | Jumlah soal | Akurasi (%) | Rata-rata petunjuk | Rata-rata durasi (detik) |")
        L.append("|-------|-------------|-------------|--------------------|--------------------------|")
        for j, v in h["latihan"].items():
            L.append(f"| {j} | {v['n']} | {f2(v['akurasi'], 1)} | {f2(v['petunjuk_rata'])} | {f2(v['durasi_rata'], 1)} |")
        L.append("")

    L.append("## 7. Literasi Matematika (benar pada percobaan pertama)\n")
    if h["literasi"]:
        L.append("| Tahap | n | Benar (%) |")
        L.append("|-------|---|-----------|")
        for t, v in h["literasi"].items():
            L.append(f"| {t} | {v['n']} | {f2(v['benar_percobaan_1'], 1)} |")
        L.append("")

    L.append("---\n_Dibuat otomatis oleh `python/analisis_statistik.py`._")
    teks = "\n".join(L)
    (folder / "laporan.md").write_text(teks, encoding="utf-8")
    return teks


def tulis_csv(h: dict, folder: Path) -> None:
    kolom = ["nama", "kelas", "materi_selesai", "jumlah_latihan", "akurasi_latihan",
             "skor_kuis", "beban_rata", "beban_kuis", "efisiensi"]
    with open(folder / "rekap_siswa.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=kolom, delimiter=";", extrasaction="ignore")
        w.writeheader()
        for r in h["rekap"]:
            w.writerow({k: (f2(r.get(k)) if isinstance(r.get(k), float) else r.get(k, "")) for k in kolom})
    if h["butir"]:
        with open(folder / "analisis_butir.csv", "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=list(h["butir"][0].keys()), delimiter=";")
            w.writeheader()
            for b in h["butir"]:
                w.writerow({k: (f2(v, 3) if isinstance(v, float) else v) for k, v in b.items()})


def buat_grafik(h: dict, folder: Path) -> bool:
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return False

    skor = [r["skor_kuis"] for r in h["rekap"] if r["skor_kuis"] is not None]
    if skor:
        fig, ax = plt.subplots(figsize=(6, 4))
        ax.hist(skor, bins=range(0, 101, 10), color="#2f6fdb", edgecolor="white")
        ax.axvline(h["kktp"], color="#e07b00", linestyle="--", label=f"KKTP {h['kktp']:g}")
        ax.set(title="Sebaran Skor Kuis", xlabel="Skor", ylabel="Jumlah siswa")
        ax.legend()
        fig.tight_layout()
        fig.savefig(folder / "grafik_skor.png", dpi=150)
        plt.close(fig)

    if h["beban"]:
        k = list(h["beban"].keys())
        v = [h["beban"][x]["rata"] for x in k]
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.barh(k, v, color="#7c4dcc")
        ax.set(xlim=(1, 9), title="Rata-rata Beban Kognitif per Konteks", xlabel="Skala Paas (1–9)")
        for i, x in enumerate(v):
            ax.text(x + 0.1, i, f"{x:.2f}", va="center")
        fig.tight_layout()
        fig.savefig(folder / "grafik_beban.png", dpi=150)
        plt.close(fig)

    pas = [(r["beban_rata"], r["skor_kuis"]) for r in h["rekap"]
           if r["beban_rata"] is not None and r["skor_kuis"] is not None]
    if len(pas) >= 3:
        fig, ax = plt.subplots(figsize=(6, 4))
        ax.scatter([p[0] for p in pas], [p[1] for p in pas], color="#1f9d55")
        ax.set(title="Beban Kognitif vs Skor Kuis", xlabel="Rata-rata beban (1–9)", ylabel="Skor kuis")
        fig.tight_layout()
        fig.savefig(folder / "grafik_korelasi.png", dpi=150)
        plt.close(fig)
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Analisis statistik data DeretKu")
    parser.add_argument("--data", type=Path, default=DIR / "data_siswa", help="folder berkas JSON siswa")
    parser.add_argument("--hasil", type=Path, default=DIR / "hasil", help="folder keluaran")
    parser.add_argument("--kuis", choices=["pertama", "terakhir", "terbaik"], default="pertama",
                        help="percobaan kuis yang dianalisis (bawaan: pertama)")
    parser.add_argument("--kktp", type=float, default=75, help="kriteria ketuntasan (bawaan 75)")
    args = parser.parse_args()

    if not args.data.exists() or not any(args.data.glob("*.json")):
        print(f"Tidak ada berkas JSON di {args.data}.")
        print("Salin berkas ekspor siswa ke folder itu, atau buat data contoh dengan:")
        print("    python python/buat_data_contoh.py")
        sys.exit(1)

    bank = json.loads(BANK.read_text(encoding="utf-8"))
    siswa = muat_siswa(args.data)
    args.hasil.mkdir(parents=True, exist_ok=True)
    h = analisis(siswa, bank, args.kuis, args.kktp)
    teks = tulis_laporan(h, bank, args.hasil)
    tulis_csv(h, args.hasil)
    ada_grafik = buat_grafik(h, args.hasil)

    print(teks)
    print(f"\n✓ Laporan & CSV tersimpan di {args.hasil}")
    if not ada_grafik:
        print("  (Grafik dilewati, pasang matplotlib untuk grafik: pip install matplotlib)")


if __name__ == "__main__":
    main()
