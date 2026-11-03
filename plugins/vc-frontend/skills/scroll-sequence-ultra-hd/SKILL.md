---
name: scroll-sequence-ultra-hd
description: Pipeline qualité obligatoire pour toute séquence d'images pilotée au scroll (scroll-driven animation, canvas frames, image sequence, scrollytelling, technique Apple product pages). Se déclenche dès qu'une vidéo doit devenir une animation au scroll, qu'un canvas affiche des frames selon la position de scroll, ou qu'un rendu de séquence paraît flou/délavé. Garantit une qualité indiscernable du master : source 4K, extraction full-range lossless, paliers AVIF, canvas calibré DPR, gate SSIM automatique dans le build.
---

# Scroll Sequence Ultra HD — norme figée (validée sur pièces, By Daniela 2026-07-30)

Objectif : la qualité affichée au canvas doit être **indiscernable de la vidéo
source à 100 % de zoom**. Chaque étape a un check automatique — le ✅ est une
preuve, jamais une affirmation.

Implémentation de référence : les scripts de ce dossier (extract-frames.sh,
encode-tiers.mjs, color-check.mjs, smoke-test.cjs, framesequence.js), à copier
dans le projet.

## 1. Source — toujours ≥ 3840 px de large

- Générer la vidéo à la résolution max. Si master ≤ 1080p : upscale AVANT
  extraction — Higgsfield `upscale_video` (provider bytedance, preset `aigc`
  pour du généré, résolution 4k) ; Real-ESRGAN seulement si GPU local.
- Mouvement LENT et LINÉAIRE exigé au prompt (caméra fixe, zéro coupe) : la
  vidéo doit rester belle figée sur n'importe quelle frame.
- **QA visuelle obligatoire** : extraire 3-5 frames du master (début/milieu/fin
  + crop détail natif) et les REGARDER avant de continuer. Chercher : halos,
  sur-netteté, artefacts d'upscale. C'est vrai pour toute image générée sur
  tout projet — jamais d'asset IA intégré sans inspection visuelle.

## 2. Extraction — PNG master lossless, conversion de range explicite

```bash
ffmpeg -i master-4k.mp4 \
  -vf "fps=15,scale=in_range=tv:out_range=pc:flags=lanczos,format=rgb24" \
  -start_number 0 frames_master/frame_%03d.png
```

- `in_range=tv:out_range=pc` : LA ligne qui rend le crème crème au lieu de
  gris délavé. Les vidéos livrées en yuv420p limited (métadonnées souvent
  `unknown`) doivent être converties explicitement.
- Check automatique obligatoire (color-check.mjs) : 5 pixels de fond de la
  frame master comparés à la source décodée en full range — tolérance **±3
  par canal**, sinon FAIL.
- PNG d'abord, compression de livraison ensuite. Jamais de lossy à l'extraction.
- 15 fps par défaut (~120 frames pour 8 s). Si budget dépassé : baisser les
  fps, JAMAIS la qualité.
- Masters volumineux (~300 Mo en 4K) : purger après encodage, mais CONSERVER
  les frames de référence du gate (première/milieu/dernière) dans
  `frames_master/ref/`.

## 3. Livraison — 4 paliers, format selon le contenu

Paliers : `frames/1080/`, `frames/1920/`, `frames/2880/`, `frames/3840/`.
Le 4e palier est indispensable : un laptop 1512 px CSS @ DPR 2 = 3024 px
device, un 4K plein écran = 3840 — sans lui, upscale flou garanti.

- **Photo / cinématique (grain, dégradés)** : **AVIF q65** (sharp, effort 4,
  lanczos3). Mesuré sur pièces : plus fidèle ET ~3× plus léger que WebP q92
  (VP8 lisse le grain, AV1 le préserve). WebP en fallback uniquement.
- **Line-art / aplats** : **lossless** (WebP `-lossless` ET AVIF lossless,
  garder le plus léger) — compact et parfait par définition sur ce contenu.
