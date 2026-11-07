import { NextRequest, NextResponse } from "next/server"
import { verifyResetToken } from "@/server/passwordReset"
import { clientIp, consume } from "@/server/rateLimit"

// Comprueba que el enlace del correo sigue siendo valido (existe, no ha caducado, no se ha usado)
export async function POST(request: NextRequest) {
	const limit = await consume(`reset-check:ip:${clientIp(request.headers)}`, { max: 30, windowSec: 15 * 60 })
	if (!limit.allowed) {
		return NextResponse.json({ message: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } })
	}
	const token = request.headers.get("token")
	if (!token || !(await verifyResetToken(token))) {
		return NextResponse.json({ message: "Link not valid or expired" }, { status: 400 })
	}
	return NextResponse.json({ message: "link verified" }, { status: 200 })
}
