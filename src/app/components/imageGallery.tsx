'use client'
import React, { useState } from 'react'
import { IPropertyImage } from '../interfaces/models'
import styles from './imageGallery.module.css'
import placeholder from '@/app/img/placeholder_280x188.png'
import Image from 'next/image'

interface IImageGallery {
    images?: IPropertyImage[],
    thumbnail?: string | null
}

const ImageGallery: React.FC<IImageGallery> = ({ images, thumbnail }) => {
    const [image, setImage] = useState(images?.find(el => el.path === thumbnail)?.path || thumbnail)
    return (
        <div className={styles.container}>
            <div className={styles.miniContainer}>
                {
                    images?.map((el, index) => (

                        <Image key={index} onClick={()=>{setImage(el.path)}} src={el.thumbPath || el.path} alt={`image${index}`} className={el.path === image ? styles.miniSelected : styles.mini} width={74} height={74}/>

                    ))
                }
            </div>
            <Image src={image || placeholder} alt='bigImage' className={styles.bigImageContainer} width={580} height={436} />
        </div>
    )
}

export default ImageGallery