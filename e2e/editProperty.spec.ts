import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
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

test('editar una propiedad desde el admin guarda los cambios', async ({ page }) => {
	await page.goto('/es/auth/login')
	await page.locator('input[type="text"], input[type="email"]').first().fill(email)
	await page.locator('input[type="password"]').fill(password)
	await page.keyboard.press('Enter')
	await page.waitForURL(/\/admin\//)

	await page.goto(`/es/admin/properties/${propertyId}/edit`)
	const form = page.getByTestId('edit-property-form')
	await expect(form.locator('input[name="title"]')).toHaveValue('Piso original')
	await expect(form.locator('textarea[name="benefits"]')).toHaveValue('Terraza')

	// validación: el título es obligatorio
	await form.locator('input[name="title"]').fill('')
	await form.getByRole('button', { name: 'Guardar cambios' }).click()
	await expect(form.getByText('Campo obligatorio')).toBeVisible()

	await form.locator('input[name="title"]').fill('Piso editado')
	await form.locator('input[name="price"]').fill('350000')
	await form.locator('textarea[name="benefits"]').fill('Piscina\nGaraje')
	await form.locator('input[name="active"]').check()
	await form.getByRole('button', { name: 'Guardar cambios' }).click()

	await expect.poll(async () => (await prisma.property.findUnique({ where: { id: propertyId } }))?.title).toBe('Piso editado')
	const saved = await prisma.property.findUnique({ where: { id: propertyId }, include: { Benefits: true } })
	expect(saved?.price?.toNumber()).toBe(350000)
	expect(saved?.active).toBe(true)
	expect(saved?.Benefits.map(b => b.name).sort()).toEqual(['Garaje', 'Piscina'])
})
