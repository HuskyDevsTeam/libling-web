'use client'
import React, { useState } from 'react'
import styles from './packagePlanList.module.css'
import { dict } from '../utils'
import PackageCard from './packageCard'
import packImgBasic from '@/app/img/pack_basico.webp'
import packImgPremium from '@/app/img/pack_premium.webp'
import packImgStandar from '@/app/img/pack_standar.webp'
import IconPackBasic from './icons/iconPackBasic'
import IconPackPremium from './icons/iconPackPremium'
import IconPackStandar from './icons/iconPackStandar'

interface IPackagePlanList {
    lang: "es" | "en" | "fr"
    action: (pack: string) => void

}


const PackagePlanList: React.FC<IPackagePlanList> = ({ lang, action }) => {
    const glosary = dict[lang]?.services
    const packageList = [
        {
            title: glosary.packageTitle1,
            list: glosary.packageList1,
            alt: 'traveler',
            image: packImgBasic,
            icon: IconPackBasic,
        },
        {
            title: glosary.packageTitle2,
            list: glosary.packageList2,
            alt: 'family',
            image: packImgPremium,
            icon: IconPackPremium,
        },
        {
            title: glosary.packageTitle3,
            list: glosary.packageList3,
            alt: 'travelers',
            image: packImgStandar,
            icon: IconPackStandar,
        },

    ]

    return (
        <div className={styles.container}>
            <div className={styles.edgeContainer}>
                {
                    packageList?.map((el, index) => (<PackageCard key={index} image={el.image} onSelect={action} title={el.title} Icon={el.icon} alt={el.alt} list={el.list} type={index === 1 ? 'main' : 'tonal'} lang={lang} />))
                }
            </div>
        </div>
    )
}

export default PackagePlanList