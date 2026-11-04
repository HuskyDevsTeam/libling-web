'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { poppinsMedium } from '@/app/fonts'
import styles from './page.module.css'
import globalStyles from '@/app/globals.module.css'
import { dict } from '@/app/utils';
import { IPage } from '../../layout';
import { getCountries, getCurrencies, getPropertyTypes } from '@/services'
import { ISelectElement } from '@/app/interfaces'
import { Button } from '@/app/components/admin/button'
import useStore from '@/app/hooks/useStore';
import { usePropertyStore } from '@/app/hooks/usePropertyStore';
import { combustiblesCalefaccion, mecanismosCalefaccion, medidasAreaTerrenos, mediosCalefaccion, rentPaymentPeriods } from '@/app/utils/data';
import InputPhoto from '@/app/components/admin/inputPhoto';
import { useInterfaceStore } from '@/app/hooks/useInterfaceStore';
import Modal from '@/app/components/admin/modal';
import { FiHome } from 'react-icons/fi';

interface IPreview extends IPage {
    onNext: (active: boolean) => void
    onGo: (step: number) => void
    files: any[]
    face: number
}



const Preview: React.FC<IPreview> = ({ params: { lang }, onNext, onGo, files, face }) => {
    const store = useStore(usePropertyStore, (state) => state)
    const interfaceStore = useStore(useInterfaceStore, (state) => state)
    const glosary = dict[lang]?.adminProperties
    const [list, setList] = useState<ISelectElement[]>([])
    const [open, setOpen] = useState<boolean>(false)
    const [checked, setChecked] = useState<boolean>(false)
    const [currency, setCurrency] = useState<ISelectElement[]>([])
    const [propertyTypes, setPropertyTypes] = useState<ISelectElement[]>([])
    const [countries, setCountries] = useState<ISelectElement[]>([])


    const [periods, setPeriods] = useState<ISelectElement[]>(rentPaymentPeriods)

    const handleSubmit = () => {
        setOpen(true)
    }
    const fetchCurrency = async () => {
        const data = await getCurrencies()
        const newArray = data?.map(el => ({ key: el.id, value: el.symbol, description: el.name }))
        setCurrency(newArray || [])
    }
    const fetchPropertyTypes = async () => {
        const data = await getPropertyTypes()
        const newArray = data?.map(el => ({ key: el.id, value: el.name }))
        setPropertyTypes(newArray || [])
        console.log(newArray)
    }
    const fetchCountries = async () => {
        const data = await getCountries()
        const newArray = data?.map(el => ({ key: el.id, value: el.name }))
        setCountries(newArray || [])
    }
    const findByKey = (array: ISelectElement[], key: number | null | undefined) => {
        return array.find(el => key?.toString() === el.key.toString())?.value
    }
    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked)
    }
    const handleNext = () => {
        onNext(checked)
        setOpen(false)
    }

    useEffect(() => {
        fetchCurrency()
        fetchPropertyTypes()
        fetchCountries()
    }, [])
    useEffect(() => {
        if (interfaceStore?.setBarContent) {
            interfaceStore?.setShowBar(true)
            interfaceStore?.setBarContent(() => (
                <div className={styles.actionBar} style={{maxWidth:760}}>
                    {/* <Button title={glosary.formButtonPreview} type='outline' /> */}
                    <Button title={glosary.formButtonRegister} onClick={handleSubmit} />
                </div>
            ))
            console.log('test')
        }
        return () => { interfaceStore?.setShowBar(false) }
    }, [interfaceStore?.setBarContent])
    return (<div className={styles.previewContainer}>
        <h1 className={styles.titlePreview} style={poppinsMedium.style}>{glosary.formPreviewTitle}</h1>
        <div className={styles.card} style={{ width: '100%', maxWidth: 760 }}>
            <Modal open={open} onRequestClose={() => { setOpen(false) }}>
                <FiHome className={styles.modalIcon} />
                <h3 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.modalCreateTitle}</h3>
                <div className={globalStyles.checkboxControl}>
                    <input type="checkbox" id="cboxInput" name="remember_me" onChange={handleCheck} />
                    <label htmlFor="cboxInput">{glosary.modalCreateOption}</label>
                </div>
                <div className={styles.modalButtons}>
                    <Button title={glosary.formButtonReturn} type='outline' onClick={() => { setOpen(false) }} />
                    <Button title={glosary.formButtonRegister} onClick={handleNext} />
                </div>
            </Modal>
            <div className={styles.cardBody}>
                <div className={styles.cardSection}>
                    <div className={styles.sectionRow}>
                        <h2 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.previewSectionTitle_1}</h2>
                        <span style={poppinsMedium.style} className={styles.sectionLink} onClick={() => { onGo(1) }}>{glosary.formLinkEdit}</span>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.sectionBlock}>
                            <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelPropertyType}</span>
                            <span className={styles.sectionDescription}>{findByKey(propertyTypes, store?.form_1?.propertyType)} <span className={styles.sectionSeparator}>{" > "}</span> {store?.form_1?.type ? glosary.formLabelSale : glosary.formLabelRent}</span>
                        </div>
                        <div className={styles.sectionBlock}>
                            <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelCountry}</span>
                            <span className={styles.sectionDescription}>{findByKey(countries, store?.form_1?.country)}</span>
                        </div>
                        <div className={styles.sectionBlock}>
                            <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelAddress}</span>
                            <span className={styles.sectionDescription}>{store?.form_1?.address}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.cardSection}>
                    <div className={styles.sectionRow}>
                        <h2 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.previewSectionTitle_2}</h2>
                        <span style={poppinsMedium.style} className={styles.sectionLink} onClick={() => { onGo(2) }}>{glosary.formLinkEdit}</span>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowHalf}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelArea}</span>
                                <span className={styles.sectionDescription}>{store?.form_2?.area}</span>

                            </div>
                            <div className={styles.sectionContentRowHalf}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelBedrooms}</span>
                                <span className={styles.sectionDescription}>{store?.form_2?.bedrooms}</span>

                            </div>

                        </div>
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowHalf}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelHeatingType}</span>
                                <span className={styles.sectionDescription}>{findByKey(mecanismosCalefaccion, store?.form_2?.heatingType)}</span>

                            </div>
                            <div className={styles.sectionContentRowHalf}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelHeatingMedium}</span>
                                <span className={styles.sectionDescription}>{findByKey(mediosCalefaccion, store?.form_2?.heatingMedium)}</span>

                            </div>

                        </div>
                        <div className={styles.sectionContentRow}>
                            <div className={styles.sectionContentRowHalf}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelHeatingEnergy}</span>
                                <span className={styles.sectionDescription}>{findByKey(combustiblesCalefaccion, store?.form_2?.heatingEnergy)}</span>

                            </div>
                            <div className={styles.sectionContentRowHalf}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelFurnished}</span>
                                <span className={styles.sectionDescription}>{store?.form_2?.furnished ? glosary.formOptionYes : glosary.formOptionNo}</span>

                            </div>

                        </div>

                    </div>
                </div>
                <div className={styles.cardSection}>
                    <div className={styles.sectionRow}>
                        <h2 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.previewSectionTitle_3}</h2>
                        <span style={poppinsMedium.style} className={styles.sectionLink} onClick={() => { onGo(3) }}>{glosary.formLinkEdit}</span>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.sectionBlock}>
                            <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelView}</span>
                            <span className={styles.sectionDescription}>{store?.form_3?.view}</span>
                        </div>
                        {
                            (!!store?.form_3?.surfaces && store?.form_3?.surfaces?.length > 0)
                            &&
                            <div className={styles.sectionBlock}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelSufaces}</span>
                                <ul className={styles.sectionList}>
                                    {
                                        store?.form_3?.surfaces.map((el, index) => (
                                            <li key={index} className={styles.listItem}>
                                                <span>{el.quantity}</span>
                                                {" "}
                                                <span>{el.description}</span>
                                                {" "}
                                                <span>{el.area}</span>
                                                {" "}
                                                <span>{findByKey(medidasAreaTerrenos, el.areaUnit)}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>

                        }
                        {
                            (!!store?.form_3?.benefits && store?.form_3?.benefits?.length > 0)
                            &&
                            <div className={styles.sectionBlock}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelBenefits}</span>
                                <ul className={styles.sectionList}>
                                    {
                                        store?.form_3?.benefits.map((el, index) => (
                                            <li key={index} className={styles.listItem}>
                                                <span>{el}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        }
                        {
                            (!!store?.form_3?.nearPlaces && store?.form_3?.nearPlaces?.length > 0)
                            &&
                            <div className={styles.sectionBlock}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelNearPlaces}</span>
                                <ul className={styles.sectionList}>
                                    {
                                        store?.form_3?.nearPlaces.map((el, index) => (
                                            <li key={index} className={styles.listItem}>
                                                <span>{el}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        }
                        {
                            (!!store?.form_3?.legalNotes && store?.form_3?.legalNotes?.length > 0)
                            &&
                            <div className={styles.sectionBlock}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelLegalNotes}</span>
                                <ul className={styles.sectionList}>
                                    {
                                        store?.form_3?.legalNotes.map((el, index) => (
                                            <li key={index} className={styles.listItem}>
                                                <span>{el}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        }
                    </div>
                </div>
                <div className={styles.cardSection}>
                    <div className={styles.sectionRow}>
                        <h2 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.previewSectionTitle_4}</h2>
                        <span style={poppinsMedium.style} className={styles.sectionLink} onClick={() => { onGo(4) }}>{glosary.formLinkEdit}</span>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.sectionBlock}>
                            <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelTitle}</span>
                            <span className={styles.sectionDescription}>{store?.form_4?.title}</span>
                        </div>
                        {
                            (!!store?.form_4?.description) &&
                            <div className={styles.sectionBlock}>
                                <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelDescription}</span>
                                <span className={styles.sectionDescription}>{store?.form_4?.description}</span>
                            </div>
                        }
                        <div className={styles.sectionBlock}>
                            <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelImages}</span>
                            <InputPhoto description={glosary.formButtonAddPhoto} facename={glosary.formLabelTumbnail} initialValues={files || []} initialFace={face}/>
                        </div>
                    </div>
                </div>

                <div className={styles.cardSectionEnd}>
                    <div className={styles.sectionRow}>
                        <h2 style={poppinsMedium.style} className={styles.sectionTitle}>{glosary.previewSectionTitle_5}</h2>
                        <span style={poppinsMedium.style} className={styles.sectionLink} onClick={() => { onGo(5) }}>{glosary.formLinkEdit}</span>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.sectionBlock}>
                            <span style={poppinsMedium.style} className={styles.sectionSubtitle}>{glosary.formLabelPrice}</span>
                            <span className={styles.sectionDescription}>
                                {findByKey(currency, store?.form_5?.currency)}
                                {" "}
                                {parseFloat(store?.form_5?.price || '0').toLocaleString('en-US')}
                                {store?.form_1?.type ? null : ` / ${findByKey(rentPaymentPeriods, store?.form_5?.frecuency)}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default Preview