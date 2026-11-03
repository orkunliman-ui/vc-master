---
name: screenshot-to-code
description: >
  Reproduces a UI from a screenshot, video frames or a URL at pixel-level fidelity, with measured proof.
  Method of abi/screenshot-to-code (strict replication rules, exact assets cropped from the reference,
  render-and-fix loop) plus objective measurement: exact palette, coordinate grid, font matching,
  ink-box alignment and a numeric diff (pixels, SSIM, edges, ΔE) after every iteration.
  Use this skill whenever the result must look like a given reference. Triggers include:
  "screenshot to code", "screenshot-to-code", "copie exactement", "à l'identique", "exactement le même",
  "même setup", "même design que", "reproduis cette page", "refais cet écran", "clone ce site",
  "pixel perfect", "fidèle à la capture", "comme sur la vidéo", "replicate this UI", "convert this screenshot",
  "mockup to code", "design to code", "Figma to code", "match this design", "copy this layout".
  Also triggers proactively whenever the user provides a screenshot, an Instagram/YouTube frame, a video
  or a URL of an interface and asks for something that should look like it, and when the user complains
  that a rebuilt screen "ne ressemble pas", "c'est pas pareil" or "tu peux mieux faire" on a replica.
---

# Screenshot-to-code — copier une interface au pixel près, avec la preuve chiffrée

Tu es un intégrateur obsessionnel : tu ne devines rien, tu mesures. L'outil screenshot-to-code bat un
rendu « à l'œil » parce qu'il copie le texte exact, découpe les vrais assets et se relit sur son propre
rendu. Cette skill garde tout ça et ajoute la mesure : couleurs exactes, positions au pixel, police
identifiée, et un score après chaque itération.

Outils : `~/.claude/skills/screenshot-to-code/scripts/` (Python avec `python3 -P`, Node pour le rendu).

| Outil | Rôle |
|---|---|
| `grid.py` | quadrillage chiffré (zoom possible) pour lire les coordonnées exactes |
| `palette.py` | couleurs dominantes + valeur exacte en des points donnés |
| `crop.py` | découpe d'un asset exact (logo, icône, photo), fond rendu transparent si besoin |
| `fontmatch.py` | classe les polices candidates sur une découpe de texte, donne la correction de taille |
| `render.mjs` | rendu Playwright d'un fichier ou d'une URL à une taille de fenêtre donnée |
| `compare.py` | scores (pixels, ssim, bords, ΔE), image référence / rendu / carte des écarts, pires zones |
| `align.py` | décalage et facteur de taille d'éléments précis (boîte d'encre) : rend la correction déterministe |
| `frames.sh` | images clés d'une vidéo (changements d'écran + 1 image/s) |

---

## Phase 0 — Avant de coder

1. **Référence en pleine résolution**, enregistrée en PNG dans un dossier de travail (scratchpad).
   - capture fournie : la garder telle quelle (si elle a de la transparence, l'aplatir sur sa couleur de fond) ;
   - vidéo : `bash frames.sh video.mp4 frames/` puis choisir les images nettes de chaque écran ;
   - URL : `node render.mjs URL ref.png --width W --height H` ; si le site est le nôtre ou que c'est permis,
     lire aussi les styles calculés dans le DOM (valeurs exactes, sans mesure) ;
   - Instagram dans Chrome : l'onglet doit être au premier plan, sinon la vidéo est gelée.
2. **Taille de fenêtre** : largeur CSS = largeur de l'image ÷ échelle (1 pour une capture d'écran normale,
   2 pour une capture Retina). Tout rendu se fait exactement à cette taille, sinon les scores ne valent rien.
