import "server-only"
import axios from "axios"
import { randomUUID } from "crypto"
import { prisma } from "@/server/db"
import { deliver, MAILBOXES } from "@/server/mail"
import { dict } from "@/app/utils/serverDict"
import { templates } from "@/app/utils/serverFuntions"
import { addMonths, CURRENCY, PeriodId, PlanId, quote } from "@/server/plans"

/**
 * Cobros con Saferpay (Payment Page). Reglas:
 *  - el importe, los meses y el plan se calculan AQUI a partir del catalogo (nunca vienen del navegador);
 *  - un pago solo se da por bueno si Saferpay confirma estado, importe, moneda y que el OrderId es nuestro pago;
 *  - la confirmacion es idempotente: confirmar dos veces (retorno del navegador + notificacion de Saferpay,
 *    recarga, doble clic) suma los meses una sola vez;
 *  - no se escribe en logs ni el token ni las credenciales.
 */
const baseUrl = () => (process.env.SAFERPAY_BASE_URL || "https://www.saferpay.com").replace(/\/$/, "")

function credentials() {
	const { SAFERPAY_API_USER: user, SAFERPAY_API_PWD: pwd, SAFERPAY_API_CUSTOMER_ID: customerId, SAFERPAY_API_TERMINAL_ID: terminalId } = process.env
	if (!user || !pwd || !customerId || !terminalId) throw new Error("Saferpay no esta configurado")
	return { auth: "Basic " + Buffer.from(`${user}:${pwd}`).toString("base64"), customerId, terminalId }
}

