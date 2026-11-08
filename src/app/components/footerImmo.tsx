'use client'
import React from 'react'
import { openCookieSettings } from './cookieConsent'
import styles from './footer.module.css'
import { poppinsRegular } from '../fonts'
import { RiFacebookFill, RiInstagramFill, RiLinkedinFill } from "react-icons/ri";
import { dict } from '../utils'


export default function FooterImmo({ lang }: { lang: "es" | "en" | "fr" }) {
    const glosary = dict[lang]?.footer

    return (<>
        <div className={styles.footerImmo}>
            <div className={styles.immoIconsContainer}>
                <a className={styles.iconImmo} href="https://www.facebook.com/profile.php?id=61554771181200" >
                    <RiFacebookFill />
                </a>
                <a className={styles.iconImmo} href="https://www.instagram.com/libling_solutions">
                    <RiInstagramFill />
                </a>
                <a className={styles.iconImmo} href="https://www.linkedin.com/company/libling/">
                    <RiLinkedinFill />
                </a>
            </div>
            <p className={styles.immoText} style={poppinsRegular.style}>
                Email: info@libling.lu
                <br />
                Autorisation n°10154859/0 /RCS B278845/TVA: LU35451932
                <br />
                Advice - Management and Relocation to Luxembourg
                <br />
                Libling Solutions for you

            </p>
        </div>
        <div className={styles.ribbon}>
            <div className={styles.bottomRibbon}>
                <div className={styles.ribbonHalf}>
                    <span className={styles.ribbonText}>{`© Libling 2024 | ${glosary.rights}.`}</span>
                </div>
                <div className={styles.ribbonHalf}>
                    <button type="button" onClick={openCookieSettings} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>
                        <span className={styles.ribbonTextFaded}>{glosary.cookies}</span>
                    </button>
                    <span className={styles.ribbonTextFaded}>{glosary.privacy}</span>
                    <span className={styles.ribbonTextFaded}>{glosary.terms}</span>
                </div>
            </div>
        </div>
    </>
    )
}
