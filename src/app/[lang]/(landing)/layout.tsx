import type { Metadata } from 'next'
import '../../globals.css'
import Navbar from '../../components/navbar'
import { poppinsRegular } from '../../fonts'
import Footer from '@/app/components/footer'
import styles from '@/app/[lang]/(landing)/page.module.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CookieConsent from '@/app/components/cookieConsent'




export const metadata: Metadata = {
  title: 'Relocation - Luxembourg | Libling Solutions',
  description: 'Travel to Luxembourg, providing you with comprehensive service and optimal support in your relocation process to Luxembourg. We are by your side to assist you with whatever you need',
  robots: 'index, follow',
  keywords: ['relocation', 'relocation help', 'experiences on Luxembourg', 'Luxembourg country', 'Libling', 'assist to relocation', 'support to your relocation', 'multilanguages relocation page', 'secure relocation to Luxembourg', 'easy relocation', 'real state on Luxembourg', 'travel to Luxembourg', 'Best option to relocate to Luxembourg', "Relocación","Ayuda para la reubicación","Experiencias en Luxemburgo","Luxemburgo (país)","Asistencia para la reubicación","Apoyo para tu reubicación","Página de reubicación multilingüe","Mudanza segura a Luxemburgo","Mudanza fácil","Bienes raíces en Luxemburgo","Viajar a Luxemburgo","La mejor opción para reubicarse en Luxemburgo","Latinos en Luxemburgo"],
  alternates:
  {
    canonical: "https://libling.lu",
    languages: {
      en: "https://libling.lu/en",
      es: "https://libling.lu/es",
      fr: "https://libling.lu/fr",
    }
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

  return (
    <html id='main' lang={lang}>
      <body style={poppinsRegular.style} className={styles.layout}>
        <ToastContainer />
        <Navbar lang={lang} />
        {children}
        <Footer lang={lang} />
        <CookieConsent lang={lang} analyticsId={process.env.GOOGLE_ANALYTICS || undefined} />
      </body>
    </html>
  )
}
