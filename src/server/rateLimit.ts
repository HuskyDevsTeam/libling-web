import "server-only"
import { prisma } from "@/server/db"

/**
 * Limitador de intentos guardado en PostgreSQL: se comparte entre instancias y sobrevive a reinicios.
 * Cada clave (por ejemplo "login:email:ana@x.com") tiene un contador dentro de una ventana de tiempo.
 */
export interface RateLimitOptions {
	/** Intentos permitidos dentro de la ventana */
	max: number
	/** Duracion de la ventana en segundos */
	windowSec: number
}
export interface RateLimitResult {
	allowed: boolean
	/** Segundos hasta que se libera la clave (0 si esta permitido) */
	retryAfterSec: number
}

/** Suma un intento a la clave y dice si todavia esta dentro del limite (operacion atomica). */
export async function consume(key: string, { max, windowSec }: RateLimitOptions): Promise<RateLimitResult> {
	const rows = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
		INSERT INTO "RateLimit" ("key", "count", "windowStart")
		VALUES (${key}, 1, NOW())
		ON CONFLICT ("key") DO UPDATE SET
			"count" = CASE WHEN "RateLimit"."windowStart" < NOW() - make_interval(secs => ${windowSec}) THEN 1 ELSE "RateLimit"."count" + 1 END,
			"windowStart" = CASE WHEN "RateLimit"."windowStart" < NOW() - make_interval(secs => ${windowSec}) THEN NOW() ELSE "RateLimit"."windowStart" END
		RETURNING "count", "windowStart"`
	const { count, windowStart } = rows[0]
	if (Math.random() < 0.02) void purgeExpired()
	if (count <= max) return { allowed: true, retryAfterSec: 0 }
	const retryAfterSec = Math.max(1, Math.ceil((windowStart.getTime() + windowSec * 1000 - Date.now()) / 1000))
	return { allowed: false, retryAfterSec }
}

/** Consulta sin sumar: ¿esta la clave ya bloqueada? */
export async function isBlocked(key: string, { max, windowSec }: RateLimitOptions): Promise<RateLimitResult> {
	const row = await prisma.rateLimit.findUnique({ where: { key } })
	if (!row) return { allowed: true, retryAfterSec: 0 }
	const resetAt = row.windowStart.getTime() + windowSec * 1000
	if (resetAt <= Date.now() || row.count < max) return { allowed: true, retryAfterSec: 0 }
	return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)) }
}

export async function clear(key: string) {
	await prisma.rateLimit.deleteMany({ where: { key } })
}

async function purgeExpired() {
	try {
		await prisma.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 24 * 3600 * 1000) } } })
	} catch {
		// la limpieza es oportunista: si falla no afecta a nadie
	}
}

/**
 * IP del cliente detras del proxy de Dokploy (Traefik). Traefik AÑADE la IP real al final de
 * X-Forwarded-For, asi que se usa la ultima entrada: lo que haya delante lo puede escribir el cliente.
 */
export function clientIp(headers: Headers): string {
	const forwarded = headers.get("x-forwarded-for")
	const last = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).at(-1)
	return (last || headers.get("x-real-ip") || "unknown").slice(0, 64)
}
