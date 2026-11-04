'use client'
import React, { MouseEventHandler, useEffect, useRef, useState } from 'react'
import styles from './input.module.css'
import { poppinsMedium, poppinsRegular } from '@/app/fonts'
import { FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi'
import { IInputSelect, ISelectElement, dataTranslate } from '@/app/interfaces'
import { dict } from '@/app/utils'

const InputSelect: React.FC<IInputSelect> = ({ label, placeholder, list, error, touched, description, onChange, name, initialValue, lang }) => {
    const [focused, setFocused] = useState(false)
    const [openList, setOpenList] = useState(false)
    const [listFiltered, setListFiltered] = useState<ISelectElement[]>(list || [])
    const inputRef = useRef<HTMLInputElement | null>(null)
    const labelOf = (el: ISelectElement) => (!!lang && !!el.value && el.value in dict[lang].data && dict[lang].data[el.value as dataTranslate]) ? dict[lang].data[el.value as dataTranslate] : el.value.toString()
    const hasValue = (v: unknown) => v !== undefined && v !== null && v !== ''

    const handleChange: ((el: ISelectElement) => void) | undefined = (e) => {
                if (hasValue(e.value) && (!error || !touched)) setFocused(true)
        if (hasValue(e.key) && hasValue(e.value) && !!onChange) {
            if (inputRef?.current) {

                inputRef.current.value = labelOf(e)


            }
            onChange(e.key.toString())
        }
        handleBlur()
    }
    const handleClick: MouseEventHandler<HTMLDivElement> = () => {
        if (openList && inputRef?.current) {
            inputRef.current?.blur()
        } else {
            inputRef.current?.focus()
        }
    }
    const handleFocus = () => {
        if (!error || !touched) {
            setFocused(true)
        }
        setOpenList(true)
    }
    const handleBlur = () => {
        if (!error || !touched) {
            setFocused(false)
        }
        setTimeout(()=>{
            setOpenList(false)
        },200)
    }
    useEffect(() => {
        if (!!list) {
            setListFiltered(list)
        }
    }, [list])
    useEffect(() => {
        if (!inputRef.current) return
        if (hasValue(initialValue)) {
            const initialElement = list?.find(el => el.key.toString() === initialValue?.toString())
            if (initialElement) inputRef.current.value = labelOf(initialElement)
        } else if (initialValue === '') {
            inputRef.current.value = ''
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue, list, lang])
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
                <input id={`${name}Input`} name={name} type={"text"} ref={inputRef} readOnly placeholder={placeholder} style={{ cursor: 'pointer', ...poppinsRegular.style }} onFocus={handleFocus} onBlur={handleBlur} className={(error && touched) ? styles.inputError : focused ? styles.inputFocus : styles.input} />
                <div className={styles.passwordButton} onClick={handleClick}>
                    {
                        openList
                            ?
                            <FiChevronUp className={styles.passwordIcon} />
                            :
                            <FiChevronDown className={styles.passwordIcon} />
                    }
                </div>
                <div className={openList ? styles.listContainer : styles.listContainerHidden}>
                    {
                        listFiltered.map((el, index) => (
                            <div key={index} className={styles.listItem} onMouseDown={(ev) => { ev.preventDefault(); handleChange(el) }}>
                                {
                                    (!!lang && !!el.value && el.value in dict[lang].data && dict[lang].data[el.value as dataTranslate])
                                        ?
                                        dict[lang].data[el.value as dataTranslate]
                                        :
                                        el.value
                                }
                                {
                                    !!el.description ? <span className={styles.listItemDescription}>
                                        {` (${el.description})`}
                                    </span> : null
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
            {
                !!(error && touched) && <span className={styles.errorMessage} style={poppinsRegular.style}>{error}</span>
            }
        </div>
    )
}

export default InputSelect
