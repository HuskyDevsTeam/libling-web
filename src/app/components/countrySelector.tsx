'use client'
import React, { useEffect, useState } from 'react'
import styles from './countrySelector.module.css'
import spainImg from '@/app/img/spain.png'
import luxemburgImg from '@/app/img/luxembourg.png'
import emiratesImg from '@/app/img/united-arab-emirates.png'
import earthImg from '@/app/img/earth.png'
import Image from 'next/image'
import { ICountry, ILang, countryType } from '../interfaces'
import { dict } from '../utils'
import { setCookie } from 'cookies-next'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { poppinsMedium } from '../fonts'
import { useRouter } from 'next/navigation'

export const CountrySelector = ({ country, lang, dark = false }: ICountry & ILang & { dark?: boolean }) => {
    const flags = {
        'ES': spainImg,
        'AE': emiratesImg,
        'LU': luxemburgImg,
        'ALL': earthImg,
    }
    const [open, setOpen] = useState(false)
    const [currentCountry, setCurrentCountry] = useState<countryType | undefined>(country)
    const glosary = dict[lang].immo
    const router = useRouter()

    const handleClick = (currCountry: countryType) => {
        if (currCountry in flags) {
            setCurrentCountry(currCountry)
            setCookie('immo-country', currCountry)
            setOpen(false)
            // router.refresh()
            window.location.reload()
        }
    }
    return (<>
        {
            !!currentCountry &&
            <div className={styles.container} onBlurCapture={() => { setOpen(false) }}>
                <div className={styles.selectedLangImmo} onClick={() => { setOpen(state => !state) }} >
                    <Image alt={currentCountry} src={flags[currentCountry]} width={24} height={24} className={styles.flag} />
                    {
                        currentCountry === 'ES' && <span className={dark ? styles.langHeaderAlt : styles.langHeader} style={poppinsMedium.style}>{glosary.spain}</span>
                    }
                    {
                        currentCountry === 'AE' && <span className={dark ? styles.langHeaderAlt : styles.langHeader} style={poppinsMedium.style}>{glosary.emirates}</span>
                    }
                    {
                        currentCountry === 'LU' && <span className={dark ? styles.langHeaderAlt : styles.langHeader} style={poppinsMedium.style}>{glosary.luxemburg}</span>
                    }
                    {
                        currentCountry === 'ALL' && <span className={dark ? styles.langHeaderAlt : styles.langHeader} style={poppinsMedium.style}>{glosary.earth}</span>
                    }
                    {
                        !!open
                            ?
                            <FiChevronUp className={dark ? styles.iconAlt : styles.icon} />
                            :
                            <FiChevronDown className={dark ? styles.iconAlt : styles.icon} />
                    }
                </div>
                <div className={open ? styles.langListActive : styles.langList}>
                    <div className={styles.countryItem} onClick={() => { handleClick('LU') }}>
                        <Image alt='lux' src={luxemburgImg} width={24} height={24} className={styles.flag} />
                        <span className={currentCountry === 'LU' ? styles.langTitleSelected : styles.langTitle}>{glosary.luxemburg}</span>
                    </div>
                    <div className={styles.countryItem} onClick={() => { handleClick('ES') }}>
                        <Image alt='esp' src={spainImg} width={24} height={24} className={styles.flag} />
                        <span className={currentCountry === 'ES' ? styles.langTitleSelected : styles.langTitle}>{glosary.spain}</span>
                    </div>
                    <div className={styles.countryItem} onClick={() => { handleClick('AE') }}>
                        <Image alt='aeu' src={emiratesImg} width={24} height={24} className={styles.flag} />
                        <span className={currentCountry === 'AE' ? styles.langTitleSelected : styles.langTitle}>{glosary.emirates}</span>
                    </div>
                    <div className={styles.countryItem} onClick={() => { handleClick('ALL') }}>
                        <Image alt='all' src={earthImg} width={24} height={24} className={styles.flag} />
                        <span className={currentCountry === 'ALL' ? styles.langTitleSelected : styles.langTitle}>{glosary.earth}</span>
                    </div>
                </div>
            </div>
        }
    </>
    )
}
