import { z } from "zod"

// Validacion de las entradas de las acciones de servidor. Los campos desconocidos se descartan.

export const id = z.number().int().positive().max(2_147_483_647)
export const ids = z.array(id).min(1).max(200)
const text = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) => text(max).optional()
const finite = z.number().finite()

export const orderDirection = z.enum(["asc", "desc"])
export const paging = {
	page: z.number().int().min(1).max(100_000).default(1),
	limit: z.number().int().min(1).max(100).default(15),
}

const numberFilter = z.union([
	finite,
	z
		.object({
			equals: finite.optional(),
			gt: finite.optional(),
			gte: finite.optional(),
			lt: finite.optional(),
			lte: finite.optional(),
		})
		.strict(),
])

/** Filtros permitidos en listados de inmuebles (lista blanca: nada llega a Prisma sin pasar por aqui). */
export const propertyFilters = z.object({
	search: optionalText(100),
	address: optionalText(150),
	type: z.boolean().optional(),
	furnished: z.boolean().optional(),
	elevator: z.boolean().optional(),
	propertyTypeId: id.optional(),
	countryId: id.optional(),
	bedrooms: numberFilter.optional(),
	bathrooms: numberFilter.optional(),
	price: numberFilter.optional(),
	area: finite.optional(),
	parking: finite.optional(),
})
export const adminPropertyFilters = propertyFilters.extend({ active: z.boolean().optional() })

export const propertyOrderBy = z.partialRecord(
	z.enum(["id", "title", "address", "area", "bedrooms", "bathrooms", "price", "createdAt", "updatedAt"]),
	orderDirection
)

const surface = z.object({ name: text(120), description: text(500), quantity: text(60), areaId: z.number().int().default(0), propertyId: z.number().int().optional() })
const benefit = z.object({ name: text(160), propertyId: z.number().int().optional() })
const nearPlace = z.object({ name: text(160), description: text(500), propertyId: z.number().int().optional() })
const legalNotice = z.object({ name: text(300), propertyId: z.number().int().optional() })

const propertyBase = {
	title: text(200).min(1),
	content: optionalText(10_000),
	address: text(300).min(1),
	thumbnail: z.url().max(500).optional(),
	longitude: finite.min(-180).max(180).optional(),
	latitude: finite.min(-90).max(90).optional(),
	area: finite.min(0).max(1e7).optional(),
	bedrooms: finite.min(0).max(1000).optional(),
	bathrooms: finite.min(0).max(1000).optional(),
	price: finite.min(0).max(1e12).optional(),
	heatingType: optionalText(100),
	heatingMedium: optionalText(100),
	heatingEnergy: optionalText(100),
	view: optionalText(100),
	furnished: z.boolean(),
	parking: finite.min(0).max(1000).optional(),
	elevator: z.boolean().optional(),
	active: z.boolean(),
	type: z.boolean(),
	frecuency: optionalText(30),
	countryId: id,
	currencyId: id,
	propertyTypeId: id,
	Surface: z.array(surface).max(100).optional(),
	Benefits: z.array(benefit).max(100).optional(),
	NearPlace: z.array(nearPlace).max(100).optional(),
	LegalNotice: z.array(legalNotice).max(100).optional(),
}
// publishedById se ignora: siempre es el usuario de la sesion.
export const propertyCreate = z.object(propertyBase)
export const propertyUpdate = z.object(propertyBase).partial()

export const propertyTypeCreate = z.object({ name: text(80).min(1), code: text(80).min(1) })

export const affiliateSearch = z.object({ search: optionalText(100) })
export const affiliateOrderBy = z.partialRecord(
	z.enum(["id", "name", "email", "status", "phone", "plan", "plan_date"]),
	orderDirection
)

export const email = z.string().trim().toLowerCase().email().max(254)
export const plan = z.enum(["Student", "JobSeeker", "Business"])
export const affiliateRegister = z.object({
	email,
	name: text(120).min(1),
	phone: text(40).min(3),
	countryId: id,
	plan,
})
export const affiliateRenew = z.object({ email, plan })
export const stateCode = z.string().trim().min(2).max(10)
