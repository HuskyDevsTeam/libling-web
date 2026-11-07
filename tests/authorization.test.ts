import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Sesion simulada: null = visitante sin cuenta
const session = vi.hoisted(() => ({ current: null as null | { user: { email: string } } }))
vi.mock('@/auth', () => ({ auth: async () => session.current }))

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'ALL' }) }) }))

import * as actions from '@/services'

const hasDb = !!process.env.POSTGRES_PRISMA_URL
const prisma = new PrismaClient()
const tag = `authz-${Date.now()}`
let draftId = 0
let ids = { user: 0, country: 0, currency: 0, type: 0 }
const createdProperties: number[] = []
const createdAffiliates: number[] = []
let cleanup: (() => Promise<void>) | undefined

const adminActions: Array<[string, () => Promise<unknown>]> = [
	['indexProperty', () => actions.indexProperty({}, {}, 1, 15, false, true)],
	['createProperty', () => actions.createProperty({} as never)],
	['updateProperty', () => actions.updateProperty(1, { title: 'x' })],
	['deleteProperty', () => actions.deleteProperty(1)],
	['activeMultipleProperty', () => actions.activeMultipleProperty([1])],
	['deactivateMultipleProperty', () => actions.deactivateMultipleProperty([1])],
	['createPropertyType', () => actions.createPropertyType({ name: 'a', code: 'A' })],
	['deletePropertyImage', () => actions.deletePropertyImage(1)],
	['getAffiliates', () => actions.getAffiliates()],
	['showAffiliate', () => actions.showAffiliate({ id: 1 })],
]

beforeAll(async () => {
	if (!hasDb) return
	const user = await prisma.user.create({ data: { email: `${tag}@test.local`, password: 'x' } })
	const country = await prisma.country.create({ data: { name: tag, code: tag, capital: 'x', phone: '0', currency: 'EUR' } })
	const currency = await prisma.currency.create({ data: { name: tag, symbol: 'E', code: tag, nativeSymbol: 'E', decimalDigits: 2, round: 0, pluralName: 'e' } })
	const type = await prisma.propertyType.create({ data: { name: tag, code: tag } })
	const draft = await prisma.property.create({
		data: { title: 'Borrador', slug: tag, address: 'x', active: false, publishedById: user.id, countryId: country.id, currencyId: currency.id, propertyTypeId: type.id },
	})
	draftId = draft.id
	ids = { user: user.id, country: country.id, currency: currency.id, type: type.id }
	cleanup = async () => {
		await prisma.property.deleteMany({ where: { id: { in: [draft.id, ...createdProperties] } } })
		await prisma.affiliate.deleteMany({ where: { id: { in: createdAffiliates } } })
		await prisma.user.deleteMany({ where: { id: user.id } })
		await prisma.propertyType.deleteMany({ where: { id: type.id } })
		await prisma.currency.deleteMany({ where: { id: currency.id } })
		await prisma.country.deleteMany({ where: { id: country.id } })
	}
})
afterAll(async () => {
	await cleanup?.()
	await prisma.$disconnect()
})


describe('acciones de servidor: autorizacion', () => {
	beforeEach(() => {
		session.current = null
	})

	it.each(adminActions)('%s rechaza a un visitante sin sesion', async (_name, call) => {
		await expect(call()).rejects.toThrow('Unauthorized')
	})

	it('no exporta funciones peligrosas como acciones publicas', () => {
		for (const dangerous of ['updateUser', 'createUser', 'getUser', 'getUserById', 'updatePay', 'createPay', 'updateAffiliate', 'createAffiliate', 'showProperty', 'getPays', 'getDashboardStats', 'createPropertyImage']) {
			expect(Object.keys(actions)).not.toContain(dangerous)
		}
	})

	it('una sesion de un usuario inexistente tampoco pasa', async () => {
		session.current = { user: { email: 'nadie-que-no-existe@test.local' } }
		await expect(actions.deleteProperty(1)).rejects.toThrow('Unauthorized')
	})
})

describe('acciones publicas: validacion de entradas', () => {
	it.skipIf(!hasDb)('el listado publico nunca devuelve borradores aunque se pida active=false', async () => {
		const res = await actions.indexPublicProperties({ active: false, publishedById: 1 } as never, {}, 1, 100)
		expect(res.data.some((p) => p.id === draftId)).toBe(false)
		expect(res.data.every((p) => p.active)).toBe(true)
	})
	it('rechaza limites y paginas absurdos', async () => {
		await expect(actions.indexPublicProperties({}, {}, 1, 100000)).rejects.toThrow()
		await expect(actions.indexPublicProperties({}, {}, -5, 15)).rejects.toThrow()
	})
	it('paymentInitialization rechaza importes negativos y retorno a otro dominio', async () => {
		process.env.APP_URL = 'https://libling.lu'
		await expect(actions.paymentInitialization('x', -1, 1, 'https://libling.lu/p', 1)).rejects.toThrow()
		await expect(actions.paymentInitialization('x', 10, 1, 'https://evil.example/p', 1)).rejects.toThrow()
	})
	it('findAffiliateByEmail rechaza emails invalidos', async () => {
		await expect(actions.findAffiliateByEmail('no-es-un-email')).rejects.toThrow()
	})
})

describe.skipIf(!hasDb)('con sesion de administrador', () => {
	it('createProperty publica siempre a nombre del usuario de la sesion, aunque el cliente mande otro id', async () => {
		session.current = { user: { email: `${tag}@test.local` } }
		const created = await actions.createProperty({
			title: 'Creado con sesion', address: 'Rue Test 2', furnished: false, active: false, type: true,
			countryId: ids.country, currencyId: ids.currency, propertyTypeId: ids.type,
			publishedById: 1, // intento de suplantacion: se descarta
		} as never)
		createdProperties.push(created.id)
		const row = await prisma.property.findUnique({ where: { id: created.id } })
		expect(row?.publishedById).toBe(ids.user)
	})
	it('rechaza datos invalidos (precio negativo, pais inexistente como texto)', async () => {
		session.current = { user: { email: `${tag}@test.local` } }
		await expect(actions.updateProperty(draftId, { price: -5 })).rejects.toThrow()
		await expect(actions.updateProperty(draftId, { countryId: 'x' as never })).rejects.toThrow()
	})
})

describe.skipIf(!hasDb)('flujo publico de afiliados', () => {
	it('registrar y renovar solo cambian datos de contacto y plan; nunca status ni fechas', async () => {
		const mail = `${tag}-afiliado@test.local`
		expect(await actions.findAffiliateByEmail(mail)).toBeNull()
		const { id } = await actions.registerAffiliate({ email: mail, name: 'Ana', phone: '+352 111', countryId: ids.country, plan: 'Student' })
		createdAffiliates.push(id)
		expect(await actions.findAffiliateByEmail(mail)).toEqual({ id })
		await actions.updateAffiliatePlan(id, { plan: 'Business', status: true, plan_date: new Date('2099-01-01') } as never)
		const row = await prisma.affiliate.findUnique({ where: { id } })
		expect(row?.plan).toBe('Business')
		expect(row?.status).toBe(false)
		expect(row!.plan_date.getFullYear()).toBeLessThan(2099)
	})
})
