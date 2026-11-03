"""Mesure l'écart d'alignement et de taille d'éléments précis entre la référence et le rendu (boîte d'« encre »).

Usage : python3 -P align.py ref.png rendu.png --box nom:x0,y0,x1,y1 [--box titre:x0,y0,x1,y1 ...] [--bg #ffffff] [--tol 40]
Chaque zone doit contenir l'élément dans les deux images (prendre une marge de quelques px).
Donne le décalage à corriger (px) et le facteur de taille : c'est ce qui rend l'itération déterministe.
"""
import sys

import numpy as np
from PIL import Image


def box_of(a: np.ndarray, box: tuple[int, int, int, int], bg: np.ndarray, tol: float):
    sub = a[box[1] : box[3], box[0] : box[2]]
    m = np.linalg.norm(sub - bg, axis=-1) > tol
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return None
    return (int(xs.min() + box[0]), int(ys.min() + box[1]), int(xs.max() + 1 + box[0]), int(ys.max() + 1 + box[1]))


def main() -> None:
    argv = sys.argv[1:]
    if len(argv) < 4:
        print(__doc__)
        sys.exit(2)
    ref = np.asarray(Image.open(argv[0]).convert("RGB"), dtype=np.float32)
    out = np.asarray(Image.open(argv[1]).convert("RGB"), dtype=np.float32)
    o = dict(zip(argv, argv[1:]))
    tol = float(o.get("--tol", 40))
    if "--bg" in o:
        h = o["--bg"].lstrip("#")
        bg = np.array([int(h[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)
    else:
        bg = ref[0, 0]
    boxes = [argv[i + 1] for i, x in enumerate(argv) if x == "--box"]
    for spec in boxes:
        name, coords = spec.split(":")
        b = tuple(map(int, coords.split(",")))
        r = box_of(ref, b, bg, tol)
        v = box_of(out, b, bg, tol)
        if not r or not v:
            print(f"{name:<14} rien trouvé ({'référence' if not r else 'rendu'}) dans {b}")
            continue
        rw, rh, vw, vh = r[2] - r[0], r[3] - r[1], v[2] - v[0], v[3] - v[1]
        dx, dy = v[0] - r[0], v[1] - r[1]
        ok = dx == 0 and dy == 0 and rw == vw and rh == vh
        print(
            f"{name:<14} réf {rw}×{rh} en {r[0]},{r[1]} · rendu {vw}×{vh} en {v[0]},{v[1]}"
            + ("  ✓ identique" if ok else f"  → décaler de {-dx:+d},{-dy:+d} px · taille ×{rh / vh:.3f} (hauteur) ×{rw / vw:.3f} (largeur)")
        )


if __name__ == "__main__":
    main()
