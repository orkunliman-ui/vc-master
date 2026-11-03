// Encodage des paliers de livraison depuis les PNG masters (norme Ultra HD).
// Photo-réaliste → AVIF q65 (mesuré : plus net ET ~3x plus léger que WebP q92
// sur contenu photo avec grain), redimensionnement lanczos3.
// Incrémental : les frames déjà encodées sont sautées (reprise après OOM/kill).
// Usage : node scripts/encode-tiers.mjs <masterDir> <tier1> <tier2> ...
import { readdir, mkdir, rm, stat } from 'node:fs/promises'
import sharp from 'sharp'

const [masterDir, ...tierArgs] = process.argv.slice(2)
const tiers = tierArgs.map(Number)

const masters = (await readdir(masterDir))
  .filter((f) => /^frame_\d{3}\.png$/.test(f))
  .sort()
if (!masters.length) {
  console.error('FAIL: aucun master PNG dans', masterDir)
  process.exit(1)
}

async function exists(path) {
  return stat(path).then(
    (s) => s.size > 0,
    () => false
  )
}

for (const tier of tiers) {
  const out = `public/frames/${tier}`
  await mkdir(out, { recursive: true })
  // Purge des formats obsolètes uniquement (reprise incrémentale sur .avif).
  for (const f of await readdir(out)) {
    if (!f.endsWith('.avif')) await rm(`${out}/${f}`)
  }
  // Batch réduit sur les grands paliers : 8 encodes AVIF 4K en parallèle
  // saturent la RAM du VPS (OOM kill constaté).
  const batch = tier >= 3840 ? 1 : tier >= 2880 ? 2 : 6
  let done = 0
  for (let i = 0; i < masters.length; i += batch) {
    await Promise.all(
      masters.slice(i, i + batch).map(async (f) => {
        const dest = `${out}/${f.replace('.png', '.avif')}`
        if (await exists(dest)) return
        await sharp(`${masterDir}/${f}`)
          .resize({ width: tier, kernel: 'lanczos3' })
          .avif({ quality: 65, effort: 4 })
          .toFile(dest)
        done++
      })
    )
  }
  console.log(`palier ${tier}: ${masters.length} frames (${done} encodées, ${masters.length - done} déjà présentes) — AVIF q65`)
}
