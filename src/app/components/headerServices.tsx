'use client'
import React from 'react'
import styles from './headerServices.module.css'
import globalStyles from '@/app/globals.module.css'
import Image from 'next/image';
import headerImg1 from '@/app/img/services_header_1440.webp'
import headerImg2 from '@/app/img/banner_services_mobile_1.webp'
import headerImg3 from '@/app/img/banner_servicios_1920.webp'
import { dict } from '../utils';
import { poppinsBold, poppinsRegular } from '../fonts';
import useWindowDimensions from '../hooks/useWindowDimensions';
interface IHeader {
    lang: "es" | "en" | "fr"
}
const HeaderServices:React.FC<IHeader> = ({lang}) => {
    const glosary = dict[lang]?.services
    const { height, width } = useWindowDimensions();


    return (
        <>
            <div className={styles.sliderItem}>
                {
                    (width !== null && width <= 500)
                    ?
                    <Image src={headerImg2} alt='header image' width={360} height={580} priority={true} style={{ objectFit: 'cover', objectPosition: 'bottom center' }} quality={100} sizes="(max-width: 360px) 100vw, 360px" className={styles.sliderImage}/>
                    :
                    (width !== null && width > 500 && width <= 1440)
                        ?
                        <Image src={headerImg1} alt='header image' width={1440} height={450} priority={true} style={{ objectFit: 'cover', objectPosition: 'right center' }} quality={100} sizes="(max-width: 1440px) 100vw, 1440px" className={styles.sliderImage}/>
                        :
                        <Image src={headerImg3} alt='header image' width={1920} height={500} priority={true} style={{ objectFit: 'cover', objectPosition: 'right bottom' }} quality={100} sizes="(max-width: 1920px) 100vw, 1920px" className={styles.sliderImage}/>
                }
                <div className={styles.sliderTextContainer}>
                    <h2 className={globalStyles.boldTitle} style={{...poppinsRegular.style, color:'#000000DE'}}><span>{glosary.bigTitleHeader1_1}</span></h2>
                    <p className={globalStyles.commonText}><span>{glosary.commonHeader1}</span><span className={globalStyles.textPrimary} style={poppinsBold.style}>{glosary.commonHeader2}</span><span>{glosary.commonHeader3}</span></p>
                </div>
            </div>
        </>
    )
}

export default HeaderServices