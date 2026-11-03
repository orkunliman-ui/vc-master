// Séquence d'images pilotée au scroll, dessinée sur un canvas plein écran
// (technique des pages produit Apple) — norme "Ultra HD" :
//  - canvas calibré au devicePixelRatio (plafonné à 2), style CSS explicite
//  - imageSmoothingQuality 'high', coordonnées entières, resize debouncé
//  - l'index affiché lerpe vers l'index cible (fluidité en scroll violent),
//    mais on dessine TOUJOURS une frame native — jamais de blend de deux
//    frames (ça re-floute).
// Le chargement est progressif et jamais bloquant : draw() affiche la frame
// décodée la plus proche de l'index demandé.

export function createFrameSequence({ canvas, urls }) {
  const ctx = canvas.getContext('2d')
  const images = new Array(urls.length)
  let loadedCount = 0
  let currentIndex = -1

  // Lerp d'index : cible posée par le scroll, avance en rAF.
  let targetIndex = 0
  let smoothIndex = 0
  let rafId = 0

  function applyCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    const w = Math.round(cssW * dpr)
    const h = Math.round(cssH * dpr)
    if (w === canvas.width && h === canvas.height) return
    canvas.width = w
    canvas.height = h
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    // Le redimensionnement du backing store réinitialise l'état du contexte.
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    if (currentIndex >= 0) draw(currentIndex, true)
  }

  let resizeTimer = 0
  function onResize() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(applyCanvasSize, 150)
  }

  function load(from, to, onProgress) {
    const jobs = []
    for (let i = from; i < Math.min(to, urls.length); i++) {
      if (images[i]) continue
      jobs.push(
        new Promise((resolve) => {
          const img = new Image()
          img.decoding = 'async'
          img.onload = () => {
            images[i] = img
            loadedCount++
            onProgress?.(loadedCount)
            resolve(true)
          }
          img.onerror = () => resolve(false)
          img.src = urls[i]
        })
      )
    }
    return Promise.all(jobs).then((oks) => oks.every(Boolean))
  }

  function nearestLoaded(index) {
    if (images[index]) return index
    for (let d = 1; d < urls.length; d++) {
      if (images[index - d]) return index - d
      if (images[index + d]) return index + d
    }
    return -1
  }

  function draw(index, force = false) {
    const clamped = Math.max(0, Math.min(urls.length - 1, Math.round(index)))
    const i = nearestLoaded(clamped)
    if (i < 0 || (i === currentIndex && !force)) return
    currentIndex = i
    const img = images[i]
    const cw = canvas.width
    const ch = canvas.height
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = Math.round(img.naturalWidth * s)
    const h = Math.round(img.naturalHeight * s)
    ctx.drawImage(img, Math.round((cw - w) / 2), Math.round((ch - h) / 2), w, h)
  }

  function tick() {
    smoothIndex += (targetIndex - smoothIndex) * 0.22
    if (Math.abs(targetIndex - smoothIndex) < 0.5) smoothIndex = targetIndex
    draw(smoothIndex)
    rafId = smoothIndex === targetIndex ? 0 : requestAnimationFrame(tick)
  }

  // API scroll : pose la cible, le rAF fait le reste.
  function seek(index) {
    targetIndex = Math.max(0, Math.min(urls.length - 1, index))
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  window.addEventListener('resize', onResize)
  applyCanvasSize()

  return {
    load,
    draw,
    seek,
    resize: applyCanvasSize,
    count: urls.length,
    get currentIndex() {
      return currentIndex
    },
    get ready() {
      return loadedCount > 0
    },
  }
}

// Palier de frames : le plus petit dont la largeur couvre le canvas en pixels
// device (pas CSS) ; à défaut, le plus grand. Ex : 1512 CSS @ DPR 2 = 3024
// device → palier 3840.
export function pickTier(tiers, cssWidth) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const needed = Math.round(cssWidth * dpr)
  const sorted = [...tiers].sort((a, b) => a - b)
  return sorted.find((t) => t >= needed) ?? sorted[sorted.length - 1]
}
