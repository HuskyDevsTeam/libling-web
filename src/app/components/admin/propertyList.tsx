'use client'
import { IPropertyList } from '@/app/interfaces'
import React, { useEffect, useRef, useState } from 'react'
import styles from './propertyList.module.css'
import globalStyles from '@/app/globals.module.css'
import { dict } from '@/app/utils'
import { poppinsMedium } from '@/app/fonts'
import { InputSearch } from './inputSearch'
import { useDebounce } from '@/app/hooks/useDebounce'
import { Button } from './button'
import PropertyListItem from './propertyListItem'
import useStore from '@/app/hooks/useStore'
import { useInterfaceStore } from '@/app/hooks/useInterfaceStore'
import InputSelectMini from './inputSelecMini'
import { activeMultipleProperty, deactivateMultipleProperty, deleteProperty, indexProperty } from '@/services'
import { IMetaPaginate } from '@/app/interfaces/models'
import { FiPlus, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiEdit2, FiHome, FiMonitor, FiPause, FiPlay } from 'react-icons/fi'
import Modal from './modal'
import { toast } from 'react-toastify'
import CustomToast from '../toast'
import { useRouter } from 'next/navigation'

const PropertyList: React.FC<IPropertyList> = ({ lang, initialData, metaData }) => {
    const glosary = dict[lang].adminProperties
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
        const data = await indexProperty({ type: tab === 0 ? undefined : tab === 1 ? true : false, search: debouncedSearch || undefined }, {}, currentPage, store?.limit, false, true)
        console.log('propertyData', data)
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
    const handleCheck = (event: React.FormEvent<HTMLInputElement>) => {
        if (event.currentTarget.checked) {
            setSelected(properties?.map(el => el.id) || [])
        }
        else {
            setSelected([])
        }
    }
    const handleLimit = (key: string) => {
        console.log('selected key', key)
        store?.setLimit(parseInt(key))
    }
    const handleDelete = (id: number, active: boolean) => {
        setSelectedDelete({ id, active })
        setOpenDelete(true)
    }
    const handleNextDelete = async () => {
        store?.setLoading(true)
        setOpenDelete(false)
        const published = await deleteProperty(selectedDelete?.id || 0)
        toast.success(<CustomToast type='success' title={glosaryImmo.success} content={glosary.toastDelete} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })
        await fetchProperties()
        setSelected([])
        store?.setLoading(false)
    }
    const handlePreview = () => { setOpenPreview(true) }
    const handleNextPreview = () => { }
    const handlePublish = () => { setOpenPublish(true) }
    const handleNextPublish = async () => {
        store?.setLoading(true)
        setOpenPublish(false)
        const published = await activeMultipleProperty(selected)
        toast.success(<CustomToast type='success' title={glosaryImmo.success} content={glosary.toastPublish} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })
        await fetchProperties()
        setSelected([])
        store?.setLoading(false)
    }
    const handlePause = () => { setOpenPause(true) }
    const handleNextPause = async () => {
        store?.setLoading(true)
        setOpenPause(false)
        const unpublished = await deactivateMultipleProperty(selected)
        toast.success(<CustomToast type='success' title={glosaryImmo.success} content={glosary.toastPause} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })
        await fetchProperties()
        setSelected([])
        store?.setLoading(false)
    }
    const tabList = [
        {
            tab: 0,
            name: glosary.tabAll
        },
        {
            tab: 1,
            name: glosary.formLabelSale
        },
        {
            tab: 2,
            name: glosary.formLabelRent
        },
    ]
    useEffect(() => {
        setProperties(initialData)
    }, [initialData])
    useEffect(() => {
        console.log("selected Id's", selected)
        if (selected.length >= 1) {
            store?.setShowBar(true)
            store?.setBarContent(() => (
                <div className={styles.actionBar} >
                    <div className={styles.actionInfo} onClick={handlePublish} >
                        <span>{selected.length}{" "}{glosary.selecteds}</span>
                    </div>
                    <div className={styles.actionButton} onClick={handlePublish}>
                        <FiPlay className={styles.actionIcon} />
                        <span>{glosary.actionPublish}</span>
                    </div>
                    <div className={styles.actionButton} onClick={handlePause} >
                        <FiPause className={styles.actionIcon} />
                        <span>{glosary.actionPause}</span>
                    </div>
                    {
                        (selected.length === 1) &&
                        <div className={styles.actionButton} onClick={() => { router.push(`/admin/properties/${selected[0]}/edit`) }} >
                            <FiEdit2 className={styles.actionIcon} />
                            <span>{glosary.actionEdit}</span>
                        </div>
                    }
                </div>
            ))
        }
        return () => { store?.setShowBar(false) }
    }, [selected])
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
            <Modal open={openPublish} onRequestClose={() => { setOpenPublish(false) }}>
                <FiHome className={styles.modalIconPublish} />
                <h3 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.modalPublishConfirm}</h3>
                <div className={styles.modalButtons}>
                    <Button title={glosary.formButtonReturn} type='outline' onClick={() => { setOpenPublish(false) }} />
                    <Button title={glosary.actionPublish} onClick={handleNextPublish} />
                </div>
            </Modal>
            <Modal open={openPause} onRequestClose={() => { setOpenPause(false) }}>
                <FiHome className={styles.modalIconPublish} />
                <h3 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.modalPauseConfirm}</h3>
                <div className={styles.modalButtons}>
                    <Button title={glosary.formButtonReturn} type='outline' onClick={() => { setOpenPause(false) }} />
                    <Button title={glosary.actionPublish} onClick={handleNextPause} />
                </div>
            </Modal>
            <Modal open={openPreview} onRequestClose={() => { setOpenPreview(false) }}>
                <FiHome className={styles.modalIconPublish} />
                <h3 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.modalPublishConfirm}</h3>
                <div className={styles.modalButtons}>
                    <Button title={glosary.formButtonReturn} type='outline' onClick={() => { setOpenPreview(false) }} />
                    <Button title={glosary.actionPublish} onClick={handleNextPreview} />
                </div>
            </Modal>
            <Modal open={openDelete} onRequestClose={() => { setOpenDelete(false) }}>
                <FiHome className={styles.modalIconDelete} />
                <h3 style={poppinsMedium.style} className={styles.sectionTitle}>{selectedDelete?.active ? glosary.modalDeleteTitle : glosary.modalDeletePauseTitle}</h3>
                {
                    selectedDelete?.active &&
                    <p className={styles.modalText}>

                        {glosary.modalDeleteText}

                    </p>
                }
                <div className={styles.modalButtons}>
                    <Button title={glosary.formButtonReturn} type='outline' onClick={() => { setOpenDelete(false) }} />
                    <Button title={glosary.modalDeleteButton} onClick={handleNextDelete} type='error' />
                </div>
            </Modal>
            <div className={styles.cardTop}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.indexTitle}</h2>
                    <div className={styles.listTools}>
                        <InputSearch placeholder={glosaryImmo.headerButton} value={search} onChange={handleSearch} />
                        <div className={styles.registerDesktop}>
                            <Button title={glosary.formButtonRegister} goTo={'/admin/properties/create'} type='main' />
                        </div>
                    </div>
                </div>
                {
                    selected.length === 0 &&
                    <button type='button' className={styles.fab} aria-label={glosary.formButtonRegister} title={glosary.formButtonRegister} onClick={() => { router.push('/admin/properties/create') }}>
                        <FiPlus />
                    </button>
                }
                <div className={styles.tabContainer}>
                    {
                        tabList.map((el, index) => (<div key={index} className={tab === el.tab ? styles.selectedTab : styles.tab} style={poppinsMedium.style} onClick={() => {
                            setCurrentPage(1)
                            setTab(el.tab)
                        }}>{el.name}</div>))
                    }
                </div>
            </div>
            <article className={styles.cardContent}>
                <table className={styles.tableContainer}>
                    <thead><tr>
                        <th style={poppinsMedium.style}>
                            <div className={globalStyles.checkboxControl}>
                                <input type="checkbox" id="cboxInput" name="select_all" onChange={handleCheck} checked={selected.length === properties?.length} />
                            </div>
                        </th>
                        <th style={poppinsMedium.style} className={styles.colSummary}>{glosary.listBasic}</th>
                        <th style={poppinsMedium.style} className={styles.colPrice}>{glosary.formLabelPrice}</th>
                        <th style={poppinsMedium.style}>{glosary.formLabelPropertyType}</th>
                        <th style={poppinsMedium.style}>{glosary.listStatus}</th>
                        <th style={poppinsMedium.style}>{glosary.listActions}</th>
                    </tr></thead>
                    <tbody>
                        {
                            properties?.map((el, index) => (

                                <PropertyListItem key={index} item={el} lang={lang} onSelect={handleSelect} isChecked={selected.some(element => el.id === element)} onDelete={handleDelete} onPreview={(id) => { router.push(`/admin/properties/${id}`) }} onEdit={(id) => { router.push(`/admin/properties/${id}/edit`) }} />
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

export default PropertyList