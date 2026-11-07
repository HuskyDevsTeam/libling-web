import React from 'react'
import styles from './page.module.css'
import { dict } from '@/app/utils'
import { IPage } from '../layout'
import { FiCreditCard, FiHome } from 'react-icons/fi'
import { poppinsMedium } from '@/app/fonts'
import Link from 'next/link'
import { getAffiliates } from '@/server/data'
import { requireAdminPage } from '@/server/guard'
import AffiliateList from '@/app/components/admin/affiliateList'

const Affiliate: React.FC<IPage> = async props => {
  const params = await props.params;

  const {
    lang
  } = params;
  await requireAdminPage(params.lang)

  const glosary = dict[lang]?.adminAffiliate
  const glosaryNav = dict[lang]?.adminNav
  const affiliates = await getAffiliates(undefined,undefined,undefined,undefined)
  return (<>
    <div className={styles.titleBar}>
      <h1 className={styles.titleBarTitle} style={poppinsMedium.style}>{glosaryNav.affiliateTitle}</h1>
      <div className={styles.breadcrumsContainer}>
        <Link href={'/admin/affiliates'}>
          <span className={styles.breadcrumsLink}>{glosaryNav.dashboardTitle}</span>
        </Link>
        <span className={styles.breadcrumsText}>/</span>
        <span className={styles.breadcrumsText}>{glosaryNav.affiliateTitle}</span>
      </div>
    </div>
    <section className={styles.section}>
      {
        affiliates.data?.length <= 0
          ?

          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.indexTitle}</h2>
            <article className={styles.cardContent}>
              <div className={styles.emptyContainer}>
                <FiCreditCard className={styles.emptyIcon} />
                <div className={styles.emptyText}>
                  <span className={styles.emptyTitle} style={poppinsMedium.style}>{glosary.indexEmptyListTitle}</span>
                </div>
              </div>
            </article>

          </div>
          :
          <AffiliateList initialData={affiliates.data} metaData={affiliates.meta} lang={lang} />
      }

    </section>
  </>
  )
}

export default Affiliate