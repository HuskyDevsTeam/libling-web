import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

const deleted = vi.hoisted(() => [] as string[])
vi.mock('@/server/storage', () => ({
	deleteObject: async (key: string) => { deleted.push(key) },
	keyFromUrl: (u: string) => (u.startsWith('https://cdn.test/') ? u.slice('https://cdn.test/'.length) : null),
	getObject: async () => Buffer.alloc(0),
	putObject: async () => 'x',
	publicUrl: (k: string) => k,
}))
import { prisma } from '@/server/db'
import { deleteProperty, deletePropertyImage, indexProperty, showProperty, createPropertyImage } from '@/server/data'
import { purgeDeleted, RETENTION_DAYS } from '@/server/maintenance'
import { GET, POST } from '@/app/api/cron/maintenance/route'

const hasDb = !!process.env.POSTGRES_PRISMA_URL
const tag = `soft-${Date.now()}`
const DAY = 24 * 60 * 60 * 1000

describe.skipIf(!hasDb)('borrado logico y purga', () => {
	let ids: { user: number; country: number; currency: number; type: number }
	const mk = (title: string) => prisma.property.create({
		data: { title, slug: `${tag}-${title}`, address: 'x', publishedById: ids.user, countryId: ids.country, currencyId: ids.currency, propertyTypeId: ids.type, active: true },
	})
	beforeAll(async () => {
		const user = await prisma.user.create({ data: { email: `${tag}@test.local`, password: 'x' } })
		const country = await prisma.country.create({ data: { name: tag, code: tag, capital: 'x', phone: '0', currency: 'EUR' } })
		const currency = await prisma.currency.create({ data: { name: tag, symbol: 'E', code: tag, nativeSymbol: 'E', decimalDigits: 2, round: 0, pluralName: 'e' } })
		const type = await prisma.propertyType.create({ data: { name: tag, code: tag } })
		ids = { user: user.id, country: country.id, currency: currency.id, type: type.id }
	})
	afterAll(async () => {
		await prisma.property.deleteMany({ where: { publishedById: ids.user } })
		await prisma.user.deleteMany({ where: { id: ids.user } })
		await prisma.propertyType.deleteMany({ where: { id: ids.type } })
		await prisma.currency.deleteMany({ where: { id: ids.currency } })
		await prisma.country.deleteMany({ where: { id: ids.country } })
	})

	it('borrar un inmueble lo oculta pero conserva la fila; borrar una imagen igual', async () => {
		const p = await mk('a')
		const img = await createPropertyImage({ name: 'n', description: '', path: 'https://cdn.test/a.webp', propertyId: p.id } as never)
		await deletePropertyImage(img.id)
		expect((await showProperty({ id: p.id }))?.PropertyImage).toHaveLength(0)
		expect(await prisma.propertyImage.count({ where: { id: img.id } })).toBe(1)
		await deleteProperty(p.id)
		expect(await showProperty({ id: p.id })).toBeNull()
		const list = await indexProperty({ countryId: ids.country } as never, {}, 1, 50, false, 'admin')
		expect(list.data.find((x) => x.id === p.id)).toBeUndefined()
		const row = await prisma.property.findUniqueOrThrow({ where: { id: p.id } })
		expect(row.deletedAt).toBeInstanceOf(Date)
		expect(row.active).toBe(false)
	})

	it('la purga solo elimina lo borrado hace mas de 90 dias y borra sus archivos', async () => {
		const old = await mk('old'), recent = await mk('recent'), keep = await mk('keep')
		await prisma.propertyImage.create({ data: { name: 'o', description: '', path: 'https://cdn.test/old.webp', thumbPath: 'https://cdn.test/old-thumb.webp', originalKey: 'originals/old.jpg', propertyId: old.id } })
		const oldImg = await prisma.propertyImage.create({ data: { name: 's', description: '', path: 'https://cdn.test/solo.webp', propertyId: keep.id, deletedAt: new Date(Date.now() - (RETENTION_DAYS + 1) * DAY) } })
		await prisma.property.update({ where: { id: old.id }, data: { deletedAt: new Date(Date.now() - (RETENTION_DAYS + 1) * DAY) } })
		await prisma.property.update({ where: { id: recent.id }, data: { deletedAt: new Date(Date.now() - (RETENTION_DAYS - 1) * DAY) } })
		const result = await purgeDeleted(prisma)
		expect(result.properties).toBeGreaterThanOrEqual(1)
		expect(await prisma.property.count({ where: { id: old.id } })).toBe(0)
		expect(await prisma.property.count({ where: { id: recent.id } })).toBe(1)
		expect(await prisma.property.count({ where: { id: keep.id } })).toBe(1)
		expect(await prisma.propertyImage.count({ where: { id: oldImg.id } })).toBe(0)
		expect(deleted).toEqual(expect.arrayContaining(['old.webp', 'old-thumb.webp', 'originals/old.jpg', 'solo.webp']))
		expect(deleted).not.toContain('recent.webp')
	})

	it('la ruta diaria exige CRON_SECRET', async () => {
		const call = (h?: string) => POST(new Request('http://x/api/cron/maintenance', { method: 'POST', headers: h ? { authorization: h } : {} }))
		delete process.env.CRON_SECRET
		expect((await call('Bearer anything')).status).toBe(401)
		process.env.CRON_SECRET = 'a-long-enough-secret-123'
		expect((await call()).status).toBe(401)
		expect((await call('Bearer wrong-secret-of-same-len!')).status).toBe(401)
		const ok = await call('Bearer a-long-enough-secret-123')
		expect(ok.status).toBe(200)
		expect(await ok.json()).toMatchObject({ purge: expect.any(Object), convert: expect.any(Object) })
		expect(GET).toBe(POST)
	})
})
