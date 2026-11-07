import { MetadataRoute } from "next"
import { prisma } from "@/server/db"
import { memo } from "@/server/memo"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Un cliente de Prisma compartido (antes abria uno propio) y el listado se reutiliza durante 1 hora
	const properties = await memo("properties", "sitemap", 3600_000, () =>
		prisma.property.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } })
	)
	const propertyEntries: MetadataRoute.Sitemap = properties.map((p) => ({
		url: `https://libling.lu/immo/${p.slug}`,
		lastModified: p.updatedAt,
		priority: 0.7,
		//@ts-ignore
		alternates: {
			languages: {
				es: `https://libling.lu/es/immo/${p.slug}`,
				en: `https://libling.lu/en/immo/${p.slug}`,
				fr: `https://libling.lu/fr/immo/${p.slug}`,
			},
		},
	}))
	return [
		{
			url: "https://libling.lu",
			lastModified: new Date(),
			priority: 1,
			//@ts-ignore
			alternates: {
				languages: {
					es: "https://libling.lu/es",
					en: "https://libling.lu/en",
					fr: "https://libling.lu/fr",
				},
			},
		},
		{
			url: "https://libling.lu/about",
			lastModified: new Date(),
			priority: 0.8,
			//@ts-ignore
			alternates: {
				languages: {
					es: "https://libling.lu/es/about",
					en: "https://libling.lu/en/about",
					fr: "https://libling.lu/fr/about",
				},
			},
		},
		{
			url: "https://libling.lu/services",
			priority: 0.8,
			lastModified: new Date(),
			//@ts-ignore
			alternates: {
				languages: {
					es: "https://libling.lu/es/services",
					en: "https://libling.lu/en/services",
					fr: "https://libling.lu/fr/services",
				},
			},
		},
		{
			url: "https://libling.lu/immo",
			lastModified: new Date(),
			priority: 1,
			//@ts-ignore
			alternates: {
				languages: {
					es: "https://libling.lu/es/immo",
					en: "https://libling.lu/en/immo",
					fr: "https://libling.lu/fr/immo",
				},
			},
		},
		{
			url: "https://libling.lu/contact",
			lastModified: new Date(),
			priority: 0.8,
			//@ts-ignore
			alternates: {
				languages: {
					es: "https://libling.lu/es/contact",
					en: "https://libling.lu/en/contact",
					fr: "https://libling.lu/fr/contact",
				},
			},
		},
		...propertyEntries,
	]
}
