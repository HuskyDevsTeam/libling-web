import { createPropertyImage, showProperty, updateProperty } from "@/server/data"
import { requireAdmin, UnauthorizedError } from "@/server/guard"
import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { processImage } from "@/server/images"
import { putObject } from "@/server/storage"

const MAX_BYTES = 15 * 1024 * 1024

// Tipo real del archivo por sus primeros bytes (no se fia de la extension ni de la cabecera del cliente)
const detectImage = (b: Buffer): { ext: string; mime: string } | null => {
	if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" }
	if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" }
	if (b.length > 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return { ext: "webp", mime: "image/webp" }
	return null
}

const json = (message: string, status: number) => NextResponse.json({ message }, { status })

export async function POST(request: Request): Promise<NextResponse> {
	try {
		await requireAdmin()
	} catch (e) {
		if (e instanceof UnauthorizedError) return json("Unauthorized", 401)
		throw e
	}
	const { searchParams } = new URL(request.url)
	const propertyId = Number(searchParams.get("propertyId"))
	const face = searchParams.get("face")
	if (!Number.isInteger(propertyId) || propertyId <= 0) return json("Invalid propertyId", 400)
	if (!request.body) return json("Empty body", 400)
	if (Number(request.headers.get("content-length") || 0) > MAX_BYTES) return json("File too large", 413)

	const buffer = Buffer.from(await request.arrayBuffer())
	if (buffer.length === 0 || buffer.length > MAX_BYTES) return json("File too large", 413)
	const image = detectImage(buffer)
	if (!image) return json("Unsupported image type", 415)
	if (!(await showProperty({ id: propertyId }))) return json("Property not found", 404)

	// Siempre se guarda un WebP optimizado (ficha) y una miniatura (listados); el original queda solo como
	// respaldo privado (nunca se enlaza) salvo que se desactive con KEEP_ORIGINALS=false.
	let processed
	try {
		processed = await processImage(buffer)
	} catch {
		return json("Unreadable image", 422)
	}
	const stem = `${Date.now()}-${randomUUID()}`
	const originalKey = process.env.KEEP_ORIGINALS === "false" ? null : `originals/${stem}.${image.ext}`
	const [url, thumbUrl] = await Promise.all([
		putObject(`${stem}.webp`, processed.large.buffer, "image/webp"),
		putObject(`${stem}-thumb.webp`, processed.thumb.buffer, "image/webp"),
		...(originalKey ? [putObject(originalKey, buffer, image.mime, { CacheControl: "private, no-store" })] : []),
	])
	await createPropertyImage({
		name: `${stem}.webp`,
		description: "",
		path: url,
		thumbPath: thumbUrl,
		originalKey,
		propertyId,
	})
	if (face == "1") {
		await updateProperty(propertyId, { thumbnail: url })
	}
	const response = { filename: `${stem}.webp`, url, thumbUrl }
	return NextResponse.json(response)
}
