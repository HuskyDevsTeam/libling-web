'use client'
import React, { useEffect, useState } from 'react'
import styles from './affiliatePlanList.module.css'
import { dict } from '../utils'
import AffiliateCard from './affiliateCard'
import InputSwitch from './admin/inputSwitch'
import { Payment } from './payment'
import ReactModal from 'react-modal'
import useStore from '../hooks/useStore'
import { useAffiliateStore } from '../hooks/useAffiliateStore'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify';
import CustomToast from './toast';
import { paymentAssert, verifyPayStatus } from '@/services'
import { templates } from '../utils/funtions'

interface IAffiliatePlanList{
    lang: "es" | "en" | "fr"
}


const AffiliatePlanList:React.FC<IAffiliatePlanList> = ({lang}) => {
    ReactModal.setAppElement('#main')
    const glosary = dict[lang]?.services
    const [ open, setOpen ] = useState(false);
    const [initialForm, setInitialForm] = useState(1)
    const [isVerifying, setIsVerifying] = useState(false)
    const query = useSearchParams()
    const affiliateList = [
        {
            id:1,
            name:glosary.sectionOption1,
            priceFrecuency:glosary.sectionOptionBy1,
            plans:[
                {
                    id:1,
                    title:glosary.planTitle1,
                    content:glosary.planContent1,
                    list:glosary.planList1,
                    price:8.56,
                },
                {
                    id:2,
                    title:glosary.planTitle2,
                    content:glosary.planContent2,
                    list:glosary.planList2,
                    price:22.95,
                },
                {
                    id:3,
                    title:glosary.planTitle3,
                    content:glosary.planContent3,
                    list:glosary.planList3,
                    price:45,
                },
            ]   
        },
        {
            id:2,
            name:glosary.sectionOption2,
            priceFrecuency:glosary.sectionOptionBy2,
            plans:[
                {
                    id: 1,
                    title: glosary.planTitle1,
                    content: glosary.planContent1,
                    list: glosary.planList1Extra,
                    price: 48,
                },
                {
                    id: 2,
                    title: glosary.planTitle2,
                    content: glosary.planContent2,
                    list: glosary.planList2Extra,
                    price: 120,
                },
                {
                    id: 3,
                    title: glosary.planTitle3,
                    content: glosary.planContent3,
                    list: glosary.planList3Extra,
                    price: 45,
                },
            ]   
        },
        {
            id:3,
            name:glosary.sectionOption3,
            priceFrecuency:glosary.sectionOptionBy3,
            plans:[
                {
                    id: 1,
                    title: glosary.planTitle1,
                    content: glosary.planContent1,
                    list: glosary.planList1Extra2,
                    price: 90,
                },
                {
                    id: 2,
                    title: glosary.planTitle2,
                    content: glosary.planContent2,
                    list: glosary.planList2Extra2,
                    price: 220,
                },
                {
                    id: 3,
                    title: glosary.planTitle3,
                    content: glosary.planContent3,
                    list: glosary.planList3Extra2,
                    price: 45,
                },
            ]   
        },
    ]
    const listFrecuency = [
        {
            key: 1,
            value: glosary.sectionOption1,
            priceFrecuency:glosary.sectionOptionBy1,

        },
        {
            key: 2,
            value: glosary.sectionOption2,
            priceFrecuency:glosary.sectionOptionBy2,

        },
        {
            key: 3,
            value: glosary.sectionOption3,
            priceFrecuency:glosary.sectionOptionBy3,
        },
    ]
    
    //states
    const [frecuency, setFrecuency] = useState<string | number>(1)
    const [plan, setPlan] = useState<string | number>(1)
    const store = useStore(useAffiliateStore, (state) => state)

    //functions
    const handleFrecuency = (key: string | number) => {
        console.log('selected key', key)
        store?.setFrecuency(key)
    }
    const frecuencyName = listFrecuency?.find(el=>el.key == store?.frecuency)?.priceFrecuency || glosary.sectionOptionBy1
    const handleSelectedPlan = (key:number) =>{
        console.log('the selected key was', key)
        store?.setPlan(key)
        setInitialForm(1)
        setOpen(true)
    }
    const handlePayVerification = async (isWaitingVerify: number | null)=>{
        if(isWaitingVerify){
            toast.warning(<CustomToast type='warning' title={glosary.infoMessageTitle} content={glosary.infoMessageContent} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FFBB33', maxWidth: 450, padding: 24, borderRadius: 10 } })
            setIsVerifying(true)
            const verifyResponse = await paymentAssert(isWaitingVerify, lang)
            if(verifyResponse.status === 200 && !!verifyResponse.affiliate){
                toast.success(<CustomToast type='success' title={glosary.successMessageTitle} content={glosary.successMessageContent} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })
            }else{
                toast.error(<CustomToast type='error' title={glosary.errorMessageTitle} content={glosary.errorMessageContent} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
            }
        }else{
            window.location.href = (window.location.origin + window.location.pathname)
        }
        
    }

    // Pagos: al volver de Saferpay (?pay=ID) se confirma el pago en el servidor
    const payQuery = query.get('pay')
    useEffect(()=>{
        if(payQuery && (parseInt(payQuery || '0') > 0) && isVerifying === false){
            verifyPayStatus(payQuery).then(handlePayVerification)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar al cambio del parametro de la URL
    }, [payQuery])
    // Alta de miembro (?member=1|2): abre el formulario. Se resuelve al cambiar la URL, durante el render.
    const memberQuery = query.get('member')
    const [handledMember, setHandledMember] = useState<string | null | undefined>(undefined)
    if(handledMember !== memberQuery){
        setHandledMember(memberQuery)
        if(memberQuery === '1' || memberQuery === '2'){
            setInitialForm(parseInt(memberQuery))
            setOpen(true)
        }
    }

    return (
    <>
        <div className={styles.container}>
            <InputSwitch list={listFrecuency} initialValue={store?.frecuency} onChange={handleFrecuency} />
            <div className={styles.edgeContainer}>
                <div className={styles.cardContainer}>
                {
                    affiliateList.find(el=>el.id == store?.frecuency)?.plans?.map((el)=>(<AffiliateCard key={el.id} id={el.id} frecuency={frecuencyName} onSelect={handleSelectedPlan} title={el.title} content={el.content} list={el.list} price={el.price} type={el.id === 2 ? 'main' : 'outline'} lang={lang}/>))
                    }
                </div>
            </div>
        </div>
        <Payment open={open} closeModal={()=>{setOpen(false)}} lang={lang} plan={plan} frecuency={frecuency} changeFrecuency={handleFrecuency} initialForm={initialForm}/>
    </>
    )
}

export default AffiliatePlanList