import "server-only"
import { prisma } from "@/server/db"
import {
	IAffiliateData,
	IAffiliateOrderBy,
	IAffiliateSearch,
	ICreateAffiliateData,
	ICreatePay,
	IMetaPaginate,
	IPayOrderBy,
	IPaySearch,
	IPropertyCreateDTO,
	IPropertyData,
	IPropertyImageCreate,
	IPropertyOrderBy,
	IPropertySearch,
	IPropertyUpdateDTO,
	IUpdateAffiliateData,
	IUpdatePay,
} from "@/app/interfaces/models"
import { PropertyCreate, PropertyUpdate } from "@/app/classes"
import { cookies } from "next/headers"
import countries from "@/app/utils/countries.json"
import { slugify } from "@/app/utils/slug"
import { invalidate, memo } from "@/server/memo"

const CATALOG_TTL = 60_000
const LISTING_TTL = 30_000
const saltRounds = 12

const buildMeta = (
	totalData: number,
	page: number,
	limit: number
): IMetaPaginate => {
	const totalPages = Math.max(Math.ceil(totalData / limit), 1)
	const newPage = Math.min(Math.max(page, 1), totalPages)
	return {
		page: newPage,
		prevPage: newPage <= 1 ? null : newPage - 1,
		nextPage: newPage >= totalPages ? null : newPage + 1,
		dataPerPage: totalData >= limit ? limit : totalData,
		totalData,
		totalPages,
	}
}
const normalizePage = (page: number, limit: number) => {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 15
	const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
	return { page: safePage, limit: safeLimit }
}
export interface IPropertyTypeData {
	id?: number
	name: string
	code: string
}
export interface IUserData {
	id?: number
	name: string
	email: string
	password: string
}
export interface IUserUpdateData {
	name?: string
	email?: string
	password?: string
}
export interface IUserResult {
	id: number
	email: string
	name: string | null
	password: string
}
export interface IUserSession {
	name?: string | null | undefined
	email?: string | null | undefined
}
export async function getUser(email: string) {
	try {
		const user = await prisma.user.findFirstOrThrow({
			where: {
				email: { equals: email, mode: "insensitive" },
			},
		})
		return user
	} catch (e) {
		// usuario inexistente: se devuelve undefined
		return undefined
	}
}
export async function getUserById(id: number) {
	try {
		const user = await prisma.user.findFirstOrThrow({
			where: {
				id,
			},
		})
		return user
	} catch (e) {
		// usuario inexistente: se devuelve undefined
		return undefined
	}
}
export async function createUser(data: IUserData) {
	try {
		const user = await prisma.user.create({ data })
	} catch (e) {
		console.error(e)
		throw e
	}
}
export async function updateUser(id: number, data: IUserUpdateData) {
	try {
		const user = await prisma.user.update({ where: { id }, data })
	} catch (e) {
		console.error(e)
		throw e
	}
}
export async function getPropertyTypes() {
	try {
		const propertyTypes = await memo("catalog", "propertyTypes", CATALOG_TTL, () => prisma.propertyType.findMany())
		return propertyTypes
	} catch (e) {
		console.error("Error getting propertyTypes")
		return undefined
	}
}
export async function findPropertyType(id: number) {
	try {
		const propertyType = await prisma.propertyType.findFirst({ where: { id } })
		return propertyType
	} catch (e) {
		console.error("Error getting propertyType")
		return undefined
	}
}
export async function findPropertyTypeByCode(code: string) {
	try {
		const propertyType = await memo("catalog", `propertyType:${code}`, CATALOG_TTL, () =>
			prisma.propertyType.findFirst({ where: { code } })
		)
		return propertyType
	} catch (e) {
		console.error("Error getting propertyType")
		return undefined
	}
}
export async function getCountries() {
	try {
		const countries = await memo("catalog", "countries", CATALOG_TTL, () =>
			prisma.country.findMany({ orderBy: { name: "asc" } })
		)
		return countries
	} catch (e) {
		console.error("Error getting Countries", e)
		return undefined
	}
}
export async function getStatesByCode(code: string) {
	try {
		const states = countries.find((el) => el?.code2 === code)?.states
		return states?.map((el) => ({
			key: el.code,
			value: el.name,
			description: el.code,
		}))
	} catch (e) {
		console.error("Error getting states", e)
		return undefined
	}
}
export async function findCountryByCode(code: string) {
	try {
		const country = await memo("catalog", `country:${code}`, CATALOG_TTL, () =>
			prisma.country.findFirst({ where: { code } })
		)
		return country
	} catch (e) {
		console.error("Error getting Country", e)
		return undefined
	}
}
export async function getCurrencies() {
	try {
		const currencies = await memo("catalog", "currencies", CATALOG_TTL, () => prisma.currency.findMany())
		return currencies
	} catch (e) {
		console.error("Error getting Currencies")
		return undefined
	}
}
/**
 * Cuanta informacion se trae de cada inmueble:
 *  - "card": solo lo que pintan las tarjetas publicas (sin descripcion ni fotos, beneficios, etc.),
 *  - "admin": tablas del panel (moneda y tipo),
 *  - "full": todo, con las relaciones.
 */
