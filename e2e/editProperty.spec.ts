import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const IMG = `https://${process.env.IMAGE_HOST || 'libling-assets.s3.eu-west-2.amazonaws.com'}`
const tag = `e2e-${Date.now()}`
const email = `${tag}@test.local`
const password = 'Passw0rd!e2e'
let propertyId: number
let ids: number[] = []

test.beforeAll(async () => {
	const user = await prisma.user.create({ data: { email, password: await bcrypt.hash(password, 4) } })
	const country = await prisma.country.create({ data: { name: tag, code: tag, capital: 'x', phone: '0', currency: 'EUR' } })
	const currency = await prisma.currency.create({ data: { name: tag, symbol: '€', code: tag, nativeSymbol: '€', decimalDigits: 2, round: 0, pluralName: 'euros' } })
	const type = await prisma.propertyType.create({ data: { name: tag, code: tag } })
	const property = await prisma.property.create({
		data: {
			title: 'Piso original', content: 'Descripción original', address: 'Rue de Test 1', area: 70, bedrooms: 2, bathrooms: 1,
			price: 300000, type: true, active: false, publishedById: user.id, countryId: country.id, currencyId: currency.id, propertyTypeId: type.id,
			Benefits: { create: [{ name: 'Terraza' }] },
			PropertyImage: { create: [{ name: 'a.jpg', description: '', path: `${IMG}/a.jpg` }, { name: 'b.jpg', description: '', path: `${IMG}/b.jpg` }] },
			thumbnail: `${IMG}/a.jpg`,
		},
	})
	propertyId = property.id
	ids = [user.id, country.id, currency.id, type.id]
})

test.afterAll(async () => {
	await prisma.property.deleteMany({ where: { id: propertyId } })
	await prisma.user.deleteMany({ where: { id: ids[0] } })
	await prisma.propertyType.deleteMany({ where: { id: ids[3] } })
	await prisma.currency.deleteMany({ where: { id: ids[2] } })
	await prisma.country.deleteMany({ where: { id: ids[1] } })
	await prisma.$disconnect()
})

test('editar una propiedad pasa por los 5 pasos precargados y guarda todo', async ({ page }) => {
	await page.goto('/es/auth/login')
	await page.locator('input[type="text"], input[type="email"]').first().fill(email)
	await page.locator('input[type="password"]').fill(password)
	await page.keyboard.press('Enter')
	await page.waitForURL(/\/admin\//)

	await page.goto(`/es/admin/properties/${propertyId}/edit`)
	const next = () => page.getByRole('button', { name: 'Siguiente' }).click()

	// Paso 1: ubicación, tipo y país precargados
	await expect(page.locator('textarea[name="address"], #addressInput, textarea').first()).toHaveValue('Rue de Test 1')
	await next()
	// Paso 2: características precargadas
	await expect(page.getByLabel('Área')).toHaveValue('70')
	await page.getByLabel('Área').fill('85')
	await page.getByLabel('Plazas de parking').fill('2')
	await page.getByText('Ascensor').locator('xpath=ancestor::div[1]').getByText('Sí', { exact: true }).click()
	await next()
	// Paso 3: superficies, beneficios, etc. (sin cambios)
	await expect(page.getByPlaceholder('Ejemplo: terraza, jardín, balcón...').first()).toHaveValue('Terraza')
	await page.getByRole('button', { name: 'Agregar beneficio' }).click()
	await page.getByPlaceholder('Ejemplo: terraza, jardín, balcón...').last().fill('Garaje')
	await next()
	// Paso 4: título, descripción y fotos existentes
	await expect(page.getByLabel('Título')).toHaveValue('Piso original')
	await expect(page.getByTestId('existing-photos').locator('img')).toHaveCount(2)
	await page.getByLabel('Título').fill('Piso editado')
	const photos = await prisma.propertyImage.findMany({ where: { propertyId }, orderBy: { id: 'asc' } })
	await page.getByTestId(`remove-photo-${photos[1].id}`).click()
	await expect(page.getByTestId('existing-photos').locator('img')).toHaveCount(1)
	await next()
	// Paso 5: precio y moneda precargados
	await expect(page.getByLabel('Precio')).toHaveValue('300000')
	await page.getByLabel('Precio').fill('350000')
	await next() // en editar, el último paso guarda

	await expect.poll(async () => (await prisma.property.findUnique({ where: { id: propertyId } }))?.title).toBe('Piso editado')
	const saved = await prisma.property.findUnique({ where: { id: propertyId }, include: { Benefits: true, PropertyImage: true } })
	expect(saved?.price?.toNumber()).toBe(350000)
	expect(saved?.area?.toNumber()).toBe(85)
	expect(saved?.parking).toBe(2)
	expect(saved?.elevator).toBe(true)
	expect(saved?.Benefits.map(b => b.name).sort()).toEqual(['Garaje', 'Terraza'])
	expect(saved?.PropertyImage.map(i => i.id)).toEqual([photos[0].id])
	expect(saved?.thumbnail).toBe(`${IMG}/a.jpg`)
	expect(saved?.publishedById).toBe(ids[0])
})
