'use client'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'
import { dict } from '../utils'
import InputSwitch from './admin/inputSwitch'
import InputSelect from './admin/inputSelect'
import { InputText } from './admin/inputText'
import { FiSearch } from 'react-icons/fi'
import Loader from './admin/loader'
import styles from './propertySearchForm.module.css'
import { poppinsMedium } from '../fonts'
import { ISelectElement, langType } from '../interfaces'

interface ISearchForm{
    list:ISelectElement[]
    lang:langType
}

const PropertySearchForm:React.FC<ISearchForm> = ({list, lang}) => {
    const glosaryAdmin = dict[lang]?.adminProperties
  const glosary = dict[lang]?.immo
    const mainColor = '#FFB34C'
    const textColor = '#000000DD'
    const [type, setType] = useState<string | number>(1)
    const [address, setAddress] = useState<string>('')
    const [propertyType, setPropertyType] = useState<string>('')
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const listSwitch = [
        {
            key: 1,
            value: glosaryAdmin.formLabelSale,
        },
        {
            key: 0,
            value: glosaryAdmin.formLabelRent,
        },
    ]
    const handlePropertyType = (key: string) => {
        setPropertyType(key)
    }
    const handleSellType = (key: string | number) => {
        setType(key)
    }
    const handleAddress: ((e: string | React.ChangeEvent<any>) => void) | undefined = (e) => {
        if (typeof e !== 'string') {
            setAddress(e.target.value)
        }
    }
    const handleSubmit = () => {
        const urlQuery = new URLSearchParams('')
        urlQuery.append('type', type.toString())
        urlQuery.append('propertyType', propertyType.toString())
        urlQuery.append('address', address.toString())

        startTransition(() => {
            router.push(`/immo/search?${urlQuery.toString()}`)
        })
    }
    return (
        <div className={styles.formHeader}>
            <InputSwitch list={listSwitch} initialValue={1} onChange={handleSellType} label={glosaryAdmin.formLabelCategory} mainColor={mainColor} textColor={textColor} />
            <InputSelect label={glosaryAdmin.formLabelPropertyType} placeholder={glosaryAdmin.formPlaceholderSelect} list={list} onChange={handlePropertyType} lang={lang} />
            <InputText label={glosaryAdmin.formLabelAddress} placeholder='Ej.: 17, rue du Marché-aux-Herbes' value={address} onChange={handleAddress} />
            <button className={styles.headerButton} onClick={handleSubmit} disabled={isPending} aria-busy={isPending}>
                {
                    isPending
                        ? <span style={{ display: 'inline-block', width: 90, height: 20 }}><Loader color="#FFFFFF" /></span>
                        : <>
                            <FiSearch className={styles.headerButtonIcon} />
                            <span className={styles.headerButtonText} style={poppinsMedium.style}>
                                {glosary.headerButton}
                            </span>
                        </>
                }
            </button>
        </div>
    )
}

export default PropertySearchForm