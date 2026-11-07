import { randomUUID } from "node:crypto"
import type { PrismaClient } from "@prisma/client"
import { processImage } from "./images.ts"
import { deleteObject, getObject, keyFromUrl, putObject } from "./storage.ts"

/**
 * Tareas de mantenimiento (sin dependencias de Next, para usarlas tambien desde scripts):
 *  - purgeDeleted: elimina por completo lo borrado hace mas de 90 dias (filas y archivos del bucket).
 *  - convertPending: convierte a WebP las fotos antiguas que aun no tienen miniatura.
 */
export const RETENTION_DAYS = 90

const keysOf = (urls: (string | null | undefined)[]) => urls.map((u) => (u ? keyFromUrl(u) : null)).filter((k): k is string => !!k)

export async function purgeDeleted(prisma: PrismaClient, now = new Date()) {
	const limit = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000)
	const result = { properties: 0, images: 0, files: 0, fileErrors: 0 }
	const removeFiles = async (keys: string[]) => {
		for (const key of keys.filter((k, i) => keys.indexOf(k) === i)) {
			try {
				await deleteObject(key)
				result.files++
			} catch (e) {
				result.fileErrors++
				console.error(`purga: no se pudo borrar ${key}: ${(e as Error).message}`)
			}
		}
	}
	const select = { id: true, path: true, thumbPath: true, originalKey: true } as const
	const fileKeys = (img: { path: string; thumbPath: string | null; originalKey: string | null }) => [
		...keysOf([img.path, img.thumbPath]),
		...(img.originalKey ? [img.originalKey] : []),
	]

	// Inmuebles: primero sus archivos, luego la fila (las imagenes y demas hijos se borran en cascada)
	const properties = await prisma.property.findMany({
		where: { deletedAt: { lt: limit } },
		select: { id: true, thumbnail: true, thumbnailWebp: true, PropertyImage: { select } },
		take: 200,
	})
	for (const p of properties) {
		await removeFiles([...p.PropertyImage.flatMap(fileKeys), ...keysOf([p.thumbnail, p.thumbnailWebp])])
		await prisma.property.delete({ where: { id: p.id } })
		result.properties++
	}
	// Imagenes sueltas borradas (el inmueble sigue activo)
	const images = await prisma.propertyImage.findMany({ where: { deletedAt: { lt: limit } }, select, take: 500 })
	for (const img of images) {
		await removeFiles(fileKeys(img))
		await prisma.propertyImage.delete({ where: { id: img.id } })
		result.images++
	}
	return result
}

async function download(url: string): Promise<{ buffer: Buffer; key: string | null }> {
	const key = keyFromUrl(url)
	if (key) return { buffer: await getObject(key), key }
	const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	return { buffer: Buffer.from(await res.arrayBuffer()), key: null }
}

async function convertOne(prisma: PrismaClient, image: { id: number; path: string; propertyId: number }) {
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

export interface ConvertOptions {
	limit?: number
	concurrency?: number
	dryRun?: boolean
	onError?: (image: { id: number; path: string }, message: string) => void
}

/** Idempotente: salta las fotos que ya tienen miniatura. El original no se toca (pasa a ser el respaldo privado). */
export async function convertPending(prisma: PrismaClient, { limit = 25, concurrency = 3, dryRun = false, onError }: ConvertOptions = {}) {
	const pending = await prisma.propertyImage.findMany({
		where: { thumbPath: null, deletedAt: null },
		select: { id: true, path: true, propertyId: true },
		orderBy: { id: "asc" },
		take: Number.isFinite(limit) ? limit : undefined,
	})
	const remaining = await prisma.propertyImage.count({ where: { thumbPath: null, deletedAt: null } })
	const out = { pending: pending.length, remaining, done: 0, failed: 0, bytesBefore: 0, bytesAfter: 0, bytesThumb: 0 }
	if (dryRun) return out
	const queue = [...pending]
	await Promise.all(
		Array.from({ length: concurrency }, async () => {
			for (let image = queue.shift(); image; image = queue.shift()) {
				try {
					const r = await convertOne(prisma, image)
					out.done++, (out.bytesBefore += r.before), (out.bytesAfter += r.after), (out.bytesThumb += r.thumb)
				} catch (e) {
					out.failed++
					onError?.(image, (e as Error).message)
				}
			}
		})
	)
	out.remaining = Math.max(0, remaining - out.done)
	return out
}
