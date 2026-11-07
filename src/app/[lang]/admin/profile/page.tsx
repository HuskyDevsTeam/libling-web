import React from 'react'
import styles from '../dashboard/page.module.css'
import { dict } from '@/app/utils'
import { IPage } from '../layout'
import { poppinsMedium } from '@/app/fonts'
import { auth } from '@/auth'
import ProfileForms from '@/app/components/admin/profileForms'

export const dynamic = 'force-dynamic'

const Profile: React.FC<IPage> = async props => {
  const params = await props.params;

  const {
    lang
  } = params;

  const glosary = dict[lang]?.adminNav
  const session = await auth()
  return (<>
    <div className={styles.titleBar}>
      <h1 className={styles.titleBarTitle} style={poppinsMedium.style}>{glosary.profileMenu}</h1>
    </div>
    <section className={styles.section}>
      <ProfileForms lang={lang} name={session?.user?.name ?? ''} email={session?.user?.email ?? ''} />
    </section>
  </>)
}
export default Profile
