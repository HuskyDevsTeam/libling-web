/**
 * Log estructurado (una linea JSON por evento) a stdout/stderr: es lo que muestra la pestaña "Logs" de Dokploy.
 * Nunca registrar contraseñas, tokens ni cuerpos completos de peticiones.
 */
type Level = "info" | "warn" | "error"

function serializeError(error: unknown) {
	if (error instanceof Error) {
		const code = (error as { code?: unknown }).code
		return { name: error.name, message: error.message, ...(code ? { code } : {}), stack: error.stack }
	}
	return { message: String(error) }
}

function write(level: Level, event: string, data?: Record<string, unknown>) {
	const { error, ...rest } = data ?? {}
	const line = JSON.stringify({
		time: new Date().toISOString(),
		level,
		event,
		...rest,
		...(error !== undefined ? { error: serializeError(error) } : {}),
	})
	if (level === "error") console.error(line)
	else if (level === "warn") console.warn(line)
	else console.log(line)
}

export const logger = {
	info: (event: string, data?: Record<string, unknown>) => write("info", event, data),
	warn: (event: string, data?: Record<string, unknown>) => write("warn", event, data),
	error: (event: string, data?: Record<string, unknown>) => write("error", event, data),
}
