import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/server/db'

const hasDb = !!process.env.POSTGRES_PRISMA_URL

// Saferpay simulado en memoria
const bank = vi.hoisted(() => ({
	calls: [] as { path: string; body: any }[],
	assertion: undefined as undefined | ((body: any) => any),
	captureError: undefined as undefined | string,
}))
vi.mock('axios', () => {
	const post = async (url: string, body: any) => {
		const path = url.split('/api/Payment/v1/')[1]
		bank.calls.push({ path, body })
		if (path === 'PaymentPage/Initialize') return { data: { Token: `tok-${body.Payment.OrderId}`, RedirectUrl: `https://bank.test/pay/${body.Payment.OrderId}` } }
		if (path === 'PaymentPage/Assert') return { data: bank.assertion!(body) }
		if (path === 'Transaction/Capture') {
			if (bank.captureError) throw Object.assign(new Error('x'), { isAxiosError: true, response: { status: 402, data: { ErrorName: bank.captureError } } })
			return { data: { Status: 'CAPTURED' } }
		}
		throw new Error('ruta inesperada ' + path)
	}
	return { default: { post, isAxiosError: (e: any) => !!e?.isAxiosError }, post }
})
const sent = vi.hoisted(() => [] as { to: string }[])
vi.mock('@/server/mail', async (orig) => ({ ...(await orig<object>()), deliver: async (m: { to: string }) => { sent.push({ to: m.to }) } }))

import { startPayment, confirmPayment, confirmAndNotify } from '@/server/payments'
import { addMonths, quote } from '@/server/plans'

const tag = `pay-${Date.now()}`
let affiliateId: number, countryId: number
const goodTx = (payId: number, cents: number, status = 'AUTHORIZED') => () => ({
	Transaction: { Id: `t${payId}`, Status: status, OrderId: String(payId), Amount: { Value: String(cents), CurrencyCode: 'EUR' } },
})
async function newPay(plan: 1 | 2 | 3 = 1, period: 1 | 2 | 3 = 1) {
	const r = await startPayment({ affiliateId, plan, period, returnUrl: 'https://libling.lu/services', lang: 'en' })
	if (r.status !== 200) throw new Error('no se creo el pago')
	return { payId: r.payId, cents: quote(plan, period).amountCents }
}
const affiliate = () => prisma.affiliate.findUniqueOrThrow({ where: { id: affiliateId } })

describe('calculo de importes (sin DB)', () => {
	it('el importe sale del catalogo del servidor, con IVA y en centimos', () => {
		expect(quote(1, 1)).toMatchObject({ amountCents: 1002, months: 1, plan: 'Student' }) // 8,56 * 1,17
		expect(quote(2, 2)).toMatchObject({ amountCents: 14040, months: 6, plan: 'JobSeeker' }) // 120 * 1,17
		expect(quote(3, 3)).toMatchObject({ amountCents: 5265, months: 1, plan: 'Business' }) // pago unico: siempre 1 mes
	})
	it('addMonths no se desborda a fin de mes', () => {
		expect(addMonths(new Date('2027-01-31T10:00:00Z'), 1).toISOString().slice(0, 10)).toBe('2027-02-28')
		expect(addMonths(new Date('2027-03-15T10:00:00Z'), 12).toISOString().slice(0, 10)).toBe('2028-03-15')
	})
})

