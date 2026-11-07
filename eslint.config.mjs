import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

export default defineConfig([
	...nextVitals,
	{
		// Reglas nuevas del React Compiler (eslint-plugin-react-hooks 6+). No existian en la
		// configuracion anterior (Next 14) y marcan patrones que funcionan bien en React 19
		// (setState en efectos de sincronizacion, refs de formularios). Se desactivan hasta
		// que se refactoricen los formularios del admin en un cambio aparte.
		rules: {
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/refs": "off",
		},
	},
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"]),
])
