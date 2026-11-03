"""Trouve la police d'un texte de la capture : rend le même texte dans chaque police candidate et classe par ressemblance.

Usage :
  python3 -P fontmatch.py ref_texte.png --text "VAULT BRAIN" --size 32 \\
      --fonts "Inter,Roboto,Space Grotesk,IBM Plex Sans" [--weight 400] [--letter 0.02em] [--color #hex] [--bg #hex]

ref_texte.png = découpe serrée d'un seul texte de la capture (crop.py). Polices chargées depuis Google Fonts.
Sans --color/--bg, les deux couleurs dominantes de la découpe sont prises (la plus présente = fond).
Astuce : affiner ensuite --size et --letter avec la meilleure police (le score monte quand c'est juste).
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from compare import dilate, edges, gray, ssim_map  # noqa: E402

HERE = Path(__file__).parent


def two_colors(a: np.ndarray) -> tuple[str, str]:
    q = (a // 24).reshape(-1, 3)
    keys, counts = np.unique(q, axis=0, return_counts=True)
    order = np.argsort(-counts)
    flat = a.reshape(-1, 3)
    out = []
    for k in order[:2]:
        m = np.all(q == keys[k], axis=1)
        out.append("#%02x%02x%02x" % tuple(int(v) for v in np.median(flat[m], axis=0)))
    return out[0], out[1] if len(out) > 1 else "#000000"


def main() -> None:
    args = sys.argv[1:]
    if not args or args[0].startswith("--"):
        print(__doc__)
        sys.exit(2)
    o = dict(zip(args[1:], args[2:]))
    ref = np.asarray(Image.open(args[0]).convert("RGB"), dtype=np.float32)
    h, w = ref.shape[:2]
    bg, fg = two_colors(ref.astype(np.uint8))
    bg, fg = o.get("--bg", bg), o.get("--color", fg)
    fonts = [f.strip() for f in o["--fonts"].split(",") if f.strip()]
    size, weight, letter, text = o.get("--size", "16"), o.get("--weight", "400"), o.get("--letter", "normal"), o["--text"]
    gap = 20
    fam = "&".join(f"family={f.replace(' ', '+')}:wght@{weight}" for f in fonts)
    blocks = "\n".join(
        f'<div style="position:absolute;left:0;top:{i * (h + gap)}px;width:{w}px;height:{h}px;background:{bg};color:{fg};'
        f"font-family:'{f}';font-size:{size}px;font-weight:{weight};letter-spacing:{letter};line-height:{h}px;white-space:nowrap;overflow:hidden\">{text}</div>"
        for i, f in enumerate(fonts)
    )
    html = f'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fam}&display=block"></head><body style="margin:0;background:{bg}">{blocks}</body></html>'
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "fonts.html"
        shot = Path(tmp) / "fonts.png"
        page.write_text(html)
        total = len(fonts) * (h + gap)
        r = subprocess.run(["node", str(HERE / "render.mjs"), str(page), str(shot), "--width", str(w), "--height", str(total), "--wait", "1500"], capture_output=True, text=True)
        if r.returncode != 0:
            print(r.stderr)
            sys.exit(1)
        img = np.asarray(Image.open(shot).convert("RGB"), dtype=np.float32)
    def ink_box(a: np.ndarray, bgc: str):
        b = np.array([int(bgc.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)
        m = np.linalg.norm(a - b, axis=-1) > 40
        ys, xs = np.nonzero(m)
        return None if len(xs) == 0 else (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)

    rb = ink_box(ref, bg)
    if rb is None:
        print("aucun texte détecté dans la découpe (vérifier --bg)")
        sys.exit(1)
    rink = ref[rb[1] : rb[3], rb[0] : rb[2]]
    rw, rh = rink.shape[1], rink.shape[0]
    gr = gray(rink)
    er = edges(gr)
    rows = []
    for i, f in enumerate(fonts):
        cand = img[i * (h + gap) : i * (h + gap) + h, :w]
        cb = ink_box(cand, bg)
        if cb is None:
            continue
        cink = cand[cb[1] : cb[3], cb[0] : cb[2]]
        # Forme des lettres : l'encre du candidat ramenée à la taille de celle de la référence.
        cn = np.asarray(Image.fromarray(cink.astype(np.uint8)).resize((rw, rh), Image.LANCZOS), dtype=np.float32)
        gc = gray(cn)
        ec = edges(gc)
        a = (er & dilate(ec, 1)).sum() / max(1, er.sum())
        b = (ec & dilate(er, 1)).sum() / max(1, ec.sum())
        f1 = 0 if a + b == 0 else 2 * a * b / (a + b)
        s = float(ssim_map(gr, gc, 5).mean())
        rows.append({
            "font": f,
            "ssim": round(s * 100, 1),
            "contours": round(f1 * 100, 1),
            "score": round((s * 0.6 + f1 * 0.4) * 100, 1),
            "largeur": round(cink.shape[1] / rw, 3),
            "hauteur": round(cink.shape[0] / rh, 3),
        })
    rows.sort(key=lambda r: -r["score"])
    print(f"texte « {text} » · {size}px · graisse {weight} · espacement {letter} · couleur {fg} sur {bg}")
    print(f"encre de la référence : {rw}×{rh} px (le candidat est ramené à cette taille pour juger la forme)")
    for r in rows:
        print(f"  {r['score']:5.1f}  {r['font']:<28} ssim {r['ssim']:5.1f} · contours {r['contours']:5.1f} · largeur ×{r['largeur']} · hauteur ×{r['hauteur']}")
    if rows:
        b = rows[0]
        print(f"→ {b['font']} : taille à corriger ×{1 / b['hauteur']:.3f} (hauteur d'encre) ; si la largeur reste fausse après ça, ajuster --letter")
    print(json.dumps(rows[:3], ensure_ascii=False))


if __name__ == "__main__":
    main()
