
import type { Metadata, Viewport } from 'next'
import '../../globals.css'

import 'react-toastify/dist/ReactToastify.css';
import { Body } from '@/app/components/admin/body';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SIDEBAR_COOKIE } from '@/app/components/admin/sidebarCookie';



export const viewport: Viewport = {
  themeColor: '#225FE7',
}

export const metadata: Metadata = {
  title: 'Libling Solutions',
  description: 'Landing page for Libling solutions',
}
export interface IPage {
  params: Promise<{
    lang: "es" | "en" | "fr"
  }>
}
// Props sincronos para componentes hijos que reciben `params` ya resuelto
export interface IPageSync {
  params: {
    lang: "es" | "en" | "fr"
  }
}

export default async function RootLandingLayout(
  props: {
    children: React.ReactNode,
    params: Promise<{ lang: string }>
    
  }
) {
  const params = await props.params;

  const lang = params.lang as "es" | "en" | "fr";

  const {
    children
  } = props;

  const session = await auth()
  if (!session?.user) redirect(`/${lang}/auth/login`)
  // Default open on desktop; only an explicit '0' cookie means closed.
  const initialOpen = (await cookies()).get(SIDEBAR_COOKIE)?.value !== '0'
  return (
    <html id='main' lang={lang}>
      <Body lang={lang} user={session?.user} initialOpen={initialOpen}>
        {children}
      </Body>
    </html>
  )
}
