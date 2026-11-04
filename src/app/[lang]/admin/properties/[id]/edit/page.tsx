import React from 'react'
import { notFound } from 'next/navigation'
import { showProperty } from '@/services'
import { IEditInitial } from '@/app/utils/propertyEdit'
import EditWizard from './editWizard'

interface IEdit {
    params: {
        id: string
        lang: "es" | "en" | "fr"
    }
}

const Edit: React.FC<IEdit> = async ({ params: { id, lang } }) => {
    const propertyId = parseInt(id)
    if (Number.isNaN(propertyId)) notFound()
    const property = await showProperty({ id: propertyId })
    if (!property) notFound()
    // Solo datos serializables: los Decimal de Prisma no pasan a componentes cliente
    const initial: IEditInitial = {
        id: property.id,
        type: property.type,
        propertyTypeId: property.propertyTypeId,
        countryId: property.countryId,
        address: property.address,
        longitude: property.longitude?.toNumber(),
        latitude: property.latitude?.toNumber(),
        area: property.area?.toNumber(),
        bedrooms: property.bedrooms?.toNumber(),
        bathrooms: property.bathrooms?.toNumber(),
        heatingType: property.heatingType,
        heatingMedium: property.heatingMedium,
        heatingEnergy: property.heatingEnergy,
        furnished: property.furnished,
        parking: property.parking,
        elevator: property.elevator,
        view: property.view,
        Surface: property.Surface.map(el => ({ name: el.name, description: el.description, quantity: el.quantity, areaId: el.areaId })),
        Benefits: property.Benefits.map(el => ({ name: el.name })),
        NearPlace: property.NearPlace.map(el => ({ name: el.name })),
        LegalNotice: property.LegalNotice.map(el => ({ name: el.name })),
        title: property.title,
        content: property.content,
        thumbnail: property.thumbnail,
        images: property.PropertyImage.map(el => ({ id: el.id, path: el.path })),
        price: property.price?.toNumber(),
        currencyId: property.currencyId,
        frecuency: property.frecuency,
    }
    return <EditWizard lang={lang} initial={initial} />
}

export default Edit
