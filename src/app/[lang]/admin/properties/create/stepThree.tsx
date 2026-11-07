'use client'
import React, { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css';
import { toast } from 'react-toastify';
import InputSelect from '@/app/components/admin/inputSelect'
import { poppinsMedium } from '@/app/fonts'
import styles from './page.module.css'
import { dict } from '@/app/utils';
import { IPageSync as IPage } from '../../layout';
import { ISelectElement } from '@/app/interfaces'
import CustomToast from '@/app/components/toast'
import * as Yup from 'yup';
import { FieldArray, Form, Formik, FormikErrors, FormikHelpers, FormikProps } from 'formik'
import { Button } from '@/app/components/admin/button'
import { InputText } from '@/app/components/admin/inputText'
import { FiPlus, FiX } from 'react-icons/fi';
import useStore from '@/app/hooks/useStore';
import { usePropertyStoreFromContext } from '@/app/hooks/PropertyStoreContext'
import { medidasAreaTerrenos } from '@/app/utils/data';


interface IValues {
    view: string | null
    surfaces: {
        quantity: string
        description: string
        area: string
        areaUnit: number
    }[]
    benefits: string[]
    nearPlaces: string[]
    legalNotes: string[]
}
interface IStepThree extends IPage {
    onNext: VoidFunction
    onBack: VoidFunction
}




const StepThree: React.FC<IStepThree> = ({ params: { lang }, onNext, onBack }) => {
    const store = useStore(usePropertyStoreFromContext(), (state) => state)
    const initalValues = {
        view: store?.form_3?.view || null,
        surfaces: store?.form_3?.surfaces || [],
        benefits: store?.form_3?.benefits || [],
        nearPlaces: store?.form_3?.nearPlaces || [],
        legalNotes: store?.form_3?.legalNotes || [],
    }
    const glosary = dict[lang]?.adminProperties
    const glosaryError = dict[lang]?.auth
    const [areaList, setAreaList] = useState<ISelectElement[]>(medidasAreaTerrenos)
    const formRef = useRef<FormikProps<IValues>>(null)
    const handleAreaSelect = (index: number, key: string) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue(`surfaces.${index}.areaUnit`, key)
    }
    const validationSchema = Yup.object({
        view: Yup.string().optional().nullable(),
        surfaces: Yup.array().of(Yup.object().shape({
            quantity: Yup.string().required(glosary.formValidationRequired),
            description: Yup.string().required(glosary.formValidationRequired),
            area: Yup.string().required(glosary.formValidationRequired),
            areaUnit: Yup.number().required(glosary.formValidationRequired),
        })).optional(),
        benefits: Yup.array().of(Yup.string().required(glosary.formValidationRequired)).optional(),
        nearPlaces: Yup.array().of(Yup.string().required(glosary.formValidationRequired)).optional(),
        legalNotes: Yup.array().of(Yup.string().required(glosary.formValidationRequired)).optional(),
    });
    const handleSubmit = async (values: IValues, formikHelpers: FormikHelpers<IValues>) => {
        const formData = values
        console.log(formData)
        try {
            store?.setForm_3(formData)
            onNext()
        } catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={glosaryError.error_default} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        } finally {
            formikHelpers.setSubmitting(false)

        }
    }
    useEffect(() => {
    }, [])
    return (
        <div className={styles.card}>
            <div className={styles.cardBody}>

                <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.formStepTitle_3}</h2>
                <Formik
                    initialValues={initalValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    innerRef={formRef}
                    enableReinitialize
                >
                    {({ values, handleChange, errors, touched }) => (
                        <Form className={styles.cardContentBig}>
                            <InputText label={glosary.formLabelView} description={glosary.formLabelOptional} placeholder={glosary.formPlaceholderView} error={errors.view} touched={touched.view} value={values.view || undefined} onChange={handleChange('view')} />
                            <FieldArray name='surfaces'>
                                {
                                    ({ push, remove }) => (
                                        <div className={styles.multiFormControl}>
                                            <h4 className={styles.multiFormLabel} style={poppinsMedium.style}>{glosary.formLabelSufaces}{" "} <span className={styles.multiFormLabelDescription}>({glosary.formLabelOptional})</span> </h4>
                                            {
                                                values.surfaces.length > 0 && values.surfaces.map((el, index) => (
                                                    <div key={index} className={styles.inputRow}>

                                                        <InputText placeholder={glosary.formPlaceholderSurfaces_1} error={(('surfaces' in errors) && (typeof errors.surfaces === 'object') && (index in errors.surfaces) && (typeof errors.surfaces[index] !== 'string')) ? (errors.surfaces[index] as FormikErrors<{ quantity: string; description: string; area: string; areaUnit: number; }>)?.quantity : undefined} touched={'surfaces' in touched && (typeof touched.surfaces === 'object') && (index in touched.surfaces) && (typeof touched.surfaces[index] === 'object') ? touched.surfaces[index]?.quantity : undefined} onChange={handleChange(`surfaces.${index}.quantity`)} value={values.surfaces[index]?.quantity} />
                                                        <div >
                                                            <InputText placeholder={glosary.formPlaceholderSurfaces_2} error={(('surfaces' in errors) && (typeof errors.surfaces === 'object') && (errors.surfaces[index] !== undefined) && (typeof errors.surfaces[index] !== 'string')) ? (errors.surfaces[index] as FormikErrors<{ quantity: string; description: string; area: string; areaUnit: number; }>)?.description : undefined} touched={'surfaces' in touched && (typeof touched.surfaces === 'object') && (index in touched.surfaces) && (typeof touched.surfaces[index] === 'object') ? touched.surfaces[index]?.description : undefined} onChange={handleChange(`surfaces.${index}.description`)} value={values.surfaces[index]?.description} />
                                                        </div>
                                                        <div style={{}}>

                                                            <InputText placeholder={glosary.formPlaceholderSurfaces_3} error={(('surfaces' in errors) && (typeof errors.surfaces === 'object') && (index in errors.surfaces) && (typeof errors.surfaces[index] !== 'string')) ? (errors.surfaces[index] as FormikErrors<{ quantity: string; description: string; area: string; areaUnit: number; }>)?.area : undefined} touched={'surfaces' in touched && (typeof touched.surfaces === 'object') && (index in touched.surfaces) && (typeof touched.surfaces[index] === 'object') ? touched.surfaces[index]?.area : undefined} onChange={handleChange(`surfaces.${index}.area`)} value={values.surfaces[index]?.area} />

                                                        </div>
                                                        <div style={{}}>

                                                            <InputSelect placeholder={glosary.formPlaceholderSelect} list={areaList} onChange={(key: string) => { handleAreaSelect(index, key) }} error={(('surfaces' in errors) && (typeof errors.surfaces === 'object') && (index in errors.surfaces) && (typeof errors.surfaces[index] !== 'string')) ? (errors.surfaces[index] as FormikErrors<{ quantity: string; description: string; area: string; areaUnit: number; }>)?.areaUnit : undefined} touched={'surfaces' in touched && (typeof touched.surfaces === 'object') && (index in touched.surfaces) && (typeof touched.surfaces[index] === 'object') ? touched.surfaces[index]?.areaUnit : undefined} initialValue={values.surfaces[index]?.areaUnit} />

                                                        </div>
                                                        <div className={styles.iconClose} onClick={() => { remove(index) }}>
                                                            <FiX />
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                            <div className={styles.buttonTopPadding}>
                                                <Button Icon={FiPlus} title={glosary.formButtonAddSurfaces} type='tonal' onClick={() => {
                                                    push({
                                                        quantity: '',
                                                        description: '',
                                                        area: '',
                                                        areaUnit: ''
                                                    })
                                                }} />
                                            </div>
                                        </div>
                                    )
                                }


                            </FieldArray>
                            <FieldArray name='benefits'>
                                {
                                    ({ push, remove }) => (
                                        <div className={styles.multiFormControl}>
                                            <h4 className={styles.multiFormLabel} style={poppinsMedium.style}>{glosary.formLabelBenefits}{" "} <span className={styles.multiFormLabelDescription}>({glosary.formLabelOptional})</span> </h4>
                                            {
                                                values.benefits.length > 0 && values.benefits.map((el, index) => (
                                                    <div key={index} className={styles.inputRow}>
                                                        <div className={styles.simpleMultiFormControl}>
                                                            <InputText key={index} placeholder={glosary.formPlaceholderBenefits} error={(('benefits' in errors) && (typeof errors.benefits === 'object') && (index in errors.benefits) && (typeof errors.benefits[index] === 'string')) ? errors.benefits[index] : undefined} touched={'benefits' in touched && (typeof touched.benefits === 'object') && (index in touched.benefits) && (typeof touched.benefits[index] === 'string') ? touched.benefits[index] : undefined} onChange={handleChange(`benefits.${index}`)} value={el} />
                                                        </div>
                                                        <div className={styles.iconClose} onClick={() => { remove(index) }}>
                                                            <FiX />
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                            <div className={styles.buttonTopPadding}>
                                                <Button Icon={FiPlus} title={glosary.formButtonAddBenefits} type='tonal' onClick={() => {
                                                    push('')
                                                }} />
                                            </div>
                                        </div>
                                    )
                                }
                            </FieldArray>
                            <FieldArray name='nearPlaces'>
                                {
                                    ({ push, remove }) => (
                                        <div className={styles.multiFormControl}>
                                            <h4 className={styles.multiFormLabel} style={poppinsMedium.style}>{glosary.formLabelNearPlaces}{" "} <span className={styles.multiFormLabelDescription}>({glosary.formLabelOptional})</span> </h4>
                                            {
                                                values.nearPlaces.length > 0 && values.nearPlaces.map((el, index) => (
                                                    <div key={index} className={styles.inputRow}>
                                                        <div className={styles.simpleMultiFormControl}>
                                                            <InputText key={index} placeholder={glosary.formPlaceholderNearPlaces} error={(('nearPlaces' in errors) && (typeof errors.nearPlaces === 'object') && (index in errors.nearPlaces) && (typeof errors.nearPlaces[index] === 'string')) ? errors.nearPlaces[index] : undefined} touched={'nearPlaces' in touched && (typeof touched.nearPlaces === 'object') && (index in touched.nearPlaces) && (typeof touched.nearPlaces[index] === 'string') ? touched.nearPlaces[index] : undefined} onChange={handleChange(`nearPlaces.${index}`)} value={el} />
                                                        </div>
                                                        <div className={styles.iconClose} onClick={() => { remove(index) }}>
                                                            <FiX />
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                            <div className={styles.buttonTopPadding}>
                                                <Button Icon={FiPlus} title={glosary.formButtonAddNearPlaces} type='tonal' onClick={() => {
                                                    push('')
                                                }} />
                                            </div>
                                        </div>
                                    )
                                }
                            </FieldArray>
                            <FieldArray name='legalNotes'>
                                {
                                    ({ push, remove }) => (
                                        <div className={styles.multiFormControl}>
                                            <h4 className={styles.multiFormLabel} style={poppinsMedium.style}>{glosary.formLabelLegalNotes}{" "} <span className={styles.multiFormLabelDescription}>({glosary.formLabelOptional})</span> </h4>
                                            {
                                                values.legalNotes.length > 0 && values.legalNotes.map((el, index) => (
                                                    <div key={index} className={styles.inputRow}>
                                                        <div className={styles.simpleMultiFormControl}>
                                                            <InputText key={index} placeholder={glosary.formPlaceholderLegalNotes} error={(('legalNotes' in errors) && (typeof errors.legalNotes === 'object') && (index in errors.legalNotes) && (typeof errors.legalNotes[index] === 'string')) ? errors.legalNotes[index] : undefined} touched={'legalNotes' in touched && (typeof touched.legalNotes === 'object') && (index in touched.legalNotes) && (typeof touched.legalNotes[index] === 'string') ? touched.legalNotes[index] : undefined} onChange={handleChange(`legalNotes.${index}`)} value={el} />
                                                        </div>
                                                        <div className={styles.iconClose} onClick={() => { remove(index) }}>
                                                            <FiX />
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                            <div className={styles.buttonTopPadding}>
                                                <Button Icon={FiPlus} title={glosary.formButtonAddLegalNotes} type='tonal' onClick={() => {
                                                    push('')
                                                }} />
                                            </div>
                                        </div>
                                    )
                                }
                            </FieldArray>
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

export default StepThree