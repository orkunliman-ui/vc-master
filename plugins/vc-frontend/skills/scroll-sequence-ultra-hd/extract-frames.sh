#!/usr/bin/env bash
# Pipeline "Ultra HD" — séquences scroll (norme qualité obligatoire, 2026-07-30).
# Vidéo master (>= 3840px de large) → PNG masters lossless (conversion
# limited→full range explicite, lanczos) → paliers WebP q92 via sharp.
#
# Usage : scripts/extract-frames.sh [master-4k.mp4]
# Sortie : public/frames/{1080,1920,2880,3840}/frame_NNN.webp
#          src/js/frames-manifest.json (count + paliers, consommé par main.js)
#          frames_master/ref/ (frames PNG de référence pour le gate qualité)
#
# Gates assertés (le ✅ est une preuve, pas une affirmation) :
#   - master vidéo >= 3840px de large
#   - couleur : master PNG vs vidéo source ±3 RGB (color-check.mjs)
#   - couleur : palier livré vs master PNG ±3 RGB
#   - counts identiques sur tous les paliers
#   - budget : chaque palier < 12 Mo (sinon réduire les fps, PAS la qualité)
set -euo pipefail
cd "$(dirname "$0")/.."

VIDEO="${1:-public/frames/_src/harmonisation-4k.mp4}"
# 15 fps — AVIF q65 rend le budget confortable ; si un jour le budget est
# dépassé : réduire les fps, PAS la qualité (norme).
FPS="${FPS:-15}"
MASTER_DIR="frames_master"
TIERS=(${TIERS_OVERRIDE:-1080 1920 2880 3840})

[ -f "$VIDEO" ] || { echo "FAIL: vidéo master introuvable: $VIDEO"; exit 1; }

W=$(ffprobe -v quiet -show_entries stream=width -of csv=p=0 "$VIDEO" | head -1)
[ "$W" -ge 3840 ] || { echo "FAIL: master ${W}px < 3840px — upscaler la source d'abord"; exit 1; }

# ── 1. PNG masters : zéro perte, range full explicite, lanczos ──
rm -rf "$MASTER_DIR"
mkdir -p "$MASTER_DIR/ref"
ffmpeg -v error -i "$VIDEO" \
  -vf "fps=$FPS,scale=in_range=tv:out_range=pc:flags=lanczos,format=rgb24" \
  -start_number 0 "$MASTER_DIR/frame_%03d.png"
COUNT=$(ls "$MASTER_DIR"/frame_*.png | wc -l)
echo "masters: $COUNT PNG ${W}px"

# ── 2. Check couleur : master PNG vs vidéo source (±3 RGB, 5 pixels de fond) ──
ffmpeg -v error -i "$VIDEO" -vf "select='eq(n\,0)',scale=in_range=tv:out_range=pc,format=rgb24" -frames:v 1 -y /tmp/ultra-ref-src.png
node scripts/color-check.mjs /tmp/ultra-ref-src.png "$MASTER_DIR/frame_000.png" \
  || { echo "FAIL: dérive colorimétrique extraction"; exit 1; }

# ── 3. Paliers de livraison (sharp, lanczos3, AVIF q65 — mesuré plus net
#       ET plus léger que WebP q92 sur contenu photo avec grain) ──
node scripts/encode-tiers.mjs "$MASTER_DIR" "${TIERS[@]}"

# ── 4. Preuves ──
for T in "${TIERS[@]}"; do
  CT=$(ls "public/frames/$T"/frame_*.avif | wc -l)
  SZ=$(du -sb "public/frames/$T" | cut -f1)
  PRE=$(ls "public/frames/$T"/frame_*.avif | head -20 | xargs stat -c%s | awk '{s+=$1} END {print s}')
  echo "palier $T: $CT frames, $((SZ / 1024 / 1024)) Mo, préchargement 20 = $((PRE / 1024)) KiB"
  [ "$CT" -eq "$COUNT" ] || { echo "FAIL: palier $T désynchronisé ($CT vs $COUNT)"; exit 1; }
  [ "$SZ" -le $((12 * 1024 * 1024)) ] || { echo "FAIL: palier $T > 12 Mo — réduire FPS, pas la qualité"; exit 1; }
done

# ── 5. Check couleur : palier max vs master PNG ──
MAXTIER="${TIERS[${#TIERS[@]}-1]}"
node scripts/color-check.mjs "$MASTER_DIR/frame_000.png" "public/frames/$MAXTIER/frame_000.avif" \
  || { echo "FAIL: dérive colorimétrique encodage"; exit 1; }

# ── 6. Manifest consommé par le runtime ──
LAST=$((COUNT - 1))
MID=$((COUNT / 2))
TIERS_JSON=$(printf '%s, ' "${TIERS[@]}")
printf '{ "count": %s, "tiers": [%s], "ext": "avif" }\n' "$COUNT" "${TIERS_JSON%, }" > src/js/frames-manifest.json

# ── 7. Références du gate qualité (0 / milieu / fin), masters purgés (disque VPS) ──
cp "$MASTER_DIR/frame_000.png" "$MASTER_DIR/ref/"
cp "$MASTER_DIR/$(printf 'frame_%03d.png' "$MID")" "$MASTER_DIR/ref/"
cp "$MASTER_DIR/$(printf 'frame_%03d.png' "$LAST")" "$MASTER_DIR/ref/"
find "$MASTER_DIR" -maxdepth 1 -name 'frame_*.png' -delete
echo "OK — pipeline Ultra HD assertée ($COUNT frames, 4 paliers, refs gate: 0/$MID/$LAST)"
