'use client'
import { IAffiliateList } from '@/app/interfaces'
import React, { useEffect, useRef, useState } from 'react'
import styles from './affiliateList.module.css'
import { dict } from '@/app/utils'
import { poppinsMedium, poppinsRegular, poppinsSemiBold } from '@/app/fonts'
import { InputSearch } from './inputSearch'
import { useDebounce } from '@/app/hooks/useDebounce'
import { Button } from './button'
import useStore from '@/app/hooks/useStore'
import { useInterfaceStore } from '@/app/hooks/useInterfaceStore'
import InputSelectMini from './inputSelecMini'
import { getAffiliates, showAffiliate } from '@/services'
import { IAffiliateShow, IMetaPaginate } from '@/app/interfaces/models'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import Modal from './modal'
import { toast } from 'react-toastify'
import CustomToast from '../toast'
import { useRouter } from 'next/navigation'
import AffiliateListItem from './affiliateListItem'

const AffiliateList: React.FC<IAffiliateList> = ({ lang, initialData, metaData }) => {
    const glosary = dict[lang].adminAffiliate
    const glosaryService = dict[lang].services
    const glosaryImmo = dict[lang].immo
    const store = useStore(useInterfaceStore, (state) => state)
    const [properties, setProperties] = useState(initialData)
    const [meta, setMeta] = useState<IMetaPaginate | undefined>(metaData)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [selected, setSelected] = useState<number[]>([])
    const [openPreview, setOpenPreview] = useState<boolean>(false)
    const [affiliate, setAffiliate] = useState<IAffiliateShow>()
    const [tab, setTab] = useState(0)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search.trim(), 400)
    const router = useRouter()
    const plans = {
        'Student':glosaryService.planTitle1,
        'JobSeeker':glosaryService.planTitle2,
        'Business':glosaryService.planTitle3,
    }
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
        if (data?.meta && data.meta.page !== currentPage) setCurrentPage(data.meta.page)
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
    const handlePreview = async (id: number) => {
        store?.setLoading(true)
        try {
            const affiliate = await showAffiliate({ id })
            if (!!affiliate) setAffiliate(affiliate)
            setOpenPreview(true)

        } catch {
            toast.error(<CustomToast type='error' title={'Error'} content={'Error'} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })

        } finally {
            store?.setLoading(false)

        }
    }
    useEffect(() => {
        setProperties(initialData)
    }, [initialData])
    const skipInitialFetch = useRef(true)
    useEffect(() => {
        // The server already rendered page 1 with default filters; avoid a duplicate query on mount.
        if (skipInitialFetch.current) {
            skipInitialFetch.current = false
            if (store?.limit === 15 && currentPage === 1 && tab === 0 && !debouncedSearch) return
        }
        if (store?.limit) {
            fetchProperties()
        }
    }, [store?.limit, currentPage, tab, debouncedSearch])
    return (
        <div className={styles.card}>
            <Modal open={openPreview} onRequestClose={() => { setOpenPreview(false) }} width='80vw'>
                <div className={styles.modalHeader}>
                    <h5 style={poppinsRegular.style} className={styles.sectionTitle}>{affiliate?.name}</h5>
                    <p className={styles.fadedTextHeader}>{affiliate?.phone}</p>
                    <p className={styles.fadedTextHeader}>{affiliate?.email}</p>
                </div>
                <div className={styles.modalDescription}>
                    <div className={styles.rowDescription}>
                        <span className={styles.rowDescriptionBase}>
                            {glosary.listLastPay}
                        </span>
                        <span style={poppinsSemiBold.style} className={styles.rowDescriptionBase}>
                            {affiliate?.Pay?.at(-1)?.date?.toLocaleString(lang, {dateStyle:'medium', timeStyle:'medium', hour12:true})}
                        </span>
                    </div>
                    <div className={styles.rowDescription}>
                        <span className={styles.rowDescriptionBase}>
                            {glosary.listStatus}
                        </span>
                        {
                            (!!affiliate?.plan_date && affiliate?.plan_date > new Date())
                            ?
                            <span className={styles.badgeActive}>
                                {glosary.listActive}
                            </span>
                            :
                            <span className={styles.badge}>
    
                                {glosary.listInactive}
                            </span>
                        }
                    </div>
                    <div className={styles.rowDescription}>
                        <span className={styles.rowDescriptionBase}>
                            {glosaryService.planDate}
                        </span>
                        <span style={poppinsSemiBold.style} className={styles.rowDescriptionBase}>
                            {affiliate?.plan_date?.toLocaleString(lang, {dateStyle:'medium', timeStyle:'medium', hour12:true})}
                        </span>
                    </div>
                </div>
                <div className={styles.modalList}>
                    <h6 style={poppinsMedium.style} className={styles.listTitle}>
                        {glosary.detailTitle}
                        <span style={poppinsRegular.style}>
                            {affiliate?.name}
                        </span>
                    </h6>
                    <div className={styles.listRow} style={poppinsSemiBold.style}>
                        <div className={styles.listColumnTitle}>
                            {glosary.detailColumn1}
                        </div>
                        <div className={styles.listColumnTitle}>
                            {glosary.detailColumn2}
                        </div>
                        <div className={styles.listColumnTitle}>
                            {glosary.detailColumn3}
                        </div>
                    </div>
                    <div style={{maxHeight:200, overflowY:'scroll'}}>
                    {
                        affiliate?.Pay.filter(el=>el.status).reverse().map((el,index) => (
                            <div className={styles.listRow} key={index}>
                                <div className={styles.listColumnContent}>
                                    {el.reference}
                                </div>
                                <div className={styles.listColumnContent}>
                                    {el.date?.toLocaleString(lang, {dateStyle:'medium', timeStyle:'medium', hour12:true})}
                                </div>
                                <div className={styles.listColumnContent}>
                                    {plans[affiliate.plan]}
                                </div>
                            </div>
                        ))
                    }

                    </div>
                </div>
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
                    <thead>
                        <th style={poppinsMedium.style}>{glosary.listName}</th>
                        <th style={poppinsMedium.style}>{glosary.listPhone}</th>
                        <th style={poppinsMedium.style}>{glosary.listEmail}</th>
                        <th style={poppinsMedium.style}>{glosary.listLastPay}</th>
                        <th style={poppinsMedium.style}>{glosary.listStatus}</th>
                        <th style={poppinsMedium.style}>{glosary.listActions}</th>
                    </thead>
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
                        {(properties?.length || 0) === 0 ? 0 : ((meta?.dataPerPage || 15) * (currentPage - 1)) + 1}
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