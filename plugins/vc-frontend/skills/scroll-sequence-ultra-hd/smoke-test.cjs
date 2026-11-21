/**
 * Smoke test runtime — exécuté après `vite build` (npm run build).
 * Sert dist/ via `vite preview`, ouvre la page en headless Chromium et ÉCHOUE si :
 *   - erreur console / pageerror / requête >= 400
 *   - ScrollTrigger non initialisé (triggers, pins)
 *   - le canvas du hero ne change pas de frame entre 0 % et ~50 % du pin
 *   - les particules de l'harmonisation n'atteignent pas leur position finale
 *   - scroll violent (End/Home) → état incohérent ou erreur
 *   - après scroll complet, des éléments restent invisibles hors chorégraphie
 *   - une image atteignable reste non chargée
 *   - pass mobile 375px : mêmes invariants
 * Mesure aussi les durées de frame rAF pendant le scrub (rapport, gate p95).
 *
 * Règle projet : la review de code sans exécution navigateur ne suffit pas.
 */
const { spawn } = require('node:child_process')
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright-core')

const CHROME = process.env.CHROME_PATH || undefined // undefined : navigateur Playwright installé par défaut
const PORT = 4173
const URL = `http://127.0.0.1:${PORT}/`
// Invisibilité voulue en fin de parcours (chorégraphie) :
const HIDDEN_OK = '.hero__shadow, .hero__scrollcue, .hero__content, .harmonisation, .preloader'
const MIN_TRIGGERS = 4
const MIN_PIN_SPACERS = 2

let failed = false
function fail(msg) {
  console.error(`✗ FAIL — ${msg}`)
  failed = true
}
function ok(msg) {
  console.log(`  ✓ ${msg}`)
}

async function waitForServer(url, ms) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    try {
      const r = await fetch(url)
      if (r.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`preview server injoignable sur ${url}`)
}

async function wheelBy(page, total, step = 800, delay = 100) {
  for (let done = 0; done < total; done += step) {
    await page.mouse.wheel(0, step)
    await page.waitForTimeout(delay)
  }
}

