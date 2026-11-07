import React, { useRef, useState } from 'react'
import styles from './input.module.css'
import { poppinsMedium, poppinsRegular } from '@/app/fonts'
import { ITextInput } from '@/app/interfaces'

export const InputTextArea: React.FC<ITextInput> = ({ name, error, touched, label, placeholder, Icon, description, onChange, value }) => {
    // const [active, setActive] = useState(false)
    const [focused, setFocused] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const handleChange: ((e: string | React.ChangeEvent<any>) => void) | undefined = (e) => {
        if (!!value && (!error || !touched)) setFocused(true)
        if (!!e && !!onChange) {
            onChange(e)
        }
    }
    const handleFocus = () => {
        if (!error || !touched) {
            setFocused(true)
        }
    }
    const handleBlur = () => {
        if (!error || !touched) {
            setFocused(false)
        }
    }
    return (
        <div className={styles.formControl}>
            {
                !!label
                &&
                <label htmlFor={`${name}Input`} style={poppinsMedium.style} className={error && touched ? styles.labelError : focused ? styles.labelActive : undefined}>
                    <span>{label}</span>
                    {
                        !!description &&
                        <span className={styles.descriptionLabel}>{" "}({description})</span>
                    }
                </label>
            }
            <div className={styles.inputContainer}>
                <textarea id={`${name}Input`} name={name} ref={inputRef} value={value} placeholder={placeholder} style={poppinsRegular.style} onFocus={handleFocus} onBlur={handleBlur} onChange={handleChange} className={(error && touched) ? styles.inputError : focused ? styles.inputFocus : styles.input} rows={4} />
            </div>
            {
                !!(error && touched) && <span className={styles.errorMessage} style={poppinsRegular.style}>{error}</span>
            }
        </div>
    )
}
