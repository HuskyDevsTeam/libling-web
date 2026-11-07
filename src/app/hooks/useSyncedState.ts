import { useState } from 'react'

/**
 * Estado local que arranca con el valor de una prop y se vuelve a sincronizar cuando la prop cambia.
 * Sustituye al patron "useEffect(() => setState(prop), [prop])", que provoca un render extra con datos
 * viejos: aqui el ajuste se hace durante el propio render (patron recomendado por React para estado derivado).
 */
export default function useSyncedState<T>(value: T) {
	const [state, setState] = useState<T>(value)
	const [previous, setPrevious] = useState<T>(value)
	if (!Object.is(previous, value)) {
		setPrevious(value)
		setState(value)
	}
	return [state, setState] as const
}
