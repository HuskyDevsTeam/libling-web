import type { Metadata, Viewport } from 'next'
import '../../globals.css'
import { poppinsRegular } from '../../fonts'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './layout.module.css'
import { LanguageSelector } from '@/app/components/languageSelector';




export const viewport: Viewport = {
  themeColor: '#225FE7',
}

export const metadata: Metadata = {
  title: 'Libling Solutions',
  description: 'login for Libling solutions admin',
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
    <html lang={lang}>
      <body style={poppinsRegular.style} className={styles.layout}>
        <ToastContainer />
        <div className={styles.floatSelector}>
          <LanguageSelector lang={lang} />
        </div>
        {children}
      </body>
    </html>
  )
}
