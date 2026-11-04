
import type { Metadata } from 'next'
import '../../globals.css'

import 'react-toastify/dist/ReactToastify.css';
import { Body } from '@/app/components/admin/body';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { SIDEBAR_COOKIE } from '@/app/components/admin/sidebarCookie';



export const metadata: Metadata = {
  title: 'Libling Solutions',
  description: 'Landing page for Libling solutions',
}
export interface IPage {
  params: {
    lang: "es" | "en" | "fr"
  }
}

export default async function RootLandingLayout({
  children,
  params: { lang }
}: {
  children: React.ReactNode,
  params: { lang: "es" | "en" | "fr" }
  
}) {
  const session = await auth()
  // Default open on desktop; only an explicit '0' cookie means closed.
  const initialOpen = cookies().get(SIDEBAR_COOKIE)?.value !== '0'
  return (
    <html id='main' lang={lang}>
      <Body lang={lang} user={session?.user} initialOpen={initialOpen}>
        {children}
      </Body>
    </html>
  )
}