- Budget : **< 12 Mo par palier** (asserté). Dépassement → baisser les fps.
- Encodage 4K : **batch séquentiel** (libaom ≈ 2 Go RAM par encode 4K — OOM
  garanti en parallèle sur VPS) + reprise incrémentale (skip des frames déjà
  encodées).
- Émettre un manifest JSON `{ count, tiers, ext }` consommé par le runtime —
  zéro constante dupliquée en JS.

## 4. Canvas — calibration DPR obligatoire

```js
const dpr = Math.min(window.devicePixelRatio || 1, 2)
canvas.width = Math.round(cssW * dpr)
canvas.height = Math.round(cssH * dpr)
canvas.style.width = cssW + 'px'
canvas.style.height = cssH + 'px'
// Le resize du backing store RÉINITIALISE l'état du contexte → reposer :
ctx.imageSmoothingEnabled = true
ctx.imageSmoothingQuality = 'high'
```

- Palier choisi en **pixels device** (clientWidth × dpr), jamais en CSS : le
  plus petit palier ≥ largeur device, sinon le plus grand.
- Cover-fit ratio conservé, coordonnées et dimensions **arrondies à l'entier**,
  resize complet avec debounce (~150 ms).
- Scroll → **lerp de l'index** affiché vers l'index cible (fluidité en scroll
  violent), mais TOUJOURS dessiner une frame native — jamais de blend de deux
  frames (ça re-floute).
- Chargement jamais bloquant : dessiner la frame décodée la plus proche si la
  cible n'est pas encore chargée.
- Préchargement critique (~20 frames) avec vraie progression affichée
  (preloader), borné dans le temps (~6 s) ; le reste en async.

## 5. Gate qualité automatique — dans le build, échec = build rouge

Dans le smoke test headless (viewport 1920×1080 @ deviceScaleFactor 2, palier
max) : servir les masters de référence en local, puis à 3 positions de scroll
(première / milieu / dernière frame) :

1. Attendre que le lerp se pose sur la frame cible exacte (hook
   `window.__abd.hero.frame()`), puis crops 200×200 du canvas réel vs master
   PNG dessiné cover-fit aux mêmes dimensions.
2. **SSIM ≥ 0,98** sur le crop détail (métrique d'indiscernabilité perçue).
   NE PAS gater sur la variance laplacienne brute : sur contenu grainé, la
   haute fréquence du master EST le grain — inatteignable en lossy (validé
   sur pièces : q92 à 360 Ko/frame plafonne à 80 %). La variance reste
   affichée à titre informatif.
3. **Fond identique à ±3 RGB.**
4. Crops master/rendu écrits côte à côte (`tasks/reports/`) + **rapport de
   comparaison montré au client avant toute livraison** — obligatoire.
5. Mesurer toute métrique qualité **à la résolution native de livraison**, sur
   le crop exact du gate — un probe après downscale ment (mesuré : 94 %
   apparent à 1200 px vs 50 % réel à 4K).

## Leçons intégrées (payées sur ce projet — ne pas re-payer)

- **La review de code sans exécution navigateur est insuffisante.** Tout build
  passe par un smoke test headless réel : triggers ScrollTrigger présents,
  frames qui changent au scroll, scroll violent (End/Home pendant inertie —
  router les touches vers le smooth-scroller), pass mobile 375 px,
  reduced-motion, 0 erreur console. Exposer `window.gsap` /
  `window.ScrollTrigger` / hooks de debug : les imports ES sont module-scoped,
  `window.gsap === undefined` en console est un faux négatif.
- **Aucun contenu caché par défaut en CSS en attendant JS.** Les états
  initiaux des reveals sont posés PAR le JS (gsap.set) une fois chargé ; si le
  JS meurt, le site reste 100 % lisible (poster statique, fonds fixes).
  Fallback `prefers-reduced-motion` : poster + texte visibles, zéro canvas,
  zéro téléchargement de frames.
- **QA visuelle obligatoire sur toute image générée** (Higgsfield ou autre) :
  regarder les frames extraites ET le rendu final en screenshots avant de
  livrer. Les métriques attrapent la dérive, seul l'œil attrape le ridicule.
