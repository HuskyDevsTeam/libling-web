import React from 'react'
import styles from './page.module.css'
import { dict } from '@/app/utils'
import { findPropertyType, indexProperty } from '@/server/data'
import InnerNav from '@/app/components/innerNav'
import { poppinsMedium } from '@/app/fonts'
import { rentPaymentPeriods } from '@/app/utils/data'
import PropertyCard from '@/app/components/propertyCard'
import Pagination from '@/app/components/pagination'
import { dataTranslate } from '@/app/interfaces'

interface ISearch {
    params: Promise<{
        lang: "es" | "en" | "fr"
    }>,
    searchParams: { [key: string]: string | string[] | undefined }

}

const Search: React.FC<ISearch> = async props => {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const {
        lang
    } = params;

    const filters = {
        type: !!searchParams?.type && typeof searchParams?.type === 'string' && parseInt(searchParams?.type) ? true : false,
        propertyTypeId: !!searchParams?.propertyType && typeof searchParams?.propertyType === 'string' ? parseInt(searchParams?.propertyType) : undefined,
        address: !!searchParams?.address && typeof searchParams?.address === 'string' ? searchParams?.address : undefined,
        active:true

    }
    const page = !!searchParams?.page && typeof searchParams?.page === 'string' && parseInt(searchParams?.page) ? parseInt(searchParams?.page) : undefined
    const glosaryData = dict[lang].data
    const propertyType = await findPropertyType(filters.propertyTypeId || 0)
    const propertyTypeName = propertyType && propertyType.name in glosaryData ? glosaryData[propertyType.name as dataTranslate] : null
    const response = await indexProperty(filters, {}, page, undefined, true, 'card')
    const properties = response.data
    const pagination = response.meta
    const glosary = dict[lang].immo
    const glosaryNav = dict[lang].navbar
    const glosaryAdmin = dict[lang].adminProperties
    const urlQuery = new URLSearchParams('')
    urlQuery.set('type', searchParams?.type?.toString() || '')
    urlQuery.set('propertyType', searchParams?.propertyType?.toString() || '')
    urlQuery.set('address', searchParams?.address?.toString() || '')


    return (<>
        <InnerNav text={glosary.backSearch} />
        <div className={styles.container}>
            <div className={styles.titleContainer}>
                <h1 className={styles.title} style={poppinsMedium.style}>{`${propertyTypeName || glosaryNav.admin_1} ${glosary.miniatureConector} ${filters.type ? glosaryAdmin.formLabelSale.toLowerCase() : glosaryAdmin.formLabelRent.toLowerCase()} ${filters.address ? glosary.altConector : ''} ${filters.address ? filters.address : ''}`}</h1>
                <span className={styles.subtitle}>{`${pagination.totalData} ${glosary.results} - ${glosary.page} ${pagination.page}`}</span>

            </div>
            <div className={styles.cardContainer}>
                {
                    properties.map((el, index) => (
                        <PropertyCard key={index} slug={el.slug} location={el.country.name} currency={el.currency.symbol} price={el.price} frecuency={el.frecuency ? rentPaymentPeriods.find(element => el.frecuency?.toString() === element.key.toString())?.value : undefined} subtitle={`${el.propertyType.name in glosaryData ? glosaryData[el.propertyType.name as dataTranslate] : el.propertyType.name} ${glosary.miniatureConector} ${el.type ? glosaryAdmin.formLabelSale.toLocaleLowerCase() : glosaryAdmin.formLabelRent.toLocaleLowerCase()}`} area={`${el.area} m${"\u00B2"}`} bedrooms={el.bedrooms?.toString()} bathrooms={el.bathrooms?.toString()} thumbnail={el.thumbnail?.toString()} />
                    ))
                }
            </div>
            <Pagination pagination={pagination} searchParams={urlQuery.toString()} url={'/immo/search'} />
        </div>
    </>
    )
}

export default Search