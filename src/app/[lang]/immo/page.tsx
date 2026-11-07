import React from 'react'
import styles from './page.module.css'
import Image from 'next/image'
import bannerMedium from '@/app/img/immo/hero_landing_1440x900.jpg'
import { poppinsSemiBold } from '@/app/fonts'
import { dict } from '@/app/utils'
import { findPropertyTypeByCode, getPropertyTypes, indexProperty } from '@/services'
import PropertyCategory from '@/app/components/propertyCategory'
import PropertySearchForm from '@/app/components/propertySearchForm'
import { CountrySelector } from '@/app/components/countrySelector'
import { cookies } from 'next/headers'
import { countryType } from '@/app/interfaces'
interface IPage {
  params: Promise<{
    lang: "es" | "en" | "fr"
  }>
}
const Home: React.FC<IPage> = async props => {
  const params = await props.params;

  const {
    lang
  } = params;

  const fetchPropertyTypes = async () => {
    const data = await getPropertyTypes()
    const newArray = data?.map(el => ({ key: el.id, value: el.name }))
    return newArray || []
  }
  const glosary = dict[lang]?.immo
  const country = (await cookies()).get('immo-country')?.value as countryType || 'LU'
  const propertyTypes = await fetchPropertyTypes()
  const lastProperties = await indexProperty({ active: true }, { id: 'desc' })
  const saleProperties = await indexProperty({ active: true, type: true })
  const officeType = await findPropertyTypeByCode('OFFICE')
  const officeProperties = await indexProperty({ active: true, propertyTypeId: officeType?.id })
  const furnishedProperties = await indexProperty({ active: true, furnished: true })
  const bigProperties = await indexProperty({ active: true, bedrooms: { gte: 4 }, bathrooms: { gte: 3 } })

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerMask}>
          <div className={styles.textContainer}>
            <h1 className={styles.headerTitle} style={poppinsSemiBold.style}>{glosary.headerTitle}</h1>
            <p className={styles.headerDescription}>{glosary.headerDescription}</p>
          </div>
          <PropertySearchForm list={propertyTypes} lang={lang} />
        </div>


      </header>
      <section className={styles.mobileSection}>
      <CountrySelector country={country} lang={lang} dark={true}/>
        <div className={styles.textContainer}>
          <h1 className={styles.headerTitle} style={poppinsSemiBold.style}>{glosary.headerTitle}</h1>
          <p className={styles.headerDescription}>{glosary.headerDescription}</p>
        </div>
        <PropertySearchForm list={propertyTypes} lang={lang} />
      </section>
      <section className={styles.propertiesSection}>
        <PropertyCategory title={glosary.sectionTitle_1} description={glosary.sectionDescription_1} initialData={lastProperties.data} filters={{ active: true }} orderBy={{ id: 'desc' }} lang={lang} metaData={lastProperties.meta} />
        <PropertyCategory title={glosary.sectionTitle_2} description={glosary.sectionDescription_2} initialData={saleProperties.data} filters={{ active: true, type: true }} lang={lang} metaData={saleProperties.meta} />
        <PropertyCategory title={glosary.sectionTitle_3} description={glosary.sectionDescription_3} initialData={officeProperties.data} filters={{ active: true, propertyTypeId: 2 }} lang={lang} metaData={officeProperties.meta} />
        <PropertyCategory title={glosary.sectionTitle_4} description={glosary.sectionDescription_4} initialData={furnishedProperties.data} filters={{ active: true, furnished: true }} lang={lang} metaData={furnishedProperties.meta} />
        <PropertyCategory title={glosary.sectionTitle_5} description={glosary.sectionDescription_5} initialData={bigProperties.data} filters={{ active: true, bedrooms: { gte: 4 }, bathrooms: { gte: 3 } }} lang={lang} metaData={bigProperties.meta} />
      </section>
    </main>
  )
}

export default Home