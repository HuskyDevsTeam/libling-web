'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import styles from '../../create/page.module.css'
import { dict } from '@/app/utils'
import { langType } from '@/app/interfaces'
import StepOne from '../../create/stepOne'
import StepTwo from '../../create/stepTwo'
import StepThree from '../../create/stepThree'
import StepFour from '../../create/stepFour'
import StepFive from '../../create/stepFive'
import ExistingPhotos from './existingPhotos'
import CustomToast from '@/app/components/toast'
import useStore from '@/app/hooks/useStore'
import { useEditPropertyStore } from '@/app/hooks/usePropertyStore'
import { PropertyStoreContext } from '@/app/hooks/PropertyStoreContext'
import { useInterfaceStore } from '@/app/hooks/useInterfaceStore'
import { deletePropertyImage, updateProperty } from '@/services'
import { IEditForms, IEditInitial, buildUpdateDTO, formsFromProperty } from '@/app/utils/propertyEdit'

interface IEditWizard {
    lang: langType
    initial: IEditInitial
}

const FINAL_STEP = 5

// Mismo formulario de 5 pasos que registrar, precargado, y que guarda con updateProperty
const EditWizard: React.FC<IEditWizard> = ({ lang, initial }) => {
    const glosary = dict[lang].adminProperties
    const router = useRouter()
    const store = useStore(useEditPropertyStore, (state) => state)
    const storeInterface = useStore(useInterfaceStore, (state) => state)
    const [files, setFiles] = useState<any[]>([])
    const [face, setFace] = useState(0)
    const [removedIds, setRemovedIds] = useState<number[]>([])
    const keptImages = initial.images.filter(el => !removedIds.includes(el.id))
    // portada elegida entre las fotos existentes; null => portada = foto nueva
    const [coverPath, setCoverPath] = useState<string | null>(initial.thumbnail || initial.images[0]?.path || null)
    const step = store?.lastStep
    // El efecto de abajo carga los formularios en el store: mientras no estan, no se pinta nada
    const ready = !!store?.form_1

    // Carga la propiedad en el store de editar (en memoria, no toca el borrador de registrar)
    useEffect(() => {
        const state = useEditPropertyStore.getState()
        const forms = formsFromProperty(initial)
        state.setForm_1(forms.form_1)
        state.setForm_2(forms.form_2)
        state.setForm_3(forms.form_3)
        state.setForm_4(forms.form_4)
        state.setForm_5(forms.form_5)
        state.setStep(1)
        return () => {
            useEditPropertyStore.getState().resetForm()
            useEditPropertyStore.getState().resetStep()
        }
    }, [initial])

    const handleNext = () => { if (!!step && step < FINAL_STEP) store?.addStep() }
    const handleBack = () => { if (!!step && step > 1) store?.removeStep() }
    const handleFiles = (newFiles: any[], newFace: number) => {
        // elegir/añadir fotos nuevas pasa la portada a las nuevas
        if (newFiles.length > 0) setCoverPath(null)
        setFiles(newFiles)
        setFace(newFace)
    }
    const handleRemove = (id: number) => {
        const img = initial.images.find(el => el.id === id)
        setRemovedIds(state => [...state, id])
        if (img && img.path === coverPath) setCoverPath(null)
    }

    const handleSubmit = async () => {
        try {
            storeInterface?.setLoading(true)
            const state = useEditPropertyStore.getState()
            const forms: Partial<IEditForms> = { form_1: state.form_1, form_2: state.form_2, form_3: state.form_3, form_4: state.form_4, form_5: state.form_5 } as Partial<IEditForms>
            const hasNew = files.length > 0
            const cover = coverPath && keptImages.some(el => el.path === coverPath) ? coverPath : (hasNew ? null : keptImages[0]?.path || null)
            await updateProperty(initial.id, { ...buildUpdateDTO(forms), thumbnail: cover || undefined })
            await Promise.all(removedIds.map(id => deletePropertyImage(id)))
            await Promise.all(files.map(async (file, index) => {
                const ext = file?.name?.split('.')?.at(-1) || 'jpg'
                const asFace = !cover && index === face ? '&face=1' : ''
                const response = await fetch(`/api/image?propertyId=${initial.id}&type=${ext}${asFace}`, { method: 'POST', body: file })
                if (!response.ok) throw new Error('image upload failed')
            }))
            toast.success(<CustomToast type='success' title='OK' content={glosary.toastUpdate} />, { theme: 'colored', icon: false, style: { backgroundColor: '#00C851', maxWidth: 450, padding: 24, borderRadius: 10 } })
            router.push(`/admin/properties/${initial.id}`)
            router.refresh()
        } catch (e) {
            console.error(e)
            toast.error(<CustomToast type='error' title='Error' content={'error'} />, { theme: 'colored', icon: false, style: { backgroundColor: '#FF4444', maxWidth: 450, padding: 24, borderRadius: 10 } })
        } finally {
            storeInterface?.setLoading(false)
        }
    }

    if (!ready || !step) return null
    const arraySteps = new Array(FINAL_STEP).fill(0)
    return (
        <PropertyStoreContext.Provider value={useEditPropertyStore}>
            <div className={styles.titleBar}>
                <div className={styles.stepContainer}>
                    <span className={styles.stepText}>{glosary.editTitle}: {glosary.formStep}{" "}{step}{" "}{glosary.formStepConnector}{" "}{FINAL_STEP}</span>
                    <div className={styles.indicatorContainer}>
                        {arraySteps.map((el, index) => (
                            <div key={index} className={index <= step - 1 ? styles.indicatorFill : styles.indicator}></div>
                        ))}
                    </div>
                </div>
                <span className={styles.buttonLink} onClick={() => { router.replace(`/admin/properties/${initial.id}`) }}>
                    {glosary.formOptionCancel}
                </span>
            </div>
            <section className={styles.section} data-testid='edit-property-wizard'>
                {step === 1 && <StepOne params={{ lang }} onNext={handleNext} />}
                {step === 2 && <StepTwo params={{ lang }} onNext={handleNext} onBack={handleBack} />}
                {step === 3 && <StepThree params={{ lang }} onNext={handleNext} onBack={handleBack} />}
                {step === 4 && (
                    <StepFour params={{ lang }} onNext={handleNext} onBack={handleBack} handleFiles={handleFiles} files={files}
                        hasExistingPhotos={keptImages.length > 0}
                        extra={keptImages.length > 0 && (
                            <ExistingPhotos title={glosary.editPhotosCurrent} coverLabel={glosary.formLabelTumbnail} removeLabel={glosary.editPhotoRemove}
                                images={keptImages} cover={coverPath} onCover={(path) => { setCoverPath(path) }} onRemove={handleRemove} />
                        )} />
                )}
                {step === 5 && <StepFive params={{ lang }} onNext={handleSubmit} onBack={handleBack} />}
            </section>
        </PropertyStoreContext.Provider>
    )
}

export default EditWizard
