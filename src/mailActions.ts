"use server"
import { headers } from "next/headers"
import { z } from "zod"
import { cleanSubject, deliver, MAILBOXES, textToHtml, escapeHtml } from "@/server/mail"
import { captchaEnabled, verifyCaptcha } from "@/server/captcha"
import { clientIp, consume } from "@/server/rateLimit"
import { dict } from "@/app/utils"
import { subjects, templates } from "@/app/utils/funtions"

/**
 * Unicas acciones publicas de correo. Cada una:
 *  - valida con zod (la entrada nunca decide el destinatario ni el cuerpo de la plantilla),
 *  - descarta bots (honeypot, Turnstile opcional) y limita por IP y por direccion,
 *  - escapa el HTML y envia a buzones fijos de Libling.
 */
export type MailResult = { ok: true } | { ok: false; reason: "invalid" | "captcha" | "rate_limited" | "failed" }

const lang = z.enum(["es", "en", "fr"])
const email = z.string().trim().toLowerCase().email().max(254)
const antiSpam = {
	website: z.string().max(200).optional(), // honeypot: un humano lo deja vacio
	captchaToken: z.string().max(2048).optional(),
}
const name = z.string().trim().min(1).max(100)

const IP_LIMIT = { max: 8, windowSec: 60 * 60 }
const EMAIL_LIMIT = { max: 3, windowSec: 60 * 60 }

const schemas = {
	footer: z.object({ lang, email, ...antiSpam }),
	contact: z.object({ lang, email, name, subject: z.string().trim().min(1).max(120), message: z.string().trim().min(1).max(5000), ...antiSpam }),
	relocation: z.object({ lang, email, name, subject: z.string().trim().min(1).max(40), message: z.string().trim().max(5000).optional(), ...antiSpam }),
	immo: z.object({ lang, email, name, pageUrl: z.string().max(500).optional(), ...antiSpam }),
}

/** Clave publica de Turnstile (o null si el captcha esta desactivado). */
export async function getCaptchaSiteKey(): Promise<string | null> {
	return captchaEnabled() ? (process.env.TURNSTILE_SITE_KEY as string) : null
}

async function gate(input: { email: string; website?: string; captchaToken?: string }, scope: string): Promise<MailResult | null> {
	// Honeypot: se responde "ok" para no dar pistas al bot, pero no se envia nada
	if (input.website) return { ok: true }
	const ip = clientIp(await headers())
	const byIp = await consume(`mail:${scope}:ip:${ip}`, IP_LIMIT)
	const byEmail = await consume(`mail:email:${input.email}`, EMAIL_LIMIT)
	if (!byIp.allowed || !byEmail.allowed) return { ok: false, reason: "rate_limited" }
	if (!(await verifyCaptcha(input.captchaToken, ip))) return { ok: false, reason: "captcha" }
	return null
}

async function run(task: () => Promise<unknown>): Promise<MailResult> {
	try {
		await task()
		return { ok: true }
	} catch (e) {
		console.error("mail: envio fallido", (e as Error)?.message)
		return { ok: false, reason: "failed" }
	}
}

function banner(l: z.infer<typeof lang>) {
	const g = dict[l].home
	return g.bigTitleHeader1_1 + g.bigTitleHeader1_2
}

/** Escapa nombre y texto y enlaza al remitente para que el equipo sepa a quien responder. */
function ownerBody(l: z.infer<typeof lang>, fromName: string, fromEmail: string, message: string) {
	return templates.info(banner(l), escapeHtml(fromName), `${textToHtml(message)}<br><br>${escapeHtml(fromEmail)}`, l)
}

export async function sendFooterMessage(input: z.input<typeof schemas.footer>): Promise<MailResult> {
	const parsed = schemas.footer.safeParse(input)
	if (!parsed.success) return { ok: false, reason: "invalid" }
	const d = parsed.data
	const blocked = await gate(d, "footer")
	if (blocked) return blocked
	const g = dict[d.lang].mail
	return run(async () => {
		await deliver({ to: d.email, subject: g.subject_3, html: templates.infoClient(banner(d.lang), null, d.lang), replyTo: MAILBOXES.info })
		await deliver({ to: MAILBOXES.info, subject: g.subject_1, html: ownerBody(d.lang, d.email, d.email, g.main), replyTo: d.email })
	})
}

export async function sendContactMessage(input: z.input<typeof schemas.contact>): Promise<MailResult> {
	const parsed = schemas.contact.safeParse(input)
	if (!parsed.success) return { ok: false, reason: "invalid" }
	const d = parsed.data
	const blocked = await gate(d, "contact")
	if (blocked) return blocked
	const g = dict[d.lang].mail
	return run(async () => {
		await deliver({ to: d.email, subject: g.subject_3, html: templates.infoClient(banner(d.lang), d.name, d.lang), replyTo: MAILBOXES.info })
		await deliver({ to: MAILBOXES.info, subject: cleanSubject(d.subject), html: ownerBody(d.lang, d.name, d.email, d.message), replyTo: d.email })
	})
}

export async function sendRelocationMessage(input: z.input<typeof schemas.relocation>): Promise<MailResult> {
	const parsed = schemas.relocation.safeParse(input)
	if (!parsed.success) return { ok: false, reason: "invalid" }
	const d = parsed.data
	// El asunto sale de la lista del servidor: se ignora cualquier texto que mande el cliente
	const list = dict[d.lang].contact.formSubjectList
	const subject = (list.find((el) => el.key === d.subject) ?? list[0])?.value
	if (!subject) return { ok: false, reason: "invalid" }
	const blocked = await gate(d, "relocation")
	if (blocked) return blocked
	const g = dict[d.lang].mail
	return run(async () => {
		await deliver({ to: d.email, subject: g.subject_3, html: templates.infoClient(banner(d.lang), d.name, d.lang), replyTo: MAILBOXES.info })
		await deliver({ to: MAILBOXES.info, subject, html: ownerBody(d.lang, d.name, d.email, d.message ?? ""), replyTo: d.email })
	})
}

export async function sendImmoInquiry(input: z.input<typeof schemas.immo>): Promise<MailResult> {
	const parsed = schemas.immo.safeParse(input)
	if (!parsed.success) return { ok: false, reason: "invalid" }
	const d = parsed.data
	// Solo se acepta un enlace del propio sitio: evita usar el correo para difundir enlaces ajenos
	const appOrigin = new URL(process.env.APP_URL || "http://localhost:3000").origin
	let pageUrl = appOrigin
	try {
		const u = new URL(d.pageUrl ?? "", appOrigin)
		if (u.origin === appOrigin) pageUrl = u.toString()
	} catch {
		// URL invalida: se usa la portada
	}
	const blocked = await gate(d, "immo")
	if (blocked) return blocked
	return run(async () => {
		await deliver({
			to: MAILBOXES.immo,
			from: "no-reply@libling.lu",
			subject: subjects.immo,
			html: templates.immo(escapeHtml(d.name), escapeHtml(pageUrl), d.lang) + `<p>${escapeHtml(d.email)}</p>`,
			replyTo: d.email,
		})
		await deliver({ to: d.email, from: "no-reply@libling.lu", subject: subjects.welcomeImmo, html: templates.immoConfirmation(d.lang), replyTo: MAILBOXES.immo })
	})
}
