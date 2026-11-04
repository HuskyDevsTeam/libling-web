/** Convierte un título en un slug apto para URL (sin acentos, minúsculas, guiones). */
export function slugify(text: string, maxLength = 80): string {
	const slug = text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/ß/g, 'ss')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, maxLength)
		.replace(/-+$/g, '')
	return slug || 'propiedad'
}
