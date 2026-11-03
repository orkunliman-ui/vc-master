#!/usr/bin/env bash
# Copie les skills VC Master dans ~/.claude/skills (noms courts, sans préfixe de section).
# Usage : ./install.sh                         -> toutes les sections
#         ./install.sh vc-methode vc-frontend  -> sections choisies
# Un skill déjà présent n'est jamais écrasé.
set -euo pipefail
cd "$(dirname "$0")"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
mkdir -p "$DEST"

if [ "$#" -eq 0 ]; then
  set -- $(ls plugins)
fi

added=0; skipped=0
for section in "$@"; do
  if [ ! -d "plugins/$section/skills" ]; then
    echo "Section inconnue : $section (choix : $(ls plugins | tr '\n' ' '))" >&2
    exit 1
  fi
  for dir in "plugins/$section/skills"/*/; do
    name="$(basename "$dir")"
    if [ -e "$DEST/$name" ]; then
      echo "= $name déjà présent, ignoré"
      skipped=$((skipped + 1))
    else
      cp -R "$dir" "$DEST/$name"
      echo "+ $name"
      added=$((added + 1))
    fi
  done
done
echo "Terminé : $added ajouté(s), $skipped ignoré(s) dans $DEST. Relance Claude Code."
