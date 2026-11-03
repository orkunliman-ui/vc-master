"""Quadrillage chiffré sur une capture, pour lire les positions exactes (en pixels de l'image source).

Usage : python3 -P grid.py image.png sortie.png [--step 50] [--crop x0,y0,x1,y1] [--zoom 2]
Avec --crop, seule la zone est gardée puis agrandie (--zoom) : les étiquettes restent en coordonnées source.
"""
import sys

from PIL import Image, ImageDraw


def main() -> None:
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    o = dict(zip(sys.argv[1:], sys.argv[2:]))
    if len(a) < 2:
        print(__doc__)
        sys.exit(2)
    img = Image.open(a[0]).convert("RGB")
    step = int(o.get("--step", 50))
    x0, y0, x1, y1 = (map(int, o["--crop"].split(","))) if "--crop" in o else (0, 0, img.width, img.height)
    zoom = float(o.get("--zoom", 1 if "--crop" not in o else 2))
    img = img.crop((x0, y0, x1, y1)).resize((round((x1 - x0) * zoom), round((y1 - y0) * zoom)), Image.NEAREST)
    d = ImageDraw.Draw(img, "RGBA")
    for gx in range((x0 // step) * step, x1 + 1, step):
        if gx < x0:
            continue
        X = (gx - x0) * zoom
        major = gx % (step * 2) == 0
        d.line([(X, 0), (X, img.height)], fill=(255, 40, 160, 150 if major else 70), width=1)
        d.text((X + 2, 2), str(gx), fill=(255, 255, 0, 255))
    for gy in range((y0 // step) * step, y1 + 1, step):
        if gy < y0:
            continue
        Y = (gy - y0) * zoom
        major = gy % (step * 2) == 0
        d.line([(0, Y), (img.width, Y)], fill=(40, 200, 255, 150 if major else 70), width=1)
        d.text((2, Y + 2), str(gy), fill=(255, 255, 0, 255))
    img.save(a[1])
    print(f"{a[1]} · zone {x0},{y0} → {x1},{y1} · pas {step} px · zoom {zoom}")


if __name__ == "__main__":
    main()
