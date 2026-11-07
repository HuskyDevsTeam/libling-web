'use client'
import React, { useState, use } from 'react';
import styles from './page.module.css'
import { dict } from '@/app/utils'
import { IPage } from '../../layout'
import { useRouter } from 'next/navigation'
import StepOne from './stepOne'
import StepTwo from './stepTwo'
import StepThree from './stepThree'
import StepFour from './stepFour'
import StepFive from './stepFive'
import useStore from '@/app/hooks/useStore'
import { usePropertyStore } from '@/app/hooks/usePropertyStore'
import Preview from './preview'
import { toast } from 'react-toastify'
import CustomToast from '@/app/components/toast'
import { createProperty, getUser } from '@/services'
import { IPropertyCreateDTO } from '@/app/interfaces/models'
import { useInterfaceStore } from '@/app/hooks/useInterfaceStore'


const PropertyCreate: React.FC<IPage> = props => {
    const params = use(props.params);

    const {
        lang
    } = params;

    const store = useStore(usePropertyStore, (state) => state)
    const storeInterface = useStore(useInterfaceStore, (state) => state)
    const step = store?.lastStep
    const glosary = dict[lang]?.adminProperties
    const finalStep = 5
    const arraySteps = new Array(finalStep).fill(0)
    const router = useRouter()
    const [files, setFiles] = useState<any[]>([])
    const [face, setFace] = useState<number>(0)
    const handleNext = () => {
        if (!!step && step <= 5) {
            store?.addStep()
        }
    }
    const handleBack = () => {
        if (!!step && step > 1) {
            store?.removeStep()
        }
    }
    const handleStep = (newStep: number) => {
        if (!!newStep && newStep > 0 && newStep <= 6) {
            store?.setStep(newStep)
        }
    }
    const handleFiles = (newFiles: any[], face:number) => {
        setFiles(newFiles)
        setFace(face)
    }

    const handleSubmit = async (active: boolean) => {
        try {
            storeInterface?.setLoading(true)
            const user = await getUser(storeInterface?.user?.email || '')
            const data: IPropertyCreateDTO = {
                title: store?.form_4?.title || '',
                content: store?.form_4?.description,
                address: store?.form_1?.address || '',
                thumbnail: undefined,
                longitude: store?.form_1?.longitude,
                latitude: store?.form_1?.latitude,
                area: parseInt(store?.form_2?.area || '0'),
                bedrooms: parseInt(store?.form_2?.bedrooms || '0'),
                bathrooms: parseInt(store?.form_2?.bathrooms || '0'),
                price: parseInt(store?.form_5?.price || '0'),
                heatingType: (store?.form_2?.heatingType || 0).toString(),
                heatingMedium: (store?.form_2?.heatingMedium || 0).toString(),
                heatingEnergy: (store?.form_2?.heatingEnergy || 0).toString(),
                view: store?.form_3?.view || '',
                furnished: !!store?.form_2?.furnished,
                parking: parseInt(store?.form_2?.parking || '0'),
                elevator: !!store?.form_2?.elevator,
                active,
                type: !!store?.form_1?.type,
                frecuency: (store?.form_5?.frecuency || 0).toString(),
                publishedById: user?.id || 0,
                countryId: parseInt(store?.form_1?.country?.toString() || '0'),
                currencyId: parseInt(store?.form_5?.currency?.toString() || '0'),
                propertyTypeId: parseInt(store?.form_1?.propertyType?.toString() || '0'),
                Surface: store?.form_3?.surfaces.map(el => ({
                    quantity: el.quantity,
                    name: el.area,
                    description: el.description,
                    areaId: parseInt(el.areaUnit?.toString()),
                    propertyId: 0,
                })),
                Benefits: store?.form_3?.benefits.map(el => ({
                    name: el,
                    propertyId: 0
                })),
                NearPlace: store?.form_3?.nearPlaces.map(el => ({
                    name: el,
                    description: '',
                    propertyId: 0
                })),
                LegalNotice: store?.form_3?.legalNotes.map(el => ({
                    name: el,
                    propertyId: 0
                })),
            }
            const createdProperty = await createProperty(data)
            const id = createdProperty.id
            if (files.length > 0) {
                await Promise.all(files.map(async (file, index) => {
                    const response = await fetch(`/api/image?propertyId=${id}&type=${file?.name?.split('.')?.at(-1) || 'jpg'}${store?.form_4?.faceIndex === index ? '&face=1' : ''}`, {
                        method: 'POST',
                        body: file,
                    })
                    console.log('chemi', await response.json())
                }))
                
            } else {
                toast.error(<CustomToast type='error' title='Error' content={'error particular'} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
            }
            toast.success(<CustomToast type='success' title='Nice' content={glosary.toastPublish} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })
            router.push('/admin/properties')
            
        }
        catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={'error'} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        }
        finally{
            storeInterface?.setLoading(false)
            store?.resetForm()
            store?.resetStep()
        }

    }


    return (<>
        {
            !!(step && step <= finalStep && step > 0)
            &&
            <div className={styles.titleBar}>
                <div className={styles.stepContainer}>
                    <span className={styles.stepText}>{glosary.formStep}{" "}{step}{" "}{glosary.formStepConnector}{" "}{finalStep}</span>

                    <div className={styles.indicatorContainer}>
                        {
                            arraySteps.map((el, index) => (
                                <div key={index} className={!!step && index <= step - 1 ? styles.indicatorFill : styles.indicator}></div>
                            ))
                        }
                    </div>
                </div>
                <span className={styles.buttonLink} onClick={() => { router.replace('/admin/properties') }}>
                    {glosary.formOptionCancel}
                </span>
            </div>
        }
        <section className={styles.section}>
            {
                step === 1
                &&
                <StepOne params={{ lang }} onNext={handleNext} />
            }
            {
                step === 2
                &&
                <StepTwo params={{ lang }} onNext={handleNext} onBack={handleBack} />
            }
            {
                step === 3
                &&
                <StepThree params={{ lang }} onNext={handleNext} onBack={handleBack} />
            }
            {
                step === 4
                &&
                <StepFour params={{ lang }} onNext={handleNext} onBack={handleBack} handleFiles={handleFiles} files={files} />
            }
            {
                step === 5
                &&
                <StepFive params={{ lang }} onNext={handleNext} onBack={handleBack} />
            }
            {
                step === 6
                &&
                <Preview params={{ lang }} onNext={handleSubmit} onGo={handleStep} files={files} face={face} />
            }
        </section>
    </>
    )
}

export default PropertyCreate