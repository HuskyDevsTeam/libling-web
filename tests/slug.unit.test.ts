import { describe, expect, it } from 'vitest'
import { slugify } from '@/app/utils/slug'

describe('slugify', () => {
	it('quita acentos, símbolos y pasa a minúsculas', () => {
		expect(slugify('Apartamento Élégant à Luxembourg-Ville')).toBe('apartamento-elegant-a-luxembourg-ville')
		expect(slugify('Maison  &  Jardín!!')).toBe('maison-jardin')
	})
	it('usa un valor por defecto si no queda nada', () => {
		expect(slugify('###')).toBe('propiedad')
	})
	it('limita la longitud sin dejar guiones al final', () => {
		const s = slugify('a'.repeat(79) + ' bbb')
		expect(s.length).toBeLessThanOrEqual(80)
		expect(s.endsWith('-')).toBe(false)
	})
})
