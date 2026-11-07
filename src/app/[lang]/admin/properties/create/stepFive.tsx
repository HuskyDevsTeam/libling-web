'use client'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import { poppinsMedium } from '@/app/fonts'
import styles from './page.module.css'
import { dict } from '@/app/utils';
import { IPageSync as IPage } from '../../layout';
import { getCurrencies } from '@/services'
import { ISelectElement } from '@/app/interfaces'
import CustomToast from '@/app/components/toast'
import * as Yup from 'yup';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik'
import { Button } from '@/app/components/admin/button'
import InputSelect from '@/app/components/admin/inputSelect';
import { InputText } from '@/app/components/admin/inputText';
import useStore from '@/app/hooks/useStore';
import { usePropertyStoreFromContext } from '@/app/hooks/PropertyStoreContext'
import { rentPaymentPeriods } from '@/app/utils/data';


interface IValues {
    price?: string
    currency?: number
    frecuency?: number | null
}
interface IStepFive extends IPage {
    onNext: VoidFunction
    onBack: VoidFunction
}



const StepFive: React.FC<IStepFive> = ({ params: { lang }, onNext, onBack }) => {
    const store = useStore(usePropertyStoreFromContext(), (state) => state)
    const glosary = dict[lang]?.adminProperties
    const glosaryError = dict[lang]?.auth
    const [list, setList] = useState<ISelectElement[]>([])
    const [currency, setCurrency] = useState<ISelectElement[]>([])
    const formRef = useRef<FormikProps<IValues>>(null)
    const initialValues: IValues = {
        price: store?.form_5?.price || '',
        currency: store?.form_5?.currency,
        frecuency: store?.form_5?.frecuency || null,
    }

    const [periods, setPeriods] = useState<ISelectElement[]>(rentPaymentPeriods)

    const fetchCurrency = async () => {
        const data = await getCurrencies()
        const newArray = data?.map(el => ({ key: el.id, value: el.symbol, description: el.name }))
        setCurrency(newArray || [])
    }
    const handleCurrency = (key: string) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('currency', key)
    }
    const handleFrecuency = (key: string) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('frecuency', key)
    }
    const validationSchema = Yup.object({
        price: Yup.string().required(glosary.formValidationRequired),
        currency: Yup.number().required(glosary.formValidationRequired),
        frecuency: !store?.form_1?.type ? Yup.number().required(glosary.formValidationRequired) : Yup.number().nullable().optional(),
    });
    const handleSubmit = async (values: IValues, { setSubmitting }: FormikHelpers<IValues>) => {
        const formData = values
        console.log(formData)
        try {
            store?.setForm_5(formData)
            onNext()
        } catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={glosaryError.error_default} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        } finally {
            setSubmitting(false)

        }
    }
    useEffect(() => {
        fetchCurrency()
    }, [])
    return (
        <div className={styles.card}>
            <div className={styles.cardBody}>

                <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.formStepTitle_5}</h2>
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
                                    <InputSelect label={glosary.formLabelCurrency} placeholder={glosary.formPlaceholderSelectText} list={currency} onChange={handleCurrency} initialValue={values.currency} error={errors.currency} touched={touched.currency} />
                                </div>
                                <div className={styles.inputRowHalf}>
                                    <InputText label={glosary.formLabelPrice} placeholder={glosary.formPlaceholderText} value={values.price} error={errors.price} touched={touched.price} onChange={handleChange('price')}  />
                                </div>
                            </div>
                            {
                                !(store?.form_1?.type)
                                ?
                                <InputSelect label={glosary.formLabelFrecuency} placeholder={glosary.formPlaceholderSelectText} list={periods} onChange={handleFrecuency} initialValue={values.frecuency} error={errors.frecuency} touched={touched.frecuency}/>
                                :
                                null
                            }

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

export default StepFive