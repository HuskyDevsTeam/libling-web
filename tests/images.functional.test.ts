import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import sharp from 'sharp'
import { processImage } from '@/server/images'

const puts = vi.hoisted(() => [] as { key: string; type: string; size: number; extra: Record<string, unknown> }[])
vi.mock('@/server/storage', () => ({
	putObject: async (key: string, body: Buffer, type: string, extra: Record<string, unknown> = {}) => {
		puts.push({ key, type, size: body.length, extra })
		return `https://cdn.test/${key}`
	},
	publicUrl: (k: string) => `https://cdn.test/${k}`,
}))
vi.mock('@/server/guard', () => ({
	requireAdmin: async () => ({ id: 1, email: 'a@test.local', name: 'a' }),
	UnauthorizedError: class extends Error {},
}))
import { prisma } from '@/server/db'
import { POST } from '@/app/api/image/route'

const hasDb = !!process.env.POSTGRES_PRISMA_URL
// Foto "de camara": 4000x3000, con orientacion EXIF 6 (hay que girarla) y metadatos
const photo = (w = 4000, h = 3000) =>
	sharp({ create: { width: w, height: h, channels: 3, background: { r: 200, g: 120, b: 40 } } })
		.jpeg({ quality: 95 })
		.withMetadata({ orientation: 6, exif: { IFD0: { Copyright: 'privado' } } })
		.toBuffer()

describe('processImage', () => {
	it('genera WebP grande (max 1920) y miniatura (max 480), sin ampliar y sin metadatos', async () => {
		const { large, thumb } = await processImage(await photo())
		for (const v of [large, thumb]) expect((await sharp(v.buffer).metadata()).format).toBe('webp')
		// orientacion 6 = girada: 4000x3000 pasa a 3000x4000 y luego se reduce al lado largo
		expect(Math.max(large.width, large.height)).toBe(1920)
		expect(large.height).toBeGreaterThan(large.width)
		expect(Math.max(thumb.width, thumb.height)).toBe(480)
		expect((await sharp(large.buffer).metadata()).exif).toBeUndefined()
		const small = await processImage(await photo(300, 200))
		expect(small.large.width).toBe(200)
		expect(small.large.height).toBe(300)
		expect(Math.max(small.large.width, small.large.height)).toBeLessThanOrEqual(300)
	})
	it('el WebP pesa mucho menos que el original', async () => {
		const original = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#888', noise: { type: 'gaussian', mean: 128, sigma: 30 } } }).jpeg({ quality: 90 }).toBuffer()
		const { large, thumb } = await processImage(original)
		expect(large.buffer.length).toBeLessThan(original.length / 2)
		expect(thumb.buffer.length).toBeLessThan(large.buffer.length / 4)
	})
	it('rechaza archivos que no son imagen y bombas de descompresion', async () => {
		await expect(processImage(Buffer.from('no soy una imagen'))).rejects.toThrow()
		const bomb = await sharp({ create: { width: 12000, height: 9000, channels: 3, background: '#fff' } }).png({ compressionLevel: 9 }).toBuffer()
		await expect(processImage(bomb)).rejects.toThrow()
	}, 30_000)
})

describe.skipIf(!hasDb)('POST /api/image', () => {
	const tag = `img-${Date.now()}`
	let ids: { user: number; country: number; currency: number; type: number; property: number }
	beforeAll(async () => {
		const user = await prisma.user.create({ data: { email: `${tag}@test.local`, password: 'x' } })
		const country = await prisma.country.create({ data: { name: tag, code: tag, capital: 'x', phone: '0', currency: 'EUR' } })
		const currency = await prisma.currency.create({ data: { name: tag, symbol: '€', code: tag, nativeSymbol: '€', decimalDigits: 2, round: 0, pluralName: 'euros' } })
		const type = await prisma.propertyType.create({ data: { name: tag, code: tag } })
		const property = await prisma.property.create({ data: { title: tag, slug: tag, content: 'x', address: 'x', type: true, publishedById: user.id, countryId: country.id, currencyId: currency.id, propertyTypeId: type.id } })
		ids = { user: user.id, country: country.id, currency: currency.id, type: type.id, property: property.id }
	})
	afterAll(async () => {
		await prisma.property.deleteMany({ where: { id: ids.property } })
		await prisma.user.deleteMany({ where: { id: ids.user } })
		await prisma.propertyType.deleteMany({ where: { id: ids.type } })
		await prisma.currency.deleteMany({ where: { id: ids.currency } })
		await prisma.country.deleteMany({ where: { id: ids.country } })
	})
	beforeEach(() => { puts.length = 0 })
	const upload = async (body: Buffer, face = false) =>
		POST(new Request(`http://x/api/image?propertyId=${ids.property}${face ? '&face=1' : ''}`, { method: 'POST', body: new Uint8Array(body) }))

	it('guarda WebP grande + miniatura y el original como respaldo privado; la portada usa la miniatura', async () => {
		const res = await upload(await photo(), true)
		expect(res.status).toBe(200)
		expect(puts.map((p) => p.key).sort()).toEqual(expect.arrayContaining([expect.stringMatching(/^\d+-[\w-]+\.webp$/), expect.stringMatching(/-thumb\.webp$/), expect.stringMatching(/^originals\/.*\.jpg$/)]))
		expect(puts).toHaveLength(3)
		expect(puts.find((p) => p.key.startsWith('originals/'))?.extra).toEqual({ CacheControl: 'private, no-store' })
		const image = await prisma.propertyImage.findFirstOrThrow({ where: { propertyId: ids.property } })
		expect(image.path).toMatch(/\.webp$/)
		expect(image.thumbPath).toMatch(/-thumb\.webp$/)
		expect(image.originalKey).toMatch(/^originals\//)
		const property = await prisma.property.findUniqueOrThrow({ where: { id: ids.property } })
		expect(property.thumbnail).toBe(image.path) // la portada se identifica por la URL de la foto
		expect(property.thumbnailWebp).toBe(image.thumbPath)
	})
	it('KEEP_ORIGINALS=false no guarda el original', async () => {
		process.env.KEEP_ORIGINALS = 'false'
		try {
			expect((await upload(await photo(800, 600))).status).toBe(200)
			expect(puts).toHaveLength(2)
		} finally { delete process.env.KEEP_ORIGINALS }
	})
	it('una imagen corrupta con cabecera JPEG valida da 422 y no sube nada', async () => {
		const res = await upload(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('basura'.repeat(50))]))
		expect(res.status).toBe(422)
		expect(puts).toHaveLength(0)
	})
	it('no sube tipos que no son imagen', async () => {
		expect((await upload(Buffer.from('<?php echo 1; ?>'))).status).toBe(415)
		expect(puts).toHaveLength(0)
	})
})
