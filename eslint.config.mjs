import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

export default defineConfig([
	...nextVitals,
	{
		// Reglas nuevas de React 19 / React Compiler: se dejan como aviso
		// para no mezclar refactors de componentes con la actualizacion de Next.
		rules: {
			"react-hooks/set-state-in-effect": "warn",
			"react-hooks/refs": "warn",
		},
	},
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"]),
])
