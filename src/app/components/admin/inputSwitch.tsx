import { IInputSwitch } from '@/app/interfaces'
import styles from './input.module.css'
import React, { useEffect, useState } from 'react'
import useSyncedState from '@/app/hooks/useSyncedState'
import { poppinsMedium } from '@/app/fonts'

const InputSwitch: React.FC<IInputSwitch> = ({ list, initialValue, onChange, label, mainColor = '#1973FA', textColor = '#fff', backgroundColor='#fff', grow=false }) => {
    const [selected, setSelected] = useSyncedState(initialValue)
    console.log('initial switch key', initialValue)
    const handleClick = (key: string | number) => {
        setSelected(key)
        if (!!onChange) onChange(key)
    }
    return (
        <div className={styles.formControl}>
            {
                !!label
                &&
                <label style={poppinsMedium.style}>
                    <span>{label}</span>
                </label>
            }
            <div className={styles.switchContainer} style={{backgroundColor:backgroundColor, width: grow ? '100%' : 'auto'}}>
                {
                    list.map((el, index) => (
                        <div key={index} className={selected?.toString() === el.key.toString() ? styles.selectedSwitch : styles.switch} style={selected?.toString() === el.key.toString() ? { backgroundColor: mainColor, color: textColor } : undefined} onClick={() => { handleClick(el.key) }}>
                            {el.value}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default InputSwitch