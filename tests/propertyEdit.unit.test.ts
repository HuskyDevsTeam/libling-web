import { describe, expect, it } from 'vitest'
import { buildUpdateDTO, linesToList, listToLines } from '@/app/utils/propertyEdit'

const base = {
	title: '  Casa  ', content: 'desc', address: ' Calle 1 ', price: '250000', area: '90.5',
	bedrooms: '3', bathrooms: '', view: '', furnished: true, active: false,
	benefits: 'Piscina\n\n  Garaje  ', nearPlaces: 'Metro', legalNotes: '',
}

describe('propertyEdit helpers', () => {
	it('linesToList quita espacios y líneas vacías', () => {
		expect(linesToList('a\n b \n\n c')).toEqual(['a', 'b', 'c'])
		expect(linesToList('')).toEqual([])
	})
	it('listToLines es la inversa para nombres', () => {
		expect(listToLines([{ name: 'a' }, { name: 'b' }])).toBe('a\nb')
		expect(listToLines(undefined)).toBe('')
	})
	it('buildUpdateDTO convierte números, recorta textos y arma las listas', () => {
		const dto = buildUpdateDTO(base)
		expect(dto.title).toBe('Casa')
		expect(dto.address).toBe('Calle 1')
		expect(dto.price).toBe(250000)
		expect(dto.area).toBe(90.5)
		expect(dto.bathrooms).toBeUndefined()
		expect(dto.Benefits).toEqual([{ name: 'Piscina' }, { name: 'Garaje' }])
		expect(dto.LegalNotice).toEqual([])
	})
})
