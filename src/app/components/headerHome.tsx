'use client'
import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import styles from './headerHome.module.css'
import globalStyles from '@/app/globals.module.css'
import Image from 'next/image';
import headerImg1_2 from '@/app/img/carrusel_banner_1_1920.webp'
import headerImg1 from '@/app/img/carrusel_banner_1_1440.webp'
import headerImg1_1 from '@/app/img/banner_home_mobile_1.webp'
import headerImg2_2 from '@/app/img/carrusel_banner_2_1920.webp'
import headerImg2 from '@/app/img/carrusel_banner_2_1440.webp'
import headerImg2_1 from '@/app/img/banner_home_mobile_2.webp'
import headerImg3_2 from '@/app/img/carrusel_banner_3_1920.webp'
import headerImg3 from '@/app/img/carrusel_banner_3_1440.webp'
import headerImg3_1 from '@/app/img/banner_home_mobile_3.webp'
import { dict } from '../utils';
import { Button } from './admin/button';
import { FaChevronRight } from 'react-icons/fa';
import { poppinsMedium, poppinsSemiBold } from '../fonts';
import useWindowDimensions from '../hooks/useWindowDimensions';
interface IHeader {
    lang: "es" | "en" | "fr"
}
const HeaderHome:React.FC<IHeader> = ({lang}) => {
    const glosary = dict[lang]?.home
    const { height, width } = useWindowDimensions();
    return (
        <>
        {
            (width !== null)
            &&
            <Carousel autoPlay={true} infiniteLoop={true} interval={15000} showThumbs={false} showIndicators={false} showStatus={false} className={styles.sliderImage} preventMovementUntilSwipeScrollTolerance={true}>
                <div className={styles.sliderItem}>
                    {
                        (width !== null && width <= 500)
                        ?
                        <Image src={headerImg1_1} alt='header image' width={360} height={580} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100} sizes="(max-width: 360px) 100vw, 360px" className={styles.sliderImage}/>
                        :
                        (width !== null && width > 500 && width <= 1440)
                        ?
                        <Image src={headerImg1} alt='header image' width={1440} height={500} priority={true} style={{ objectFit: 'cover', objectPosition: 'right bottom' }} quality={100} sizes="(max-width: 1440px) 100vw, 1440px" className={styles.sliderImage}/>
                        :
                        <Image src={headerImg1_2} alt='header image' width={1920} height={500} priority={true} style={{ objectFit: 'cover', objectPosition: 'right bottom' }} quality={100} sizes="(max-width: 1920px) 100vw, 1920px" className={styles.sliderImage}/>

                    }
                    <div className={styles.sliderTextContainer}>
                        <h4 className={[globalStyles.miniTitle, globalStyles.textPrimary].join(' ')} style={poppinsSemiBold.style}>{glosary.miniTitleHeader1}</h4>
                        <h2 className={globalStyles.bigTitle} style={poppinsMedium.style}><span>{glosary.bigTitleHeader1_1}</span><span className={globalStyles.textPrimary}>{glosary.bigTitleHeader1_2}</span> </h2>
                        <p className={globalStyles.commonText}>{glosary.commonHeader1}</p>
                        <div style={{display:'flex', flexGrow:0}}>
                            <Button title={glosary.actionButtonHeader1} Icon={FaChevronRight}/>

                        </div>
                    </div>
                </div>
                <div className={styles.sliderItem}>
                    {
                        (width !== null && width <= 500)
                        ?
                        <Image src={headerImg2_1} alt='header image' width={360} height={580} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100} sizes="(max-width: 360px) 100vw, 360px" className={styles.sliderImage}/>
                        :
                        (width !== null && width > 500 && width <= 1440)
                        ?
                        <Image src={headerImg2} alt='header image' width={1440} height={500} priority={true} style={{ objectFit: 'cover', objectPosition: 'right bottom' }} quality={100} sizes="(max-width: 1440px) 100vw, 1440px" className={styles.sliderImage}/>
                        :
                        <Image src={headerImg2_2} alt='header image' width={1920} height={500} priority={true} style={{ objectFit: 'cover', objectPosition: 'right bottom' }} quality={100} sizes="(max-width: 1920px) 100vw, 1920px" className={styles.sliderImage}/>
                        
                    }
                    <div className={styles.sliderTextContainer}>
                        <h4 className={globalStyles.miniTitle} style={poppinsSemiBold.style}>{glosary.miniTitleHeader2}</h4>
                        <h2 className={globalStyles.bigTitle} style={poppinsMedium.style}><span className={globalStyles.textPrimary}>{glosary.bigTitleHeader2_1}</span><span>{glosary.bigTitleHeader2_2}</span> </h2>
                        <p className={globalStyles.commonText}>{glosary.commonHeader2}</p>
                        <div style={{display:'flex', flexGrow:0}}>
                            <Button title={glosary.actionButtonHeader2} Icon={FaChevronRight}/>
                        </div>
                    </div>
                </div>
                <div className={styles.sliderItem}>
                    {
                        (width !== null && width <= 500)
                        ?
                        <Image src={headerImg3_1} alt='header image' width={360} height={580} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100} sizes="(max-width: 360px) 100vw, 360px" className={styles.sliderImage}/>
                        :
                        (width !== null && width > 500 && width <= 1440)
                        ?
                        <Image src={headerImg3} alt='header image' width={1440} height={500} priority={true} style={{ objectFit: 'cover', objectPosition: 'right bottom' }} quality={100} sizes="(max-width: 1440px) 100vw, 1440px" className={styles.sliderImage}/>
                        :
                        <Image src={headerImg3_2} alt='header image' width={1920} height={500} priority={true} style={{ objectFit: 'cover', objectPosition: 'right bottom' }} quality={100} sizes="(max-width: 1920px) 100vw, 1920px" className={styles.sliderImage}/>
                    }
                    <div className={styles.sliderTextContainer}>
                        <h4 className={globalStyles.miniTitle} style={poppinsSemiBold.style}>{glosary.miniTitleHeader3}</h4>
                        <h2 className={globalStyles.bigTitle} style={poppinsMedium.style}><span>{glosary.bigTitleHeader3_1}</span><span className={globalStyles.textPrimary}>{glosary.bigTitleHeader3_2}</span> </h2>
                        <p className={globalStyles.commonText}>{glosary.commonHeader3}</p>
                        <div style={{display:'flex', flexGrow:0}}>
                        <Button title={glosary.actionButtonHeader3} Icon={FaChevronRight}/>
                        </div>
                    </div>
                </div>
            </Carousel>
        }
        </>
    )
}

export default HeaderHome