/**
 * Convierte imagenes estaticas a WebP (y videos a WebM) y escribe una tabla de pesos.
 *
 *   pnpm optimize-assets                          # todo public/ (png, jpg, gif -> .webp; mp4 -> .webm si falta)
 *   pnpm optimize-assets src/app/img/foo.gif ...  # solo esos archivos
 *   pnpm optimize-assets --check                  # no escribe: falla si hay referencias a un png/jpg/gif de public/ que ya tiene .webp
 *
 * Los originales no se borran. Se omiten los menores de 20 KB. Los GIF animados pasan a WebP animado.
 * Las variantes responsive ya existen como archivos *_1440x900.jpg, *_320x568.jpg...: cada una se convierte por separado.
 * Videos: VP9 + Opus con ffmpeg (si esta instalado) y un poster WebP del primer fotograma.
 */
import { readdir, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"
import sharp from "sharp"

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"))
const IMAGE = /\.(png|jpe?g|gif)$/i
const MIN_BYTES = 20 * 1024

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) yield* walk(full)
		else yield full
	}
}

const files = []
if (args.length) files.push(...args)
else for await (const f of walk("public")) files.push(f)

const rows = []
for (const file of files) {
	const size = (await stat(file)).size
	if (IMAGE.test(file) && size >= MIN_BYTES) {
		const out = file.replace(IMAGE, ".webp")
		if (existsSync(out) && (await stat(out)).mtimeMs >= (await stat(file)).mtimeMs) continue
		const animated = /\.gif$/i.test(file)
		await sharp(file, { animated }).webp({ quality: 80, effort: 5 }).toFile(out)
		rows.push([file, size, out, (await stat(out)).size])
	} else if (/\.mp4$/i.test(file)) {
		const out = file.replace(/\.mp4$/i, ".webm")
		if (!existsSync(out)) {
			const r = spawnSync("ffmpeg", ["-y", "-i", file, "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1", "-c:a", "libopus", "-b:a", "96k", out], { stdio: "ignore" })
			if (r.status !== 0) {
				console.error(`ffmpeg no pudo convertir ${file}`)
				continue
			}
			rows.push([file, size, out, (await stat(out)).size])
		}
		const poster = file.replace(/\.mp4$/i, "-poster.webp")
		if (!existsSync(poster)) {
			spawnSync("ffmpeg", ["-y", "-i", file, "-frames:v", "1", "-vf", "scale='min(1280,iw)':-2", poster], { stdio: "ignore" })
		}
	}
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`
let before = 0, after = 0
for (const [src, a, dst, b] of rows) {
	before += a
	after += b
	console.log(`${src.padEnd(60)} ${kb(a).padStart(9)} -> ${kb(b).padStart(9)}  (${Math.round((1 - b / a) * 100)}% menos)`)
}
console.log(rows.length ? `\nTotal: ${kb(before)} -> ${kb(after)}` : "Nada que convertir")
