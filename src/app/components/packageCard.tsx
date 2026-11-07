import React from 'react'
import styles from './packageCard.module.css'
import globalStyles from '@/app/globals.module.css'
import { Button } from './admin/button'
import { dict } from '../utils'
import { poppinsSemiBold } from '../fonts'
import IconCheck from './icons/iconCheck'
import Image, { StaticImageData } from 'next/image'

interface IPackageCard {
    title: string
    alt: string
    Icon: React.ElementType
    image: StaticImageData
    list: string[]
    type?:"outline" | "main" | "secondary" | "tonal" | "text" | "warning" | "error" | undefined
    lang: "es" | "en" | "fr"
    onSelect: (pack: string) => void
}

const PackageCard: React.FC<IPackageCard> = ({ image, alt,title, Icon, list, onSelect, type = 'outline', lang}) => {
    const glosary = dict[lang].services
    return (
        <div className={styles.container}>
            <div className={styles.headContainer}>
                <Image src={image} alt={alt} width={376} height={147} priority={true} style={{ objectFit: 'cover', objectPosition: 'center center' }} quality={100} className={styles.headImage}/>
                <div className={styles.headTextContainer}>
                    <Icon/>
                    <h3 className={[globalStyles.smallTitle, globalStyles.textNegative].join(' ')} style={poppinsSemiBold.style}>{title}</h3>
                </div>
            </div>
            <div className={styles.bodyContainer}>
                <ul className={styles.listContainer}>
                    {
                        list.map((el,index)=>(<li className={[styles.listItem].join(' ')} key={index}>
                            <div className={styles.iconList}>
                                <IconCheck/>
                            </div>
                            <span className={[globalStyles.text].join(' ')}>
                                {el}
                            </span>
                        </li>))
                    }
                </ul>
                <div style={{display:'flex', flexGrow:0}}>
                <Button type={type} title={glosary.planActionButton} onClick={()=>{onSelect(title)}} grow={true}/>
                </div>                
            </div>
        </div>
    )
}

export default PackageCard