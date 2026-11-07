import "server-only"

/**
 * Cache en memoria con caducidad corta, por proceso. Sirve para lo que se pide en cada visita y casi
 * nunca cambia (paises, tipos, monedas, listados publicos de inmuebles). Cada espacio ("catalog",
 * "properties") se vacia entero cuando el admin cambia algo, y ademas caduca solo: aunque haya mas de
 * una instancia, ninguna sirve datos con mas de `ttlMs` de antiguedad.
 */
interface Entry {
	value: unknown
	expires: number
}
const spaces = new Map<string, Map<string, Entry>>()
const inflight = new Map<string, Promise<unknown>>()
const MAX_ENTRIES = 300

export async function memo<T>(space: string, key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
	let entries = spaces.get(space)
	if (!entries) spaces.set(space, (entries = new Map()))
	const hit = entries.get(key)
	if (hit && hit.expires > Date.now()) return hit.value as T
	// Varias peticiones identicas a la vez comparten una sola consulta
	const flightKey = `${space}\u0000${key}`
	const pending = inflight.get(flightKey)
	if (pending) return pending as Promise<T>
	const promise = load()
		.then((value) => {
			if (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value as string)
			entries.set(key, { value, expires: Date.now() + ttlMs })
			return value
		})
		.finally(() => inflight.delete(flightKey))
	inflight.set(flightKey, promise)
	return promise
}

export function invalidate(space: string) {
	spaces.get(space)?.clear()
}
