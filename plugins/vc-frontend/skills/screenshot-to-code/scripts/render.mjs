// Rend une page (fichier HTML local ou URL) en PNG, à une taille de fenêtre donnée.
// Usage : node render.mjs <fichier.html|URL> <sortie.png> [--width 1440] [--height 900] [--full] [--dpr 1] [--wait 1200] [--selector CSS]
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright-core'

const args = process.argv.slice(2)
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').match(/^--(width|height|dpr|wait|selector)$/))
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`)
  return i >= 0 ? args[i + 1] : d
}
const [input, out] = pos
if (!input || !out) {
  console.error('usage : node render.mjs <fichier.html|URL> <sortie.png> [--width 1440] [--height 900] [--full] [--dpr 1] [--wait 1200] [--selector CSS]')
  process.exit(2)
}
// Navigateur headless déjà téléchargé par Playwright (on ne télécharge rien ici).
const base = join(homedir(), '.cache', 'ms-playwright')
const shell = readdirSync(base).filter(d => d.startsWith('chromium_headless_shell')).sort().pop()
const exe = shell && join(base, shell, 'chrome-headless-shell-linux64', 'chrome-headless-shell')
if (!exe || !existsSync(exe)) {
  console.error(`navigateur headless introuvable dans ${base}`)
  process.exit(1)
}
const url = /^https?:\/\//.test(input) ? input : pathToFileURL(resolve(input)).href
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--font-render-hinting=none', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] })
const ctx = await browser.newContext({ viewport: { width: Number(opt('width', 1440)), height: Number(opt('height', 900)) }, deviceScaleFactor: Number(opt('dpr', 1)) })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => m.type() === 'error' && errors.push(m.text()))
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => errors.push(`chargement : ${e.message}`))
await page.evaluate(() => document.fonts?.ready).catch(() => {})
await page.waitForTimeout(Number(opt('wait', 1200)))
const sel = opt('selector', null)
if (sel) await page.locator(sel).first().screenshot({ path: out })
else await page.screenshot({ path: out, fullPage: args.includes('--full') })
const size = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }))
console.log(JSON.stringify({ out, page: size, errors: errors.slice(0, 8) }))
await browser.close()
