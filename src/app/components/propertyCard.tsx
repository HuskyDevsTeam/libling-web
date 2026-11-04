'use client'
import React from 'react'
import styles from './propertyCard.module.css'
import Image from 'next/image'
import placeholder from '@/app/img/placeholder_280x188.png'
import { FiMapPin } from 'react-icons/fi'
import IconArea from './icons/iconArea'
import IconBed from './icons/iconBed'
import IconBath from './icons/iconBath'
import { poppinsMedium } from '../fonts'
import { useRouter } from 'next/navigation'

interface IPropertyCard {
    thumbnail?: string
    location: string
    currency: string
    price?: number
    frecuency?: string
    subtitle: string
    area?: string
    bedrooms?: string
    bathrooms?: string
    slug: string
}

const PropertyCard: React.FC<IPropertyCard> = ({ thumbnail, location, currency, price, frecuency, subtitle, area, bedrooms, bathrooms, slug }) => {
    const router = useRouter()
    return (
        <div className={styles.propertiesCard} onClick={()=>{router.push(`/immo/${slug}`)}}>
            <Image src={thumbnail || placeholder} alt='Property photo' className={styles.propertyPhoto} width={280} height={188}/>
            <div className={styles.textContainer}>
                <div className={styles.locationContainer}> <FiMapPin className={styles.icon} /> <span>{location}</span></div>
                <div className={styles.priceContainer}>
                    {
                        !!currency &&
                        <span className={styles.price} style={poppinsMedium.style}>{currency}</span>
                    }
                    {
                        !!price &&
                        <span className={styles.price} style={poppinsMedium.style}>{price.toLocaleString('en-US')}</span>
                    }
                    {
                        !!frecuency &&
                        <span className={styles.frecuency}>{`/ ${frecuency}`}</span>
                    }
                </div>
                <div className={styles.priceContainer}>
                    <span>{subtitle}</span>
                </div>
            </div>
            <div className={styles.featuresContainer}>
                {
                    !!area
                    &&
                    <span className={styles.feature}>
                        <IconArea />
                        <span>{area}</span>
                    </span>
                }
                {
                    !!bedrooms
                    &&
                    <span className={styles.feature}>
                        <IconBed />
                        <span>{bedrooms || 0}</span>
                    </span>
                }
                {
                    !!bathrooms
                    &&
                    <span className={styles.feature}>
                        <IconBath />
                        <span>{bathrooms || 0}</span>
                    </span>
                }
            </div>
        </div>
    )
}

export default PropertyCard