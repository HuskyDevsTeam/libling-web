'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import styles from './profileForms.module.css'
import { InputText } from './inputText'
import { InputPassword } from './inputPassword'
import { Button } from './button'
import { poppinsMedium } from '@/app/fonts'
import { dict } from '@/app/utils'
import { changeOwnPassword, updateProfileName, ProfileResult } from '@/app/actions'

export default function ProfileForms({ lang, name, email }: { lang: 'es' | 'en' | 'fr', name: string, email: string }) {
    const glosary = dict[lang]?.adminNav as Record<string, string>
    const router = useRouter()
    const [nameValue, setNameValue] = useState(name)
    const [savingName, setSavingName] = useState(false)
    const [current, setCurrent] = useState('')
    const [next, setNext] = useState('')
    const [confirm, setConfirm] = useState('')
    const [savingPassword, setSavingPassword] = useState(false)

    const report = (result: ProfileResult, okMessage: string) => {
        if (result.ok) toast.success(okMessage)
        else toast.error(glosary[result.error] || glosary.genericError)
        return result.ok
    }
    const submitName = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingName(true)
        try {
            if (report(await updateProfileName(nameValue), glosary.nameSaved)) router.refresh()
        } catch { toast.error(glosary.genericError) }
        setSavingName(false)
    }
    const submitPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingPassword(true)
        try {
            if (report(await changeOwnPassword(current, next, confirm), glosary.passwordSaved)) {
                setCurrent(''); setNext(''); setConfirm('')
            }
        } catch { toast.error(glosary.genericError) }
        setSavingPassword(false)
    }
    return (
        <div className={styles.grid}>
            <form className={styles.card} onSubmit={submitName}>
                <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.profileTitle}</h2>
                <p className={styles.email}>{glosary.emailLabel}: {email}</p>
                <InputText name="name" label={glosary.nameLabel} value={nameValue} onChange={(e: any) => setNameValue(e?.target?.value ?? e)} />
                <Button submit title={glosary.saveName} loading={savingName} disabled={savingName} />
            </form>
            <form className={styles.card} onSubmit={submitPassword}>
                <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.passwordCardTitle}</h2>
                <InputPassword name="current" label={glosary.currentPassword} value={current} onChange={(e: any) => setCurrent(e?.target?.value ?? e)} />
                <InputPassword name="next" label={glosary.newPassword} value={next} onChange={(e: any) => setNext(e?.target?.value ?? e)} />
                <InputPassword name="confirm" label={glosary.confirmPassword} value={confirm} onChange={(e: any) => setConfirm(e?.target?.value ?? e)} />
                <Button submit title={glosary.savePassword} loading={savingPassword} disabled={savingPassword} />
            </form>
        </div>
    )
}