export type PropertyView = "full" | "admin" | "card"
const cardSelect = {
	id: true,
	title: true,
	slug: true,
	price: true,
	frecuency: true,
	area: true,
	bedrooms: true,
	bathrooms: true,
	type: true,
	active: true,
	thumbnail: true,
	thumbnailWebp: true,
	country: { select: { name: true } },
	currency: { select: { symbol: true } },
	propertyType: { select: { name: true } },
} as const
const fullInclude = {
	publishedBy: { select: { id: true, name: true } },
	country: true,
	currency: true,
	propertyType: true,
	Surface: true,
	NearPlace: true,
	LegalNotice: true,
	PropertyImage: true,
	Benefits: true,
} as const
export async function indexProperty(
	filters: IPropertySearch = {},
	orderBy: IPropertyOrderBy = {},
	page: number = 1,
	limit: number = 15,
	country: boolean = true,
	view: PropertyView = "full"
) {
	let countryFilter
	if (country) {
		countryFilter = await getCountryFilter()
	}
	const { search, address, ...rest } = filters
	const term = search?.trim()
	const where = {
		...rest,
		address: address
			? { contains: address.trim(), mode: "insensitive" as const }
			: undefined,
		OR: term
			? [
					{ title: { contains: term, mode: "insensitive" as const } },
					{ address: { contains: term, mode: "insensitive" as const } },
					{ content: { contains: term, mode: "insensitive" as const } },
					{
						propertyType: {
							name: { contains: term, mode: "insensitive" as const },
						},
					},
			  ]
			: undefined,
		countryId: countryFilter,
	}
	const paging = normalizePage(page, limit)
	// Los listados publicos (solo inmuebles activos) se comparten entre visitantes durante unos segundos
	const cacheable = view === "card" && (filters as { active?: boolean }).active === true
	const load = async () => {
		const total = await prisma.property.count({ where })
		const meta0 = buildMeta(total, paging.page, paging.limit)
		const page = { where, orderBy, skip: (meta0.page - 1) * paging.limit, take: paging.limit, relationLoadStrategy: "join" as const }
		// Una sola consulta con joins en lugar de una por relacion
		const properties: unknown[] =
			view === "card"
				? await prisma.property.findMany({ ...page, select: cardSelect })
				: await prisma.property.findMany({
						...page,
						include: view === "admin" ? { currency: true, propertyType: true } : fullInclude,
				  })
		const data: IPropertyData[] = (properties as any[]).map((el) => ({
			...el,
			longitude: el.longitude?.toNumber(),
			latitude: el.latitude?.toNumber(),
			area: el.area?.toNumber(),
			bedrooms: el.bedrooms?.toNumber(),
			bathrooms: el.bathrooms?.toNumber(),
			price: el.price?.toNumber(),
		}))
		return { data, total }
	}
	const { data, total } = cacheable
		? await memo("properties", JSON.stringify({ where, orderBy, page: paging.page, limit: paging.limit }), LISTING_TTL, load)
		: await load()
	const meta = buildMeta(total, paging.page, paging.limit)
	return {
		data,
		meta,
	}
}
/** Ficha publica: solo inmuebles publicados (los borradores y pausados no se pueden ver por id). */
export async function showActiveProperty(filters: IPropertySearch) {
	return showProperty({ ...filters, active: true })
}
export async function showProperty(filters: IPropertySearch) {
	const property = await prisma.property.findFirst({
		where: filters,
		relationLoadStrategy: "join",
		include: fullInclude,
	})
	return property
}
async function uniqueSlug(title: string) {
	const base = slugify(title)
	let candidate = base
	for (let i = 2; await prisma.property.findUnique({ where: { slug: candidate }, select: { id: true } }); i++) {
		candidate = `${base}-${i}`
	}
	return candidate
}
export async function createProperty(data: IPropertyCreateDTO) {
	try {
		const newProperty = new PropertyCreate(data)
		// Propiedad y hijos en una sola transaccion: antes los hijos se lanzaban sin esperar y,
		// si fallaban, quedaba un inmueble a medias sin que nadie se enterara.
		for (let attempt = 0; ; attempt++) {
			const slug = await uniqueSlug(data.title)
			try {
				const created = await prisma.$transaction(async (tx) => {
					const createdProperty = await tx.property.create({ data: { ...newProperty, slug } })
					const withParent = <T extends object>(list?: T[]) => (list ?? []).map((el) => ({ ...el, propertyId: createdProperty.id }))
					await tx.surface.createMany({ data: withParent(data.Surface) })
					await tx.benefits.createMany({ data: withParent(data.Benefits) })
					await tx.nearPlace.createMany({ data: withParent(data.NearPlace) })
					await tx.legalNotice.createMany({ data: withParent(data.LegalNotice) })
					return createdProperty
				})
				invalidate("properties")
				return created
			} catch (e) {
				// Otro alta con el mismo titulo gano el slug entre la comprobacion y el insert: se reintenta
				if ((e as { code?: string }).code === "P2002" && attempt < 3) continue
				throw e
			}
		}
	} catch (e) {
		console.error(e)
		throw e
	}
}
export async function updateProperty(id: number, data: IPropertyUpdateDTO) {
	// Scalar fields left undefined are ignored by Prisma. The child lists
	// (Surface, Benefits, NearPlace, LegalNotice) are replaced as a whole only
	// when they are provided, all inside one transaction.
	const scalars = new PropertyUpdate(data)
	const withoutPropertyId = <T extends { propertyId?: number }>(el: T) => {
		const { propertyId, ...rest } = el
		return rest
	}
	const result = await prisma.$transaction(async (tx) => {
		// Al cambiar la portada se actualiza tambien su miniatura (la de la imagen con esa URL; null si es una foto antigua)
		const coverImage = data.thumbnail
			? await tx.propertyImage.findFirst({ where: { propertyId: id, path: data.thumbnail }, select: { thumbPath: true } })
			: undefined
		const updatedProperty = await tx.property.update({
			where: { id },
			data: { ...scalars, ...(data.thumbnail ? { thumbnailWebp: coverImage?.thumbPath ?? null } : {}) },
		})
		if (data.Surface) {
			await tx.surface.deleteMany({ where: { propertyId: id } })
			await tx.surface.createMany({
				data: data.Surface.map((el) => ({ ...withoutPropertyId(el), propertyId: id })),
			})
		}
		if (data.Benefits) {
			await tx.benefits.deleteMany({ where: { propertyId: id } })
			await tx.benefits.createMany({
				data: data.Benefits.map((el) => ({ ...withoutPropertyId(el), propertyId: id })),
			})
		}
		if (data.NearPlace) {
			await tx.nearPlace.deleteMany({ where: { propertyId: id } })
			await tx.nearPlace.createMany({
				data: data.NearPlace.map((el) => ({ ...withoutPropertyId(el), propertyId: id })),
			})
		}
		if (data.LegalNotice) {
			await tx.legalNotice.deleteMany({ where: { propertyId: id } })
			await tx.legalNotice.createMany({
				data: data.LegalNotice.map((el) => ({ ...withoutPropertyId(el), propertyId: id })),
			})
		}
		// Decimal no es serializable hacia componentes cliente (server action)
		return {
			...updatedProperty,
			longitude: updatedProperty.longitude?.toNumber(),
			latitude: updatedProperty.latitude?.toNumber(),
			area: updatedProperty.area?.toNumber(),
			bedrooms: updatedProperty.bedrooms?.toNumber(),
			bathrooms: updatedProperty.bathrooms?.toNumber(),
			price: updatedProperty.price?.toNumber(),
		}
	})
	invalidate("properties")
	return result
}
export async function deleteProperty(id: number) {
	try {
		const propertyDeleted = await prisma.property.delete({ where: { id } })
		invalidate("properties")
		return propertyDeleted
	} catch (e) {
		console.error(e)
		throw e
	}
}
async function setActive(ids: number[], active: boolean) {
	// Un solo UPDATE para todos (antes eran N consultas en paralelo)
	const { count } = await prisma.property.updateMany({ where: { id: { in: ids } }, data: { active } })
	invalidate("properties")
	return { count }
}
export async function activeMultipleProperty(ids: number[]) {
	return setActive(ids, true)
}
export async function deactivateMultipleProperty(ids: number[]) {
	return setActive(ids, false)
}
export async function createPropertyType(data: IPropertyTypeData) {
	try {
		const propertyType = await prisma.propertyType.create({ data })
		invalidate("catalog")
		return propertyType
	} catch (e) {
		console.error(e)
		throw e
	}
}
export async function createPropertyImage(data: IPropertyImageCreate) {
	try {
		const propertyImage = await prisma.propertyImage.create({ data })
		return propertyImage
	} catch (e) {
		console.error(e)
		throw e
	}
}
export async function deletePropertyImage(id: number) {
	try {
		const propertyImage = await prisma.propertyImage.delete({ where: { id } })
		invalidate("properties")
		return propertyImage
	} catch (e) {
		console.error(e)
		throw e
	}
}

