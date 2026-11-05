import React, { useEffect, useState } from 'react'
import styles from './propertyList.module.css'
import globalStyles from '@/app/globals.module.css'
import { IPropertyData } from '@/app/interfaces/models'
import { poppinsMedium } from '@/app/fonts'
import { rentPaymentPeriods } from '@/app/utils/data'
import { dataTranslate, langType } from '@/app/interfaces'
import { dict } from '@/app/utils'
import { FiEdit2, FiEye, FiTrash } from 'react-icons/fi'
import placeholder from '@/app/img/100.jpeg'

import Image from 'next/image'

export const SUMMARY_MAX_CHARS = 150
export const TITLE_MAX_CHARS = 40
export const truncateText = (text: string | null | undefined, max: number = SUMMARY_MAX_CHARS) => {
    const clean = (text ?? '').replace(/\s+/g, ' ').trim()
    return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean
}

interface IListItem {
    item: IPropertyData
    lang: langType
    isChecked?: boolean
    onSelect?: (id: number) => void
    onEdit?: (id: number) => void
    onPreview?: (id: number) => void
    onDelete?: (id: number, active: boolean) => void
}

const PropertyListItem: React.FC<IListItem> = ({ item, lang, onSelect, onPreview, onDelete, onEdit, isChecked = false }) => {
    const glosaryData = dict[lang].data
    const glosaryAdmin = dict[lang].adminProperties
    const glosary = dict[lang].immo
    const [checked, setChecked] = useState(isChecked)
    const handleSelect = (event: React.FormEvent<HTMLInputElement>) => {
        if (onSelect) onSelect(item.id)
    }
    useEffect(() => {
        setChecked(isChecked)
    }, [isChecked])
    return (
        <tr>
            <td>
                <div className={globalStyles.checkboxControl}>
                    <input type="checkbox" id="cboxInput" name="select_all" onChange={handleSelect} checked={checked} />
                </div>
            </td>
            <td>
                <div className={styles.basicContainer}>
                    <Image className={styles.basicMini} src={item.thumbnail || placeholder} alt={item.title} width={70} height={70} style={{ width: 70, height: 70, minWidth: 70, objectFit: 'cover' }} />
                    <div className={styles.basicTextContainer}>
                        <span className={styles.basicTitle}>{truncateText(item.title, TITLE_MAX_CHARS)}</span>
                        <span className={styles.basicSubtitle}>{truncateText(item.content)}</span>
                    </div>
                </div>
            </td>
            <td>
                <div className={styles.priceContainer}>
                    {
                        !!item.currency &&
                        <span className={styles.price} style={poppinsMedium.style}>{item.currency.symbol}{" "}</span>
                    }
                    {
                        !!item.price &&
                        <span className={styles.price} style={poppinsMedium.style}>{item.price.toLocaleString('en-US')}</span>
                    }
                    {
                        (item.frecuency !== '0') &&
                        <span className={styles.frecuency}>{` / ${item.frecuency ? rentPaymentPeriods.find(element => item.frecuency?.toString() === element.key.toString())?.value : undefined}`}</span>
                    }
                </div>
            </td>
            <td>
                {`${item.propertyType.name in glosaryData ? glosaryData[item.propertyType.name as dataTranslate] : item.propertyType.name} ${glosary.miniatureConector} ${item.type ? glosaryAdmin.formLabelSale.toLocaleLowerCase() : glosaryAdmin.formLabelRent.toLocaleLowerCase()}`}
            </td>
            <td>
                {
                    item.active
                        ?
                        <span className={styles.badgeActive}>
                            {glosaryAdmin.listActive}
                        </span>
                        :
                        <span className={styles.badge}>

                            {glosaryAdmin.listInactive}
                        </span>
                }
            </td>
            <td>
                <div className={styles.actionContainer}>
                    <FiEye className={styles.action} data-testid={`preview-property-${item.id}`} aria-label={glosaryAdmin.actionPreview} onClick={!!onPreview ? () => { onPreview(item.id) } : () => { }} />
                    <FiEdit2 className={styles.action} data-testid={`edit-property-${item.id}`} aria-label={glosaryAdmin.actionEdit} onClick={!!onEdit ? () => { onEdit(item.id) } : () => { }} />
                    <FiTrash className={styles.action} aria-label="delete" onClick={!!onDelete ? () => { onDelete(item.id, item.active) } : () => { }} />
                </div>
            </td>
        </tr>
    )
}

export default PropertyListItem