3. **Ce qui est demandé** : copie exacte (on ne « améliore » rien), ou base fidèle puis adaptation
   (on copie d'abord, on adapte ensuite, chaque écart étant voulu et dit).

---

## Phase 1 — Mesurer (fiche technique)

Écrire une fiche `spec.md` avant le code. C'est elle qui évite les approximations.

```bash
python3 -P grid.py ref.png grid.png --step 50                      # vue d'ensemble
python3 -P grid.py ref.png zoom.png --step 10 --crop x0,y0,x1,y1   # détail, zoom ×2 par défaut
python3 -P palette.py ref.png --top 14 --at x,y x,y               # couleurs exactes
python3 -P crop.py ref.png x0,y0,x1,y1 texte.png                  # découpe serrée d'un texte
python3 -P fontmatch.py texte.png --text "…" --size 31 --weight 700 --fonts "Inter,Space Grotesk,…"
```

La fiche contient :
- zones de mise en page (en px) : en-têtes, colonnes, gouttières, marges, rayons d'angle ;
- couleurs en hex, chacune avec son point de mesure (fond, textes, accents, bordures, ombres) ;
- typographie : famille (via `fontmatch.py`, 8 à 15 candidates proches), graisse, taille, interlignage, espacement ;
- le texte exact, mot pour mot, avec ses retours à la ligne ;
- les assets à découper (boîte de chacun), à régénérer (masqué, fond photo) ou à remplacer par une
  icône d'une bibliothèque seulement si elle est identique.

---

## Phase 2 — Assets exacts

- Logos, icônes, photos, illustrations : `crop.py` dans la référence. On copie l'original, on ne redessine
  jamais à la main (règle : la différence se voit tout de suite).
- Icône sur fond uni : `--transparent #hex --tol 24`. Asset trop petit : `--scale 2` (interpolation,
  à dire), ou régénération fidèle si la netteté compte.
- Jamais la capture entière en image de fond : la page doit être du vrai code.

---

## Phase 3 — Construire d'un seul jet

- Le fichier complet en une fois, avec les valeurs de la fiche (px exacts plutôt que des classes approximatives).
- Texte exact. Les éléments répétés sont écrits en entier : jamais de `<!-- autres éléments ici -->`.
- Pile du projet : HTML seul pour un prototype ; dans un projet Next/React, composants et CSS du projet.
- Polices : Google Fonts via `<link>`, ou la police du projet. Si une police est introuvable, prendre la
  plus proche selon `fontmatch.py` et le dire.

---

## Phase 4 — Rendre, comparer, corriger (boucle)

```bash
node render.mjs page.html v1.png --width W --height H
python3 -P compare.py ref.png v1.png cmp-v1 --tile 48 --label v1
python3 -P align.py ref.png v1.png --box titre:x0,y0,x1,y1 --box logo:x0,y0,x1,y1
```

1. Regarder `cmp-vN/side.png` (référence | rendu | carte des écarts) et les pires zones (`worst/`).
2. `align.py` sur les éléments en cause : il donne le décalage en px et le facteur de taille exacts.
3. Corriger les plus gros écarts d'abord : mise en page (bords < 98), puis couleurs (ΔE), puis typographie.
4. Recommencer. Garder un tableau des scores v1 → vN.

**Arrêt :** deux itérations de suite sans gain, ou cibles atteintes. Toujours garder la meilleure version,
pas la dernière.

| Type de référence | ssim | ΔE moyen | bords |
|---|---|---|---|
| UI plate (texte, aplats, icônes) | ≥ 95 | ≤ 2,5 | ≥ 99 |
| UI riche (photos, dégradés, flou) | ≥ 88 | ≤ 5 | ≥ 96 |
| 3D, particules, animation | structure et cadrage au jugé sur `side.png` ; scores donnés à titre indicatif |

Ensuite seulement : version mobile (390 px), en vérifiant qu'aucune correction mobile ne casse le bureau.
Pour une vidéo : d'abord la mise en page à l'arrêt, puis le rythme des animations, image par image.

---

## Sortie

1. Le code, au bon endroit dans le projet.
2. `side.png` final (référence | rendu | écarts), donné à l'utilisateur quand le résultat doit être vu.
3. Le tableau des scores, par exemple :

| version | pixels | ssim | bords | ΔE | correction |
|---|---|---|---|---|---|
| v1 | 96,46 | 86,98 | 99,41 | 3,88 | premier jet depuis la fiche |
| v2 | 98,46 | 95,13 | 99,95 | 1,91 | `align.py` : nom −1 px, titre 23 px, espacements |

4. Les écarts restants et leur cause (police indisponible, asset régénéré, rendu de police différent du système d'origine).

---

## Exemples

- **Carte de profil** (fixture de screenshot-to-code, 498×180) : `fontmatch` → Space Grotesk 700 pour le nom,
  JetBrains Mono pour le titre ; avatar découpé ; v1 → v2 guidé par `align.py` : ssim 87 → 95, ΔE 3,9 → 1,9.
  La v3 était moins bonne (94), donc arrêt sur la v2.
- **Écran de tableau de bord tiré d'une vidéo Instagram** : `frames.sh`, une image nette par écran, une fiche
  par écran ; les zones 3D et animées sont jugées sur la structure et le cadrage. Les compteurs viennent des
  vraies données du projet (règle : aucun chiffre inventé), mais avec la typographie et le placement exacts.
- **Site existant (URL)** : rendu de référence par `render.mjs` à la même largeur, styles calculés lus dans le
  DOM quand c'est permis, assets découpés, puis la même boucle.

---

## Anti-patterns

- Deviner une couleur à l'œil ou arrondir à une classe Tailwind voisine : toujours `palette.py`.
- Choisir une police « qui ressemble » sans `fontmatch.py`.
- Rendre à une autre taille de fenêtre que la référence : les scores deviennent faux (`compare.py` le signale).
- Redessiner un logo ou une icône au lieu de la découper.
- Mettre une image de remplacement alors que l'asset est découpable.
- Mettre la capture entière en fond.
- Écrire « identique » ou « fidèle » sans le tableau des scores.
- « Améliorer » le design quand l'utilisateur demande une copie : on copie d'abord, l'adaptation vient après et elle est annoncée.
- Garder la dernière itération alors qu'une précédente avait un meilleur score.

---

## Origine

Méthode reprise de [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) (MIT, commit d026163
du 22/07/2026) : consigne « looks exactly like the screenshot », texte exact, extraction d'assets
(`extract_assets`), contrôle de son propre rendu (`screenshot_preview`) puis correction. Leur extraction
passe par Gemini ; ici c'est la grille et `crop.py`. Leur contrôle est visuel ; ici il est aussi chiffré.

## Changelog

| Version | Date | Changement | Déclencheur |
|---|---|---|---|
| 1.0 | 2026-10-09 | Création : 8 outils, boucle mesurée, testée sur la fixture de screenshot-to-code (ssim 87 → 95) | Demande : « Screenshot-to-code serait beaucoup beaucoup plus efficace que toi… améliore toi » |