async function saferpay<T>(path: string, body: Record<string, unknown>): Promise<T> {
	const { auth, customerId } = credentials()
	const response = await axios.post<T>(
		`${baseUrl()}/api/Payment/v1/${path}`,
		{ RequestHeader: { SpecVersion: "1.41", CustomerId: customerId, RequestId: randomUUID(), RetryIndicator: 0 }, ...body },
		{ headers: { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" }, timeout: 15_000 }
	)
	return response.data
}

const errorName = (e: unknown) => (axios.isAxiosError(e) ? (e.response?.data as { ErrorName?: string } | undefined)?.ErrorName : undefined)

export async function startPayment(input: { affiliateId: number; plan: PlanId; period: PeriodId; returnUrl: string; lang: string }) {
	const { amountCents, months, plan, description } = quote(input.plan, input.period)
	const affiliate = await prisma.affiliate.findUnique({ where: { id: input.affiliateId } })
	if (!affiliate) return { status: 404 as const }

	const pay = await prisma.pay.create({
		data: { affiliateId: affiliate.id, status: false, quantity: amountCents / 100, months, plan },
	})
	const appUrl = process.env.APP_URL
	const notifyUrl = appUrl?.startsWith("https://") ? `${appUrl.replace(/\/$/, "")}/api/pay/notify?pay=${pay.id}&lang=${input.lang}` : undefined
	try {
		const { terminalId } = credentials()
		const data = await saferpay<{ Token: string; RedirectUrl: string }>("PaymentPage/Initialize", {
			TerminalId: terminalId,
			Payment: {
				Amount: { Value: String(amountCents), CurrencyCode: CURRENCY },
				// El OrderId es el id de nuestro pago: unico, y es lo que se comprueba al confirmar
				OrderId: String(pay.id),
				Description: description,
			},
			ReturnUrl: { Url: `${input.returnUrl}?pay=${pay.id}` },
			Notification: { MerchantEmails: ["Affiliate@libling.lu"], PayerEmail: affiliate.email, ...(notifyUrl ? { NotifyUrl: notifyUrl } : {}) },
		})
		await prisma.pay.update({ where: { id: pay.id }, data: { reference: data.Token } })
		return { status: 200 as const, redirectUrl: data.RedirectUrl, payId: pay.id }
	} catch (e) {
		console.error("Saferpay Initialize fallo", errorName(e) ?? (e as Error).message)
		return { status: 500 as const }
	}
}

export type ConfirmResult =
	| { status: 200; paid: true; firstConfirmation: boolean; affiliateId: number }
	| { status: 402 | 404 | 409 | 500; paid: false }

/** Confirma un pago con Saferpay y, si esta cobrado, activa el plan una sola vez. */
export async function confirmPayment(payId: number): Promise<ConfirmResult> {
	const pay = await prisma.pay.findUnique({ where: { id: payId } })
	if (!pay) return { status: 404, paid: false }
	// Ya confirmado: se responde sin volver a tocar nada
	if (pay.status) return { status: 200, paid: true, firstConfirmation: false, affiliateId: pay.affiliateId }
	if (!pay.reference || !pay.quantity) return { status: 409, paid: false }

	try {
		const expectedCents = Math.round(pay.quantity.toNumber() * 100)
		const assertion = await saferpay<{
			Transaction: { Id: string; Status: string; OrderId?: string; Amount: { Value: string; CurrencyCode: string } }
		}>("PaymentPage/Assert", { Token: pay.reference })
		const tx = assertion.Transaction
		if (tx.Amount?.CurrencyCode !== CURRENCY || Number(tx.Amount?.Value) !== expectedCents || tx.OrderId !== String(pay.id)) {
			console.error(`Saferpay Assert no coincide con el pago ${pay.id}`)
			return { status: 409, paid: false }
		}
		let status = tx.Status
		if (status === "AUTHORIZED") {
			// Con captura automatica en el terminal esto ya llega como CAPTURED; si no, se cobra aqui
			try {
				const captured = await saferpay<{ Status: string }>("Transaction/Capture", { TransactionReference: { TransactionId: tx.Id } })
				status = captured.Status
			} catch (e) {
				if (errorName(e) === "TRANSACTION_ALREADY_CAPTURED") status = "CAPTURED"
				else throw e
			}
		}
		if (status !== "CAPTURED") return { status: 402, paid: false }
	} catch (e) {
		const name = errorName(e)
		// 402 / TRANSACTION_ABORTED etc.: el cliente no completo el pago
		if (axios.isAxiosError(e) && e.response && e.response.status < 500) {
			console.error("Saferpay rechazo la confirmacion", name)
			return { status: 402, paid: false }
		}
		console.error("Saferpay Assert fallo", name ?? (e as Error).message)
		return { status: 500, paid: false }
	}

	// Un unico ganador: solo quien pasa el pago de "sin pagar" a "pagado" suma los meses
	const firstConfirmation = await prisma.$transaction(async (tx) => {
		const claimed = await tx.pay.updateMany({ where: { id: pay.id, status: false }, data: { status: true } })
		if (claimed.count === 0) return false
		const affiliate = await tx.affiliate.findUniqueOrThrow({ where: { id: pay.affiliateId } })
		const now = new Date()
		// Si el plan sigue vigente se suma al vencimiento actual; si caduco (o es nuevo), se cuenta desde hoy
		const base = affiliate.status && affiliate.plan_date > now ? affiliate.plan_date : now
		await tx.affiliate.update({
			where: { id: affiliate.id },
			data: { plan_date: addMonths(base, pay.months), status: true, ...(pay.plan ? { plan: pay.plan } : {}) },
		})
		return true
	})
	return { status: 200, paid: true, firstConfirmation, affiliateId: pay.affiliateId }
}

type Lang = "es" | "en" | "fr"

/** Confirma el pago y, solo en la primera confirmacion, manda los correos del alta de afiliado. */
export async function confirmAndNotify(payId: number, lang: Lang) {
	const result = await confirmPayment(payId)
	if (result.paid && result.firstConfirmation) {
		try {
			const affiliate = await prisma.affiliate.findUnique({ where: { id: result.affiliateId }, include: { country: true, Pay: true } })
			if (affiliate) {
				const subject = dict[lang].mail.affiliateTitle
				await deliver({ to: MAILBOXES.affiliate, subject, html: templates.affiliateAdmin(lang, affiliate), replyTo: affiliate.email })
				await deliver({ to: affiliate.email, subject, html: templates.affiliate(lang), replyTo: MAILBOXES.affiliate })
			}
		} catch (e) {
			console.error("correo de afiliado no enviado", (e as Error)?.message)
		}
	}
	return result
}
