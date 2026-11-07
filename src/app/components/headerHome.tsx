'use client'
import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import styles from './headerHome.module.css'
import globalStyles from '@/app/globals.module.css'
import { getImageProps, type StaticImageData } from 'next/image';
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
interface IHeader {
    lang: "es" | "en" | "fr"
}
/**
 * Imagen del hero con direccion de arte por CSS (movil / medio / grande). Se pinta ya en el HTML del servidor
 * (antes esperaba a conocer el ancho de la ventana con JavaScript: el hero aparecia tarde y movia la pagina).
 */
const HeroPicture = ({ mobile, medium, large, first = false }: { mobile: StaticImageData; medium: StaticImageData; large: StaticImageData; first?: boolean }) => {
    const common = { alt: 'header image', quality: 80, priority: first, loading: first ? undefined : ('lazy' as const) }
    const m = getImageProps({ ...common, src: mobile, width: 360, height: 580, sizes: '100vw' })
    const md = getImageProps({ ...common, src: medium, width: 1440, height: 500, sizes: '100vw' })
    const lg = getImageProps({ ...common, src: large, width: 1920, height: 500, sizes: '1440px' })
    const { srcSet, ...imgProps } = lg.props
    return (
        <picture>
            <source media="(max-width: 500px)" srcSet={m.props.srcSet} sizes="100vw" />
            <source media="(max-width: 1440px)" srcSet={md.props.srcSet} sizes="100vw" />
            <img {...imgProps} alt={imgProps.alt} srcSet={srcSet} className={styles.sliderImage} style={{ objectFit: 'cover', objectPosition: 'right bottom', color: 'transparent' }} />
        </picture>
    )
}
const HeaderHome:React.FC<IHeader> = ({lang}) => {
    const glosary = dict[lang]?.home
    return (
        <>
        <Carousel autoPlay={true} infiniteLoop={true} interval={15000} showThumbs={false} showIndicators={false} showStatus={false} className={styles.sliderImage} preventMovementUntilSwipeScrollTolerance={true}>
                <div className={styles.sliderItem}>
                    <HeroPicture mobile={headerImg1_1} medium={headerImg1} large={headerImg1_2} first />
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
                    <HeroPicture mobile={headerImg2_1} medium={headerImg2} large={headerImg2_2} />
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
                    <HeroPicture mobile={headerImg3_1} medium={headerImg3} large={headerImg3_2} />
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
        </>
    )
}

export default HeaderHome