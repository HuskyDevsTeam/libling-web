'use client'
import React from 'react'
import styles from './headerContact.module.css'
import globalStyles from '@/app/globals.module.css'
import Image from 'next/image';
import headerImg1 from '@/app/img/contact_banner.webp'
import headerImg1_1 from '@/app/img/banner_contact_mobile.webp'
import headerImg1_2 from '@/app/img/banner_contactanos_1920.webp'
import { dict } from '../utils';
import { poppinsMedium, poppinsSemiBold } from '../fonts';
import useWindowDimensions from '../hooks/useWindowDimensions';
interface IHeader {
    lang: "es" | "en" | "fr"
}
const HeaderContact:React.FC<IHeader> = ({lang}) => {
    const glosary = dict[lang]?.contact
    const { height, width } = useWindowDimensions();

    return (
        <>
            <div className={styles.sliderItem}>
                {
                    (width !== null && width <= 500)
                    ?
                    <Image src={headerImg1_1} alt='header image' width={360} height={580} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100} sizes="(max-width: 360px) 100vw, 360px" className={styles.sliderImage}/>
                    :
                    (width !== null && width > 500 && width <= 1440)
                    ?
                    <Image src={headerImg1} alt='header image' width={1440} height={450} priority={true} style={{ objectFit: 'cover', objectPosition: 'right center' }} quality={100} sizes="(max-width: 1440px) 100vw, 1440px" className={styles.sliderImage}/>
                    :
                    <Image src={headerImg1_2} alt='header image' width={1920} height={500} priority={true} style={{ objectFit: 'cover', objectPosition: 'right bottom' }} quality={100} sizes="(max-width: 1920px) 100vw, 1920px" className={styles.sliderImage}/>

                }
                <div className={styles.sliderTextContainer}>
                    <h4 className={globalStyles.miniTitle} style={{...poppinsSemiBold.style, color:'#56B7FF'}}>{glosary.miniTitleHeader1}</h4>
                    <h2 className={[globalStyles.boldTitle, globalStyles.textNegative].join(' ')} style={poppinsSemiBold.style}><span>{glosary.bigTitleHeader1}</span></h2>
                </div>
            </div>
        </>
    )
}

export default HeaderContact