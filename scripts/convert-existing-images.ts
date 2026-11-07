/**
 * Convierte a WebP (grande + miniatura) las fotos de inmuebles que ya estaban guardadas.
 *
 *   node scripts/convert-existing-images.ts --dry-run        # solo cuenta
 *   node scripts/convert-existing-images.ts --limit 50       # prueba con unas pocas
 *   node scripts/convert-existing-images.ts                  # todas
 *
 * Tambien se hace sin acceso a la consola: la ruta diaria /api/cron/maintenance convierte un lote
 * (CONVERT_BATCH, por defecto 25) en cada llamada hasta que no queden pendientes.
 * Variables: POSTGRES_PRISMA_URL y las S3_* de la aplicacion. Idempotente; el original no se borra.
 */
import { PrismaClient } from "@prisma/client"
import { convertPending } from "../src/server/maintenance.ts"

const args = process.argv.slice(2)
const flag = (name: string, fallback: number) => {
	const i = args.indexOf(name)
	return i >= 0 ? Number(args[i + 1]) : fallback
}
const prisma = new PrismaClient()
const mb = (n: number) => (n / 1024 / 1024).toFixed(2)

convertPending(prisma, {
	limit: flag("--limit", Infinity),
	concurrency: flag("--concurrency", 3),
	dryRun: args.includes("--dry-run"),
	onError: (image, message) => console.error(`foto ${image.id} (${image.path}): ${message}`),
})
	.then((r) => {
		if (args.includes("--dry-run")) return console.log(`${r.pending} fotos pendientes (simulacion: no se escribe nada)`)
		console.log(`convertidas ${r.done}, con error ${r.failed}, pendientes ${r.remaining}. Original ${mb(r.bytesBefore)} MB -> WebP ${mb(r.bytesAfter)} MB (+ miniaturas ${mb(r.bytesThumb)} MB)`)
	})
	.finally(() => prisma.$disconnect())