export const getCountryFilter = async () => {
	const countryCookie = (await cookies()).get("immo-country")?.value
	if (!countryCookie) {
		return (await findCountryByCode("LU"))?.id
	}
	if (!!countryCookie && countryCookie === "ALL") {
		return undefined
	}
	if (!!countryCookie && countryCookie !== "ALL") {
		return (await findCountryByCode(countryCookie))?.id
	}
}
export const createPay = async (data: ICreatePay) => {
	try {
		const pay = await prisma.pay.create({ data })
		return pay
	} catch (e) {
		console.error(e)
		throw e
	}
}
export const updatePay = async (data: IUpdatePay) => {
	try {
		const pay = await prisma.pay.update({ where: { id: data.id }, data })
		return pay
	} catch (e) {
		console.error(e)
		throw e
	}
}
export const createAffiliate = async (data: ICreateAffiliateData) => {
	try {
		const affiliate = await prisma.affiliate.create({ data })
		return affiliate
	} catch (e) {
		console.error(e)
		throw e
	}
}
export const updateAffiliate = async (data: IUpdateAffiliateData) => {
	try {
		const affiliate = await prisma.affiliate.update({
			where: { id: data.id },
			data,
		})
		return affiliate
	} catch (e) {
		console.error(e)
		throw e
	}
}

