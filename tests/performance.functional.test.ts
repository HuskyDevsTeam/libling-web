import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/server/db'
import { memo, invalidate } from '@/server/memo'
import { activeMultipleProperty, createProperty, deactivateMultipleProperty, indexProperty, updateProperty } from '@/server/data'

const hasDb = !!process.env.POSTGRES_PRISMA_URL
const tag = `perf-${Date.now()}`

describe('memo (sin DB)', () => {
	it('reutiliza el resultado, comparte peticiones simultaneas y caduca', async () => {
		const load = vi.fn(async () => Math.random())
		const [a, b] = await Promise.all([memo('t', 'k', 1000, load), memo('t', 'k', 1000, load)])
		expect(a).toBe(b)
		expect(await memo('t', 'k', 1000, load)).toBe(a)
		expect(load).toHaveBeenCalledTimes(1)
		invalidate('t')
		await memo('t', 'k', 1000, load)
		expect(load).toHaveBeenCalledTimes(2)
		await new Promise((r) => setTimeout(r, 15))
		await memo('t', 'caduca', 5, load)
		await new Promise((r) => setTimeout(r, 15))
		await memo('t', 'caduca', 5, load)
		expect(load).toHaveBeenCalledTimes(4)
	})
	it('no guarda en cache los errores', async () => {
		let n = 0
		const flaky = async () => { if (n++ === 0) throw new Error('boom'); return 'ok' }
		await expect(memo('t', 'err', 1000, flaky)).rejects.toThrow('boom')
		expect(await memo('t', 'err', 1000, flaky)).toBe('ok')
	})
})

describe.skipIf(!hasDb)('rendimiento de datos', () => {
	let ids: { user: number; country: number; currency: number; type: number }
	const base = () => ({
		content: 'Descripcion', address: 'Rue 1', area: 50, furnished: false, type: true, publishedById: ids.user,
		countryId: ids.country, currencyId: ids.currency, propertyTypeId: ids.type,
	})
	beforeAll(async () => {
		const user = await prisma.user.create({ data: { email: `${tag}@test.local`, password: 'x' } })
		const country = await prisma.country.create({ data: { name: tag, code: tag, capital: 'x', phone: '0', currency: 'EUR' } })
		const currency = await prisma.currency.create({ data: { name: tag, symbol: '€', code: tag, nativeSymbol: '€', decimalDigits: 2, round: 0, pluralName: 'euros' } })
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

	it('createProperty guarda propiedad e hijos de forma atomica y ya completos al volver', async () => {
		const created = await createProperty({
			...base(), title: `Atomica ${tag}`, active: false, bedrooms: 1, bathrooms: 1, price: 1,
			Benefits: [{ name: 'a', propertyId: 0 }, { name: 'b', propertyId: 0 }],
			NearPlace: [{ name: 'n', description: '', propertyId: 0 }],
		} as never)
		const row = await prisma.property.findUniqueOrThrow({ where: { id: created.id }, include: { Benefits: true, NearPlace: true } })
		expect(row.Benefits).toHaveLength(2)
		expect(row.NearPlace).toHaveLength(1)
		// Un hijo invalido deshace todo: no queda el inmueble a medias
		const before = await prisma.property.count({ where: { publishedById: ids.user } })
		await expect(createProperty({ ...base(), title: `Rota ${tag}`, active: false, Benefits: [{ name: null, propertyId: 0 }] } as never)).rejects.toThrow()
		expect(await prisma.property.count({ where: { publishedById: ids.user } })).toBe(before)
	})
	it('dos altas con el mismo titulo reciben slugs distintos', async () => {
		const [a, b] = await Promise.all([1, 2].map(() => createProperty({ ...base(), title: `Mismo titulo ${tag}`, active: false } as never)))
		expect(a.slug).not.toBe(b.slug)
	})
	it('publicar y pausar varios inmuebles es un solo UPDATE y el listado publico lo refleja enseguida (cache invalidada)', async () => {
		const list = await Promise.all([1, 2, 3].map((i) => createProperty({ ...base(), title: `Lote ${i} ${tag}`, active: false } as never)))
		const idsList = list.map((p) => p.id)
		const publicIds = async () => (await indexProperty({ active: true }, { id: 'desc' }, 1, 100, false, 'card')).data.map((p) => p.id)
		expect(await publicIds()).not.toContain(idsList[0])
		expect(await activeMultipleProperty(idsList)).toEqual({ count: 3 })
		expect(await publicIds()).toEqual(expect.arrayContaining(idsList))
		await deactivateMultipleProperty(idsList)
		expect(await publicIds()).not.toContain(idsList[0])
		await updateProperty(idsList[0], { active: true })
		expect(await publicIds()).toContain(idsList[0])
	})
	it('la vista "card" solo trae lo que pintan las tarjetas', async () => {
		const { data } = await indexProperty({ active: true }, {}, 1, 5, false, 'card')
		expect(data.length).toBeGreaterThan(0)
		const item = data[0] as unknown as Record<string, unknown>
		expect(Object.keys(item).filter((k) => item[k] !== undefined).sort()).toEqual(
			['active', 'area', 'bathrooms', 'bedrooms', 'country', 'currency', 'frecuency', 'id', 'price', 'propertyType', 'slug', 'thumbnail', 'thumbnailWebp', 'title', 'type'].sort()
		)
		expect(item.content).toBeUndefined()
		expect(item.PropertyImage).toBeUndefined()
	})
})
