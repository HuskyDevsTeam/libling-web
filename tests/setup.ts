import { vi } from 'vitest'

// Fuera de una peticion de Next, cookies() lanza error. En los tests se simula el filtro "todos los paises".
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'ALL' }) }), headers: async () => new Headers() }))
