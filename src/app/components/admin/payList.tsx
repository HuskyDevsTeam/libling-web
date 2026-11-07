'use client'
import { IAffiliateList, IPropertyList } from '@/app/interfaces'
import React, { useEffect, useState } from 'react'
import styles from './affiliateList.module.css'
import globalStyles from '@/app/globals.module.css'
import { dict } from '@/app/utils'
import { poppinsMedium } from '@/app/fonts'
import { InputSearch } from './inputSearch'
import { useDebounce } from '@/app/hooks/useDebounce'
import { Button } from './button'
import useStore from '@/app/hooks/useStore'
import { useInterfaceStore } from '@/app/hooks/useInterfaceStore'
import InputSelectMini from './inputSelecMini'
import { activeMultipleProperty, deactivateMultipleProperty, deleteProperty, getAffiliates, indexProperty } from '@/services'
import { IMetaPaginate } from '@/app/interfaces/models'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiHome, FiMonitor, FiPause, FiPlay } from 'react-icons/fi'
import Modal from './modal'
import { toast } from 'react-toastify'
import CustomToast from '../toast'
import { useRouter } from 'next/navigation'
import AffiliateListItem from './affiliateListItem'

const AffiliateList: React.FC<IAffiliateList> = ({ lang, initialData, metaData }) => {
    const glosary = dict[lang].adminAffiliate
    const glosaryImmo = dict[lang].immo
    const store = useStore(useInterfaceStore, (state) => state)
    const [properties, setProperties] = useState(initialData)
    const [meta, setMeta] = useState<IMetaPaginate | undefined>(metaData)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [selected, setSelected] = useState<number[]>([])
    const [openPublish, setOpenPublish] = useState<boolean>(false)
    const [openPause, setOpenPause] = useState<boolean>(false)
    const [openPreview, setOpenPreview] = useState<boolean>(false)
    const [openDelete, setOpenDelete] = useState<boolean>(false)
    const [selectedDelete, setSelectedDelete] = useState<{ id: number, active: boolean } | undefined>()
    const [tab, setTab] = useState(0)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search.trim(), 400)
    const router = useRouter()
    const handlePrevPage = (jump: number) => {
        const canGoBack = currentPage - jump > 0
        if (canGoBack) {
            setCurrentPage(state => state - jump)
        }
    }
    const handleNextPage = (jump: number) => {
        const canGoNext = currentPage + jump <= (meta?.totalPages || 1)
        if (canGoNext) {
            setCurrentPage(state => state + jump)
        }
    }
    const handleSelect = (id: number) => {
        if (selected.some(el => el === id)) {
            setSelected(state => state.filter(el => el !== id))
        } else {
            setSelected(state => [...state, id])
        }
    }
    const handleSearch = (e: string | React.ChangeEvent<any>) => {
        setCurrentPage(1)
        setSearch(typeof e === 'string' ? e : e.target.value)
    }
    const fetchProperties = async () => {
        store?.setLoading(true)
        console.log('executing fetch')
        const data = await getAffiliates({ search: debouncedSearch || undefined }, {}, currentPage, store?.limit)
        console.log('affiliateData', data)
        setMeta(data?.meta)
        setProperties(data?.data)
        store?.setLoading(false)
    }

    const paginationList = [
        {
            key: 15,
            value: 15
        },
        {
            key: 20,
            value: 20
        },
        {
            key: 25,
            value: 25
        },
        {
            key: 30,
            value: 30
        },
        {
            key: 40,
            value: 40
        },
        {
            key: 50,
            value: 50
        },
    ]
    const handleLimit = (key: string) => {
        console.log('selected key', key)
        store?.setLimit(parseInt(key))
    }
    const handlePreview = () => { 
        store?.setLoading(true)
        store?.setLoading(false)
        setOpenPreview(true)
     }
    useEffect(() => {
        setProperties(initialData)
    }, [initialData])
    useEffect(() => {
        if (store?.limit) {
            fetchProperties()
        }
    }, [store?.limit, currentPage, tab, debouncedSearch])
    return (
        <div className={styles.card}>
            <Modal open={openPreview} onRequestClose={() => { setOpenPreview(false) }}>
                <FiHome className={styles.modalIconPublish} />
                <h3 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.detailTitle}</h3>
                <div className={styles.modalButtons}>
                    <Button title={glosary.detailAction} type='outline' onClick={() => { setOpenPreview(false) }} />
                </div>
            </Modal>
            <div className={styles.cardTop}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.indexTitle}</h2>
                    <div className={styles.listTools}>
                        <InputSearch placeholder={glosaryImmo.headerButton} value={search} onChange={handleSearch} />
                    </div>
                </div>
            </div>
            <article className={styles.cardContent}>
                <table className={styles.tableContainer}>
                    <thead><tr>
                        <th style={poppinsMedium.style}>{glosary.listName}</th>
                        <th style={poppinsMedium.style}>{glosary.listPhone}</th>
                        <th style={poppinsMedium.style}>{glosary.listEmail}</th>
                        <th style={poppinsMedium.style}>{glosary.listLastPay}</th>
                        <th style={poppinsMedium.style}>{glosary.listStatus}</th>
                        <th style={poppinsMedium.style}>{glosary.listActions}</th>
                    </tr></thead>
                    <tbody>
                        {
                            properties?.map((el, index) => (

                                <AffiliateListItem key={index} item={el} lang={lang} onSelect={handleSelect} isChecked={selected.some(element => el.id === element)} onPreview={handlePreview} />
                            ))
                        }
                    </tbody>
                </table>
                <div className={styles.paginatorContainer}>
                    <span>{glosary.linesPerPage}</span>
                    <InputSelectMini initialValue={store?.limit} list={paginationList} placeholder='15' onChange={handleLimit} />
                    <span>
                        {((meta?.dataPerPage || 15) * (currentPage - 1)) + 1}
                        {" - "}
                        {((meta?.dataPerPage || 15) * (currentPage - 1)) + (properties?.length || 0)}
                        {` ${glosary.formStepConnector} `}
                        {meta?.totalData}
                    </span>
                    <div className={styles.pageControlContainer}>
                        <FiChevronsLeft onClick={() => { handlePrevPage(5) }} />
                        <FiChevronLeft className={styles.pageControl} onClick={() => { handlePrevPage(1) }} />
                        <FiChevronRight className={styles.pageControl} onClick={() => { handleNextPage(1) }} />
                        <FiChevronsRight onClick={() => { handleNextPage(5) }} />
                    </div>
                </div>
            </article>
        </div>
    )
}

export default AffiliateList