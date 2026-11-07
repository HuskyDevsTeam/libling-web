'use client'
import React, { useEffect, useLayoutEffect, useState, use } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { dict } from '@/app/utils';
import CustomToast from '@/app/components/toast';
import { toast } from 'react-toastify';
import { InputText } from '@/app/components/admin/inputText';
import styles from './page.module.css'
import { Button } from '@/app/components/admin/button';
import LogoSVG from '@/app/components/icons/logoSVG';
import { poppinsMedium, poppinsRegular } from '@/app/fonts';
import { InputPassword } from '@/app/components/admin/inputPassword';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosRequestConfig } from 'axios';
import { useAuthFetch } from '@/hooks/useFetch';
import { FiCheckCircle } from 'react-icons/fi';

interface IValues {
    password: string
    passwordConfirmation: string
}

const ChangePassword = (props: { params: Promise<{ lang: "es" | "en" | "fr" }> }) => {
    const params = use(props.params);
    const lang = params.lang
    const glosary = dict[lang]?.auth
    const glosaryNav = dict[lang]?.adminNav
    const router = useRouter()
    const token = useSearchParams().get('token')
    const authFetch = useAuthFetch()
    const [success, setSuccess] = useState(false)
    const options: AxiosRequestConfig<any> = {
        headers: {
            token
        }
    }
    const validationSchema = Yup.object({
        password: Yup.string().required(glosary.login_password_required)
            .min(8, glosaryNav.passwordMin)
            .test('max-bytes', glosaryNav.passwordMax, (value) => new TextEncoder().encode(value || '').length <= 72),
        passwordConfirmation: Yup.string().required(glosary.login_password_confirmation_required).nonNullable()
            .oneOf([Yup.ref('password')], glosary.login_password_confirmation_required)
    });
    const handleSubmit = async (values: IValues, { setSubmitting }: FormikHelpers<IValues>) => {
        try {
            await authFetch({
                endpoint: 'change-password',
                formData: values,
                options
            })
            setSuccess(true)
        } catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={glosary.error_default} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className={styles.section}>
            <LogoSVG />
            {
                success
                    ?
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <FiCheckCircle className={styles.icon} />
                            <h2 className={styles.title} style={poppinsMedium.style}>{glosary.email_set_title}</h2>
                            <h4 className={styles.subtitle} style={poppinsRegular.style}>{glosary.email_set_subtitle}</h4>
                        </div>
                        <Button title={glosary.formButtonContinue} type='text' onClick={() => { router.push('/auth/login') }} />
                    </div>
                    :
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.title} style={poppinsMedium.style}>{glosary.change_password_title}</h2>
                            <h4 className={styles.subtitle} style={poppinsRegular.style}>{glosary.change_password_subtitle}</h4>
                        </div>
                        <Formik
                            initialValues={{ password: '', passwordConfirmation: '' }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, values, handleChange, errors, touched }) => (
                                <Form className={styles.form}>

                                    <InputPassword label={glosary.login_password} placeholder={glosary.login_placeholder} value={values.password} onChange={handleChange('password')} error={errors.password} touched={touched.password} name='password' />
                                    <InputPassword label={glosary.login_password_confirm} placeholder={glosary.login_placeholder} value={values.passwordConfirmation} onChange={handleChange('passwordConfirmation')} error={errors.passwordConfirmation} touched={touched.passwordConfirmation} name='passwordConfirmation' />
                                    <Button title={glosary.formButtonChangePassword} loading={isSubmitting} submit={true} />
                                    <Button title={glosary.formButtonOrLogin} type='text' onClick={() => { router.push('/auth/login') }} />
                                </Form>
                            )}
                        </Formik>
                    </div>
            }
        </section>
    );
}

export default ChangePassword;