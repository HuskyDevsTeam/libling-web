'use client'
import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import Script from 'next/script'

/**
 * Consentimiento de cookies (RGPD / ePrivacy). Google Analytics NO se carga hasta que el visitante
 * lo acepta; "Rechazar" es tan visible como "Aceptar" y la eleccion se puede cambiar desde el pie de pagina.
 * La eleccion se guarda en localStorage (solo en el navegador del visitante, sin cookies propias).
 */
const KEY = 'libling-cookie-consent'
const EVENT = 'libling-cookie-consent-change'
type Choice = 'granted' | 'denied' | null

const read = (): Choice => {
    try {
        const value = window.localStorage.getItem(KEY)
        return value === 'granted' || value === 'denied' ? value : null
    } catch {
        return null
    }
}
const subscribe = (callback: () => void) => {
    window.addEventListener(EVENT, callback)
    window.addEventListener('storage', callback)
    return () => {
        window.removeEventListener(EVENT, callback)
        window.removeEventListener('storage', callback)
    }
}
const write = (value: Choice) => {
    try {
        if (value) window.localStorage.setItem(KEY, value)
        else window.localStorage.removeItem(KEY)
    } catch {
        /* sin almacenamiento: la eleccion vale solo para esta pagina */
    }
    window.dispatchEvent(new Event(EVENT))
}

/** Vuelve a mostrar el aviso para que el visitante cambie su eleccion. */
export const openCookieSettings = () => write(null)

const text = {
    es: { title: 'Cookies', body: 'Usamos cookies de analítica (Google Analytics) para mejorar el sitio. Solo se activan si las aceptas.', accept: 'Aceptar', reject: 'Rechazar', more: 'Política de privacidad' },
    en: { title: 'Cookies', body: 'We use analytics cookies (Google Analytics) to improve the site. They are only enabled if you accept.', accept: 'Accept', reject: 'Reject', more: 'Privacy policy' },
    fr: { title: 'Cookies', body: "Nous utilisons des cookies d'analyse (Google Analytics) pour améliorer le site. Ils ne sont activés que si vous les acceptez.", accept: 'Accepter', reject: 'Refuser', more: 'Politique de confidentialité' },
} as const

const button = (primary: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
    border: '1px solid #1d3557', background: primary ? '#1d3557' : '#fff', color: primary ? '#fff' : '#1d3557',
})

const CookieConsent: React.FC<{ lang: 'es' | 'en' | 'fr'; analyticsId?: string }> = ({ lang, analyticsId }) => {
    // En el servidor se asume "denegado": nunca se carga analitica antes de conocer la eleccion
    const choice = useSyncExternalStore(subscribe, read, () => 'denied' as Choice)
    const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false)
    const t = text[lang] ?? text.en
    return (
        <>
            {choice === 'granted' && analyticsId && (
                <>
                    <Script id="google-analytics-call" src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy="afterInteractive" />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${analyticsId}', { anonymize_ip: true });`}
                    </Script>
                </>
            )}
            {hydrated && choice === null && (
                <div role="dialog" aria-live="polite" aria-label={t.title} style={{ position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 1000, maxWidth: 560, margin: '0 auto', background: '#fff', color: '#1d3557', padding: 16, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,.25)' }}>
                    <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.5 }}>
                        {t.body} <Link href={`/${lang}/privacy`} style={{ textDecoration: 'underline' }}>{t.more}</Link>
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" style={button(false)} onClick={() => write('denied')}>{t.reject}</button>
                        <button type="button" style={button(true)} onClick={() => write('granted')}>{t.accept}</button>
                    </div>
                </div>
            )}
        </>
    )
}
export default CookieConsent
