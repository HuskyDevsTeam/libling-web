'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import styles from './editForm.module.css'
import { dict } from '@/app/utils'
import { poppinsMedium } from '@/app/fonts'
import { Button } from '@/app/components/admin/button'
import { InputText } from '@/app/components/admin/inputText'
import { InputTextArea } from '@/app/components/admin/inputTextArea'
import CustomToast from '@/app/components/toast'
import { updateProperty } from '@/services'
import { IPropertyEditValues, buildUpdateDTO } from '@/app/utils/propertyEdit'
import { langType } from '@/app/interfaces'

interface IEditForm {
    lang: langType
    initial: IPropertyEditValues & { id: number }
}

const EditForm: React.FC<IEditForm> = ({ lang, initial }) => {
    const glosary = dict[lang].adminProperties
    const router = useRouter()
    const { id, ...initialValues } = initial
    const numberField = Yup.string().matches(/^\d*(\.\d+)?$/, glosary.editRequired).nullable()
    const schema = Yup.object({
        title: Yup.string().trim().required(glosary.editRequired),
        address: Yup.string().trim().required(glosary.editRequired),
        price: numberField,
        area: numberField,
        bedrooms: numberField,
        bathrooms: numberField,
    })
    const handleSubmit = async (values: IPropertyEditValues) => {
        try {
            await updateProperty(id, buildUpdateDTO(values))
            toast.success(<CustomToast type='success' title='OK' content={glosary.toastUpdate} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })
            router.push(`/admin/properties/${id}`)
            router.refresh()
        } catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={'error'} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        }
    }
    return (
        <div className={styles.card}>
            <h1 className={styles.title} style={poppinsMedium.style}>{glosary.editTitle}</h1>
            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
                {({ values, errors, touched, handleChange, isSubmitting }) => (
                    <Form className={styles.form} data-testid='edit-property-form'>
                        <InputText name='title' label={glosary.formLabelTitle} value={values.title} onChange={handleChange} error={errors.title} touched={touched.title} />
                        <InputTextArea name='content' label={glosary.formLabelDescription} value={values.content} onChange={handleChange} />
                        <InputText name='address' label={glosary.formLabelAddress} value={values.address} onChange={handleChange} error={errors.address} touched={touched.address} />
                        <div className={styles.row}>
                            <InputText name='price' label={glosary.formLabelPrice} value={values.price} onChange={handleChange} error={errors.price} touched={touched.price} />
                            <InputText name='area' label={glosary.formLabelArea} value={values.area} onChange={handleChange} error={errors.area} touched={touched.area} />
                        </div>
                        <div className={styles.row}>
                            <InputText name='bedrooms' label={glosary.formLabelBedrooms} value={values.bedrooms} onChange={handleChange} error={errors.bedrooms} touched={touched.bedrooms} />
                            <InputText name='bathrooms' label={glosary.formLabelBathrooms} value={values.bathrooms} onChange={handleChange} error={errors.bathrooms} touched={touched.bathrooms} />
                        </div>
                        <InputText name='view' label={glosary.formLabelView} value={values.view} onChange={handleChange} />
                        <InputTextArea name='benefits' label={glosary.formLabelBenefits} description={glosary.editListHint} value={values.benefits} onChange={handleChange} />
                        <InputTextArea name='nearPlaces' label={glosary.formLabelNearPlaces} description={glosary.editListHint} value={values.nearPlaces} onChange={handleChange} />
                        <InputTextArea name='legalNotes' label={glosary.formLabelLegalNotes} description={glosary.editListHint} value={values.legalNotes} onChange={handleChange} />
                        <label className={styles.check}>
                            <input type='checkbox' name='furnished' checked={values.furnished} onChange={handleChange} />
                            <span>{glosary.formLabelFurnished}</span>
                        </label>
                        <label className={styles.check}>
                            <input type='checkbox' name='active' checked={values.active} onChange={handleChange} />
                            <span>{glosary.activePub}</span>
                        </label>
                        <div className={styles.buttons}>
                            <Button title={glosary.formButtonReturn} type='outline' onClick={() => { router.back() }} />
                            <Button title={glosary.formButtonSave} submit loading={isSubmitting} />
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default EditForm
