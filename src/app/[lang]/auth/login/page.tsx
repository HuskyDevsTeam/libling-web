'use client'
import React, { useRef, useState, use } from 'react';
import styles from './page.module.css'
import globalStyles from '@/app/globals.module.css'
import { authenticate } from '@/app/actions'
import { dict } from '@/app/utils'
import LogoSVG from '@/app/components/icons/logoSVG'
import { poppinsMedium, poppinsRegular } from '@/app/fonts'
import { toast } from 'react-toastify'
import CustomToast from '@/app/components/toast'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { Button } from '@/app/components/admin/button'
import { useRouter } from 'next/navigation'

const Login = (props: { params: Promise<{ lang: "es" | "en" | "fr" }> }) => {
    const params = use(props.params);
    const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null)
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null)
    const lang = params.lang
    const glosary = dict[lang]?.auth
    const [focusedEmail, setFocusedEmail] = useState(false)
    const [loading, setLoading] = useState(false)
    const [focusedPassword, setFocusedPassword] = useState(false)
    const [errorPassword, setErrorPassword] = useState(false)
    const [visiblePassword, setVisiblePassword] = useState(false)
    const [errorEmail, setErrorEmail] = useState(false)
    const router = useRouter()
    const onFocusEmail = () => {
        if (!errorEmail) {
            setFocusedEmail(true)
        }
    }
    const onBlurEmail = () => setFocusedEmail(false)
    const onFocusPassword = () => {
        if (!errorPassword) {
            setFocusedPassword(true)
        }
    }
    const onBlurPassword = () => setFocusedPassword(false)
    const emailRef = useRef<HTMLInputElement | null>(null)
    const passwordRef = useRef<HTMLInputElement | null>(null)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setLoading(true)
            const formData = new FormData()
            const email = emailRef.current?.value?.trim()
            const password = passwordRef.current?.value
            if (!email) {
                setErrorEmail(true)
                setEmailErrorMessage(glosary.login_email_required)
                setLoading(false)
            }
            if (!password) {
                setErrorPassword(true)
                setPasswordErrorMessage(glosary.login_password_required)
                setLoading(false)
            }
            if (!email || !password) return
            if (email) formData.append('email', email)
            if (password) formData.append('password', password)
            const response = await authenticate(undefined, formData)
            if (response)
                toast.error(<CustomToast type='error' title='Error' content={glosary.error_credentials} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        }
        catch (e) {
            toast.error(<CustomToast type='error' title='Error' content={glosary.error_default} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })

        } finally {
            setLoading(false)

        }
    }
    const handleTypeEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.currentTarget.value !== '') {
            setErrorEmail(false)
            setEmailErrorMessage(null)
            setFocusedEmail(true)
        }
    }
    const handleTypePassword = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.currentTarget.value !== '') {
            setErrorPassword(false)
            setPasswordErrorMessage(null)
            setFocusedPassword(true)
        }

    }
    return (
        <section className={styles.section}>
            
            <LogoSVG />
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.title} style={poppinsMedium.style}>{glosary.login_title}</h2>
                    <h4 className={styles.subtitle} style={poppinsRegular.style}>{glosary.login_subtitle}</h4>
                </div>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formControl}>
                        <label htmlFor="emailInput" style={poppinsMedium.style} className={focusedEmail ? styles.labelActive : errorEmail ? styles.labelError : undefined}>{glosary.login_email}</label>
                        <div className={styles.inputContainer}>
                            <input id='emailInput' name='email' type="email" ref={emailRef} placeholder={glosary.login_placeholder} style={poppinsRegular.style} onFocus={onFocusEmail} onBlur={onBlurEmail} onKeyDown={handleTypeEmail} className={focusedEmail ? styles.inputFocus : errorEmail ? styles.inputError : styles.input} />
                        </div>
                        {
                            !!emailErrorMessage && <span className={styles.errorMessage} style={poppinsRegular.style}>{emailErrorMessage}</span>
                        }
                    </div>
                    <div className={styles.formControl}>
                        <label htmlFor="passwordInput" style={poppinsMedium.style} className={focusedPassword ? styles.labelActive : errorPassword ? styles.labelError : undefined}>{glosary.login_password}</label>
                        <div className={styles.inputContainer}>
                            <input id='passwordInput' name='password' type={visiblePassword ? "text" : "password"} ref={passwordRef} placeholder={glosary.login_placeholder} style={poppinsRegular.style} onFocus={onFocusPassword} onBlur={onBlurPassword} onKeyDown={handleTypePassword} className={focusedPassword ? styles.inputFocus : errorPassword ? styles.inputError : styles.input} />
                            <div className={styles.passwordButton} onClick={() => { setVisiblePassword(state => !state) }}>
                                {
                                    visiblePassword
                                        ?
                                        <FiEyeOff className={styles.passwordIcon} />
                                        :
                                        <FiEye className={styles.passwordIcon} />
                                }
                            </div>

                        </div>
                        {
                            !!passwordErrorMessage && <span className={styles.errorMessage} style={poppinsRegular.style}>{passwordErrorMessage}</span>
                        }
                    </div>
                    <div className={styles.checkboxControl}>
                        <input type="checkbox" id="cboxInput" name="remember_me" />
                        <label htmlFor="cboxInput">{glosary.login_remember}</label>
                    </div>
                    <Button title={glosary.login_button} loading={loading} type='main' submit={true} />
                </form>
                <Button title={glosary.login_forgot} type='text' onClick={() => { router.push('/auth/forgot-password') }} />
            </div>
        </section>
    )
}

export default Login