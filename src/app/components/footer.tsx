'use client'
import React, { SyntheticEvent, useState } from 'react'
import styles from './footer.module.css'
import { poppinsMedium, poppinsRegular, poppinsSemiBold } from '../fonts'
import { RiFacebookFill, RiInstagramFill, RiLinkedinFill } from "react-icons/ri";
import { dict } from '../utils'
import { sendFooterMessage } from '@/mailActions'
import { useAntiSpam } from './antiSpam'
import CustomToast from './toast'
import { toast } from 'react-toastify'
import Link from 'next/link';


export default function Footer({ lang }: { lang: "es" | "en" | "fr" }) {
    const glosary = dict[lang]?.footer
    const glosaryForms = dict[lang]?.adminProperties
    const glosaryAuth = dict[lang]?.auth
    const glosaryContact = dict[lang]?.contact
    const glosaryImmo = dict[lang]?.immo
    const glosaryHome = dict[lang]?.home
    const glosaryNav = dict[lang]?.navbar
    const mailMessages = dict[lang]?.mail
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState<boolean | undefined>();
    const spam = useAntiSpam()


    const handleClick = (currLang: string) => {
        console.log(lang, currLang)
        let currentLocation = window.location.href
        console.log('current location', currentLocation)
        currentLocation = currentLocation.replace(`/${lang}`, `/${currLang}`)
        console.log('new location', currentLocation)
        document.cookie = `NEXT_LOCALE=${currLang}; max-age=31536000; path=/`
        console.log(document.cookie)
        window.location.href = currentLocation
    }
    const handleSubmit = async (event: SyntheticEvent) => {
        if (loading) { return }
        event.preventDefault()
        setLoading(true)
        try{
            const result = await sendFooterMessage({ email: inputValue, lang, ...spam.read() })
            spam.reset()
            if (!result.ok) throw new Error(result.reason)
            toast.success(<CustomToast type='success' title={glosaryImmo.success} content={glosaryImmo.successEmail} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })

        }catch(error){
            console.error(error)
            toast.error(<CustomToast type='error' title='Error' content={glosaryImmo.failEmail} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        }finally{
            setLoading(undefined)
            setInputValue('')
        }
    }
    return (<>
        <div className={styles.footer}>
            <div className={styles.footerContainer}>
                <div className={styles.contactInfo}>
                    <h3 style={poppinsSemiBold.style}>{glosary.title_1}</h3>
                    <p>
                        Advice - Management and relocation service in Luxembourg
                        <br />
                        <br />
                        27 Bd Prince Henri L-1724  Luxembourg
                        <br />
                        <a href="mailto:Info@libling.lu" target='_blank'>
                        Info@libling.lu 
                        </a>
                        /
                        <a href="mailto:Affiliate@libling.lu" target='_blank'>
                        Affiliate@libling.lu 
                        </a>
                        /
                        <a href="mailto:Immo@libling.lu" target='_blank'>
                        Immo@libling.lu 
                        </a>
                        <br />
                        <a href="tel:+352691367757" target='_blank'>Telephone : +352 691 367 757 </a>
                         /
                        <a href="http://wa.me/+352691367757" target='_blank'> WhatsApp : Libling Solutions</a>
                        <br />
                        Banque
                        <br />
                        BIC: BGLLLULL
                        <br />
                        IBAN: LU89 0030 6821 2959 0000  
                        <br />
                        Etablissement: 10154859|0   Matricule: 20232434385 
                        <br />
                        TVA: LU35451932  RCS: B278845
                        <br />
                    </p>

                </div>
                <ul>
                    <li><Link href={'/'}>{glosaryNav.link_2}</Link></li>
                    <li><Link href={'/immo'}>{'Immo'}</Link></li>
                    <li><Link href={'/about'}>{glosaryNav.link_1}</Link></li>
                    <li><Link href={'/contact'}>{glosaryNav.link_4}</Link></li>
                    <li><Link href={'/services'}>{glosaryNav.link_3}</Link></li>
                </ul>
                {/* <div className={styles.luxemburgContainer}>
                    <Image src={luxemburgImg} alt='madeInLuxemburg' width={96} height={77} />
                    
                </div> */}
                <div className={styles.contactInfo}>
                    <h4 style={{ ...poppinsMedium.style, maxWidth: 300, padding: 0 }} >{glosary.title_2}</h4>
                    <form onSubmit={handleSubmit} className={styles.formEmail}>
                        <div className={styles.formControl}>
                            <label htmlFor="emailInput" style={poppinsMedium.style} className={styles.label}>{glosaryAuth.login_email}</label>
                            <div className={styles.inputContainer}>
                                <input type="email" name="some" id="emailInput" placeholder={glosaryForms.formPlaceholderText} className={styles.input} value={inputValue} disabled={loading} style={poppinsRegular.style}
                                    onChange={(e) => setInputValue(e.target.value)} required />
                            </div>
                        </div>
                        {spam.field}
                        <button disabled={loading} style={poppinsMedium.style}>{loading ? <span className={styles.loader}></span> : <span>{glosaryContact.form_button}</span>}</button>
                    </form>
                    <div className={styles.socialContainer} style={{ maxWidth: 300 }}>
                        <h5 style={poppinsMedium.style}>{glosary.title_3}</h5>
                        <div className={styles.socialIconsContainer}>
                            <a className={styles.icon} href="https://www.facebook.com/profile.php?id=61554771181200" >
                                <RiFacebookFill />
                            </a>
                            <a className={styles.icon} href="https://www.instagram.com/libling_solutions">
                                <RiInstagramFill />
                            </a>
                            <a className={styles.icon} href="https://www.linkedin.com/company/libling/">
                                <RiLinkedinFill />
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div className={styles.ribbon}>
            <div className={styles.bottomRibbon}>
                <div className={styles.ribbonHalf}>
                    <span className={styles.ribbonText}>{`© Libling 2024 | ${glosary.rights}.`}</span>
                </div>
                <div className={styles.ribbonHalf}>
                    {/* <span className={styles.ribbonTextFaded}>{glosary.cookies}</span> */}
                    <Link href={'/privacy'}>
                        <span className={styles.ribbonTextFaded}>{glosary.privacy}</span>
                    </Link>
                    <Link href={'/terms'}>
                        <span className={styles.ribbonTextFaded}>{glosary.terms}</span>
                    </Link>
                </div>
            </div>
        </div>
    </>
    )
}
