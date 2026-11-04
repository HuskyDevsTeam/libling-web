"use server"
import { PrismaClient } from "@prisma/client"
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
} from "./app/interfaces/models"
import { PropertyCreate, PropertyUpdate } from "./app/classes"
import { cookies } from "next/headers"
import countries from "@/app/utils/countries.json"
import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { randomUUID } from "crypto"
import { FEE_MULTIPLY } from "./app/utils/data"
const saltRounds = 12

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
const authCode =
	"Basic " +
	Buffer.from(
		process.env.SAFERPAY_API_USER + ":" + process.env.SAFERPAY_API_PWD
	).toString("base64")

const saferpayConfig: AxiosRequestConfig = {
	headers: {
		Authorization: authCode,
		"Content-Type": "application/json",
		Accept: "application/json",
	},
}


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
		const user = prisma.user.findFirstOrThrow({
			where: {
				email,
			},
		})
		return user
	} catch (e) {
		console.error("Error getting user")
		return undefined
	}
}
export async function getUserById(id: number) {
	try {
		const user = prisma.user.findFirstOrThrow({
			where: {
				id,
			},
		})
		return user
	} catch (e) {
		console.error("Error getting user")
		return undefined
	}
}
export async function createUser(data: IUserData) {
	try {
		const user = await prisma.user.create({ data })
		console.log(user)
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export async function updateUser(id: number, data: IUserUpdateData) {
	try {
		const user = await prisma.user.update({ where: { id }, data })
		console.log(user)
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export async function getPropertyTypes() {
	try {
		const propertyTypes = await prisma.propertyType.findMany()
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
		const propertyType = await prisma.propertyType.findFirst({
			where: { code },
		})
		return propertyType
	} catch (e) {
		console.error("Error getting propertyType")
		return undefined
	}
}
export async function getCountries() {
	try {
		const countries = await prisma.country.findMany({
			orderBy: { name: "asc" },
		})
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
		const country = await prisma.country.findFirst({
			where: {
				code,
			},
		})
		return country
	} catch (e) {
		console.error("Error getting Country", e)
		return undefined
	}
}
export async function getCurrencies() {
	try {
		const currencies = await prisma.currency.findMany()
		return currencies
	} catch (e) {
		console.error("Error getting Currencies")
		return undefined
	}
}
export async function indexProperty(
	filters: IPropertySearch = {},
	orderBy: IPropertyOrderBy = {},
	page: number = 1,
	limit: number = 15,
	country: boolean = true
) {
	console.log("index request", filters, orderBy, page, limit, country)
	let countryFilter
	if (country) {
		countryFilter = await getCountryFilter()
	}
	const where = {
		...filters,
		address: filters.address ? { contains: filters.address } : undefined,
		countryId: countryFilter,
	}
	const total = await prisma.property.count({ where })
	const paging = normalizePage(page, limit)
	const meta0 = buildMeta(total, paging.page, paging.limit)
	const properties = await prisma.property.findMany({
		where,
		orderBy,
		skip: (meta0.page - 1) * paging.limit,
		take: paging.limit,
		include: {
			publishedBy: true,
			country: true,
			currency: true,
			propertyType: true,
			Surface: true,
			NearPlace: true,
			LegalNotice: true,
			PropertyImage: true,
			Benefits: true,
		},
	})
	const data: IPropertyData[] = properties.map((el) => ({
		...el,
		longitude: el.longitude?.toNumber(),
		latitude: el.latitude?.toNumber(),
		area: el.area?.toNumber(),
		bedrooms: el.bedrooms?.toNumber(),
		bathrooms: el.bathrooms?.toNumber(),
		price: el.price?.toNumber(),
	}))
	const meta = buildMeta(total, paging.page, paging.limit)
	return {
		data,
		meta,
	}
}
export async function showProperty(filters: IPropertySearch) {
	const property = await prisma.property.findFirst({
		where: filters,
		include: {
			publishedBy: true,
			country: true,
			currency: true,
			propertyType: true,
			Surface: true,
			NearPlace: true,
			LegalNotice: true,
			PropertyImage: true,
			Benefits: true,
		},
	})
	return property
}
export async function createProperty(data: IPropertyCreateDTO) {
	try {
		const newProperty = new PropertyCreate(data)
		const createdProperty = await prisma.property.create({ data: newProperty })
		console.log(createdProperty)
		const surfaces = data.Surface?.map(async (el) => {
			return await prisma.surface.create({
				data: {
					...el,
					propertyId: createdProperty.id,
				},
			})
		})
		const benefits = data.Benefits?.map(async (el) => {
			return await prisma.benefits.create({
				data: {
					...el,
					propertyId: createdProperty.id,
				},
			})
		})
		const nearPlaces = data.NearPlace?.map(async (el) => {
			return await prisma.nearPlace.create({
				data: {
					...el,
					propertyId: createdProperty.id,
				},
			})
		})
		const legalNotes = data.LegalNotice?.map(async (el) => {
			return await prisma.legalNotice.create({
				data: {
					...el,
					propertyId: createdProperty.id,
				},
			})
		})
		return createdProperty
	} catch (e) {
		console.error(e)
		process.exit(1)
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
	return await prisma.$transaction(async (tx) => {
		const updatedProperty = await tx.property.update({
			where: { id },
			data: scalars,
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
}
export async function deleteProperty(id: number) {
	try {
		const propertyDeleted = await prisma.property.delete({ where: { id } })
		console.log(propertyDeleted)
		return propertyDeleted
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export async function activeMultipleProperty(ids: number[]) {
	try {
		let updatedProperties: any[] = []
		await Promise.all(
			ids.map(async (el) => {
				const updatedProperty = await prisma.property.update({
					where: { id: el },
					data: { active: true },
				})
				updatedProperties.push(updatedProperty)
			})
		)
		console.log(updatedProperties)
		return updatedProperties
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export async function deactivateMultipleProperty(ids: number[]) {
	try {
		let updatedProperties: any[] = []
		await Promise.all(
			ids.map(async (el) => {
				const updatedProperty = await prisma.property.update({
					where: { id: el },
					data: { active: false },
				})
				updatedProperties.push(updatedProperty)
			})
		)
		console.log(updatedProperties)
		return updatedProperties
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export async function createPropertyType(data: IPropertyTypeData) {
	try {
		const propertyType = await prisma.propertyType.create({ data })
		console.log(propertyType)
		return propertyType
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export async function createPropertyImage(data: IPropertyImageCreate) {
	try {
		const propertyImage = await prisma.propertyImage.create({ data })
		console.log(propertyImage)
		return propertyImage
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export async function deletePropertyImage(id: number) {
	try {
		const propertyImage = await prisma.propertyImage.delete({ where: { id } })
		console.log(propertyImage)
		return propertyImage
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}

export const getCountryFilter = async () => {
	const countryCookie = cookies().get("immo-country")?.value
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
		console.log(pay)
		return pay
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export const updatePay = async (data: IUpdatePay) => {
	try {
		const pay = await prisma.pay.update({ where: { id: data.id }, data })
		console.log(pay)
		return pay
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export const createAffiliate = async (data: ICreateAffiliateData) => {
	try {
		const affiliate = await prisma.affiliate.create({ data })
		console.log("createAffiliate service for: ", affiliate)
		return affiliate
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
export const updateAffiliate = async (data: IUpdateAffiliateData) => {
	try {
		const affiliate = await prisma.affiliate.update({
			where: { id: data.id },
			data,
		})
		console.log(affiliate)
		return affiliate
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}

export const getAffiliates = async (
	filters: IAffiliateSearch = {},
	orderBy: IAffiliateOrderBy = {},
	page: number = 1,
	limit: number = 15
) => {
	console.log("index request", filters, orderBy, page, limit)
	const total = await prisma.affiliate.count({ where: { ...filters } })
	const paging = normalizePage(page, limit)
	const meta0 = buildMeta(total, paging.page, paging.limit)
	const affiliates = await prisma.affiliate.findMany({
		where: {
			...filters,
		},
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
	console.log("index request", filters, orderBy, page, limit)
	const total = await prisma.pay.count({ where: { ...filters } })
	const paging = normalizePage(page, limit)
	const meta0 = buildMeta(total, paging.page, paging.limit)
	const pays = await prisma.pay.findMany({
		where: {
			...filters,
		},
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
export const paymentInitialization = async (
	description: string,
	price: number,
	affiliateId: number,
	returnUrl: string,
	months: number
) => {
	const paysCount = await getPaysCount()
	const newPay = await createPay({
		affiliateId,
		status: false,
		quantity: price * FEE_MULTIPLY,
		months,
	})
	const affiliate = await showAffiliate({id:affiliateId})
	const data = {
		RequestHeader: {
			SpecVersion: "1.41",
			CustomerId: process.env.SAFERPAY_API_CUSTOMER_ID,
			RequestId: randomUUID(),
			RetryIndicator: 0,
		},
		TerminalId: process.env.SAFERPAY_API_TERMINAL_ID,
		Payment: {
			Amount: {
				Value: parseFloat((price * FEE_MULTIPLY * 100).toFixed(0)),
				CurrencyCode: "EUR",
			},
			OrderId: paysCount + 1,
			Description: description,
		},
		ReturnUrl: {
			Url: `${returnUrl}?pay=${newPay.id}`,
		},
		Notification:{
			MerchantEmails:["Affiliate@libling.lu"],
			PayerEmail:affiliate?.email || ""
		}
	}

	try {
		console.log('Safer Pay config: ',JSON.stringify(saferpayConfig))
		const response = await axios.post(
			"https://www.saferpay.com/api/payment/v1/PaymentPage/Initialize",
			data,
			saferpayConfig
		)
		console.log('respuesta de la primera peticion', response.data)
		const updatedPay = await updatePay({
			id: newPay.id,
			reference: response?.data?.Token,
		})
		return {
			redirectUrl: response.data?.RedirectUrl,
			status: 200,
			pay: {
				...updatedPay,
				quantity: updatedPay.quantity?.toFixed(2),
			},
		}
	} catch (e:any) {
		if(e?.response){
			console.error('Catch Error Name: ', e?.response?.data?.ErrorName)
			console.error('Catch Error Detail: ', e?.response?.data?.ErrorDetail)
		}else{
			console.error(e)
		}
		return {
			status: 500,
		}
	}
}
export const paymentAssert = async (payId: number) => {
	const pay = await showPay({ id: payId })
	if(!pay) throw new Error('No pay founded on DB')
	const data = {
		RequestHeader: {
			SpecVersion: "1.41",
			CustomerId: process.env.SAFERPAY_API_CUSTOMER_ID,
			RequestId: randomUUID(),
			RetryIndicator: 0,
		},
		Token: pay.reference,
	}
	try {
		console.log('Safer Pay config: ',JSON.stringify(saferpayConfig))
		const response = await axios.post(
			"https://www.saferpay.com/api/Payment/v1/PaymentPage/Assert",
			data,
			saferpayConfig
		)
		console.log('respuesta de la primera peticion', response.data)
		const updatedPay = await updatePay({
			id: pay.id,
			status: true,
		})
		//actuliza el afiliado
		const affiliate = await showAffiliate({id:updatedPay.affiliateId})
		const newDate = new Date(affiliate?.plan_date || '')
		if(affiliate?.plan_date){
			newDate.setMonth(affiliate?.plan_date.getMonth() + updatedPay.months)
		}
		const updatedAffiliate = await updateAffiliate({
			id:updatedPay.affiliateId,
			plan_date: affiliate?.plan_date ? newDate : undefined,
			status:newDate > new Date(),
		})
		return {
			redirectUrl: response.data?.RedirectUrl,
			status: 200,
			pay: {
				...updatedPay,
				quantity: updatedPay.quantity?.toFixed(2),
			},
			affiliate:updatedAffiliate
		}
	} catch (e) {
		console.error(e)
		return {
			status: 500,
		}
	}
}
