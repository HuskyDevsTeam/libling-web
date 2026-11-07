'use client'
import { Form, Formik, FormikHelpers, FormikProps } from 'formik'
import React, { useRef, useState } from 'react'
import { dict } from '../utils'
import { ILang } from '../interfaces'
import * as Yup from 'yup';
import styles from './contactForm.module.css'
import { InputText } from './admin/inputText';
import { poppinsMedium } from '../fonts';
import { sendImmoInquiry } from '@/mailActions'
import { useAntiSpam } from './antiSpam'
import CustomToast from './toast'
import { toast } from 'react-toastify'
import { Button } from './admin/button'



interface IValues {
    name?: string
    email?: string
}
const ContactForm = ({ lang }: ILang) => {
    const glosaryContact = dict[lang]?.contact
    const glosaryAdmin = dict[lang]?.adminProperties
    const glosary = dict[lang]?.immo
    const formRef = useRef<FormikProps<IValues>>(null)
    const [loading,setLoading] = useState(false)
    const spam = useAntiSpam()
    const initialValues: IValues = {
        name: '',
        email: '',

    }
    const validationSchema = Yup.object({
        name: Yup.string().required(glosaryAdmin.formValidationRequired),
        email: Yup.string().email(glosaryAdmin.formValidationEmail).required(glosaryAdmin.formValidationRequired),
    });
    const handleSubmit = async (values: IValues, { setSubmitting }: FormikHelpers<IValues>) => {
        const currentURL = window.location.toString()
        try {
            setLoading(true)
            const result = await sendImmoInquiry({ email: values.email ?? '', name: values.name ?? '', pageUrl: currentURL, lang, ...spam.read() })
            spam.reset()
            if (!result.ok) throw new Error(result.reason)
            toast.success(<CustomToast type='success' title={glosary.success} content={glosary.successEmail} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })
            
        } catch (error) {
            console.error(error)
            toast.error(<CustomToast type='error' title='Error' content={glosary.failEmail} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        } finally{
            setLoading(false)
        }
    }
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            innerRef={formRef}
            enableReinitialize
        >
            {({ values, handleChange, errors, touched }) => (
                <Form className={styles.card}>
                    <h4 className={styles.formTitle} style={poppinsMedium.style}>{glosary.contactFormTitle}</h4>
                    <InputText label={glosaryContact.form_name} name='name' placeholder={glosaryAdmin.formPlaceholderText} value={values.name} error={errors.name} touched={touched.name} onChange={handleChange('name')} />
                    <InputText label={glosaryContact.form_email} name='email' placeholder={glosaryAdmin.formPlaceholderText} value={values.email} error={errors.email} touched={touched.email} onChange={handleChange('email')} />
                    {spam.field}
                    <div className={styles.buttonContainer}>
                        <Button title={'Whatsapp'} type='outline' icon='ws' goTo={`https://api.whatsapp.com/send?phone=${352691367757}`}/>
                        <button className={styles.button} style={poppinsMedium.style} disabled={loading}>
                            {glosary.contactFormButton}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default ContactForm