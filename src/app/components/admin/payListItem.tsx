import useSyncedState from '@/app/hooks/useSyncedState'
import React, { useEffect, useState } from 'react'
import styles from './propertyList.module.css'
import globalStyles from '@/app/globals.module.css'
import { IAffiliateData, IPropertyData } from '@/app/interfaces/models'
import { poppinsMedium } from '@/app/fonts'
import { rentPaymentPeriods } from '@/app/utils/data'
import { dataTranslate, langType } from '@/app/interfaces'
import { dict } from '@/app/utils'
import { FiEdit2, FiEye, FiTrash } from 'react-icons/fi'
import placeholder from '@/app/img/100.jpeg'

import Image from 'next/image'

interface IListItem {
    item: IAffiliateData
    lang: langType
    isChecked?: boolean
    onSelect?: (id: number) => void
    onPreview?: (id: number) => void
    onDelete?: (id: number, active: boolean) => void
}

const AffiliateListItem: React.FC<IListItem> = ({ item, lang, onSelect, onPreview, onDelete, isChecked = false }) => {
    const glosaryData = dict[lang].data
    const glosaryAdmin = dict[lang].adminProperties
    const glosary = dict[lang].immo
    const [checked, setChecked] = useSyncedState(isChecked)
    const handleSelect = (event: React.FormEvent<HTMLInputElement>) => {
        if (onSelect) onSelect(item.id)
    }
    return (
        <tr>
            <td>
                {
                    item.name
                }
            </td>
            <td>
                {
                    item.phone
                }
            </td>
            <td>
                {
                    item.email.toLowerCase()
                }
            </td>
            <td>
                {
                    item.Pay.at(-1)?.date?.toLocaleString(lang, {dateStyle:'full'})
                }
            </td>
            <td>
                {
                    item.status
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
                    <FiEye className={styles.action} onClick={!!onPreview ? ()=>{onPreview(item.id)} : () => { }} />
                    {/* <FiEdit2 className={styles.action} onClick={!!onEdit ? onEdit : () => { }} /> */}
                    {/* <FiTrash className={styles.action} onClick={!!onDelete ? () => { onDelete(item.id, item.active) } : () => { }} /> */}
                </div>
            </td>
        </tr>
    )
}

export default AffiliateListItem