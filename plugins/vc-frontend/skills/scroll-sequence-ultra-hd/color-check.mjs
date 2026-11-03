// Check colorimétrique : échantillonne des pixels de fond d'une frame de la
// vidéo source (décodée en PNG par ffmpeg, référence) et les compare à la
// même frame du set livré. Tolérance ±3 par canal (norme pipeline Ultra HD).
// Usage : node scripts/color-check.mjs <ref.png> <delivered> [scale]
import sharp from 'sharp'

const [refPath, delivPath] = process.argv.slice(2)
const SAMPLES = [
  [0.06, 0.08],
  [0.94, 0.08],
  [0.05, 0.5],
  [0.95, 0.85],
  [0.08, 0.92],
]

async function pixels(path) {
  const img = sharp(path)
  const { width, height } = await img.metadata()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  return SAMPLES.map(([fx, fy]) => {
    const x = Math.round(fx * (width - 1))
    const y = Math.round(fy * (height - 1))
    const i = (y * info.width + x) * info.channels
    return [data[i], data[i + 1], data[i + 2]]
  })
}

const ref = await pixels(refPath)
const del = await pixels(delivPath)
let worst = 0
ref.forEach((r, i) => {
  const d = del[i]
  const diff = Math.max(...r.map((v, c) => Math.abs(v - d[c])))
  worst = Math.max(worst, diff)
  console.log(
    `pixel ${i}: ref rgb(${r.join(',')})  livré rgb(${d.join(',')})  Δmax=${diff}`
  )
})
console.log(worst <= 3 ? `OK — Δ max ${worst} <= 3` : `FAIL — Δ max ${worst} > 3`)
process.exit(worst <= 3 ? 0 : 1)
