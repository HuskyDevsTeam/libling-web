import { IPropertyUpdateDTO } from '@/app/interfaces/models'

export interface IPropertyEditValues {
    title: string
    content: string
    address: string
    price: string
    area: string
    bedrooms: string
    bathrooms: string
    view: string
    furnished: boolean
    active: boolean
    benefits: string
    nearPlaces: string
    legalNotes: string
}

/** "a\n b \n\n c" -> ["a", "b", "c"] */
export const linesToList = (text: string): string[] =>
    text.split('\n').map(el => el.trim()).filter(el => el.length > 0)

export const listToLines = (list: { name: string }[] | undefined): string =>
    (list || []).map(el => el.name).join('\n')

const toNumber = (value: string): number | undefined => {
    if (value.trim() === '') return undefined
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
}

export const buildUpdateDTO = (values: IPropertyEditValues): IPropertyUpdateDTO => ({
    title: values.title.trim(),
    content: values.content,
    address: values.address.trim(),
    price: toNumber(values.price),
    area: toNumber(values.area),
    bedrooms: toNumber(values.bedrooms),
    bathrooms: toNumber(values.bathrooms),
    view: values.view,
    furnished: values.furnished,
    active: values.active,
    Benefits: linesToList(values.benefits).map(name => ({ name })),
    NearPlace: linesToList(values.nearPlaces).map(name => ({ name, description: '' })),
    LegalNotice: linesToList(values.legalNotes).map(name => ({ name })),
})
