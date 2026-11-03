#!/usr/bin/env bash
# Extrait les images clés d'une vidéo (changements d'écran) + une image par seconde, en PNG pleine résolution.
# Usage : bash frames.sh video.mp4 dossier_sortie [seuil_scene=0.08]
set -euo pipefail
v="$1"; out="$2"; thr="${3:-0.08}"
mkdir -p "$out/scenes" "$out/1s"
ffmpeg -loglevel error -i "$v" -vf "select='gt(scene,$thr)',showinfo" -vsync vfr "$out/scenes/%04d.png" 2> "$out/scenes.log" || true
ffmpeg -loglevel error -i "$v" -vf fps=1 "$out/1s/%04d.png"
echo "$(ls "$out/scenes" | wc -l) changements d'écran, $(ls "$out/1s" | wc -l) images à la seconde → $out"
