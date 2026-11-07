import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const sent = vi.hoisted(() => [] as { to: string; message: string }[])
vi.mock('@/app/utils/emails', () => ({
	sendEmailToClient: async (to: string, message: string) => { sent.push({ to, message }) },
}))

import { POST as forgot } from '@/app/api/auth/forgot-password/route'
import { POST as check } from '@/app/api/auth/check-password/route'
import { POST as change } from '@/app/api/auth/change-password/route'
import { createResetToken, verifyResetToken } from '@/server/passwordReset'
import { clear, consume, isBlocked } from '@/server/rateLimit'

const hasDb = !!process.env.POSTGRES_PRISMA_URL
const prisma = new PrismaClient()
const tag = `reset-${Date.now()}`
const email = `${tag}@test.local`
let userId = 0
let ipCounter = 0

const req = (path: string, body: unknown, headers: Record<string, string> = {}) =>
	new NextRequest(`http://localhost:3000/api/auth/${path}`, {
		method: 'POST',
		body: JSON.stringify(body),
		// cada test usa su propia IP para no compartir contadores
		headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.9.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`, ...headers },
	})
const tokenFromMail = () => /token=([A-Za-z0-9_-]+)/.exec(sent.at(-1)!.message)![1]

describe.skipIf(!hasDb)('restablecer contraseña', () => {
	beforeAll(async () => {
		userId = (await prisma.user.create({ data: { email, name: 'Ana', password: await bcrypt.hash('OldPassword1', 4) } })).id
	})
	afterAll(async () => {
		await prisma.user.deleteMany({ where: { id: userId } })
		await prisma.rateLimit.deleteMany({ where: { key: { startsWith: `forgot:email:${tag}` } } })
		await prisma.$disconnect()
	})

	it('forgot-password responde igual exista o no la cuenta y nunca devuelve el token', async () => {
		const known = await forgot(req('forgot-password', { email }))
		const unknown = await forgot(req('forgot-password', { email: `nadie-${tag}@test.local` }))
		expect(known.status).toBe(200)
		expect(unknown.status).toBe(200)
		const [a, b] = [await known.json(), await unknown.json()]
		expect(a).toEqual(b)
		expect(JSON.stringify(a)).not.toMatch(/[A-Za-z0-9_-]{43}/)
		await vi.waitFor(() => expect(sent.filter((m) => m.to === email)).toHaveLength(1))
		expect(sent.some((m) => m.to.startsWith('nadie-'))).toBe(false)
	})

	it('en base de datos solo hay el hash del token, nunca el token', async () => {
		const token = tokenFromMail()
		const rows = await prisma.passwordResetToken.findMany({ where: { userId } })
		expect(rows).toHaveLength(1)
		expect(rows[0].tokenHash).not.toBe(token)
		expect(rows[0].tokenHash).toMatch(/^[0-9a-f]{64}$/)
	})

	it('el enlace permite cambiar la contraseña una sola vez', async () => {
		const token = tokenFromMail()
		expect((await check(req('check-password', {}, { token }))).status).toBe(200)
		const ok = await change(req('change-password', { password: 'NewPassword123', passwordConfirmation: 'NewPassword123' }, { token }))
		expect(ok.status).toBe(200)
		const user = await prisma.user.findUnique({ where: { id: userId } })
		expect(await bcrypt.compare('NewPassword123', user!.password)).toBe(true)
		const again = await change(req('change-password', { password: 'Another12345', passwordConfirmation: 'Another12345' }, { token }))
		expect(again.status).toBe(400)
		expect((await check(req('check-password', {}, { token }))).status).toBe(400)
		const still = await prisma.user.findUnique({ where: { id: userId } })
		expect(await bcrypt.compare('NewPassword123', still!.password)).toBe(true)
	})

	it('rechaza tokens falsos, caducados o firmados con el secreto antiguo', async () => {
		const jwtLike = 'eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImlkIjoxfX0.firma'
		expect((await change(req('change-password', { password: 'Whatever1234', passwordConfirmation: 'Whatever1234' }, { token: jwtLike }))).status).toBe(400)
		expect((await check(req('check-password', {}, { token: 'x'.repeat(43) }))).status).toBe(400)
		const token = await createResetToken(userId)
		await prisma.passwordResetToken.updateMany({ where: { userId }, data: { expiresAt: new Date(Date.now() - 1000) } })
		expect(await verifyResetToken(token)).toBeNull()
		expect((await change(req('change-password', { password: 'Whatever1234', passwordConfirmation: 'Whatever1234' }, { token }))).status).toBe(400)
	})

	it('un enlace nuevo invalida el anterior', async () => {
		const first = await createResetToken(userId)
		const second = await createResetToken(userId)
		expect(await verifyResetToken(first)).toBeNull()
		expect(await verifyResetToken(second)).not.toBeNull()
	})

	it('aplica la politica de contraseña y no gasta el token si falla', async () => {
		const token = await createResetToken(userId)
		const short = await change(req('change-password', { password: 'corta', passwordConfirmation: 'corta' }, { token }))
		expect(short.status).toBe(422)
		expect((await short.json()).message).toBe('passwordMin')
		const mismatch = await change(req('change-password', { password: 'Password12345', passwordConfirmation: 'Distinta12345' }, { token }))
		expect(mismatch.status).toBe(422)
		const long = 'a'.repeat(80)
		expect((await (await change(req('change-password', { password: long, passwordConfirmation: long }, { token }))).json()).message).toBe('passwordMax')
		expect(await verifyResetToken(token)).not.toBeNull()
	})

	it('limita las peticiones de reset por IP (429) y por cuenta (sin enviar mas correos)', async () => {
		const fixedIp = { 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200)}` }
		const results: number[] = []
		for (let i = 0; i < 12; i++) results.push((await forgot(req('forgot-password', { email: `x${i}-${tag}@test.local` }, fixedIp))).status)
		expect(results.slice(0, 10).every((s) => s === 200)).toBe(true)
		expect(results.slice(10)).toEqual([429, 429])
		const before = sent.filter((m) => m.to === email).length
		for (let i = 0; i < 5; i++) await forgot(req('forgot-password', { email }))
		await new Promise((r) => setTimeout(r, 200))
		expect(sent.filter((m) => m.to === email).length - before).toBeLessThanOrEqual(3)
	})
})

describe.skipIf(!hasDb)('limitador de intentos', () => {
	const key = `test:${tag}`
	afterAll(async () => {
		await clear(key)
		await prisma.$disconnect()
	})
	it('permite hasta el maximo, bloquea despues y se libera con clear()', async () => {
		const opts = { max: 3, windowSec: 60 }
		expect((await consume(key, opts)).allowed).toBe(true)
		expect((await consume(key, opts)).allowed).toBe(true)
		expect((await isBlocked(key, opts)).allowed).toBe(true)
		expect((await consume(key, opts)).allowed).toBe(true)
		expect((await isBlocked(key, opts)).allowed).toBe(false)
		const blocked = await consume(key, opts)
		expect(blocked.allowed).toBe(false)
		expect(blocked.retryAfterSec).toBeGreaterThan(0)
		await clear(key)
		expect((await isBlocked(key, opts)).allowed).toBe(true)
	})
	it('la ventana caducada reinicia el contador', async () => {
		const opts = { max: 1, windowSec: 60 }
		await consume(key, opts)
		await prisma.rateLimit.update({ where: { key }, data: { windowStart: new Date(Date.now() - 120_000) } })
		expect((await consume(key, opts)).allowed).toBe(true)
	})
})
