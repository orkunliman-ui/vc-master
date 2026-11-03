"""Compare une capture de référence et un rendu : scores de fidélité, carte des écarts, pires zones.

Usage : python3 -P compare.py ref.png rendu.png dossier_sortie [--tile 48] [--label v1]

Scores (100 = identique) :
  pixels   100 × (1 − écart absolu moyen / 255), sur RGB
  ssim     similarité structurelle (luminance, fenêtres 7 px)
  bords    F1 des contours (Sobel, tolérance 2 px) : la mise en page est-elle au bon endroit ?
  couleur  ΔE moyen (CIE76, Lab) : < 2 invisible, 2–5 léger, > 10 couleur fausse

Sorties : side.png (référence | rendu | carte des écarts), overlay.png (fondu 50 %),
worst/ (les pires tuiles, référence au-dessus du rendu), report.json.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


def load(path: str) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)


def fit(ref: np.ndarray, out: np.ndarray) -> tuple[np.ndarray, list[str]]:
    """Ramène le rendu à la taille de la référence ; signale tout écart de taille (souvent une fenêtre mal réglée)."""
    notes: list[str] = []
    rh, rw = ref.shape[:2]
    oh, ow = out.shape[:2]
    if (oh, ow) == (rh, rw):
        return out, notes
    if ow == rw:
        notes.append(f"hauteur différente : rendu {oh} px, référence {rh} px (rendu {'coupé' if oh > rh else 'complété en noir'})")
        if oh > rh:
            return out[:rh], notes
        pad = np.zeros((rh - oh, rw, 3), dtype=np.float32)
        return np.concatenate([out, pad]), notes
    notes.append(f"largeur différente : rendu {ow}×{oh}, référence {rw}×{rh} → rendu redimensionné (régler --width du rendu sur {rw})")
    img = Image.fromarray(out.astype(np.uint8)).resize((rw, rh), Image.LANCZOS)
    return np.asarray(img, dtype=np.float32), notes


def box(a: np.ndarray, k: int) -> np.ndarray:
    """Moyenne locale k×k par image intégrale (même taille que l'entrée, bords répliqués)."""
    p = k // 2
    a = np.pad(a, p, mode="edge")
    c = a.cumsum(0).cumsum(1)
    c = np.pad(c, ((1, 0), (1, 0)))
    s = c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]
    return s / (k * k)


def gray(a: np.ndarray) -> np.ndarray:
    return a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114


def ssim_map(x: np.ndarray, y: np.ndarray, k: int = 7) -> np.ndarray:
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    mx, my = box(x, k), box(y, k)
    sx = box(x * x, k) - mx * mx
    sy = box(y * y, k) - my * my
    sxy = box(x * y, k) - mx * my
    return ((2 * mx * my + c1) * (2 * sxy + c2)) / ((mx * mx + my * my + c1) * (sx + sy + c2))


def lab(a: np.ndarray) -> np.ndarray:
    c = a / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]], dtype=np.float32)
    xyz = c @ m.T / np.array([0.95047, 1.0, 1.08883], dtype=np.float32)
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def edges(g: np.ndarray) -> np.ndarray:
    gx = np.zeros_like(g)
    gy = np.zeros_like(g)
    gx[1:-1, 1:-1] = (g[:-2, 2:] + 2 * g[1:-1, 2:] + g[2:, 2:]) - (g[:-2, :-2] + 2 * g[1:-1, :-2] + g[2:, :-2])
    gy[1:-1, 1:-1] = (g[2:, :-2] + 2 * g[2:, 1:-1] + g[2:, 2:]) - (g[:-2, :-2] + 2 * g[:-2, 1:-1] + g[:-2, 2:])
    return np.hypot(gx, gy) > 60


def dilate(m: np.ndarray, r: int = 2) -> np.ndarray:
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out |= np.roll(np.roll(m, dy, 0), dx, 1)
    return out


def heat(d: np.ndarray) -> np.ndarray:
    """ΔE → carte de chaleur : noir (identique) → violet → orange → jaune (très différent)."""
    t = np.clip(d / 25.0, 0, 1)[..., None]
    lo = np.array([0, 0, 0], dtype=np.float32)
    mid = np.array([160, 30, 200], dtype=np.float32)
    hi = np.array([255, 200, 40], dtype=np.float32)
    return np.where(t < 0.5, lo + (mid - lo) * (t / 0.5), mid + (hi - mid) * ((t - 0.5) / 0.5))


