'use client'
import React from 'react'
import styles from './headerAbout.module.css'
import globalStyles from '@/app/globals.module.css'
import Image from 'next/image';
import headerImg1 from '@/app/img/about_section_header.webp'
import { dict } from '../utils';
import { Button } from './admin/button';
import { poppinsBold, poppinsMedium } from '../fonts';
import { FaChevronDown } from 'react-icons/fa6';
import useWindowDimensions from '../hooks/useWindowDimensions';
interface IHeader {
    lang: "es" | "en" | "fr"
}
const HeaderAbout:React.FC<IHeader> = ({lang}) => {
    const glosary = dict[lang]?.about
    const { height, width } = useWindowDimensions();

    return (
        <>
            <div className={styles.container}>
                <div className={styles.imageContainer}>
                    {
                        (width !== null && width <= 500)
                        ?
                        <Image src={headerImg1} alt='header image' width={380} height={380} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100} className={styles.image}/>
                        :
                        <Image src={headerImg1} alt='header image' width={575} height={575} priority={true} style={{ objectFit: 'cover', objectPosition: 'right center' }} quality={100} className={styles.image}/>
                    }
                    <div className={styles.form}>
                    </div>
                </div>
                <div className={styles.sliderTextContainer}>
                    <h4 className={[globalStyles.miniTitle, globalStyles.textPrimary].join(' ')} style={poppinsMedium.style}>{glosary.headerTitle_1}</h4>
                    <h2 className={globalStyles.regularTitle}><span>{glosary.headerSubtitle_1}</span></h2>
                    <p className={globalStyles.commonText}><span style={poppinsBold.style}>{glosary.headerContent_1_1}</span><span>{glosary.headerContent_1_2}</span><span style={poppinsBold.style}>{glosary.headerContent_1_3}</span></p>
                    <Button title={glosary.actionButton_1} Icon={FaChevronDown} />
                </div>
            </div>
        </>
    )
}

export default HeaderAbout