import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getUser } from "@/server/data"
import { createResetToken } from "@/server/passwordReset"
import { clientIp, consume } from "@/server/rateLimit"
import { sendEmailToClient } from "@/app/utils/emails"
import { subjects, templates } from "@/app/utils/funtions"

const BASE_URL = process.env.APP_URL || "http://localhost:3000"

// Por IP (frena el envio masivo) y por cuenta (evita inundar el buzon de un usuario)
const IP_LIMIT = { max: 10, windowSec: 60 * 60 }
const EMAIL_LIMIT = { max: 3, windowSec: 60 * 60 }

// Siempre la misma respuesta, exista o no la cuenta: no se puede usar para averiguar que correos son usuarios.
const ok = () => NextResponse.json({ message: "If the account exists, an email has been sent" }, { status: 200 })

export async function POST(request: NextRequest) {
	const body = await request.json().catch(() => null)
	const parsed = z.object({ email: z.string().trim().toLowerCase().email().max(254) }).safeParse(body)
	if (!parsed.success) return NextResponse.json({ message: "Invalid email" }, { status: 400 })
	const { email } = parsed.data

	const ip = await consume(`forgot:ip:${clientIp(request.headers)}`, IP_LIMIT)
	if (!ip.allowed) {
		return NextResponse.json({ message: "Too many requests" }, { status: 429, headers: { "Retry-After": String(ip.retryAfterSec) } })
	}
	const perEmail = await consume(`forgot:email:${email}`, EMAIL_LIMIT)
	if (!perEmail.allowed) return ok() // sin avisar: no se revela nada y no se envia otro correo

	try {
		const user = await getUser(email)
		if (user) {
			const token = await createResetToken(user.id)
			const url = `${BASE_URL}/auth/change-password?token=${token}`
			// No se espera al envio: la respuesta tarda lo mismo exista o no el usuario
			void sendEmailToClient(email, templates.forgotPassword(user.name || "user", url), subjects.forgotPassword).catch((e) =>
				console.error("No se pudo enviar el correo de restablecimiento", e?.message)
			)
		}
	} catch (e) {
		console.error("forgot-password", e)
	}
	return ok()
}

