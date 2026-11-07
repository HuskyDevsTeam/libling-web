'use client'
import React, { useState } from 'react'
import styles from './countrySelector.module.css'
import spainImg from '@/app/img/spain.png'
import franceImg from '@/app/img/france.png'
import englandImg from '@/app/img/england.png'
import Image from 'next/image'

export const LanguageSelector = ({ lang }: { lang: "es" | "en" | "fr" }) => {
    const flags = {
        'es': spainImg,
        'en': englandImg,
        'fr': franceImg,
    }
    const [open, setOpen] = useState(false)

    const handleClick = (currLang: string) => {
        if (currLang) {
            let currentLocation = window.location.href
            currentLocation = currentLocation.replace(`/${lang}`, `/${currLang}`)
            document.cookie = `NEXT_LOCALE=${currLang}; max-age=31536000; path=/`
            window.location.replace(currentLocation)

        }
    }
    return (
        <div className={styles.container} onBlurCapture={() => { setOpen(false) }}>
            <div className={styles.selectedLang} onClick={() => { setOpen(state => !state) }} >
                <Image alt={lang} src={flags[lang]} width={24} height={24} style={{ width: 24, height: 24 }} />
            </div>
            <div className={open ? styles.langListActive : styles.langList}>
                <div className={styles.langItem} onClick={() => { handleClick('es') }}>
                    <Image alt='esp' src={spainImg} width={24} height={24} style={{ width: 24, height: 24 }} />
                    <span className={lang === 'es' ? styles.langTitleSelected : styles.langTitle}>Español</span>
                    {/* <span className={styles.langPlaceholder}>(ES)</span> */}
                </div>
                <div className={styles.langItem} onClick={() => { handleClick('en') }}>
                    <Image alt='eng' src={englandImg} width={24} height={24} style={{ width: 24, height: 24 }} />
                    <span className={lang === 'en' ? styles.langTitleSelected : styles.langTitle}>English</span>
                    {/* <span className={styles.langPlaceholder}>(USA)</span> */}
                </div>
                <div className={styles.langItem} onClick={() => { handleClick('fr') }}>
                    <Image alt='fra' src={franceImg} width={24} height={24} style={{ width: 24, height: 24 }} />
                    <span className={lang === 'fr' ? styles.langTitleSelected : styles.langTitle}>Français</span>
                    {/* <span className={styles.langPlaceholder}>(FR)</span> */}
                </div>
            </div>
        </div>
    )
}
