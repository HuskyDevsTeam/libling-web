import { describe, expect, it } from 'vitest'
import { IEditInitial, buildUpdateDTO, formsFromProperty } from '@/app/utils/propertyEdit'

const initial: IEditInitial = {
	id: 1, type: false, propertyTypeId: 3, countryId: 2, address: 'Rue 1', longitude: 6.1, latitude: 49.6,
	area: 90, bedrooms: 3, bathrooms: 2, heatingType: '4', heatingMedium: null, heatingEnergy: '2', furnished: true, parking: 2, elevator: true, view: 'Mar',
	Surface: [{ name: 'Jardín', description: 'Sur', quantity: '20', areaId: 1 }],
	Benefits: [{ name: 'Piscina' }], NearPlace: [{ name: 'Metro' }], LegalNotice: [{ name: 'Aviso' }],
	title: 'Casa', content: 'desc', thumbnail: 'http://x/a.jpg', images: [{ id: 5, path: 'http://x/a.jpg' }],
	price: 1500, currencyId: 1, frecuency: '2',
}

describe('formsFromProperty / buildUpdateDTO', () => {
	it('precarga cada paso con los datos de la propiedad', () => {
		const f = formsFromProperty(initial)
		expect(f.form_1).toMatchObject({ propertyType: 3, country: 2, type: 0, address: 'Rue 1', longitude: 6.1 })
		expect(f.form_2).toMatchObject({ area: '90', bedrooms: '3', heatingType: 4, heatingMedium: undefined, heatingEnergy: 2, furnished: true, parking: '2', elevator: true })
		expect(f.form_3.surfaces).toEqual([{ quantity: '20', description: 'Sur', area: 'Jardín', areaUnit: 1 }])
		expect(f.form_3.benefits).toEqual(['Piscina'])
		expect(f.form_4).toMatchObject({ title: 'Casa', description: 'desc', uploadedPhotos: true })
		expect(f.form_5).toMatchObject({ price: '1500', currency: 1, frecuency: 2 })
	})
	it('ida y vuelta: el DTO conserva los datos y no envía publishedById ni active', () => {
		const dto = buildUpdateDTO(formsFromProperty(initial))
		expect(dto).toMatchObject({
			title: 'Casa', content: 'desc', address: 'Rue 1', area: 90, bedrooms: 3, bathrooms: 2, price: 1500,
			heatingType: '4', heatingEnergy: '2', view: 'Mar', furnished: true, parking: 2, elevator: true, type: false, frecuency: '2',
			countryId: 2, currencyId: 1, propertyTypeId: 3,
		})
		expect(dto.Surface).toEqual([{ quantity: '20', name: 'Jardín', description: 'Sur', areaId: 1 }])
		expect(dto.NearPlace).toEqual([{ name: 'Metro', description: '' }])
		expect(dto).not.toHaveProperty('publishedById')
		expect(dto).not.toHaveProperty('active')
	})
	it('una venta guarda frecuencia 0', () => {
		const dto = buildUpdateDTO(formsFromProperty({ ...initial, type: true, frecuency: '0' }))
		expect(dto.type).toBe(true)
		expect(dto.frecuency).toBe('0')
	})
})
