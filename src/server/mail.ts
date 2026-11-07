import "server-only"
import nodemailer, { type Transporter } from "nodemailer"

/**
 * Capa de bajo nivel para enviar correo. NO es una accion de servidor: nada de aqui es invocable
 * desde el navegador. Los destinatarios los fija el codigo que llama (nunca el usuario final),
 * salvo en el caso de las confirmaciones, donde la direccion ya viene validada.
 */
let transporter: Transporter | undefined
function getTransporter() {
	transporter ??= nodemailer.createTransport({
		host: process.env.SMTP_SERVER || "test.net",
		port: 465,
		secure: true,
		auth: {
			user: process.env.MAIL_USER || "REPLACE-WITH-YOUR-ALIAS@YOURDOMAIN.COM",
			pass: process.env.MAIL_PWD || "REPLACE-WITH-YOUR-GENERATED-PASSWORD",
		},
		connectionTimeout: 10_000,
		greetingTimeout: 10_000,
		socketTimeout: 20_000,
	})
	return transporter
}

export const MAILBOXES = {
	info: '"Libling solutions" <info@libling.lu>',
	affiliate: '"Libling solutions" <affiliate@libling.lu>',
	immo: '"Libling Immo" <immo@libling.lu>',
	noReply: '"Libling solutions" <no-reply@libling.lu>',
} as const

/** Escapa texto del usuario antes de meterlo en una plantilla HTML. */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;")
}

/** Texto libre del usuario a HTML seguro, conservando los saltos de linea. */
export function textToHtml(value: string): string {
	return escapeHtml(value).replace(/\r?\n/g, "<br>")
}

/** Asunto de una sola linea (evita inyeccion de cabeceras) y con longitud acotada. */
export function cleanSubject(value: string, max = 120): string {
	return value.replace(/[\r\n\u2028\u2029]+/g, " ").trim().slice(0, max)
}

export interface MailOptions {
	to: string
	subject: string
	html: string
	from?: string
	replyTo?: string
}

export async function deliver({ to, subject, html, from = MAILBOXES.noReply, replyTo }: MailOptions) {
	// Solo se registra el resultado, nunca destinatarios ni contenido
	const info = await getTransporter().sendMail({ from, to, subject: cleanSubject(subject), html, replyTo })
	return { messageId: info.messageId as string }
}
