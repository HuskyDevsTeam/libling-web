import NextAuth, { CredentialsSignin } from "next-auth"
import { encode } from "next-auth/jwt"
import { authConfig } from "./auth.config"
import credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getUser } from "@/server/data"
import { UserDTO } from "./dto"
import { logger } from "@/server/logger"
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
const SHORT_MAX_AGE = 12 * 60 * 60
const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60

const DUMMY_HASH = bcrypt.hashSync("no-such-user-placeholder", 10)

export const { auth, signIn, signOut, unstable_update } = NextAuth({
	...authConfig,
	// "Recuerdame": la sesion dura 30 dias; sin marcarlo, 12 horas (el JWT lleva su propia caducidad).
	jwt: {
		encode: (params) => encode({ ...params, maxAge: params.token?.remember ? REMEMBER_MAX_AGE : SHORT_MAX_AGE }),
	},
	callbacks: {
		...authConfig.callbacks,
		jwt({ token, user }) {
			if (user) token.remember = (user as { remember?: boolean }).remember === true
			return token
		},
	},
	events: {
		signIn: ({ user }) => logger.info("login_ok", { email: user.email }),
	},
	logger: {
		error: (error) => logger.error("auth_error", { error }),
		warn: (code) => logger.warn("auth_warn", { code }),
	},
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
				if (!byEmail.allowed || !byIp.allowed) {
					logger.warn("login_rate_limited", { email, ip })
					throw new RateLimitedError()
				}

				if (parsed.success) {
					const user = await getUser(email)
					const passwordsMatch = await bcrypt.compare(parsed.data.password, user?.password ?? DUMMY_HASH)
					if (user && passwordsMatch) {
						await clear(emailKey)
						return Object.assign(new UserDTO(user), { remember: ["on", "true"].includes(String((credentials as Record<string, unknown>)?.remember_me)) })
					}
				}
				logger.warn("login_failed", { email, ip })
				await Promise.all([consume(emailKey, EMAIL_LIMIT), consume(ipKey, IP_LIMIT)])
				return null
			},
		}),
	],
})
