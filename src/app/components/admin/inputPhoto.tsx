import React, { useEffect, useState } from 'react'
import useSyncedState from '@/app/hooks/useSyncedState'
import { useDropzone } from 'react-dropzone'
import styles from './input.module.css'
import Image from 'next/image';
import { FiCamera, FiX } from 'react-icons/fi';
import { IInputPhoto } from '@/app/interfaces';
import { poppinsMedium } from '@/app/fonts';

const InputPhoto: React.FC<IInputPhoto> = ({ description, facename, onChange, initialValues, initialFace }) => {
    const [files, setFiles] = useSyncedState(initialValues);
    const deleteFile = (index: number) => {
        if (face > index) {
            setFace(state => state - 1)
        }
        setFiles(state => state.filter((el, indexEl) => index !== indexEl))

    }
    const [face, setFace] = useState<number>(initialFace || 0)
    
    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/jpeg": [], "image/png": [] },
        maxFiles: 5,
        maxSize: 2_097_152,
        onDrop: (acceptedFiles: any) => {
            setFiles(
                acceptedFiles.map((file: any) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            );
        }
    });

    const thumbs = files.map((file: any, index) => (
        <div className={styles.thumb} key={file?.name}>
            <div className={styles.thumbInner}>
                {
                    (file.path && !!onChange) &&
                    <div className={styles.thumbDelete} onClick={() => { deleteFile(index) }}>
                        <FiX />
                    </div>
                }
                <Image src={file.preview} alt={'image'} onClick={!!onChange ? () => { setFace(index) }: undefined} className={styles.img} width={100} height={100} />
                {
                    face === index && <div className={styles.thumbFace}>{facename}</div>
                }
            </div>
        </div>
    ));

    useEffect(
        () => {
            if (!!onChange) onChange(files, face)
            // return () => {
            //     // Make sure to revoke the data uris to avoid memory leaks
            //     files.forEach((file: any) => URL.revokeObjectURL(file.preview));
            // }
        },
        [files, onChange, face]
    );

    return (
        <section className={styles.photoContainer}>
            {
                !!onChange &&
                <div {...getRootProps({ className: styles.photoDropzone })}>
                    <input {...getInputProps()} />
                    <FiCamera className={styles.photoIcon} />
                    <p className={styles.photoDescription} style={poppinsMedium.style}>{description}</p>
                </div>
            }
            {
                files?.length > 0
                &&
                <aside className={styles.thumbsContainer}>{thumbs}</aside>
            }
        </section>
    );
}

export default InputPhoto