import { defineConfig } from '@playwright/test'

// Requiere: base PostgreSQL con migraciones aplicadas (POSTGRES_PRISMA_URL),
// AUTH_SECRET y AUTH_TRUST_HOST=true. Compila y levanta la app en modo produccion: con `next dev` la primera
// peticion compila bajo demanda y la recarga en caliente reiniciaba el asistente a mitad del test (fallo intermitente).
export default defineConfig({
	testDir: './e2e',
	timeout: 90_000,
	workers: 1,
	use: {
		baseURL: process.env.E2E_BASE_URL || 'http://localhost:3100',
		launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
	},
	webServer: process.env.E2E_BASE_URL ? undefined : {
		command: 'pnpm build && pnpm exec next start -p 3100',
		url: 'http://localhost:3100/api/health',
		timeout: 400_000,
		reuseExistingServer: true,
	},
})
