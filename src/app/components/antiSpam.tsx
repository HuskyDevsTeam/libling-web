'use client'
import React, { useCallback, useEffect, useRef } from 'react'
import { getCaptchaSiteKey } from '@/mailActions'

declare global {
    interface Window {
        turnstile?: {
            render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void }) => string
            reset: (id?: string) => void
        }
    }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/**
 * Proteccion anti-bots de los formularios publicos:
 *  - un campo "website" invisible (trampa: los bots lo rellenan, las personas no),
 *  - Cloudflare Turnstile cuando el servidor tiene las claves configuradas (si no, no se muestra nada).
 * Uso: const spam = useAntiSpam(); ... {spam.field} ... mail({ ...datos, ...spam.read() }); spam.reset()
 */
export function useAntiSpam() {
    const honeypot = useRef<HTMLInputElement>(null)
    const container = useRef<HTMLDivElement>(null)
    const token = useRef<string>('')
    const widgetId = useRef<string | undefined>(undefined)

    useEffect(() => {
        let cancelled = false
        getCaptchaSiteKey().then((siteKey) => {
            if (!siteKey || cancelled || !container.current) return
            const mount = () => {
                if (cancelled || !container.current || !window.turnstile || widgetId.current) return
                widgetId.current = window.turnstile.render(container.current, {
                    sitekey: siteKey,
                    callback: (t) => { token.current = t },
                    'expired-callback': () => { token.current = '' },
                })
            }
            if (window.turnstile) return mount()
            let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
            if (!script) {
                script = document.createElement('script')
                script.src = SCRIPT_SRC
                script.async = true
                document.head.appendChild(script)
            }
            script.addEventListener('load', mount)
        }).catch(() => undefined)
        return () => { cancelled = true }
    }, [])

    const read = useCallback(() => ({ website: honeypot.current?.value ?? '', captchaToken: token.current }), [])
    const reset = useCallback(() => {
        token.current = ''
        if (widgetId.current) window.turnstile?.reset(widgetId.current)
    }, [])

    const field = (
        <>
            <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                <label>Website<input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
            </div>
            <div ref={container} />
        </>
    )
    return { field, read, reset }
}