export const getAffiliates = async (
	filters: IAffiliateSearch = {},
	orderBy: IAffiliateOrderBy = {},
	page: number = 1,
	limit: number = 15
) => {
	const { search, ...rest } = filters
	const term = search?.trim()
	const where = {
		...rest,
		OR: term
			? [
					{ name: { contains: term, mode: "insensitive" as const } },
					{ email: { contains: term, mode: "insensitive" as const } },
					{ phone: { contains: term, mode: "insensitive" as const } },
			  ]
			: undefined,
	}
	const total = await prisma.affiliate.count({ where })
	const paging = normalizePage(page, limit)
	const meta0 = buildMeta(total, paging.page, paging.limit)
	const affiliates = await prisma.affiliate.findMany({
		where,
		orderBy,
		skip: (meta0.page - 1) * paging.limit,
		take: paging.limit,
		include: {
			country: true,
			Pay: true,
		},
	})
	const data = affiliates.map((el) => ({
		...el,
		Pay: el.Pay.map((element) => ({
			...element,
			quantity: element.quantity?.toNumber(),
		})),
	}))
	const meta = buildMeta(total, paging.page, paging.limit)
	return {
		data,
		meta,
	}
}
export const getDashboardStats = async () => {
	const now = new Date()
	const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	const [
		properties,
		active,
		draft,
		sale,
		rent,
		newProperties,
		affiliates,
		activeAffiliates,
		payments,
		recent,
	] = await Promise.all([
		prisma.property.count(),
		prisma.property.count({ where: { active: true } }),
		prisma.property.count({ where: { active: false } }),
		prisma.property.count({ where: { type: true } }),
		prisma.property.count({ where: { type: false } }),
		prisma.property.count({ where: { createdAt: { gte: monthAgo } } }),
		prisma.affiliate.count(),
		prisma.affiliate.count({ where: { plan_date: { gt: now } } }),
		prisma.pay.count({ where: { status: true } }),
		prisma.property.findMany({
			orderBy: { createdAt: "desc" },
			take: 5,
			select: { id: true, title: true, active: true, createdAt: true },
		}),
	])
	return {
		properties,
		active,
		draft,
		sale,
		rent,
		newProperties,
		affiliates,
		activeAffiliates,
		payments,
		recent,
	}
}
export const getPaysCount = async () => {
	return prisma.pay.count()
}
export const getPays = async (
	filters: IPaySearch = {},
	orderBy: IPayOrderBy = {},
	page: number = 1,
	limit: number = 15
) => {
	const { search, ...rest } = filters
	const term = search?.trim()
	const where = {
		...rest,
		OR: term
			? [
					{ reference: { contains: term, mode: "insensitive" as const } },
					{
						affiliate: {
							name: { contains: term, mode: "insensitive" as const },
						},
					},
					{
						affiliate: {
							email: { contains: term, mode: "insensitive" as const },
						},
					},
			  ]
			: undefined,
	}
	const total = await prisma.pay.count({ where })
	const paging = normalizePage(page, limit)
	const meta0 = buildMeta(total, paging.page, paging.limit)
	const pays = await prisma.pay.findMany({
		where,
		orderBy,
		skip: (meta0.page - 1) * paging.limit,
		take: paging.limit,
		include: {
			affiliate: true,
		},
	})
	const data = pays.map((el) => ({
		...el,
		quantity: el.quantity?.toNumber(),
	}))
	const meta = buildMeta(total, paging.page, paging.limit)
	return {
		data,
		meta,
	}
}
export const showPay = async (filters: IPaySearch) => {
	const pay = await prisma.pay.findFirst({
		where: filters,
		include: {
			affiliate: true,
		},
	})
	return pay
}
export const showAffiliate = async (filters: IAffiliateSearch) => {
	const affiliate = await prisma.affiliate.findFirst({
		where: filters,
		include: {
			country: true,
			Pay: true,
		},
	})
	return affiliate
}
export const verifyPayStatus = async (payId: string) => {
	const pay = await showPay({ id: parseInt(payId) })
	const twoDaysAgo = new Date()
	twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
	if ((!pay?.status) && pay?.date && pay.date >= twoDaysAgo) {
		return pay.id
	}
	return null
}
