import React from 'react'
import styles from './page.module.css'
import { dict } from '@/app/utils'
import { IPage } from '../layout'
import { FiCheckCircle, FiEdit3, FiHome, FiUsers } from 'react-icons/fi'
import { poppinsMedium } from '@/app/fonts'
import { auth } from '@/auth'
import { getDashboardStats } from '@/services'

export const dynamic = 'force-dynamic'

const Dashboard: React.FC<IPage> = async ({ params: { lang } }) => {
  const glosary = dict[lang]?.adminDashboard
  const glosaryNav = dict[lang]?.adminNav
  const session = await auth()
  const stats = await getDashboardStats()
  const hour = parseInt(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Europe/Luxembourg' }).format(new Date()), 10) % 24
  const greeting = hour < 12 ? glosary.greetingMorning : hour < 19 ? glosary.greetingAfternoon : glosary.greetingEvening
  const firstName = session?.user?.name?.split(' ')[0]
  const widgets = [
    { label: glosary.widgetProperties, value: stats.properties, icon: FiHome, color: '#225FE7' },
    { label: glosary.widgetActive, value: stats.active, icon: FiCheckCircle, color: '#00A651' },
    { label: glosary.widgetDraft, value: stats.draft, icon: FiEdit3, color: '#F29900' },
    { label: glosary.widgetAffiliates, value: stats.affiliates, icon: FiUsers, color: '#7B3FE4' },
  ]
  return (<>
    <div className={styles.titleBar}>
      <h1 className={styles.titleBarTitle} style={poppinsMedium.style}>{glosaryNav.dashboardTitle}</h1>
    </div>
    <section className={styles.section}>
      <div className={styles.greeting}>
        <h2 className={styles.greetingTitle} style={poppinsMedium.style}>{greeting}{firstName ? `, ${firstName}` : ''}</h2>
        <p className={styles.greetingSubtitle}>{glosary.subtitle}</p>
      </div>
      <div className={styles.widgets}>
        {widgets.map((el, index) => (
          <article key={index} className={styles.widget} data-testid={`dashboard-widget-${index}`}>
            <div className={styles.widgetIcon} style={{ color: el.color, backgroundColor: `${el.color}1A` }}>
              <el.icon />
            </div>
            <div className={styles.widgetText}>
              <span className={styles.widgetValue} style={poppinsMedium.style}>{el.value}</span>
              <span className={styles.widgetLabel}>{el.label}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  </>)
}

export default Dashboard
