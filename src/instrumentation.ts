import type { Instrumentation } from "next"

// Next llama a esto con cada error no controlado del servidor (paginas, acciones, rutas API).
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
	if (process.env.NEXT_RUNTIME !== "nodejs") return
	const { logger } = await import("@/server/logger")
	const digest = (error as { digest?: string })?.digest
	logger.error("request_error", {
		error,
		digest,
		method: request.method,
		path: request.path,
		routeType: context.routeType,
		routePath: context.routePath,
	})
}
