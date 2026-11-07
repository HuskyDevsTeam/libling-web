import React from 'react'
import styles from '../properties/page.module.css'
import { dict } from '@/app/utils'
import { IPage } from '../layout'
import { poppinsMedium } from '@/app/fonts'
import Link from 'next/link'
import { listTrash } from '@/server/data'
import { requireAdminPage } from '@/server/guard'
import { RETENTION_DAYS } from '@/server/maintenance'
import TrashList from '@/app/components/admin/trashList'

const DAY = 24 * 60 * 60 * 1000
const daysLeft = (deletedAt: Date | null) => Math.max(0, Math.ceil(RETENTION_DAYS - (Date.now() - (deletedAt?.getTime() ?? Date.now())) / DAY))

const Trash: React.FC<IPage> = async props => {
  const { lang } = await props.params
  await requireAdminPage(lang)
  const glosaryNav = dict[lang]?.adminNav
  const glosary = dict[lang]?.adminTrash
  const trash = await listTrash()
  return (<>
    <div className={styles.titleBar}>
      <h1 className={styles.titleBarTitle} style={poppinsMedium.style}>{glosary.title}</h1>
      <div className={styles.breadcrumsContainer}>
        <Link href={'/admin/dashboard'}>
          <span className={styles.breadcrumsLink}>{glosaryNav.dashboardTitle}</span>
        </Link>
        <span className={styles.breadcrumsText}>/</span>
        <span className={styles.breadcrumsText}>{glosary.title}</span>
      </div>
    </div>
    <section className={styles.section}>
      <div className={styles.card}>
        <article className={styles.cardContent}>
          <TrashList
            lang={lang}
            properties={trash.properties.map(p => ({ id: p.id, title: p.title, address: p.address, days: daysLeft(p.deletedAt) }))}
            images={trash.images.map(i => ({ id: i.id, src: i.thumbPath || i.path, propertyTitle: i.property.title, days: daysLeft(i.deletedAt) }))}
          />
        </article>
      </div>
    </section>
  </>)
}

export default Trash
