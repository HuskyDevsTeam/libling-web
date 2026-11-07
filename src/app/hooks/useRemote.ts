import { useCallback, useEffect, useState } from 'react'

/**
 * Carga datos del servidor al montar el componente y permite recargarlos.
 * `load` debe ser una funcion estable (por ejemplo una accion de servidor importada).
 * El estado solo se actualiza cuando la promesa se resuelve, nunca de forma sincrona dentro del efecto.
 */
export default function useRemote<T>(load: () => Promise<T>) {
	const [data, setData] = useState<T>()
	useEffect(() => {
		let cancelled = false
		load().then((result) => {
			if (!cancelled) setData(result)
		}).catch((error) => console.error(error))
		return () => {
			cancelled = true
		}
	}, [load])
	const reload = useCallback(() => load().then(setData), [load])
	return [data, reload] as const
}
