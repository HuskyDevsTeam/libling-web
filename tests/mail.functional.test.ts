import { beforeEach, describe, expect, it, vi } from 'vitest'

const sent: any[] = []
vi.mock('@/server/mail', async (orig) => ({ ...(await orig<any>()), deliver: vi.fn(async (m: any) => { sent.push(m); return { messageId: 'x' } }) }))
vi.mock('@/server/rateLimit', () => {
	const hits = new Map<string, number>()
	return { clientIp: () => '1.1.1.1', consume: async (k: string, o: { max: number }) => { const n = (hits.get(k) ?? 0) + 1; hits.set(k, n); return { allowed: n <= o.max, retryAfterSec: 1 } } }
})
import * as actions from '@/mailActions'

const base = { lang: 'es' as const, email: 'ana@example.com', name: 'Ana', subject: 'Hola', message: 'Quiero info' }
beforeEach(() => { sent.length = 0 })

describe('acciones publicas de correo', () => {
	it('solo expone acciones con plantilla fija (sin retransmision libre)', () => {
		expect(Object.keys(actions).sort()).toEqual(['getCaptchaSiteKey', 'sendContactMessage', 'sendFooterMessage', 'sendImmoInquiry', 'sendRelocationMessage'])
	})
	it('el aviso siempre va al buzon fijo de Libling y la confirmacion a quien escribe', async () => {
		const r = await actions.sendContactMessage({ ...base, email: 'ana1@example.com' })
		expect(r).toEqual({ ok: true })
		expect(sent.map((m) => m.to)).toEqual(['ana1@example.com', '"Libling solutions" <info@libling.lu>'])
	})
	it('escapa el HTML del mensaje y del nombre', async () => {
		await actions.sendContactMessage({ ...base, email: 'ana2@example.com', name: '<img src=x onerror=1>', message: '<script>alert(1)</script>' })
		const html = sent[1].html as string
		expect(html).not.toContain('<script>')
		expect(html).not.toContain('<img src=x')
		expect(html).toContain('&lt;script&gt;')
	})
	it('el asunto no puede llevar saltos de linea (inyeccion de cabeceras)', async () => {
		await actions.sendContactMessage({ ...base, email: 'ana3@example.com', subject: 'Hola\r\nBcc: victima@x.com' })
		expect(sent[1].subject).not.toMatch(/[\r\n]/)
	})
	it('rechaza correos y campos invalidos o demasiado largos', async () => {
		expect(await actions.sendContactMessage({ ...base, email: 'no-es-correo' })).toEqual({ ok: false, reason: 'invalid' })
		expect(await actions.sendContactMessage({ ...base, message: 'a'.repeat(5001) })).toEqual({ ok: false, reason: 'invalid' })
		expect(sent).toHaveLength(0)
	})
	it('el honeypot responde ok pero no envia nada', async () => {
		expect(await actions.sendFooterMessage({ lang: 'en', email: 'bot@example.com', website: 'http://spam' })).toEqual({ ok: true })
		expect(sent).toHaveLength(0)
	})
	it('limita por IP', async () => {
		let last: any
		for (let i = 0; i < 10; i++) last = await actions.sendFooterMessage({ lang: 'en', email: `u${i}@example.com` })
		expect(last).toEqual({ ok: false, reason: 'rate_limited' })
	})
	it('relocation: el asunto sale de la lista del servidor', async () => {
		await actions.sendRelocationMessage({ lang: 'en', email: 'r@example.com', name: 'R', subject: 'FAKE <b>' })
		expect(sent[1].subject).toBe('I want to work in Luxembourg')
	})
	it('immo: enlaces ajenos al sitio se sustituyen por la portada', async () => {
		await actions.sendImmoInquiry({ lang: 'en', email: 'i@example.com', name: 'I', pageUrl: 'https://evil.example/phish' })
		expect(sent[0].html).not.toContain('evil.example')
	})
	it('con Turnstile activado, sin token valido no se envia nada', async () => {
		process.env.TURNSTILE_SITE_KEY = 'site'
		process.env.TURNSTILE_SECRET_KEY = 'secret'
		try {
			expect(await actions.getCaptchaSiteKey()).toBe('site')
			expect(await actions.sendContactMessage({ ...base, email: 'cap@example.com' })).toEqual({ ok: false, reason: 'captcha' })
			expect(sent).toHaveLength(0)
		} finally {
			delete process.env.TURNSTILE_SITE_KEY
			delete process.env.TURNSTILE_SECRET_KEY
		}
	})
})
