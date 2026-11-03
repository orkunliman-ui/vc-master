"""Couleurs exactes d'une capture : couleurs dominantes (avec un exemple de position) et valeur aux points demandés.

Usage : python3 -P palette.py image.png [--top 14] [--region x0,y0,x1,y1] [--at x,y x,y ...]
La valeur d'un point est la médiane 3×3 autour de lui (évite les pixels d'anticrénelage).
"""
import sys

import numpy as np
from PIL import Image


def hexa(c) -> str:
    return "#%02x%02x%02x" % tuple(int(v) for v in c)


def main() -> None:
    argv = sys.argv[1:]
    if not argv:
        print(__doc__)
        sys.exit(2)
    img = np.asarray(Image.open(argv[0]).convert("RGB"))
    top = 14
    region = None
    points: list[tuple[int, int]] = []
    i = 1
    while i < len(argv):
        if argv[i] == "--top":
            top = int(argv[i + 1])
            i += 2
        elif argv[i] == "--region":
            region = tuple(map(int, argv[i + 1].split(",")))
            i += 2
        elif argv[i] == "--at":
            i += 1
            while i < len(argv) and not argv[i].startswith("--"):
                x, y = map(int, argv[i].split(","))
                points.append((x, y))
                i += 1
        else:
            i += 1
    sub = img if region is None else img[region[1] : region[3], region[0] : region[2]]
    ox, oy = (0, 0) if region is None else (region[0], region[1])
    # Couleurs dominantes : quantification à 4 niveaux par 16, puis couleur exacte la plus fréquente du groupe.
    q = (sub // 16).reshape(-1, 3)
    flat = sub.reshape(-1, 3)
    keys, inv, counts = np.unique(q, axis=0, return_inverse=True, return_counts=True)
    order = np.argsort(-counts)[:top]
    total = flat.shape[0]
    print(f"couleurs dominantes ({'zone ' + str(region) if region else 'image entière'}, {sub.shape[1]}×{sub.shape[0]}) :")
    for k in order:
        members = np.nonzero(inv.ravel() == k)[0]
        vals, c2 = np.unique(flat[members], axis=0, return_counts=True)
        exact = vals[np.argmax(c2)]
        idx = members[0]
        y, x = divmod(int(idx), sub.shape[1])
        print(f"  {hexa(exact)}  {counts[k] / total * 100:5.1f} %   ex. en {x + ox},{y + oy}")
    for x, y in points:
        win = img[max(0, y - 1) : y + 2, max(0, x - 1) : x + 2].reshape(-1, 3)
        med = np.median(win, axis=0)
        print(f"  point {x},{y} → {hexa(med)}  (pixel exact {hexa(img[y, x])})")


if __name__ == "__main__":
    main()
