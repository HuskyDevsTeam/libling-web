import React from 'react'
import { notFound } from 'next/navigation'
import { dict } from '@/app/utils'
import { showProperty } from '@/services'
import InnerNav from '@/app/components/innerNav'
import EditForm from './editForm'

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
    const glosary = dict[lang].adminProperties
    const initial = {
        id: property.id,
        title: property.title,
        content: property.content || '',
        address: property.address,
        price: property.price?.toString() || '',
        area: property.area?.toString() || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        view: property.view || '',
        furnished: property.furnished,
        active: property.active,
        benefits: property.Benefits.map(el => el.name).join('\n'),
        nearPlaces: property.NearPlace.map(el => el.name).join('\n'),
        legalNotes: property.LegalNotice.map(el => el.name).join('\n'),
    }
    return (<>
        <InnerNav text={glosary.editTitle} admin={true} />
        <EditForm lang={lang} initial={initial} />
    </>)
}

export default Edit