describe.skipIf(!hasDb)('pagos Saferpay', () => {
	beforeAll(async () => {
		process.env.SAFERPAY_API_USER = 'u'; process.env.SAFERPAY_API_PWD = 'p'
		process.env.SAFERPAY_API_CUSTOMER_ID = 'c'; process.env.SAFERPAY_API_TERMINAL_ID = 't'
		process.env.APP_URL = 'https://libling.lu'
		const country = await prisma.country.create({ data: { name: tag, code: tag, capital: 'x', phone: '0', currency: 'EUR' } })
		countryId = country.id
		affiliateId = (await prisma.affiliate.create({ data: { name: 'Ana', email: `${tag}@test.local`, phone: '1', plan: 'Student', plan_date: new Date(), status: false, countryId } })).id
	})
	afterAll(async () => {
		await prisma.pay.deleteMany({ where: { affiliateId } })
		await prisma.affiliate.deleteMany({ where: { id: affiliateId } })
		await prisma.country.deleteMany({ where: { id: countryId } })
	})
	beforeEach(() => { bank.calls.length = 0; bank.captureError = undefined; sent.length = 0 })

	it('Initialize manda el importe calculado en el servidor y el id del pago como OrderId', async () => {
		const { payId, cents } = await newPay(2, 2)
		const init = bank.calls.find((c) => c.path === 'PaymentPage/Initialize')!.body
		expect(init.Payment.Amount).toEqual({ Value: String(cents), CurrencyCode: 'EUR' })
		expect(init.Payment.OrderId).toBe(String(payId))
		expect(init.Notification.NotifyUrl).toBe(`https://libling.lu/api/pay/notify?pay=${payId}&lang=en`)
		const row = await prisma.pay.findUniqueOrThrow({ where: { id: payId } })
		expect(row.quantity?.toNumber()).toBe(cents / 100)
		expect(row).toMatchObject({ months: 6, plan: 'JobSeeker', status: false })
	})

	it('importe distinto al esperado: no se cobra ni se activa nada', async () => {
		const { payId, cents } = await newPay()
		bank.assertion = goodTx(payId, cents - 1)
		expect(await confirmPayment(payId)).toEqual({ status: 409, paid: false })
		expect((await prisma.pay.findUniqueOrThrow({ where: { id: payId } })).status).toBe(false)
		expect(bank.calls.some((c) => c.path === 'Transaction/Capture')).toBe(false)
	})
	it('moneda distinta o OrderId de otro pago: rechazado', async () => {
		const { payId, cents } = await newPay()
		bank.assertion = () => ({ Transaction: { Id: 't', Status: 'AUTHORIZED', OrderId: String(payId), Amount: { Value: String(cents), CurrencyCode: 'USD' } } })
		expect((await confirmPayment(payId)).paid).toBe(false)
		bank.assertion = () => ({ Transaction: { Id: 't', Status: 'AUTHORIZED', OrderId: String(payId + 999), Amount: { Value: String(cents), CurrencyCode: 'EUR' } } })
		expect((await confirmPayment(payId)).paid).toBe(false)
	})
	it('transaccion no autorizada (cancelada) no activa el plan', async () => {
		const { payId, cents } = await newPay()
		bank.assertion = goodTx(payId, cents, 'PENDING')
		expect(await confirmPayment(payId)).toEqual({ status: 402, paid: false })
	})

	it('pago correcto: captura, activa el plan y la segunda confirmacion NO suma meses ni repite correos', async () => {
		const { payId, cents } = await newPay(1, 2) // 6 meses
		bank.assertion = goodTx(payId, cents)
		const before = Date.now()
		const first = await confirmAndNotify(payId, 'en')
		expect(first).toMatchObject({ status: 200, paid: true, firstConfirmation: true })
		expect(bank.calls.filter((c) => c.path === 'Transaction/Capture')).toHaveLength(1)
		const a1 = await affiliate()
		expect(a1.status).toBe(true)
		expect(a1.plan_date.getTime()).toBeGreaterThan(addMonths(new Date(before), 6).getTime() - 5000)
		expect(a1.plan_date.getTime()).toBeLessThan(addMonths(new Date(), 6).getTime() + 5000)
		expect(sent.map((m) => m.to).sort()).toEqual([`${tag}@test.local`, '"Libling solutions" <affiliate@libling.lu>'].sort())

		const calls = bank.calls.length
		const second = await confirmAndNotify(payId, 'en')
		expect(second).toMatchObject({ paid: true, firstConfirmation: false })
		expect(bank.calls.length).toBe(calls) // ni siquiera vuelve a llamar a Saferpay
		expect((await affiliate()).plan_date.getTime()).toBe(a1.plan_date.getTime())
		expect(sent).toHaveLength(2)
	})
	it('dos confirmaciones simultaneas (retorno + notificacion) suman los meses una sola vez', async () => {
		const { payId, cents } = await newPay(1, 1)
		bank.assertion = goodTx(payId, cents)
		const before = (await affiliate()).plan_date
		const results = await Promise.all([confirmPayment(payId), confirmPayment(payId), confirmPayment(payId)])
		expect(results.filter((r) => r.paid && r.firstConfirmation)).toHaveLength(1)
		const after = (await affiliate()).plan_date
		expect(after.getTime()).toBeGreaterThanOrEqual(addMonths(before, 1).getTime() - 1000)
		expect(after.getTime()).toBeLessThan(addMonths(before, 2).getTime())
	})
	it('si el plan sigue vigente, los meses se suman al vencimiento actual; si caduco, desde hoy', async () => {
		const future = addMonths(new Date(), 3)
		await prisma.affiliate.update({ where: { id: affiliateId }, data: { plan_date: future, status: true } })
		let { payId, cents } = await newPay(1, 1)
		bank.assertion = goodTx(payId, cents)
		await confirmPayment(payId)
		expect((await affiliate()).plan_date.toISOString()).toBe(addMonths(future, 1).toISOString())

		await prisma.affiliate.update({ where: { id: affiliateId }, data: { plan_date: new Date('2020-01-01'), status: false } })
		;({ payId, cents } = await newPay(1, 1))
		bank.assertion = goodTx(payId, cents)
		await confirmPayment(payId)
		const renewed = (await affiliate()).plan_date
		expect(renewed.getTime()).toBeGreaterThan(Date.now())
		expect(renewed.getTime()).toBeLessThan(addMonths(new Date(), 1).getTime() + 5000)
	})
	it('ya capturado en el terminal (captura automatica): se acepta', async () => {
		const { payId, cents } = await newPay()
		bank.assertion = goodTx(payId, cents, 'CAPTURED')
		expect((await confirmPayment(payId)).paid).toBe(true)
		expect(bank.calls.some((c) => c.path === 'Transaction/Capture')).toBe(false)
	})
	it('el plan elegido se aplica al afiliado al cobrar, no antes', async () => {
		await prisma.affiliate.update({ where: { id: affiliateId }, data: { plan: 'Student' } })
		const { payId, cents } = await newPay(2, 1)
		expect((await affiliate()).plan).toBe('Student')
		bank.assertion = goodTx(payId, cents)
		await confirmPayment(payId)
		expect((await affiliate()).plan).toBe('JobSeeker')
	})
	it('un pago inexistente responde 404', async () => {
		expect(await confirmPayment(2_000_000_000)).toEqual({ status: 404, paid: false })
	})
})
