'use client'
import React, { useEffect, useRef, useState } from 'react'
import { InputRadio } from '@/app/components/admin/inputRadio'
import 'maplibre-gl/dist/maplibre-gl.css';
import { toast } from 'react-toastify';
import InputSelect from '@/app/components/admin/inputSelect'
import { poppinsMedium } from '@/app/fonts'
import styles from './page.module.css'
import { dict } from '@/app/utils';
import { IPageSync as IPage } from '../../layout';
import CustomToast from '@/app/components/toast'
import * as Yup from 'yup';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik'
import { Button } from '@/app/components/admin/button'
import { InputText } from '@/app/components/admin/inputText'
import useStore from '@/app/hooks/useStore';
import { usePropertyStoreFromContext } from '@/app/hooks/PropertyStoreContext'
import { combustiblesCalefaccion, mecanismosCalefaccion, mediosCalefaccion } from '@/app/utils/data';


interface IValues {
    area?: string
    bedrooms?: string
    bathrooms?: string
    heatingType?: number
    heatingMedium?: number
    heatingEnergy?: number
    furnished?: boolean
    parking?: string
    elevator?: boolean
}
interface IStepTwo extends IPage {
    onNext: VoidFunction
    onBack: VoidFunction
}



const StepTwo: React.FC<IStepTwo> = ({ params: { lang }, onNext, onBack }) => {
    const glosary = dict[lang]?.adminProperties
    const glosaryError = dict[lang]?.auth
    const formRef = useRef<FormikProps<IValues>>(null)
    const [submitting, setBusy] = useState(false)
    const store = useStore(usePropertyStoreFromContext(), (state) => state)
    const initialValues: IValues = {
        area: store?.form_2?.area,
        bedrooms: store?.form_2?.bedrooms,
        bathrooms: store?.form_2?.bathrooms,
        heatingType: store?.form_2?.heatingType,
        heatingMedium: store?.form_2?.heatingMedium,
        heatingEnergy: store?.form_2?.heatingEnergy,
        furnished: !!store?.form_2?.furnished,
        parking: store?.form_2?.parking,
        elevator: !!store?.form_2?.elevator,
    }

    const handleFurnishedChange = (key: boolean) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('furnished', key)
    }
    const handleElevatorChange = (key: boolean) => {
        formRef.current?.setFieldValue('elevator', key)
    }
    const handleHeatingType = (key: string) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('heatingType', key)
    }
    const handleHeatingMedium = (key: string) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('heatingMedium', key)
    }
    const handleHeatingEnergy = (key: string) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('heatingEnergy', key)
    }
    const validationSchema = Yup.object({
        area: Yup.number().required(glosary.formValidationRequired).typeError(glosary.formValidationNumbers),
        bedrooms: Yup.number().optional().typeError(glosary.formValidationNumbers),
        bathrooms: Yup.number().optional().typeError(glosary.formValidationNumbers),
        heatingType: Yup.number().optional(),
        heatingMedium: Yup.number().optional(),
        heatingEnergy: Yup.number().optional(),
        parking: Yup.number().integer(glosary.formValidationNumbers).min(0, glosary.formValidationNumbers).optional().typeError(glosary.formValidationNumbers),
    });
    const handleSubmit = async (values: IValues, { setSubmitting }: FormikHelpers<IValues>) => {
        setBusy(true)
        const formData = values
        console.log(formData)
        try {
            store?.setForm_2(formData)
            onNext()
        } catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={glosaryError.error_default} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        } finally {
            setSubmitting(false)
            setBusy(false)

        }
    }
    const AreaIcon = () => (<span className={styles.textIcon}>m{"\u00B2"}</span>)
    useEffect(() => {
    }, [])
    return (
        <div className={styles.card}>
            <div className={styles.cardBody}>

                <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.formStepTitle_2}</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    innerRef={formRef}
                    enableReinitialize
                >
                    {({ values, handleChange, errors, touched }) => (
                        <Form className={styles.cardContent}>
                            <div className={styles.inputRow}>
                                <div className={styles.inputRowHalf}>
                                    <InputText label={glosary.formLabelArea} placeholder={glosary.formPlaceholderText} Icon={AreaIcon} error={errors.area} touched={touched.area} value={values.area} onChange={handleChange('area')} />
                                </div>
                                <div className={styles.inputRowHalf}>
                                    <InputText label={glosary.formLabelBedrooms} description={glosary.formLabelOptional} placeholder={glosary.formPlaceholderText} error={errors.bedrooms} touched={touched.bedrooms} value={values.bedrooms} onChange={handleChange('bedrooms')} />
                                </div>
                            </div>
                            <div className={styles.inputRow}>
                                <div className={styles.inputRowHalf}>
                                    <InputText label={glosary.formLabelBathrooms} description={glosary.formLabelOptional} placeholder={glosary.formPlaceholderText} error={errors.bathrooms} touched={touched.bathrooms} value={values.bathrooms} onChange={handleChange('bathrooms')} />
                                </div>
                                <div className={styles.inputRowHalf}>
                                    <InputSelect label={glosary.formLabelHeatingType} description={glosary.formLabelOptional} placeholder={glosary.formPlaceholderSelect} list={mecanismosCalefaccion} onChange={handleHeatingType} error={errors.heatingType} touched={touched.heatingType} initialValue={values.heatingType} lang={lang} />
                                </div>
                            </div>
                            <div className={styles.inputRow}>
                                <div className={styles.inputRowHalf}>
                                    <InputSelect label={glosary.formLabelHeatingMedium} description={glosary.formLabelOptional} placeholder={glosary.formPlaceholderSelect} list={mediosCalefaccion} onChange={handleHeatingMedium} error={errors.heatingMedium} touched={touched.heatingMedium} initialValue={values.heatingMedium} lang={lang} />
                                </div>
                                <div className={styles.inputRowHalf}>
                                    <InputSelect label={glosary.formLabelHeatingEnergy} description={glosary.formLabelOptional} placeholder={glosary.formPlaceholderSelect} list={combustiblesCalefaccion} onChange={handleHeatingEnergy} error={errors.heatingEnergy} touched={touched.heatingEnergy} initialValue={values.heatingEnergy} lang={lang} />
                                </div>
                            </div>
                            <div className={styles.inputRow}>
                                <div className={styles.inputRowHalf}>
                                    <InputRadio label={glosary.formLabelFurnished} option_1={glosary.formOptionYes} option_2={glosary.formOptionNo} initialValue={!!values.furnished} onChange={handleFurnishedChange} />
                                </div>
                                <div className={styles.inputRowHalf}>
                                    <InputRadio label={glosary.formLabelElevator} option_1={glosary.formOptionYes} option_2={glosary.formOptionNo} initialValue={!!values.elevator} onChange={handleElevatorChange} />
                                </div>

                            </div>
                            <div className={styles.inputRow}>
                                <div className={styles.inputRowHalf}>
                                    <InputText label={glosary.formLabelParking} description={glosary.formLabelOptional} placeholder={glosary.formPlaceholderText} error={errors.parking} touched={touched.parking} value={values.parking} onChange={handleChange('parking')} />
                                </div>
                                <div className={styles.inputRowHalf}>

                                </div>
                            </div>


                        </Form>
                    )}
                </Formik>

            </div>
            <div className={styles.cardFooter}>
                <Button title={glosary.formButtonBack} type='outline' onClick={onBack} />
                <Button title={glosary.formButtonNext} onClick={() => formRef.current?.handleSubmit()} loading={submitting} />
            </div>
        </div>
    )
}

export default StepTwo