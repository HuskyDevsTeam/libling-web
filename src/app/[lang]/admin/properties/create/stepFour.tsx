'use client'
import React, { useEffect, useRef, useState } from 'react'
import { InputTextArea } from '@/app/components/admin/inputTextArea'
import { toast } from 'react-toastify';
import { poppinsMedium } from '@/app/fonts'
import styles from './page.module.css'
import { dict } from '@/app/utils';
import { IPageSync as IPage } from '../../layout';
import { ISelectElement } from '@/app/interfaces'
import CustomToast from '@/app/components/toast'
import * as Yup from 'yup';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik'
import { Button } from '@/app/components/admin/button'
import { InputText } from '@/app/components/admin/inputText';
import { FiInfo } from 'react-icons/fi';
import InputPhoto from '@/app/components/admin/inputPhoto';
import useStore from '@/app/hooks/useStore';
import { usePropertyStoreFromContext } from '@/app/hooks/PropertyStoreContext'


interface IValues {
    title: string
    description: string
    uploadedPhotos: boolean
    faceIndex: number
}
interface IStepFour extends IPage {
    onNext: VoidFunction
    onBack: VoidFunction
    files: any[]
    handleFiles: (files: any[], face:number) => void
    // Solo en editar: fotos ya guardadas (contenido extra y exención de la foto obligatoria)
    extra?: React.ReactNode
    hasExistingPhotos?: boolean
}



const StepFour: React.FC<IStepFour> = ({ params: { lang }, onNext, onBack, files, handleFiles, extra, hasExistingPhotos = false }) => {
    const store = useStore(usePropertyStoreFromContext(), (state) => state)
    const initialValues = {
        title: store?.form_4?.title || '',
        description: store?.form_4?.description || '',
        uploadedPhotos: store?.form_4?.uploadedPhotos || false,
        faceIndex: store?.form_4?.faceIndex || 0,
    }
    const formRef = useRef<FormikProps<IValues>>(null)
    const glosary = dict[lang]?.adminProperties
    const glosaryError = dict[lang]?.auth
    const [photos, setPhotos] = useState(store?.form_4?.photos)

    const handlePhoto = (key: any[], index:number) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('uploadedPhotos', key?.length > 0)
        formRef.current?.setFieldValue('faceIndex', index)
        // setPhotos(key)
        handleFiles(key, index)
    }
    const validationSchema = Yup.object({
        title: Yup.string().required(glosary.formValidationRequired),
        description: Yup.string().optional(),
        uploadedPhotos: hasExistingPhotos ? Yup.boolean() : Yup.string().required(glosary.formValidationRequired),
    });
    const handleSubmit = async (values: IValues, { setSubmitting }: FormikHelpers<IValues>) => {
        const formData = values
        try {
            console.log(formData)
            console.log(files)
            if (files.length <= 0 && !hasExistingPhotos) return toast.error(<CustomToast type='error' title='Error' content={glosary.formValidationPhotos} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
            store?.setForm_4({
                ...formData
            })
            onNext()
        } catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={glosaryError.error_default} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        } finally {
            setSubmitting(false)

        }
    }
    useEffect(() => {
    }, [])
    return (
        <div className={styles.card}>
            <div className={styles.cardBody}>
                <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.formStepTitle_4}</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    innerRef={formRef}
                    enableReinitialize
                >
                    {({ values, handleChange, errors, touched }) => (
                        <Form className={styles.cardContent}>
                            <InputText label={glosary.formLabelTitle} placeholder={glosary.formPlaceholderSelectText} onChange={handleChange('title')} value={values.title} error={errors.title} touched={touched.title} />

                            <InputTextArea label={glosary.formLabelDescription} placeholder={glosary.formPlaceholderText} description={glosary.formLabelOptional} onChange={handleChange('description')} value={values.description} error={errors.description} touched={touched.description} />

                            <div className={styles.multiFormControl}>
                                <h4 className={styles.multiFormLabel} style={poppinsMedium.style}>{glosary.formLabelPhotos}</h4>
                                <p className={styles.multiFormDescription}>{glosary.formLabelPhotosDescription}</p>
                                <div className={styles.avertisingContainer}>
                                    <FiInfo className={styles.advertisingIcon} />
                                    <span className={styles.avertisingText}>{glosary.formLabelPhotosAdvertise}</span>
                                </div>
                                {extra}
                                <InputPhoto description={glosary.formButtonAddPhoto} facename={glosary.formLabelTumbnail} onChange={handlePhoto} initialValues={files || []} />
                            </div>
                        </Form>
                    )}
                </Formik>

            </div>
            <div className={styles.cardFooter}>
                <Button title={glosary.formButtonBack} type='outline' onClick={onBack} />
                <Button title={glosary.formButtonNext} onClick={formRef.current?.handleSubmit} loading={formRef.current?.isSubmitting} />
            </div>
        </div>
    )
}

export default StepFour