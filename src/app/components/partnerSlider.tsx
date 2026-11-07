import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import styles from './partnerSlider.module.css'
import Image from 'next/image';
import Logo1 from '@/app/img/logo_partner_assurin-100.webp'
import Logo2 from '@/app/img/logo_partner_chamber_of_commerce_luxembourg-100.webp'
import Logo3 from '@/app/img/logo_partner_elena_lustina_panescu-100.webp'
import Logo4 from '@/app/img/logo_partner_house_of_training-100.webp'
import Logo5 from '@/app/img/logo_partner_husky-100.webp'
import Logo6 from '@/app/img/logo_partner_lalux-100.webp'
import Logo7 from '@/app/img/logo_partner_schemeberger_photographe-100.webp'
import Logo8 from '@/app/img/logo_partner_translations_panescu-100.webp'
import Logo9 from '@/app/img/logo_partner_zak_architect-100.webp'

const PartnerSlider = () => {
  return (
    <>
    <Carousel autoPlay={true} infiniteLoop={true} showThumbs={false} showIndicators={false} showStatus={false} showArrows={false} centerMode={true} centerSlidePercentage={18} className={styles.slider}>
        <div className={styles.sliderItem}>
            <Image src={Logo1} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
        <div className={styles.sliderItem}>
            <Image src={Logo2} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
        <div className={styles.sliderItem}>
            <Image src={Logo3} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
        <div className={styles.sliderItem}>
            <Image src={Logo4} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
        <div className={styles.sliderItem}>
            <Image src={Logo5} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
        <div className={styles.sliderItem}>
            <Image src={Logo6} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
        <div className={styles.sliderItem}>
            <Image src={Logo7} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
        <div className={styles.sliderItem}>
            <Image src={Logo8} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
        <div className={styles.sliderItem}>
            <Image src={Logo9} alt='header image' width={164} height={64} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100}/>
        </div>
    </Carousel>
    </>
  )
}

export default PartnerSlider