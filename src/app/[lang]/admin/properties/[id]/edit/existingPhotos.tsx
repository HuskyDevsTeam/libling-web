'use client'
import React from 'react'
import Image from 'next/image'
import { FiX } from 'react-icons/fi'
import styles from '@/app/components/admin/input.module.css'
import { poppinsMedium } from '@/app/fonts'

interface IExistingPhotos {
    title: string
    coverLabel: string
    removeLabel: string
    images: { id: number; path: string }[]
    cover: string | null
    onCover: (path: string) => void
    onRemove: (id: number) => void
}

// Fotos ya guardadas: elegir portada o quitarlas
const ExistingPhotos: React.FC<IExistingPhotos> = ({ title, coverLabel, removeLabel, images, cover, onCover, onRemove }) => (
    <section data-testid='existing-photos'>
        <h4 style={poppinsMedium.style}>{title}</h4>
        <aside className={styles.thumbsContainer}>
            {images.map(img => (
                <div className={styles.thumb} key={img.id}>
                    <div className={styles.thumbInner}>
                        <div className={styles.thumbDelete} role='button' aria-label={removeLabel} data-testid={`remove-photo-${img.id}`} onClick={() => onRemove(img.id)}>
                            <FiX />
                        </div>
                        <Image src={img.path} alt='image' className={styles.img} width={100} height={100} onClick={() => onCover(img.path)} />
                        {cover === img.path && <div className={styles.thumbFace}>{coverLabel}</div>}
                    </div>
                </div>
            ))}
        </aside>
    </section>
)

export default ExistingPhotos
