import "server-only"
import { Plan } from "@prisma/client"
import { FEE_MULTIPLY } from "@/app/utils/data"

/**
 * Catalogo de precios del servidor: es la UNICA fuente del importe que se cobra.
 * El navegador solo manda "que plan" y "que periodo"; nunca el precio.
 * Precios sin IVA en EUR (el IVA lo aplica FEE_MULTIPLY). El plan 3 (Business) es un pago unico.
 */
export const PLAN_IDS = [1, 2, 3] as const
export const PERIOD_IDS = [1, 2, 3] as const // 1 = mensual, 2 = semestral, 3 = anual
export type PlanId = (typeof PLAN_IDS)[number]
export type PeriodId = (typeof PERIOD_IDS)[number]

const PRICES: Record<PeriodId, Record<PlanId, number>> = {
	1: { 1: 8.56, 2: 22.95, 3: 45 },
	2: { 1: 48, 2: 120, 3: 45 },
	3: { 1: 90, 2: 220, 3: 45 },
}
const PLAN_ENUM: Record<PlanId, Plan> = { 1: Plan.Student, 2: Plan.JobSeeker, 3: Plan.Business }
const PLAN_NAME: Record<PlanId, string> = { 1: "Student", 2: "Job Seeker", 3: "General Consultation" }
const MONTHS: Record<PeriodId, number> = { 1: 1, 2: 6, 3: 12 }

export const CURRENCY = "EUR"

export function quote(plan: PlanId, period: PeriodId) {
	const net = PRICES[period][plan]
	// En centimos y redondeado una sola vez: es el valor exacto que se manda y se compara con Saferpay
	const amountCents = Math.round(net * FEE_MULTIPLY * 100)
	return {
		amountCents,
		months: plan === 3 ? 1 : MONTHS[period],
		plan: PLAN_ENUM[plan],
		description: `Libling - ${PLAN_NAME[plan]}`,
	}
}

/** Suma meses sin desbordar (31 de enero + 1 mes = 28/29 de febrero, no 3 de marzo). */
export function addMonths(date: Date, months: number): Date {
	const result = new Date(date)
	const day = result.getUTCDate()
	result.setUTCDate(1)
	result.setUTCMonth(result.getUTCMonth() + months)
	const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate()
	result.setUTCDate(Math.min(day, lastDay))
	return result
}
