import { useSyncExternalStore } from 'react'

const subscribeNothing = () => () => {}

/**
 * Lee un store persistido (zustand + localStorage) sin desajustes de hidratacion:
 * en el servidor y en el primer render del cliente devuelve undefined, y despues el valor real.
 */
const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => {
  const result = store(callback) as F
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  return hydrated ? result : undefined
}

export default useStore
