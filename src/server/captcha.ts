import "server-only"

/**
 * Cloudflare Turnstile. Si TURNSTILE_SECRET_KEY no esta definida el captcha queda desactivado
 * (los formularios siguen protegidos por honeypot y limite de envios); al definirla pasa a ser obligatorio.
 */
export function captchaEnabled() {
	return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.TURNSTILE_SITE_KEY)
}

export async function verifyCaptcha(token: string | undefined, ip: string): Promise<boolean> {
	if (!captchaEnabled()) return true
	if (!token || token.length > 2048) return false
	try {
		const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY as string, response: token })
		if (ip !== "unknown") body.set("remoteip", ip)
		const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			body,
			signal: AbortSignal.timeout(5000),
		})
		const json = (await res.json()) as { success?: boolean }
		return json.success === true
	} catch {
		return false
	}
}
