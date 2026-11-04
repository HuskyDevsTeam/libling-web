'use client'
import React, { useEffect, useRef, useState } from 'react'
import InputSwitch from '@/app/components/admin/inputSwitch'
import { InputTextArea } from '@/app/components/admin/inputTextArea'
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyles } from '@/app/actions'
import Loader from '@/app/components/admin/loader'
import Image from 'next/image'
import pin from '@/app/img/pin.png'
import { toast } from 'react-toastify';
import InputSelect from '@/app/components/admin/inputSelect'
import InputTextSelect from '@/app/components/admin/inputTextSelect'
import { poppinsMedium } from '@/app/fonts'
import styles from './page.module.css'
import { dict } from '@/app/utils';
import { IPage } from '../../layout';
import { createPropertyType, getCountries, getPropertyTypes } from '@/services'
import { ISelectElement } from '@/app/interfaces'
import CustomToast from '@/app/components/toast'
import * as Yup from 'yup';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik'
import { Button } from '@/app/components/admin/button'
import useStore from '@/app/hooks/useStore'
import { usePropertyStoreFromContext } from '@/app/hooks/PropertyStoreContext'


interface IValues {
    propertyType?: number
    country?: number
    type?: number
    address?: string
    longitude?: number
    latitude?: number
}
interface IStepOne extends IPage {
    onNext: VoidFunction
}



const StepOne: React.FC<IStepOne> = ({ params: { lang }, onNext }) => {
    const glosary = dict[lang]?.adminProperties
    const glosaryError = dict[lang]?.auth
    const [mapStyle, setMapStyle] = useState<string | null>(null)
    const [list, setList] = useState<ISelectElement[]>([])
    const [countries, setCountries] = useState<ISelectElement[]>([])
    const formRef = useRef<FormikProps<IValues>>(null)
    const store = useStore(usePropertyStoreFromContext(), (state) => state)
    const initialValues: IValues = {
        propertyType: store?.form_1?.propertyType,
        country: store?.form_1?.country,
        type: store?.form_1?.type ? 1 : 0,
        address: store?.form_1?.address,
        longitude: store?.form_1?.longitude ||  6.12777,
        latitude: store?.form_1?.latitude || 49.61675,
    }
    const [latLng, setLatLng] = useState({ lat: initialValues.latitude, lng: initialValues.longitude })
    console.log('initialValues',initialValues)
    const listSwitch = [
        {
            key: 1,
            value: glosary.formLabelSale,
        },
        {
            key: 0,
            value: glosary.formLabelRent,
        },
    ]
    const fetchPropertyTypes = async () => {
        const data = await getPropertyTypes()
        const newArray = data?.map(el => ({ key: el.id, value: el.name }))
        setList(newArray || [])
    }
    const fetchCountries = async () => {
        const data = await getCountries()
        const newArray = data?.map(el => ({ key: el.id, value: el.name }))
        setCountries(newArray || [])
    }
    const handleSellType = (key: string | number) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('type', key)
    }
    const handlePropertyType = (key: string) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('propertyType', key)
    }
    const handleCountry = (key: string) => {
        console.log('selected key', key)
        formRef.current?.setFieldValue('country', key)
    }
    const handleAddPropertyType = async (el: string) => {
        const added = await createPropertyType({ name: el, code: el.toUpperCase() })
        console.log('added', added)
        await fetchPropertyTypes()
        formRef.current?.setFieldValue('propertyType', added.id)
    }
    const validationSchema = Yup.object({
        propertyType: Yup.number().required(glosary.formValidationRequired),
        country: Yup.number().required(glosary.formValidationRequired),
        type: Yup.number().required(glosary.formValidationRequired),
        address: Yup.string().required(glosary.formValidationRequired),
        longitude: Yup.number().required(glosary.formValidationRequired),
        latitude: Yup.number().required(glosary.formValidationRequired),

    });
    const handleSubmit = async (values: IValues, { setSubmitting }: FormikHelpers<IValues>) => {
        const formData = values
        console.log('formik values', formData)
        console.log('coordinates',latLng)
        try {
            store?.setForm_1(formData)
            onNext()
        } catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={glosaryError.error_default} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        } finally {
            setSubmitting(false)

        }
    }
    useEffect(() => {
        fetchPropertyTypes()
        fetchCountries()
        getMapStyles().then(result => setMapStyle(result))
    }, [])
    return (
        <div className={styles.card}>
            <div className={styles.cardBody}>

                <h2 className={styles.cardTitle} style={poppinsMedium.style}>{glosary.formStepTitle_1}</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    innerRef={formRef}
                    enableReinitialize
                >
                    {({ isSubmitting, values, handleChange, errors, touched }) => (
                        <Form className={styles.cardContent}>
                            <div className={styles.inputRow}>
                                <div className={styles.stepOneInputLeft}>
                                    <InputTextSelect label={glosary.formLabelPropertyType} placeholder={glosary.formPlaceholderSelectText} list={list} lang={lang} onChange={handlePropertyType} onAdd={handleAddPropertyType} error={errors.propertyType} touched={touched.propertyType} initialValue={values.propertyType} />
                                </div>
                                <div className={styles.stepOneInputRight}>
                                    <InputSwitch list={listSwitch} initialValue={values.type} onChange={handleSellType} />
                                </div>
                            </div>
                            <InputSelect label={glosary.formLabelCountry} placeholder={glosary.formPlaceholderSelectText} list={countries} onChange={handleCountry} error={errors.country} touched={touched.country} initialValue={values.country} />
                            <InputTextArea label={glosary.formLabelAddress} placeholder={glosary.formPlaceholderText} error={errors.address} touched={touched.address} value={values.address} onChange={handleChange('address')} />
                            <div className={styles.mapContainer}>
                                <span className={styles.mapTitle} style={poppinsMedium.style}>{glosary.formLabelMap}</span>
                                {
                                    !!mapStyle && !!values.latitude && !!values.longitude ?
                                        <Map
                                            initialViewState={{
                                                longitude: values.longitude,
                                                latitude: values.latitude,
                                                zoom: 10
                                            }}
                                            onDrag={(e)=>{
                                                formRef.current?.setFieldValue('longitude', e.viewState.longitude)
                                                formRef.current?.setFieldValue('latitude', e.viewState.latitude)

                                            }}
                                            onZoom={(e)=>{
                                                formRef.current?.setFieldValue('longitude', e.viewState.longitude)
                                                formRef.current?.setFieldValue('latitude', e.viewState.latitude)

                                            }}
                                            style={{ width: 600, height: 400, borderRadius: 10 }}
                                            mapStyle={mapStyle}
                                        >
                                            <Marker draggable={true} latitude={values.latitude} longitude={values.longitude} onDragEnd={(e) => {
                                                console.log(e.lngLat)
                                                setLatLng(e.lngLat)
                                                formRef.current?.setFieldValue('longitude', e.lngLat.lng)
                                                formRef.current?.setFieldValue('latitude', e.lngLat.lat)
                                            }}>
                                                <Image width={36} height={36} src={pin} alt='pin' style={{ width: 36, height: 36 }} />
                                            </Marker>
                                        </Map>
                                        :
                                        <div style={{ width: 600, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Loader color='#000' />
                                        </div>
                                }
                            </div>

                        </Form>
                    )}
                </Formik>

            </div>
            <div className={styles.cardFooter}>
                <Button title={glosary.formButtonNext} onClick={formRef.current?.handleSubmit} loading={formRef.current?.isSubmitting} />
            </div>
        </div>
    )
}

export default StepOne