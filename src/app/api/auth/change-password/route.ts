import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { consumeResetToken, verifyResetToken } from "@/server/passwordReset"
import { clientIp, consume } from "@/server/rateLimit"
import { validatePasswordChange } from "@/app/utils/profile"

const bodySchema = z.object({ password: z.string().max(1000), passwordConfirmation: z.string().max(1000) })

export async function POST(request: NextRequest) {
	const limit = await consume(`reset-change:ip:${clientIp(request.headers)}`, { max: 10, windowSec: 15 * 60 })
	if (!limit.allowed) {
		return NextResponse.json({ message: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } })
	}
	const parsed = bodySchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) return NextResponse.json({ message: "Invalid request" }, { status: 422 })
	const { password, passwordConfirmation } = parsed.data

	const token = request.headers.get("token")
	if (!token || !(await verifyResetToken(token))) {
		return NextResponse.json({ message: "Link not valid or expired" }, { status: 400 })
	}
	const problem = validatePasswordChange(password, passwordConfirmation)
	if (problem) return NextResponse.json({ message: problem }, { status: 422 })

	const changed = await consumeResetToken(token, await bcrypt.hash(password, 12))
	if (!changed) return NextResponse.json({ message: "Link not valid or expired" }, { status: 400 })
	return NextResponse.json({ message: "password changed!" }, { status: 200 })
}
