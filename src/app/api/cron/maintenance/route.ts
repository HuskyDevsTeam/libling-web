import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { convertPending, purgeDeleted } from "@/server/maintenance"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/**
 * Mantenimiento diario. Se llama una vez al dia (Dokploy > Schedules, o cron del sistema):
 *   curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://libling.lu/api/cron/maintenance
 *  1. Elimina por completo los inmuebles e imagenes borrados hace mas de 90 dias (filas y archivos del bucket).
 *  2. Convierte a WebP un lote de fotos antiguas aun sin miniatura (CONVERT_BATCH, por defecto 25).
 * Sin CRON_SECRET configurado la ruta queda desactivada. Es idempotente: repetirla no causa dano.
 */
function authorized(request: Request): boolean {
	const secret = process.env.CRON_SECRET
	if (!secret || secret.length < 16) return false
	const given = Buffer.from((request.headers.get("authorization") ?? "").replace(/^Bearer /, ""))
	const expected = Buffer.from(secret)
	return given.length === expected.length && timingSafeEqual(given, expected)
}

async function run(request: Request) {
	if (!authorized(request)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
	const purge = await purgeDeleted(prisma)
	const batch = Number(process.env.CONVERT_BATCH) || 25
	const convert = await convertPending(prisma, { limit: batch, onError: (image, message) => console.error(`conversion foto ${image.id}: ${message}`) })
	console.info("mantenimiento diario", JSON.stringify({ purge, convert }))
	return NextResponse.json({ purge, convert })
}

export const POST = run
export const GET = run
