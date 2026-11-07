"use server"
/**
 * Acciones de servidor que SI se pueden invocar desde el navegador.
 *
 * Next.js expone como endpoint POST publico cada funcion async exportada de un archivo "use server",
 * y el identificador de la accion se puede sacar del JavaScript del cliente. Por eso este archivo
 * solo contiene lo que el cliente necesita de verdad, y cada accion:
 *   - comprueba la sesion (requireAdmin) si es de administracion, o
 *   - valida y limita sus entradas (zod) si es publica.
 * La capa de datos completa vive en src/server/data.ts ("server-only": no se puede importar desde
 * componentes cliente ni llamar desde fuera).
 */
import { z } from "zod"
import {
	IAffiliateOrderBy,
	IAffiliateSearch,
	IPropertyCreateDTO,
	IPropertyOrderBy,
	IPropertySearch,
	IPropertyUpdateDTO,
} from "@/app/interfaces/models"
import { requireAdmin } from "@/server/guard"
import * as data from "@/server/data"
import * as v from "@/server/schemas"

export type {
	IUserData,
	IUserResult,
	IUserSession,
	IPropertyTypeData,
} from "@/server/data"

/* ----------------------------- Administracion ----------------------------- */

export async function indexProperty(
	filters: IPropertySearch = {},
	orderBy: IPropertyOrderBy = {},
	page: number = 1,
	limit: number = 15,
	country: boolean = false,
	lean: boolean = false
) {
	await requireAdmin()
	const parsed = v.adminPropertyFilters.parse(filters)
	const order = v.propertyOrderBy.parse(orderBy)
	return data.indexProperty(
		parsed as IPropertySearch,
		order as IPropertyOrderBy,
		v.paging.page.parse(page),
		v.paging.limit.parse(limit),
		z.boolean().parse(country),
		z.boolean().parse(lean)
	)
}

export async function createProperty(input: Omit<IPropertyCreateDTO, "publishedById">) {
	const admin = await requireAdmin()
	const parsed = v.propertyCreate.parse(input)
	return data.createProperty({ ...parsed, publishedById: admin.id } as IPropertyCreateDTO)
}

export async function updateProperty(propertyId: number, input: IPropertyUpdateDTO) {
	await requireAdmin()
	return data.updateProperty(v.id.parse(propertyId), v.propertyUpdate.parse(input) as IPropertyUpdateDTO)
}

export async function deleteProperty(propertyId: number) {
	await requireAdmin()
	return data.deleteProperty(v.id.parse(propertyId))
}

export async function activeMultipleProperty(propertyIds: number[]) {
	await requireAdmin()
	return data.activeMultipleProperty(v.ids.parse(propertyIds))
}

export async function deactivateMultipleProperty(propertyIds: number[]) {
	await requireAdmin()
	return data.deactivateMultipleProperty(v.ids.parse(propertyIds))
}

export async function createPropertyType(input: { name: string; code: string }) {
	await requireAdmin()
	return data.createPropertyType(v.propertyTypeCreate.parse(input))
}

export async function deletePropertyImage(imageId: number) {
	await requireAdmin()
	return data.deletePropertyImage(v.id.parse(imageId))
}

export async function getAffiliates(
	filters: IAffiliateSearch = {},
	orderBy: IAffiliateOrderBy = {},
	page: number = 1,
	limit: number = 15
) {
	await requireAdmin()
	return data.getAffiliates(
		v.affiliateSearch.parse(filters) as IAffiliateSearch,
		v.affiliateOrderBy.parse(orderBy) as IAffiliateOrderBy,
		v.paging.page.parse(page),
		v.paging.limit.parse(limit)
	)
}

export async function showAffiliate(filters: { id: number }) {
	await requireAdmin()
	return data.showAffiliate({ id: v.id.parse(filters?.id) })
}

/* ------------------------------ Sitio publico ------------------------------ */

/** Listado publico: siempre solo inmuebles publicados y filtros de la lista blanca. */
export async function indexPublicProperties(
	filters: IPropertySearch = {},
	orderBy: IPropertyOrderBy = {},
	page: number = 1,
	limit: number = 15
) {
	const parsed = v.propertyFilters.parse(filters)
	return data.indexProperty(
		{ ...parsed, active: true } as IPropertySearch,
		v.propertyOrderBy.parse(orderBy) as IPropertyOrderBy,
		v.paging.page.parse(page),
		v.paging.limit.parse(limit),
		true,
		false
	)
}

// Datos de referencia (sin informacion personal)
export async function getCountries() {
	return data.getCountries()
}
export async function getCurrencies() {
	return data.getCurrencies()
}
export async function getPropertyTypes() {
	return data.getPropertyTypes()
}
export async function getStatesByCode(code: string) {
	return data.getStatesByCode(v.stateCode.parse(code))
}

/* ------------------- Afiliados y pagos (flujo publico, sin cuenta) ------------------- */
// Estas acciones no pueden exigir sesion (el visitante paga sin cuenta), pero ya no exponen
// lectura/escritura generica: solo devuelven el id y solo permiten cambiar nombre, telefono,
// pais y plan. El endurecimiento del cobro (precio calculado en servidor, verificacion del
// importe, idempotencia) va en la Fase 5.

export async function findAffiliateByEmail(email: string) {
	const found = await data.showAffiliate({ email: v.email.parse(email) })
	return found ? { id: found.id } : null
}

export async function registerAffiliate(input: z.input<typeof v.affiliateRegister>) {
	const parsed = v.affiliateRegister.parse(input)
	const affiliate = await data.createAffiliate({
		...parsed,
		plan_date: new Date(),
		status: false,
	})
	return { id: affiliate.id }
}

export async function updateAffiliatePlan(
	affiliateId: number,
	input: { name?: string; phone?: string; countryId?: number; plan: z.infer<typeof v.plan> }
) {
	const parsed = v.affiliateRegister.omit({ email: true }).partial({ name: true, phone: true, countryId: true }).parse(input)
	await data.updateAffiliate({ id: v.id.parse(affiliateId), ...parsed })
	return { id: affiliateId }
}

const returnUrlSchema = z.url().refine((value) => {
	const base = process.env.APP_URL
	if (!base) return true
	try {
		return new URL(value).origin === new URL(base).origin
	} catch {
		return false
	}
}, "returnUrl fuera del dominio de la aplicacion")

export async function paymentInitialization(
	description: string,
	price: number,
	affiliateId: number,
	returnUrl: string,
	months: number
) {
	return data.paymentInitialization(
		z.string().trim().min(1).max(200).parse(description),
		z.number().positive().max(100_000).parse(price),
		v.id.parse(affiliateId),
		returnUrlSchema.parse(returnUrl),
		z.number().int().min(1).max(24).parse(months)
	)
}

export async function verifyPayStatus(payId: string) {
	return data.verifyPayStatus(z.string().regex(/^\d{1,10}$/).parse(payId))
}

export async function paymentAssert(payId: number) {
	return data.paymentAssert(v.id.parse(payId))
}
