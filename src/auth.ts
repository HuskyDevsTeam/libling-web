import NextAuth, { CredentialsSignin } from "next-auth"
import { authConfig } from "./auth.config"
import credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getUser } from "@/server/data"
import { UserDTO } from "./dto"
import { clear, clientIp, consume, isBlocked } from "@/server/rateLimit"

/** Demasiados intentos fallidos: se distingue de "credenciales incorrectas" para poder avisar al usuario. */
class RateLimitedError extends CredentialsSignin {
	code = "rate_limited"
}

// Intentos fallidos permitidos: por cuenta (frena la fuerza bruta contra un usuario) y por IP
// (frena a quien prueba muchas cuentas). Se desbloquean solos al terminar la ventana.
const EMAIL_LIMIT = { max: 5, windowSec: 15 * 60 }
const IP_LIMIT = { max: 30, windowSec: 15 * 60 }

// Hash de relleno: si el usuario no existe se compara igualmente, para que responder tarde lo mismo
// y no se pueda averiguar que correos existen midiendo el tiempo.
const DUMMY_HASH = bcrypt.hashSync("no-such-user-placeholder", 10)

export const { auth, signIn, signOut, unstable_update } = NextAuth({
	...authConfig,
	providers: [
		credentials({
			async authorize(credentials, request) {
				const ip = clientIp(request.headers)
				const parsed = z
					.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1).max(200) })
					.safeParse(credentials)
				const email = parsed.success ? parsed.data.email : "invalid"
				const emailKey = `login:email:${email}`
				const ipKey = `login:ip:${ip}`

				const [byEmail, byIp] = await Promise.all([isBlocked(emailKey, EMAIL_LIMIT), isBlocked(ipKey, IP_LIMIT)])
				if (!byEmail.allowed || !byIp.allowed) throw new RateLimitedError()

				if (parsed.success) {
					const user = await getUser(email)
					const passwordsMatch = await bcrypt.compare(parsed.data.password, user?.password ?? DUMMY_HASH)
					if (user && passwordsMatch) {
						await clear(emailKey)
						return new UserDTO(user)
					}
				}
				await Promise.all([consume(emailKey, EMAIL_LIMIT), consume(ipKey, IP_LIMIT)])
				return null
			},
		}),
	],
})
