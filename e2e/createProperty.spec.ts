import { test, expect, type Locator } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const tag = `e2ec-${Date.now()}`
const email = `${tag}@test.local`
const password = 'Passw0rd!e2e'
let ids: number[] = []

// PNG de 1x1 para el paso de fotos
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

test.beforeAll(async () => {
	const user = await prisma.user.create({ data: { email, password: await bcrypt.hash(password, 4) } })
	const country = await prisma.country.create({ data: { name: `Pais ${tag}`, code: tag, capital: 'x', phone: '0', currency: 'EUR' } })
	const currency = await prisma.currency.create({ data: { name: `Moneda ${tag}`, symbol: '€', code: tag, nativeSymbol: '€', decimalDigits: 2, round: 0, pluralName: 'euros' } })
	const type = await prisma.propertyType.create({ data: { name: `Tipo ${tag}`, code: tag } })
	ids = [user.id, country.id, currency.id, type.id]
})

test.afterAll(async () => {
	await prisma.user.deleteMany({ where: { id: ids[0] } })
	await prisma.propertyType.deleteMany({ where: { id: ids[3] } })
	await prisma.currency.deleteMany({ where: { id: ids[2] } })
	await prisma.country.deleteMany({ where: { id: ids[1] } })
	await prisma.$disconnect()
})

// Recorre los 5 pasos de registrar un inmueble con catalogos cargados del servidor (paises, tipos, monedas)
// y llega a la vista previa. No publica: la publicacion sube las fotos a S3.
test('registrar un inmueble recorre los 5 pasos y llega a la vista previa con los datos', async ({ page }) => {
	await page.goto('/es/auth/login')
	await page.locator('input[type="text"], input[type="email"]').first().fill(email)
	await page.locator('input[type="password"]').fill(password)
	await page.keyboard.press('Enter')
	await page.waitForURL(/\/admin\//)

	await page.goto('/es/admin/properties/create')
	const next = () => page.getByRole('button', { name: 'Siguiente' }).click()
	const pick = async (field: Locator, option: string | RegExp) => {
		await field.click()
		await (typeof option === 'string' ? page.getByText(option, { exact: true }) : page.getByText(option)).first().click()
		await page.waitForTimeout(400) // la lista se cierra tras 200 ms al perder el foco
	}

	// Paso 1: tipo de propiedad y pais salen de las acciones del servidor
	const selects = page.getByPlaceholder('Selecciona o escribe...')
	await pick(selects.nth(0), `Tipo ${tag}`)
	await pick(selects.nth(1), `Pais ${tag}`)
	await page.locator('textarea').first().fill('Rue de Test 1, Luxembourg')
	await next()
	// Paso 2
	await page.getByLabel('Área').fill('90')
	await next()
	// Paso 3 (todo opcional)
	await next()
	// Paso 4: titulo y una foto
	await page.getByLabel('Título').fill('Piso nuevo e2e')
	await page.locator('input[type="file"]').first().setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG })
	await next()
	// Paso 5: precio y moneda (cargada del servidor)
	await page.getByLabel('Precio').fill('250000')
	await pick(page.getByPlaceholder('Selecciona o escribe...').first(), /^€/)
	await pick(page.getByPlaceholder('Selecciona o escribe...').nth(1), /mo\./) // alquiler: pide frecuencia de pago
	await next()
	// Vista previa
	if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/registrar-vista-previa.png`, fullPage: true })
	await expect(page.getByText('Piso nuevo e2e').first()).toBeVisible()
	await expect(page.getByText('Rue de Test 1, Luxembourg').first()).toBeVisible()
	await expect(page.getByText(`Tipo ${tag}`).first()).toBeVisible()
})
