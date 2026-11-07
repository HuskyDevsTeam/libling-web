/**
 * Convierte a WebP (grande + miniatura) las fotos de inmuebles que ya estaban guardadas.
 *
 *   node scripts/convert-existing-images.ts --dry-run        # solo cuenta y muestra que haria
 *   node scripts/convert-existing-images.ts --limit 50       # prueba con unas pocas
 *   node scripts/convert-existing-images.ts                  # todas
 *
 * Variables: POSTGRES_PRISMA_URL y las S3_* de la aplicacion (S3_ENDPOINT/S3_PUBLIC_URL para R2).
 * Es idempotente: salta las fotos que ya tienen miniatura, asi que se puede repetir sin riesgo.
 * El archivo original NO se toca ni se borra: pasa a ser el respaldo privado (originalKey) y se
 * ofrece a la web solo la version WebP. Los enlaces antiguos siguen funcionando mientras exista el original.
 */
import { randomUUID } from "node:crypto"
import { PrismaClient } from "@prisma/client"
import { processImage } from "../src/server/images.ts"
import { getObject, keyFromUrl, putObject } from "../src/server/storage.ts"

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const flag = (name: string, fallback: number) => {
	const i = args.indexOf(name)
	return i >= 0 ? Number(args[i + 1]) : fallback
}
const limit = flag("--limit", Infinity)
const concurrency = flag("--concurrency", 3)

const prisma = new PrismaClient()

async function download(url: string): Promise<{ buffer: Buffer; key: string | null }> {
	const key = keyFromUrl(url)
	if (key) return { buffer: await getObject(key), key }
	const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	return { buffer: Buffer.from(await res.arrayBuffer()), key: null }
}

async function convert(image: { id: number; path: string; propertyId: number }) {
	const { buffer, key } = await download(image.path)
	const { large, thumb } = await processImage(buffer)
	const stem = `${Date.now()}-${randomUUID()}`
	const [url, thumbUrl] = await Promise.all([
		putObject(`${stem}.webp`, large.buffer, "image/webp"),
		putObject(`${stem}-thumb.webp`, thumb.buffer, "image/webp"),
	])
	await prisma.$transaction(async (tx) => {
		await tx.propertyImage.update({ where: { id: image.id }, data: { path: url, thumbPath: thumbUrl, originalKey: key } })
		// La portada se identifica por la URL de la foto: se mantiene la igualdad thumbnail === path
		await tx.property.updateMany({ where: { id: image.propertyId, thumbnail: image.path }, data: { thumbnail: url, thumbnailWebp: thumbUrl } })
	})
	return { before: buffer.length, after: large.buffer.length, thumb: thumb.buffer.length }
}

async function main() {
	const pending = await prisma.propertyImage.findMany({
		where: { thumbPath: null },
		select: { id: true, path: true, propertyId: true },
		orderBy: { id: "asc" },
		take: Number.isFinite(limit) ? limit : undefined,
	})
	console.log(`${pending.length} fotos pendientes${dryRun ? " (simulacion: no se escribe nada)" : ""}`)
	if (dryRun) return
	let done = 0, failed = 0, bytesBefore = 0, bytesAfter = 0, bytesThumb = 0
	const queue = [...pending]
	await Promise.all(
		Array.from({ length: concurrency }, async () => {
			for (let image = queue.shift(); image; image = queue.shift()) {
				try {
					const r = await convert(image)
					done++, (bytesBefore += r.before), (bytesAfter += r.after), (bytesThumb += r.thumb)
				} catch (e) {
					failed++
					console.error(`foto ${image.id} (${image.path}): ${(e as Error).message}`)
				}
			}
		})
	)
	const mb = (n: number) => (n / 1024 / 1024).toFixed(2)
	console.log(`convertidas ${done}, con error ${failed}. Original ${mb(bytesBefore)} MB -> WebP ${mb(bytesAfter)} MB (+ miniaturas ${mb(bytesThumb)} MB)`)
}

main().finally(() => prisma.$disconnect())
