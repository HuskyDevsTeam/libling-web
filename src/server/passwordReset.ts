import "server-only"
import { createHash, randomBytes } from "node:crypto"
import { prisma } from "@/server/db"

export const RESET_TOKEN_TTL_MINUTES = 30

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

/** Crea un token nuevo (256 bits aleatorios). Solo se guarda su hash; el valor real solo viaja por correo. */
export async function createResetToken(userId: number) {
	const token = randomBytes(32).toString("base64url")
	await prisma.$transaction([
		// un solo enlace valido por usuario: los anteriores dejan de servir
		prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } }),
		prisma.passwordResetToken.create({
			data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000) },
		}),
	])
	return token
}

/** ¿El token existe, no ha caducado y no se ha usado? */
export async function verifyResetToken(token: string) {
	if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null
	const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } })
	if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) return null
	return record
}

/** Cambia la contraseña y gasta el token en una sola transaccion (no se puede reutilizar). */
export async function consumeResetToken(token: string, passwordHash: string) {
	const record = await verifyResetToken(token)
	if (!record) return false
	return prisma.$transaction(async (tx) => {
		// updateMany con usedAt: null evita que dos peticiones simultaneas usen el mismo token
		const spent = await tx.passwordResetToken.updateMany({
			where: { id: record.id, usedAt: null },
			data: { usedAt: new Date() },
		})
		if (spent.count !== 1) return false
		await tx.user.update({ where: { id: record.userId }, data: { password: passwordHash } })
		await tx.passwordResetToken.deleteMany({ where: { userId: record.userId, id: { not: record.id } } })
		return true
	})
}
