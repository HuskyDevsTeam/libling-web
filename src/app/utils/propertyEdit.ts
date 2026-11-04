import { IPropertyUpdateDTO } from '@/app/interfaces/models'

// Datos serializables (sin Decimal) con los que arranca el formulario de editar
export interface IEditInitial {
    id: number
    type: boolean
    propertyTypeId: number
    countryId: number
    address: string
    longitude?: number
    latitude?: number
    area?: number
    bedrooms?: number
    bathrooms?: number
    heatingType: string | null
    heatingMedium: string | null
    heatingEnergy: string | null
    furnished: boolean
    parking: number
    elevator: boolean
    view: string | null
    Surface: { name: string; description: string; quantity: string; areaId: number }[]
    Benefits: { name: string }[]
    NearPlace: { name: string }[]
    LegalNotice: { name: string }[]
    title: string
    content: string | null
    thumbnail: string | null
    images: { id: number; path: string }[]
    price?: number
    currencyId: number
    frecuency: string | null
}

// Forma que usan los pasos del formulario (misma que el store de registrar)
export interface IEditForms {
    form_1: { propertyType?: number; country?: number; type?: number; address?: string; longitude?: number; latitude?: number }
    form_2: { area?: string; bedrooms?: string; bathrooms?: string; heatingType?: number; heatingMedium?: number; heatingEnergy?: number; furnished?: boolean; parking?: string; elevator?: boolean }
    form_3: { view?: string | null; surfaces: { quantity: string; description: string; area: string; areaUnit: number }[]; benefits: string[]; nearPlaces: string[]; legalNotes: string[] }
    form_4: { title: string; description?: string; uploadedPhotos: boolean; faceIndex?: number }
    form_5: { price?: string; currency?: number; frecuency?: number | null }
}

const str = (n: number | undefined | null) => (n === undefined || n === null ? undefined : String(n))
const num = (s: string | null | undefined) => (s === undefined || s === null || s === '' ? undefined : Number(s))

export const formsFromProperty = (p: IEditInitial): IEditForms => ({
    form_1: { propertyType: p.propertyTypeId, country: p.countryId, type: p.type ? 1 : 0, address: p.address, longitude: p.longitude, latitude: p.latitude },
    form_2: { area: str(p.area), bedrooms: str(p.bedrooms), bathrooms: str(p.bathrooms), heatingType: num(p.heatingType), heatingMedium: num(p.heatingMedium), heatingEnergy: num(p.heatingEnergy), furnished: p.furnished, parking: str(p.parking), elevator: p.elevator },
    form_3: {
        view: p.view,
        surfaces: p.Surface.map(el => ({ quantity: el.quantity, description: el.description, area: el.name, areaUnit: el.areaId })),
        benefits: p.Benefits.map(el => el.name),
        nearPlaces: p.NearPlace.map(el => el.name),
        legalNotes: p.LegalNotice.map(el => el.name),
    },
    form_4: { title: p.title, description: p.content || '', uploadedPhotos: p.images.length > 0, faceIndex: 0 },
    form_5: { price: str(p.price), currency: p.currencyId, frecuency: num(p.frecuency) || null },
})

// Mismo mapeo que usa registrar al crear; no envía publishedById ni active
export const buildUpdateDTO = (f: Partial<IEditForms>): IPropertyUpdateDTO => ({
    title: f.form_4?.title || '',
    content: f.form_4?.description,
    address: f.form_1?.address || '',
    longitude: f.form_1?.longitude,
    latitude: f.form_1?.latitude,
    area: parseInt(f.form_2?.area || '0'),
    bedrooms: parseInt(f.form_2?.bedrooms || '0'),
    bathrooms: parseInt(f.form_2?.bathrooms || '0'),
    price: parseInt(f.form_5?.price || '0'),
    heatingType: (f.form_2?.heatingType || 0).toString(),
    heatingMedium: (f.form_2?.heatingMedium || 0).toString(),
    heatingEnergy: (f.form_2?.heatingEnergy || 0).toString(),
    view: f.form_3?.view || '',
    furnished: !!f.form_2?.furnished,
    parking: parseInt(f.form_2?.parking || '0'),
    elevator: !!f.form_2?.elevator,
    type: !!f.form_1?.type,
    frecuency: (f.form_5?.frecuency || 0).toString(),
    countryId: parseInt(f.form_1?.country?.toString() || '0'),
    currencyId: parseInt(f.form_5?.currency?.toString() || '0'),
    propertyTypeId: parseInt(f.form_1?.propertyType?.toString() || '0'),
    Surface: (f.form_3?.surfaces || []).map(el => ({ quantity: el.quantity, name: el.area, description: el.description, areaId: parseInt(el.areaUnit?.toString()) })),
    Benefits: (f.form_3?.benefits || []).map(name => ({ name })),
    NearPlace: (f.form_3?.nearPlaces || []).map(name => ({ name, description: '' })),
    LegalNotice: (f.form_3?.legalNotes || []).map(name => ({ name })),
})
