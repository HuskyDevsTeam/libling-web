import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { confirmAndNotify } from "@/server/payments"
import { clientIp, consume } from "@/server/rateLimit"

/**
 * Notificacion servidor a servidor de Saferpay (NotifyUrl). Confirma el cobro aunque el cliente cierre
 * el navegador antes de volver. No hace falta firmarla: la confirmacion vuelve a preguntar a Saferpay
 * (estado, importe, moneda y OrderId), asi que una llamada falsa no puede activar nada.
 */
export async function GET(request: NextRequest) {
	const params = z.object({ pay: z.coerce.number().int().positive(), lang: z.enum(["es", "en", "fr"]).catch("en") }).safeParse({
		pay: request.nextUrl.searchParams.get("pay"),
		lang: request.nextUrl.searchParams.get("lang") ?? "en",
	})
	if (!params.success) return NextResponse.json({ ok: false }, { status: 400 })
	if (!(await consume(`pay:notify:${clientIp(request.headers)}`, { max: 120, windowSec: 3600 })).allowed) {
		return NextResponse.json({ ok: false }, { status: 429 })
	}
	const result = await confirmAndNotify(params.data.pay, params.data.lang)
	// 200 si esta cobrado; en otro caso un codigo de error para que Saferpay pueda reintentar
	return NextResponse.json({ ok: result.paid }, { status: result.paid ? 200 : result.status })
}
