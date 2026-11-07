/**
 * Test funcional: ejecuta updateProperty (la acción de editar) contra una
 * base PostgreSQL real. Requiere POSTGRES_PRISMA_URL con las migraciones
 * aplicadas; si no está definida, se omite.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { updateProperty, showProperty, createProperty } from '@/server/data'

const hasDb = !!process.env.POSTGRES_PRISMA_URL
const prisma = new PrismaClient()
const tag = `vitest-${Date.now()}`
let ids: { user: number; country: number; currency: number; type: number }
let propertyId: number

describe.skipIf(!hasDb)('updateProperty (functional, DB real)', () => {
	beforeAll(async () => {
		const user = await prisma.user.create({ data: { email: `${tag}@test.local`, password: 'x' } })
		const country = await prisma.country.create({ data: { name: tag, code: tag, capital: 'x', phone: '0', currency: 'EUR' } })
		const currency = await prisma.currency.create({ data: { name: tag, symbol: '€', code: tag, nativeSymbol: '€', decimalDigits: 2, round: 0, pluralName: 'euros' } })
		const type = await prisma.propertyType.create({ data: { name: tag, code: tag } })
		ids = { user: user.id, country: country.id, currency: currency.id, type: type.id }
		const created = await createProperty({
			title: 'Original', content: 'Texto original', address: 'Rue 1', area: 80, bedrooms: 2, bathrooms: 1,
			price: 100000, furnished: false, active: false, type: true, publishedById: ids.user,
			countryId: ids.country, currencyId: ids.currency, propertyTypeId: ids.type,
			Benefits: [{ name: 'Terraza', propertyId: 0 }, { name: 'Garaje', propertyId: 0 }],
			NearPlace: [{ name: 'Escuela', description: '', propertyId: 0 }],
			LegalNotice: [{ name: 'Aviso', propertyId: 0 }],
		})
		propertyId = created.id
		await new Promise(r => setTimeout(r, 300)) // createProperty no espera a los hijos
	})
	afterAll(async () => {
		await prisma.property.deleteMany({ where: { publishedById: ids?.user } })
		await prisma.user.deleteMany({ where: { id: ids?.user } })
		await prisma.propertyType.deleteMany({ where: { id: ids?.type } })
		await prisma.currency.deleteMany({ where: { id: ids?.currency } })
		await prisma.country.deleteMany({ where: { id: ids?.country } })
		await prisma.$disconnect()
	})

	it('genera un slug único a partir del título', async () => {
		const mk = (title: string) => createProperty({
			title, address: 'x', publishedById: ids.user, countryId: ids.country, currencyId: ids.currency,
			propertyTypeId: ids.type, furnished: false, active: false, type: true,
		})
		const a = await mk('Piso Único Ñandú')
		const b = await mk('Piso Único Ñandú')
		expect(a.slug).toMatch(/^piso-unico-nandu(-\d+)?$/)
		expect(b.slug).not.toBe(a.slug)
		expect((await showProperty({ slug: b.slug }))?.id).toBe(b.id)
	})

	it('actualiza los campos enviados y deja intactos los demás', async () => {
		await updateProperty(propertyId, { title: 'Editado', price: 120000, active: true })
		const p = await showProperty({ id: propertyId })
		expect(p?.title).toBe('Editado')
		expect(p?.price?.toNumber()).toBe(120000)
		expect(p?.active).toBe(true)
		expect(p?.address).toBe('Rue 1')
		expect(p?.area?.toNumber()).toBe(80)
		expect(p?.Benefits).toHaveLength(2)
	})

	it('reemplaza las listas hijas cuando se envían', async () => {
		await updateProperty(propertyId, {
			Benefits: [{ name: 'Piscina' }],
			NearPlace: [{ name: 'Metro', description: '' }, { name: 'Parque', description: '' }],
			LegalNotice: [],
		})
		const p = await showProperty({ id: propertyId })
		expect(p?.Benefits.map(b => b.name)).toEqual(['Piscina'])
		expect(p?.NearPlace.map(n => n.name).sort()).toEqual(['Metro', 'Parque'])
		expect(p?.LegalNotice).toHaveLength(0)
	})

	it('no toca las listas hijas si no se envían', async () => {
		await updateProperty(propertyId, { content: 'Nuevo texto' })
		const p = await showProperty({ id: propertyId })
		expect(p?.content).toBe('Nuevo texto')
		expect(p?.Benefits).toHaveLength(1)
		expect(p?.NearPlace).toHaveLength(2)
	})

	it('guarda parking y ascensor (por defecto 0 y sin ascensor)', async () => {
		const before = await showProperty({ id: propertyId })
		expect(before?.parking).toBe(0)
		expect(before?.elevator).toBe(false)
		await updateProperty(propertyId, { parking: 2, elevator: true })
		const after = await showProperty({ id: propertyId })
		expect(after?.parking).toBe(2)
		expect(after?.elevator).toBe(true)
		expect(after?.title).toBe('Editado')
	})

	it('falla (sin cerrar el proceso) si la propiedad no existe', async () => {
		await expect(updateProperty(999999999, { title: 'x' })).rejects.toThrow()
	})
})