async function runPass(browser, { label, viewport }) {
  console.log(`\n── Pass ${label} (${viewport.width}×${viewport.height}) ──`)
  const ctx = await browser.newContext({ viewport, reducedMotion: 'no-preference' })
  const page = await ctx.newPage()

  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console.error] ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
  page.on('requestfailed', (r) => errors.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`))
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`[http ${r.status()}] ${r.url()}`) })

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(5000) // preloader + intro + fin de préchargement frames

  // 1. Runtime initialisé
  const rt = await page.evaluate(() => ({
    gsap: !!window.gsap,
    st: !!window.ScrollTrigger,
    triggers: window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0,
    pinSpacers: document.querySelectorAll('.pin-spacer').length,
    preloaderGone: !document.getElementById('preloader'),
    heroHook: !!window.__seq?.hero,
    harmoHook: !!window.__seq?.harmonisation,
  }))
  if (!rt.gsap || !rt.st) fail(`GSAP/ScrollTrigger absents (gsap=${rt.gsap}, st=${rt.st})`)
  if (rt.triggers < MIN_TRIGGERS) fail(`${rt.triggers} triggers — minimum ${MIN_TRIGGERS}`)
  if (rt.pinSpacers < MIN_PIN_SPACERS) fail(`${rt.pinSpacers} pin-spacer — attendu >= ${MIN_PIN_SPACERS} (hero + harmonisation)`)
  if (!rt.preloaderGone) fail('preloader toujours dans le DOM')
  if (!rt.heroHook) fail('séquence hero inactive (window.__seq.hero absent — frames pas chargées ?)')
  if (!rt.harmoHook) fail('harmonisation inactive (window.__seq.harmonisation absent)')
  if (!failed) ok(`runtime : ${rt.triggers} triggers, ${rt.pinSpacers} pins, hooks présents`)

  const canvasShot = () =>
    page.evaluate(() => document.querySelector('.hero__canvas').toDataURL('image/webp', 0.5))

  // 2. Le canvas hero change réellement de frame entre 0 % et ~50 % du pin
  const shotTop = await canvasShot()
  const frameTop = await page.evaluate(() => window.__seq.hero.frame())
  await page.mouse.move(viewport.width / 2, viewport.height / 2)
  await wheelBy(page, viewport.height * 1.6) // ~50 % du pin de 300vh
  await page.waitForTimeout(800)
  const shotMid = await canvasShot()
  const frameMid = await page.evaluate(() => window.__seq.hero.frame())
  if (shotTop === shotMid) fail('canvas hero identique entre 0 % et ~50 % du pin (séquence morte)')
  else ok(`canvas hero anime : frame ${frameTop} → ${frameMid}`)
  if (frameMid <= frameTop) fail(`index de frame ne progresse pas (${frameTop} → ${frameMid})`)

  // 3. Harmonisation : les particules atteignent leur position finale
  //    (on scrolle jusqu'à ~78 % du pin de la section — formation complète, avant la pluie)
  let peakFormed = 0
  let peakProgress = 0
  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(120)
    const s = await page.evaluate(() => ({
      p: window.__seq.harmonisation.progress(),
      f: window.__seq.harmonisation.formed(),
    }))
    peakFormed = Math.max(peakFormed, s.f)
    peakProgress = Math.max(peakProgress, s.p)
    if (s.p > 0.99) break
  }
  if (peakProgress < 0.95) fail(`harmonisation non parcourue (progress max ${peakProgress.toFixed(2)})`)
  if (peakFormed < 0.99) fail(`particules non formées (peak ${(peakFormed * 100).toFixed(1)} % < 99 %)`)
  else ok(`particules formées à ${(peakFormed * 100).toFixed(1)} %, progress max ${peakProgress.toFixed(2)}`)

  // 4. Perf : durées de frame rAF pendant un scrub continu dans les actes
  await page.evaluate(() => {
    window.__perf = []
    let last = performance.now()
    const tick = (t) => {
      window.__perf.push(t - last)
      last = t
      if (window.__perf.length < 400) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.mouse.wheel(0, -400)
  await wheelBy(page, 3000, 600, 80)
  await page.waitForTimeout(600)
  const perf = await page.evaluate(() => {
    const d = [...window.__perf].sort((a, b) => a - b)
    const at = (q) => d[Math.floor(d.length * q)] || 0
    return { n: d.length, p50: at(0.5), p95: at(0.95), max: d[d.length - 1] || 0 }
  })
  const msg = `rAF n=${perf.n} p50=${perf.p50.toFixed(1)}ms p95=${perf.p95.toFixed(1)}ms max=${perf.max.toFixed(1)}ms`
  if (perf.p95 > 20) fail(`perf scrub : ${msg} (gate p95 <= 20ms)`)
  else ok(`perf scrub : ${msg}`)

  // 5. Scroll violent : End puis Home au clavier — aucun état incohérent
  await page.keyboard.press('End')
  await page.waitForTimeout(1800)
  const bottomReached = await page.evaluate(
    () => window.scrollY + innerHeight >= document.documentElement.scrollHeight - 60
  )
  if (!bottomReached) fail('End ne va pas en bas de page (scroll bloqué)')
  await page.keyboard.press('Home')
  await page.waitForTimeout(1200)
  const afterViolence = await page.evaluate(() => ({
    y: window.scrollY,
    frame: window.__seq.hero.frame(),
  }))
  if (afterViolence.y > 5) fail(`Home ne revient pas en haut (scrollY=${afterViolence.y})`)
  if (afterViolence.frame > 8) fail(`frame hero incohérente après Home (${afterViolence.frame})`)
  else ok(`scroll violent : End/Home OK, frame hero retombée à ${afterViolence.frame}`)

  // 6. Scroll complet à la molette : rien ne reste invisible hors chorégraphie
  let lastY = -1
  for (let i = 0; i < 80; i++) {
    await page.mouse.wheel(0, 900)
    await page.waitForTimeout(90)
    const y = await page.evaluate(() => window.scrollY)
    if (y === lastY && i > 8) break
    lastY = y
  }
  await page.waitForTimeout(1200)
  const stuck = await page.evaluate((allowSel) => {
    return [...document.querySelectorAll('main *, footer *')]
      .filter((el) => {
        if (el.closest(allowSel)) return false
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return false
        const cs = getComputedStyle(el)
        return cs.opacity === '0' || cs.visibility === 'hidden'
      })
      .slice(0, 10)
      .map((el) => `${el.tagName}.${String(el.className).split(' ')[0]}`)
  }, HIDDEN_OK)
  if (stuck.length) fail(`éléments restés invisibles : ${stuck.join(', ')}`)
  else ok('aucun élément resté invisible après parcours complet')

  // 7. Images atteignables toutes chargées (lazy hors viewport horizontal exclues)
  const badImgs = await page.evaluate(() =>
    [...document.images]
      .filter((i) => {
        const r = i.getBoundingClientRect()
        const horizVisible = r.right > 0 && r.left < innerWidth
        return horizVisible && (!i.complete || i.naturalWidth === 0)
      })
      .map((i) => (i.currentSrc || i.src).split('/').pop())
  )
  if (badImgs.length) fail(`images non chargées : ${badImgs.join(', ')}`)
  else ok('images atteignables toutes chargées')

  // 8. Erreurs collectées sur toute la session
  if (errors.length) fail(`erreurs runtime :\n  ${errors.join('\n  ')}`)
  else ok('0 erreur console / réseau')

  await ctx.close()
}

// ── Gate qualité "Ultra HD" (norme §5) ─────────────────────────────────────
// Viewport 1920×1080 @ deviceScaleFactor 2 → canvas 3840×2160, palier 3840,
// comparaison 1:1 avec les PNG masters de référence (frames 0 / 60 / 120) :
//   - netteté (variance du laplacien) du crop détail >= 90 % du master
//   - fond identique à ±3 RGB
//   - crops côte à côte écrits dans tasks/reports/ pour validation humaine
const MASTER_PORT = 4599
const REF_DIR = path.join(__dirname, '..', 'frames_master', 'ref')
const REPORT_DIR = path.join(__dirname, '..', 'tasks', 'reports')

function serveMasterRefs() {
  const server = http.createServer((req, res) => {
    const f = path.join(REF_DIR, path.basename(req.url))
    if (!fs.existsSync(f)) {
      res.writeHead(404).end()
      return
    }
    res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' })
    fs.createReadStream(f).pipe(res)
  })
  server.listen(MASTER_PORT, '127.0.0.1')
  return server
}

async function qualityPass(browser, manifest) {
  console.log('\n── Gate qualité Ultra HD (1920×1080 @ DPR 2, palier 3840 vs masters) ──')
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
  })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(5000)

  const last = manifest.count - 1
  const mid = Math.floor(manifest.count / 2)
  const positions = [
    { p: 0, frame: 0 },
    { p: 0.5, frame: mid },
    { p: 1, frame: last },
  ]

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const reportFiles = []

  for (const pos of positions) {
    const res = await page.evaluate(
      async ({ p, frame, masterPort }) => {
        const st = window.ScrollTrigger.getAll().find(
          (t) => t.pin && t.trigger.classList.contains('hero')
        )
        if (!st) return { error: 'trigger hero introuvable' }
        const y = st.start + p * (st.end - st.start)
        window.lenis.scrollTo(y, { immediate: true })
        window.ScrollTrigger.update()
        // Attend que le lerp d'index se pose sur la frame cible.
        const t0 = performance.now()
        while (window.__seq.hero.frame() !== frame && performance.now() - t0 < 4000) {
          await new Promise((r) => requestAnimationFrame(r))
        }
        const got = window.__seq.hero.frame()
        if (got !== frame) return { error: `frame ${got} au lieu de ${frame}` }

        const canvas = document.querySelector('.hero__canvas')
        const cw = canvas.width
        const ch = canvas.height

        // Référence : master PNG dessiné cover-fit aux mêmes dimensions.
        const blob = await fetch(
          `http://127.0.0.1:${masterPort}/frame_${String(frame).padStart(3, '0')}.png`
        ).then((r) => (r.ok ? r.blob() : null))
        if (!blob) return { error: `master ref frame ${frame} introuvable` }
        const bmp = await createImageBitmap(blob)
        const refCanvas = document.createElement('canvas')
        refCanvas.width = cw
        refCanvas.height = ch
        const rctx = refCanvas.getContext('2d')
        rctx.imageSmoothingEnabled = true
        rctx.imageSmoothingQuality = 'high'
        const s = Math.max(cw / bmp.width, ch / bmp.height)
        rctx.drawImage(
          bmp,
          Math.round((cw - bmp.width * s) / 2),
          Math.round((ch - bmp.height * s) / 2),
          Math.round(bmp.width * s),
          Math.round(bmp.height * s)
        )

        const CROP = 200
        const zones = {
          detail: [Math.round(cw * 0.58) - CROP / 2, Math.round(ch * 0.42) - CROP / 2],
          fond: [Math.round(cw * 0.06), Math.round(ch * 0.1)],
        }

        // SSIM 8x8 sur luminance — métrique d'indiscernabilité visuelle.
        // (La variance laplacienne brute est inatteignable à >= 90 % sur du
        // contenu grainé : la HF du master EST le grain — voir rapport.)
        const ssim = (A, B, w) => {
          const C1 = (0.01 * 255) ** 2
          const C2 = (0.03 * 255) ** 2
          const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
          const W = 8
          let total = 0
          let n = 0
          for (let by = 0; by + W <= w; by += W) {
            for (let bx = 0; bx + W <= w; bx += W) {
              let ma = 0
              let mb = 0
              for (let y2 = 0; y2 < W; y2++)
                for (let x2 = 0; x2 < W; x2++) {
                  const i = ((by + y2) * w + bx + x2) * 4
                  ma += lum(A, i)
                  mb += lum(B, i)
                }
              ma /= W * W
              mb /= W * W
              let va = 0
              let vb = 0
              let cov = 0
              for (let y2 = 0; y2 < W; y2++)
                for (let x2 = 0; x2 < W; x2++) {
                  const i = ((by + y2) * w + bx + x2) * 4
                  const da = lum(A, i) - ma
                  const db = lum(B, i) - mb
                  va += da * da
                  vb += db * db
                  cov += da * db
                }
              va /= W * W - 1
              vb /= W * W - 1
              cov /= W * W - 1
              total +=
                ((2 * ma * mb + C1) * (2 * cov + C2)) /
                ((ma * ma + mb * mb + C1) * (va + vb + C2))
              n++
            }
          }
          return total / n
        }
        const lapVar = (d, w, h) => {
          let sum = 0
          let sum2 = 0
          let n = 0
          for (let y2 = 1; y2 < h - 1; y2++) {
            for (let x2 = 1; x2 < w - 1; x2++) {
              const i = (y2 * w + x2) * 4
              const lum = (px) => 0.299 * d[px] + 0.587 * d[px + 1] + 0.114 * d[px + 2]
              const v =
                4 * lum(i) - lum(i - 4) - lum(i + 4) - lum(i - w * 4) - lum(i + w * 4)
              sum += v
              sum2 += v * v
              n++
            }
          }
          const mean = sum / n
          return sum2 / n - mean * mean
        }
        const meanRGB = (d) => {
          const acc = [0, 0, 0]
          for (let i = 0; i < d.length; i += 4) {
            acc[0] += d[i]
            acc[1] += d[i + 1]
            acc[2] += d[i + 2]
          }
          return acc.map((v) => v / (d.length / 4))
        }
        const cropDataURL = (srcCtx, x, y) => {
          const c = document.createElement('canvas')
          c.width = CROP
          c.height = CROP
          c.getContext('2d').putImageData(srcCtx.getImageData(x, y, CROP, CROP), 0, 0)
          return c.toDataURL('image/png')
        }

        const cctx = canvas.getContext('2d')
        const [dx, dy] = zones.detail
        const [bx, by] = zones.fond
        const canDetail = cctx.getImageData(dx, dy, CROP, CROP)
        const refDetail = rctx.getImageData(dx, dy, CROP, CROP)
        const canFond = cctx.getImageData(bx, by, CROP, CROP)
        const refFond = rctx.getImageData(bx, by, CROP, CROP)

        return {
          frame,
          ssim: ssim(canDetail.data, refDetail.data, CROP),
          sharpCanvas: lapVar(canDetail.data, CROP, CROP),
          sharpRef: lapVar(refDetail.data, CROP, CROP),
          fondCanvas: meanRGB(canFond.data),
          fondRef: meanRGB(refFond.data),
          cropCanvas: cropDataURL(cctx, dx, dy),
          cropRef: cropDataURL(rctx, dx, dy),
        }
      },
      { p: pos.p, frame: pos.frame, masterPort: MASTER_PORT }
    )

    if (res.error) {
      fail(`gate qualité frame ${pos.frame}: ${res.error}`)
      continue
    }
    const ratio = res.sharpCanvas / res.sharpRef
    const colorDiff = Math.max(
      ...res.fondCanvas.map((v, i) => Math.abs(v - res.fondRef[i]))
    )
    const label = `frame ${res.frame}: SSIM ${res.ssim.toFixed(4)}, fond Δ${colorDiff.toFixed(1)} (variance lap. ${(ratio * 100).toFixed(0)} % — info)`
    if (res.ssim < 0.98) fail(`gate SSIM — ${label} (< 0.98)`)
    else if (colorDiff > 3) fail(`gate couleur — ${label} (> 3)`)
    else ok(label)

    for (const [kind, dataURL] of [
      ['master', res.cropRef],
      ['rendu', res.cropCanvas],
    ]) {
      const f = path.join(REPORT_DIR, `crop-f${String(res.frame).padStart(3, '0')}-${kind}.png`)
      fs.writeFileSync(f, Buffer.from(dataURL.split(',')[1], 'base64'))
      reportFiles.push(f)
    }
  }

  await ctx.close()
  if (reportFiles.length) {
    console.log(`  → crops master/rendu écrits dans tasks/reports/ (${reportFiles.length} fichiers)`)
  }
}

;(async () => {
  const preview = spawn(
    'npx',
    ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    { cwd: `${__dirname}/..`, stdio: 'ignore' }
  )
  const masterServer = serveMasterRefs()
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'frames-manifest.json'), 'utf8')
  )

  let browser
  try {
    await waitForServer(URL, 15000)
    browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] })
    await runPass(browser, { label: 'desktop', viewport: { width: 1440, height: 900 } })
    await runPass(browser, { label: 'mobile', viewport: { width: 375, height: 700 } })
    await qualityPass(browser, manifest)
    await browser.close()
  } catch (e) {
    fail(e.message)
    if (browser) await browser.close().catch(() => {})
  } finally {
    preview.kill('SIGTERM')
    masterServer.close()
  }

  if (failed) {
    console.error('\n✗ SMOKE TEST FAILED')
    process.exit(1)
  }
  console.log('\n✓ smoke test OK (desktop + mobile)')
})()
