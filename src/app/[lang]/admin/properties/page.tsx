import React from 'react'
import styles from './page.module.css'
import globalStyles from '@/app/globals.module.css'
import { dict } from '@/app/utils'
import { IPage } from '../layout'
import { FiHome } from 'react-icons/fi'
import { poppinsMedium } from '@/app/fonts'
import Link from 'next/link'
import { Button } from '@/app/components/admin/button'
import PropertyList from '@/app/components/admin/propertyList'
import { indexProperty } from '@/server/data'
import { requireAdminPage } from '@/server/guard'

const Properties: React.FC<IPage> = async props => {
  const params = await props.params;

  const {
    lang
  } = params;
  await requireAdminPage(params.lang)

  const glosary = dict[lang]?.adminProperties
  const glosaryNav = dict[lang]?.adminNav
  const properties = await indexProperty(undefined,undefined,undefined,undefined,false,true)
  return (<>
    <div className={styles.titleBar}>
      <h1 className={styles.titleBarTitle} style={poppinsMedium.style}>{glosaryNav.propertiesTitle}</h1>
      <div className={styles.breadcrumsContainer}>
        <Link href={'/admin/properties'}>
          <span className={styles.breadcrumsLink}>{glosaryNav.dashboardTitle}</span>
        </Link>
        <span className={styles.breadcrumsText}>/</span>
        <span className={styles.breadcrumsText}>{glosaryNav.propertiesTitle}</span>
      </div>
    </div>
    <section className={styles.section}>
      {
        properties.data?.length <= 0
          ?

          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.indexTitle}</h2>
            <article className={styles.cardContent}>
              <div className={styles.emptyContainer}>
                <FiHome className={styles.emptyIcon} />
                <div className={styles.emptyText}>
                  <span className={styles.emptyTitle} style={poppinsMedium.style}>{glosary.indexEmptyListTitle}</span>
                  <span className={styles.emptyDescription}>{glosary.indexEmptyListDescription}</span>
                </div>
                <Button title={glosary.formButtonRegister} goTo={'/admin/properties/create'} type='main' />
              </div>
            </article>

          </div>
          :
          <PropertyList initialData={properties.data} metaData={properties.meta} lang={lang} />
      }

    </section>
  </>
  )
}

export default Properties