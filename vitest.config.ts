import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// los tests funcionales comparten una base de datos: se ejecutan en serie
		fileParallelism: false,
		testTimeout: 20000,
	},
})
