import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
		},
	},
	test: {
		environment: 'node',
		setupFiles: ['./tests/setup.ts'],
		include: ['tests/**/*.test.ts'],
		// los tests funcionales comparten una base de datos: se ejecutan en serie
		fileParallelism: false,
		// ninguna prueba toca estado global: reusar workers es mas rapido
		isolate: false,
		testTimeout: 20000,
	},
})