def main() -> None:
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    opts = dict(zip(sys.argv[1:], sys.argv[2:]))
    if len(a) < 3:
        print(__doc__)
        sys.exit(2)
    tile = int(opts.get("--tile", 48))
    label = opts.get("--label", "")
    ref = load(a[0])
    out, notes = fit(ref, load(a[1]))
    dest = Path(a[2])
    (dest / "worst").mkdir(parents=True, exist_ok=True)

    h, w = ref.shape[:2]
    pix = 100 * (1 - np.abs(ref - out).mean() / 255)
    gr, go = gray(ref), gray(out)
    sm = ssim_map(gr, go)
    de = np.linalg.norm(lab(ref) - lab(out), axis=-1)
    er, eo = edges(gr), edges(go)
    hit_r = (er & dilate(eo)).sum() / max(1, er.sum())
    hit_o = (eo & dilate(er)).sum() / max(1, eo.sum())
    f1 = 0 if hit_r + hit_o == 0 else 2 * hit_r * hit_o / (hit_r + hit_o)

    tiles = []
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            d = de[y : y + tile, x : x + tile]
            s = sm[y : y + tile, x : x + tile]
            tiles.append({"x": x, "y": y, "w": d.shape[1], "h": d.shape[0], "deltaE": round(float(d.mean()), 2), "ssim": round(float(s.mean()), 3)})
    # Une tuile compte d'autant plus que sa couleur ET sa structure s'écartent.
    for t in tiles:
        t["score"] = round(t["deltaE"] * (1.5 - t["ssim"]), 2)
    worst = sorted(tiles, key=lambda t: -t["score"])[:12]

    hm = heat(de)
    side = np.concatenate([ref, out, hm], axis=1).astype(np.uint8)
    img = Image.fromarray(side)
    dr = ImageDraw.Draw(img)
    for i, t in enumerate(worst):
        for off in (0, w, 2 * w):
            dr.rectangle([t["x"] + off, t["y"], t["x"] + off + t["w"] - 1, t["y"] + t["h"] - 1], outline=(255, 64, 64), width=2)
        dr.text((t["x"] + 2 * w + 3, t["y"] + 2), str(i + 1), fill=(255, 255, 255))
    img.save(dest / "side.png")
    Image.fromarray(((ref + out) / 2).astype(np.uint8)).save(dest / "overlay.png")
    for i, t in enumerate(worst):
        pad = 24
        x0, y0 = max(0, t["x"] - pad), max(0, t["y"] - pad)
        x1, y1 = min(w, t["x"] + t["w"] + pad), min(h, t["y"] + t["h"] + pad)
        pair = np.concatenate([ref[y0:y1, x0:x1], np.full((4, x1 - x0, 3), 255, np.float32), out[y0:y1, x0:x1]], axis=0)
        Image.fromarray(pair.astype(np.uint8)).resize(((x1 - x0) * 3, pair.shape[0] * 3), Image.NEAREST).save(dest / "worst" / f"{i + 1:02d}_x{t['x']}_y{t['y']}.png")

    report = {
        "label": label,
        "size": [w, h],
        "pixels": round(float(pix), 2),
        "ssim": round(float(sm.mean() * 100), 2),
        "bords": round(float(f1 * 100), 2),
        "deltaE": round(float(de.mean()), 2),
        "notes": notes,
        "worst": worst,
    }
    (dest / "report.json").write_text(json.dumps(report, indent=1, ensure_ascii=False))
    print(f"{label + ' · ' if label else ''}pixels {report['pixels']} · ssim {report['ssim']} · bords {report['bords']} · ΔE {report['deltaE']}  ({w}×{h})")
    for n in notes:
        print(f"  ! {n}")
    print("  pires zones (x, y, ΔE, ssim) : " + " | ".join(f"{t['x']},{t['y']} ΔE{t['deltaE']} s{t['ssim']}" for t in worst[:6]))
    print(f"  → {dest}/side.png · {dest}/worst/")


if __name__ == "__main__":
    main()
