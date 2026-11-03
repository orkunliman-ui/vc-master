"""Découpe un asset exact dans la capture (logo, icône, photo) : on copie l'original, on ne le redessine pas.

Usage : python3 -P crop.py image.png x0,y0,x1,y1 sortie.png [--scale 2] [--transparent #hex --tol 24]
  --scale        agrandit (LANCZOS) pour un affichage plus grand : c'est une interpolation, la netteté ne revient pas
  --transparent  rend transparente la couleur de fond donnée (icône sur fond uni), avec une tolérance en distance RGB
"""
import sys

import numpy as np
from PIL import Image


def main() -> None:
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    o = dict(zip(sys.argv[1:], sys.argv[2:]))
    if len(a) < 3:
        print(__doc__)
        sys.exit(2)
    x0, y0, x1, y1 = map(int, a[1].split(","))
    img = Image.open(a[0]).convert("RGBA").crop((x0, y0, x1, y1))
    if "--transparent" in o:
        h = o["--transparent"].lstrip("#")
        bg = np.array([int(h[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)
        tol = float(o.get("--tol", 24))
        px = np.asarray(img, dtype=np.float32)
        dist = np.linalg.norm(px[..., :3] - bg, axis=-1)
        px[..., 3] = np.clip((dist - tol * 0.5) / max(1.0, tol * 0.5), 0, 1) * 255
        img = Image.fromarray(px.astype(np.uint8), "RGBA")
    s = float(o.get("--scale", 1))
    if s != 1:
        img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    img.save(a[2])
    print(f"{a[2]} · {img.width}×{img.height} (source {x1 - x0}×{y1 - y0} en {x0},{y0})")


if __name__ == "__main__":
    main()
