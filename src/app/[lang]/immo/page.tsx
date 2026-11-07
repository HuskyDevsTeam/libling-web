import React from 'react'
import styles from './page.module.css'
import Image from 'next/image'
import bannerMedium from '@/app/img/immo/hero_landing_1440x900.jpg'
import { poppinsSemiBold } from '@/app/fonts'
import { dict } from '@/app/utils'
import { findPropertyTypeByCode, getPropertyTypes, indexProperty } from '@/server/data'
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

  const glosary = dict[lang]?.immo
  const bigFilters = { active: true, bedrooms: { gte: 4 }, bathrooms: { gte: 3 } }
  // Todo lo que necesita la portada se pide a la vez (antes eran 8 esperas una detras de otra)
  const [country, types, lastProperties, saleProperties, officeType, furnishedProperties, bigProperties] = await Promise.all([
    cookies().then(c => (c.get('immo-country')?.value as countryType) || 'LU'),
    getPropertyTypes(),
    indexProperty({ active: true }, { id: 'desc' }, 1, 15, true, 'card'),
    indexProperty({ active: true, type: true }, {}, 1, 15, true, 'card'),
    findPropertyTypeByCode('OFFICE'),
    indexProperty({ active: true, furnished: true }, {}, 1, 15, true, 'card'),
    indexProperty(bigFilters, {}, 1, 15, true, 'card'),
  ])
  const propertyTypes = types?.map(el => ({ key: el.id, value: el.name })) || []
  const officeFilters = { active: true, propertyTypeId: officeType?.id ?? -1 }
  const officeProperties = await indexProperty(officeFilters, {}, 1, 15, true, 'card')

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
        <PropertyCategory title={glosary.sectionTitle_3} description={glosary.sectionDescription_3} initialData={officeProperties.data} filters={officeFilters} lang={lang} metaData={officeProperties.meta} />
        <PropertyCategory title={glosary.sectionTitle_4} description={glosary.sectionDescription_4} initialData={furnishedProperties.data} filters={{ active: true, furnished: true }} lang={lang} metaData={furnishedProperties.meta} />
        <PropertyCategory title={glosary.sectionTitle_5} description={glosary.sectionDescription_5} initialData={bigProperties.data} filters={bigFilters} lang={lang} metaData={bigProperties.meta} />
      </section>
    </main>
  )
}

export default Home