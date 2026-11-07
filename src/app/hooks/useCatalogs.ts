import { useMemo } from 'react'
import { getCountries, getCurrencies, getPropertyTypes } from '@/services'
import { ISelectElement } from '@/app/interfaces'
import useRemote from './useRemote'

const NO_ITEMS: ISelectElement[] = []

/** Monedas del servidor como opciones de un select (se cargan al montar). */
export function useCurrencies() {
	const [data] = useRemote(getCurrencies)
	return useMemo<ISelectElement[]>(() => data?.map((el) => ({ key: el.id, value: el.symbol, description: el.name })) ?? NO_ITEMS, [data])
}

/** Tipos de inmueble; `reload` vuelve a pedirlos (por ejemplo despues de crear uno nuevo). */
export function usePropertyTypes() {
	const [data, reload] = useRemote(getPropertyTypes)
	const list = useMemo<ISelectElement[]>(() => data?.map((el) => ({ key: el.id, value: el.name })) ?? NO_ITEMS, [data])
	return [list, reload] as const
}

export function useCountries() {
	const [data] = useRemote(getCountries)
	return useMemo<ISelectElement[]>(() => data?.map((el) => ({ key: el.id, value: el.name })) ?? NO_ITEMS, [data])
}
