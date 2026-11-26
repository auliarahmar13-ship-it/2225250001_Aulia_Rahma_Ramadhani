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
    def persen_bool(v: list[dict], kunci: str) -> tuple[float | None, int]:
        """% True di antara entri yang punya nilai bool (versiData ≥ 2); entri lama/null dilewati."""
        nilai = [x[kunci] for x in v if isinstance(x.get(kunci), bool)]
        return (st.fmean([1 if b else 0 for b in nilai]) * 100 if nilai else None), len(nilai)

    hasil["latihan"] = {}
    for j, v in sorted(lat.items()):
        definisi, n_def = persen_bool(v, "definisiMasalah")   # RMT C3: "Apa yang ditanyakan?"
        bukti, n_bukti = persen_bool(v, "bukti")               # RMT C2: "Buktikan"
        hasil["latihan"][j] = {
            "n": len(v), "akurasi": st.fmean([1 if x.get("benar") else 0 for x in v]) * 100,
            "petunjuk_rata": st.fmean([x.get("petunjuk", 0) for x in v]),
            "durasi_rata": st.fmean([x.get("durasiDetik", 0) for x in v]),
            "definisi_tepat": definisi, "n_definisi": n_def,
            "bukti_tepat": bukti, "n_bukti": n_bukti,
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
    hasil["rmt"] = analisis_rmt(siswa, bank, mode_kuis)
    return hasil


# ---------------------------------------------------------------------------
# Indikator RMT (versiData ≥ 3; data lama dilewati, bukan dianggap salah). docs/08 Tahap 7.
# ---------------------------------------------------------------------------
def nama_fungsi() -> dict[str, str]:
    """Kode → nama ramah siswa, dibaca dari app/js/data/rmt.js (sumber tunggal, lewat gemini.py)."""
    try:
        import gemini  # pustaka standar saja; tidak memanggil internet
        return dict(gemini.daftar_fungsi())
    except Exception:
        return {}


def analisis_rmt(siswa: list[dict], bank: dict, mode_kuis: str) -> dict:
    ids_pretes = bank.get("pretes", [])
    nama = nama_fungsi()

    # 1. Asesmen dinamis "sandwich" (hlm. 60): pretes vs butir yang sama di kuis akhir
    pasangan = []
    for d in siswa:
        pre = (d.get("pretes") or [None])[0]
        k = pilih_kuis(d, mode_kuis)
        if not pre or not k or not ids_pretes:
            continue
        benar_pre = {j["id"]: bool(j.get("benar")) for j in pre.get("jawaban", [])}
        benar_post = {j["id"]: bool(j.get("benar")) for j in k.get("jawaban", [])}
        if not all(i in benar_pre and i in benar_post for i in ids_pretes):
            continue
        a = 100 * sum(benar_pre[i] for i in ids_pretes) / len(ids_pretes)
        b = 100 * sum(benar_post[i] for i in ids_pretes) / len(ids_pretes)
        g = (b - a) / (100 - a) if a < 100 else None  # gain ternormalisasi (Hake)
        pasangan.append({"nama": nama_siswa(d), "pre": a, "post": b, "gain": g})
    gain = [p["gain"] for p in pasangan if p["gain"] is not None]
    sandwich = {
        "n": len(pasangan), "butir": ids_pretes,
        "pre": st.fmean([p["pre"] for p in pasangan]) if pasangan else None,
        "post": st.fmean([p["post"] for p in pasangan]) if pasangan else None,
        "gain": st.fmean(gain) if gain else None,
        "naik": sum(1 for p in pasangan if p["post"] > p["pre"]), "per_siswa": pasangan,
    }

    # 2. Asesmen dinamis "cake" (hlm. 60): rata-rata lapisan bantuan per jenis latihan
    lapisan: dict[str, list[int]] = defaultdict(list)
    for d in siswa:
        for l in d.get("latihan", []):
            if isinstance(l.get("lapisanBantuan"), (int, float)):
                lapisan[l.get("jenis", "?")].append(l["lapisanBantuan"])
    lapisan_ringkas = {j: {"n": len(v), "rata": st.fmean(v), "tanpa_bantuan": 100 * sum(1 for x in v if x == 0) / len(v)}
                       for j, v in sorted(lapisan.items())}

    # 3. Pemanasan Berpikir (Fase I)
    pem = [p for d in siswa for p in d.get("pemanasan", [])]
    def persen(kunci):
        v = [p[kunci] for p in pem if isinstance(p.get(kunci), bool)]
        return 100 * sum(v) / len(v) if v else None
    pemanasan = {"n": len(pem), "definisi": persen("definisi"), "benar": persen("benar"), "fungsi_tepat": persen("fungsiTepat")}

    # 4. Jurnal: frekuensi fungsi berpikir (C13) & tafsiran tertulis literasi
    frek: Counter = Counter()
    jurnal_baris, tafsir_baris = [], []
    for d in siswa:
        for j in d.get("jurnal", []):
            frek.update(j.get("fungsiKognitif", []))
            jurnal_baris.append({"nama": nama_siswa(d), "kelas": d.get("profil", {}).get("kelas", ""), "waktu": j.get("waktu", ""),
                                 "konteks": j.get("konteks", ""), "fungsi": ", ".join(nama.get(k, k) for k in j.get("fungsiKognitif", [])),
                                 "refleksi": j.get("refleksi", "")})
        for l in d.get("literasi", []):
            if l.get("tafsiran"):
                tafsir_baris.append({"nama": nama_siswa(d), "kelas": d.get("profil", {}).get("kelas", ""), "misi": l.get("id", ""),
                                     "pilihan_benar": "ya" if l.get("benar") else "tidak", "tafsiran": l["tafsiran"]})
    return {
        "sandwich": sandwich, "lapisan": lapisan_ringkas, "pemanasan": pemanasan,
        "fungsi": [(k, nama.get(k, k), n) for k, n in frek.most_common()],
        "jurnal": jurnal_baris, "tafsiran": tafsir_baris,
    }


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
        L.append("| Jenis | Jumlah soal | Akurasi (%) | Rata-rata petunjuk | Rata-rata durasi (detik) "
                 "| Definisi masalah tepat (%) | Bukti logis tepat (%) |")
        L.append("|-------|-------------|-------------|--------------------|--------------------------"
                 "|----------------------------|-----------------------|")
        for j, v in h["latihan"].items():
            L.append(f"| {j} | {v['n']} | {f2(v['akurasi'], 1)} | {f2(v['petunjuk_rata'])} | {f2(v['durasi_rata'], 1)} "
                     f"| {f2(v['definisi_tepat'], 1)} (n={v['n_definisi']}) | {f2(v['bukti_tepat'], 1)} (n={v['n_bukti']}) |")
        L.append("")
        L.append("_Definisi masalah = langkah RMT \"Apa yang ditanyakan?\" (fungsi kognitif C3); bukti logis = "
                 "langkah \"Buktikan\" (C2), hanya diminta bila jawaban angka benar. Data versiData 1 tidak "
                 "memiliki kedua kolom ini (n dihitung dari data yang ada)._\n")

    L.append("## 7. Literasi Matematika (benar pada percobaan pertama)\n")
    if h["literasi"]:
        L.append("| Tahap | n | Benar (%) |")
        L.append("|-------|---|-----------|")
        for t, v in h["literasi"].items():
            L.append(f"| {t} | {v['n']} | {f2(v['benar_percobaan_1'], 1)} |")
        L.append("")

    r = h.get("rmt") or {}
    L.append("## 8. Indikator Rigorous Mathematical Thinking (RMT)\n")
    L.append("_Rujukan: Kinard & Kozulin (lihat `docs/08-analisis-rmt.md`). Data versiData < 3 tidak memuat "
             "sebagian indikator ini dan dilewati._\n")
    s = r.get("sandwich") or {}
    L.append("### 8.1 Asesmen dinamis \"sandwich\": Tes Awal → Kuis akhir (butir yang sama)\n")
    if s.get("n"):
        L.append(f"Butir: {', '.join(s['butir'])}. Pasangan data: **{s['n']} siswa**.\n")
        L.append("| Rata-rata Tes Awal (%) | Rata-rata butir sama di Kuis (%) | Gain ternormalisasi ⟨g⟩ | Siswa yang naik |")
        L.append("|---|---|---|---|")
        L.append(f"| {f2(s['pre'], 1)} | {f2(s['post'], 1)} | {f2(s['gain'])} | {s['naik']} dari {s['n']} |\n")
        L.append("_⟨g⟩ = (post − pre) / (100 − pre); kategori Hake: < 0,3 rendah, 0,3–0,7 sedang, > 0,7 tinggi._\n")
    else:
        L.append("_Belum ada siswa yang memiliki Tes Awal dan Kuis sekaligus._\n")
    L.append("### 8.2 Asesmen dinamis \"cake\": lapisan bantuan per soal latihan\n")
    if r.get("lapisan"):
        L.append("| Jenis | n | Rata-rata lapisan bantuan | Tanpa bantuan (%) |")
        L.append("|---|---|---|---|")
        for j, v in r["lapisan"].items():
            L.append(f"| {j} | {v['n']} | {f2(v['rata'])} | {f2(v['tanpa_bantuan'], 1)} |")
        L.append("\n_Lapisan bantuan = petunjuk + contoh + pesan Teman AI sebelum jawaban diperiksa. "
                 "Makin sedikit lapisan yang dibutuhkan → makin mandiri (potensi belajar, hlm. 60, 194–195)._\n")
    else:
        L.append("_Belum ada data lapisan bantuan._\n")
    p = r.get("pemanasan") or {}
    L.append("### 8.3 Pemanasan Berpikir (Fase I)\n")
    if p.get("n"):
        L.append("| n tugas | Definisi masalah tepat (%) | Tugas benar (%) | Menamai fungsi berpikir tepat (%) |")
        L.append("|---|---|---|---|")
        L.append(f"| {p['n']} | {f2(p['definisi'], 1)} | {f2(p['benar'], 1)} | {f2(p['fungsi_tepat'], 1)} |\n")
    else:
        L.append("_Belum ada data Pemanasan._\n")
    L.append("### 8.4 Fungsi berpikir di Jurnal RMT\n")
    if r.get("fungsi"):
        L.append("| Kode | Fungsi berpikir | Jumlah |")
        L.append("|---|---|---|")
        for k, nm, n in r["fungsi"][:12]:
            L.append(f"| {k} | {nm} | {n} |")
        L.append("")
    else:
        L.append("_Belum ada catatan jurnal._\n")
    L.append(f"### 8.5 Penjelasan tertulis\n\nTafsiran literasi: **{len(r.get('tafsiran', []))}**; entri jurnal: "
             f"**{len(r.get('jurnal', []))}**. Nilai dengan rubrik di `docs/10-rubrik-rmt.md` memakai berkas "
             "`tafsiran_rubrik.csv` dan `jurnal_rubrik.csv` (kolom K1–K4 dikosongkan untuk diisi guru).\n")

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
    # RMT: berkas siap dinilai guru dengan rubrik analitik (docs/10-rubrik-rmt.md); K1–K4 diisi 1–4
    r = h.get("rmt") or {}
    rubrik = ["K1_bahasa_matematika", "K2_bukti_logis", "K3_kesadaran_fungsi", "K4_keterhubungan"]
    for nama_berkas, baris in (("tafsiran_rubrik.csv", r.get("tafsiran", [])), ("jurnal_rubrik.csv", r.get("jurnal", []))):
        if not baris:
            continue
        with open(folder / nama_berkas, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=list(baris[0].keys()) + rubrik, delimiter=";")
            w.writeheader()
            for b in baris:
                w.writerow({**b, **{k: "" for k in rubrik}})
    if (r.get("sandwich") or {}).get("per_siswa"):
        with open(folder / "pretes_postes.csv", "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=["nama", "pre", "post", "gain"], delimiter=";")
            w.writeheader()
            for b in r["sandwich"]["per_siswa"]:
                w.writerow({k: (f2(v) if isinstance(v, float) else ("" if v is None else v)) for k, v in b.items()})


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
