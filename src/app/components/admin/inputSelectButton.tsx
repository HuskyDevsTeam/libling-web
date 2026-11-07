'use client'
import React, { MouseEventHandler, useEffect, useRef, useState } from 'react'
import useSyncedState from '@/app/hooks/useSyncedState'
import styles from './input.module.css'
import buttonStyles from './buttonOutline.module.css'
import { poppinsMedium, poppinsRegular } from '@/app/fonts'
import { IInputSelect, IInputSelectButton, ISelectElement, dataTranslate } from '@/app/interfaces'
import { dict } from '@/app/utils'

const NO_ITEMS: ISelectElement[] = []
const InputSelectButton: React.FC<IInputSelectButton> = ({list, error, touched, onChange, initialValue, lang,title, loading = false, disabled = false, grow=false }) => {
    const [focused, setFocused] = useState(false)
    const [openList, setOpenList] = useState(false)
    const [currentStyle, setCurrentStyle] = useState(disabled ? buttonStyles.buttonDisabled : buttonStyles.button)
    const [listFiltered, setListFiltered] = useSyncedState<ISelectElement[]>(list || NO_ITEMS)
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
    const handleMouseDown = () => {
        if (!loading && !disabled) {
            setCurrentStyle(buttonStyles?.buttonPressed)
        }
    }
    const handleMouseUp = () => {
        if (!loading && !disabled) {
            setCurrentStyle(buttonStyles.button)
        }
    }
    const handleClick = () => {
        setOpenList(state => !state)
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
            <div className={styles.inputContainer}>
                <button className={currentStyle} onMouseDown={handleMouseDown} onClick={handleClick} onMouseUp={handleMouseUp} onTouchStart={handleMouseDown} onTouchEnd={handleMouseUp} type={'button'} style={{flexGrow: grow ? 1: undefined}} onBlur={handleBlur}>

                    {
                        loading
                            ?
                            <span className={buttonStyles.loader}>
                            </span>
                            :
                            <span style={poppinsMedium.style}>
                                {title}
                            </span>
                    }
                </button>
                <div className={openList ? styles.listContainer : styles.listContainerHidden}>
                    {
                        listFiltered.map((el, index) => (
                            <div key={index} className={styles.listItemButton} onMouseDown={(ev) => { ev.preventDefault(); handleChange(el) }}>
                                {
                                    (!!lang && !!el.value && el.value in dict[lang].data && dict[lang].data[el.value as dataTranslate])
                                        ?
                                        dict[lang].data[el.value as dataTranslate]
                                        :
                                        el.value
                                }
                                {
                                    !!el.description ? <span className={styles.listItemButtonDescription}>
                                        {` ${el.description}`}
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

export default InputSelectButton
