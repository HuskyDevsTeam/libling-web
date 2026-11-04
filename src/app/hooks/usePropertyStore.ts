import { create, StoreApi, UseBoundStore } from "zustand"
import { persist } from "zustand/middleware"

// the store itself does not need any change
interface IForm1 {
	propertyType?: number
	country?: number
	type?: number
	address?: string
	longitude?: number
	latitude?: number
}
interface IForm2 {
	area?: string
	bedrooms?: string
	bathrooms?: string
	heatingType?: number
	heatingMedium?: number
	heatingEnergy?: number
	furnished?: boolean
	parking?: string
	elevator?: boolean
}
interface IForm3 {
	view?: string | null
	surfaces: {
		quantity: string
		description: string
		area: string
		areaUnit: number
	}[]
	benefits: string[]
	nearPlaces: string[]
	legalNotes: string[]
}
interface IForm4 {
	title: string
    description?: string
    uploadedPhotos: boolean
    photos?: {
		preview:string
		thumbnail:boolean
	}[]
	faceIndex?: number
}
interface IForm5 {
	price?: string
    currency?: number
    frecuency?: number | null
}
interface TypePropertyStore {
	lastStep: number
	form_1: IForm1 | undefined
	form_2: IForm2 | undefined
	form_3: IForm3 | undefined
	form_4: IForm4 | undefined
	form_5: IForm5 | undefined
	//actions
	setForm_1: (form: IForm1) => void
	setForm_2: (form: IForm2) => void
	setForm_3: (form: IForm3) => void
	setForm_4: (form: IForm4) => void
	setForm_5: (form: IForm5) => void
	addStep: VoidFunction
	removeStep: VoidFunction
	setStep: (step: number) => void
	resetStep: VoidFunction
	resetForm: VoidFunction
}

const initializer = (set: (partial: Partial<TypePropertyStore>) => void, get: () => TypePropertyStore): TypePropertyStore => ({
	lastStep: 1,
	form_1: undefined,
	form_2: undefined,
	form_3: undefined,
	form_4: undefined,
	form_5: undefined,
	//Actions
	setForm_1: (form: IForm1) => set({ form_1: form }),
	setForm_2: (form: IForm2) => set({ form_2: form }),
	setForm_3: (form: IForm3) => set({ form_3: form }),
	setForm_4: (form: IForm4) => set({ form_4: form }),
	setForm_5: (form: IForm5) => set({ form_5: form }),
	resetForm: () =>
		set({
			form_1: undefined,
			form_2: undefined,
			form_3: undefined,
			form_4: undefined,
			form_5: undefined,
		}),
	addStep: () => set({ lastStep: get().lastStep + 1 }),
	removeStep: () => set({ lastStep: get().lastStep - 1 }),
	setStep: (step: number) => set({ lastStep: step }),
	resetStep: () => set({ lastStep: 1 }),
})

// Borrador del formulario de registrar (persistido en localStorage)
export const usePropertyStore = create<TypePropertyStore>()(
	persist(initializer, { name: "property-libling-storage" })
)

// Estado del formulario de editar: en memoria, no pisa el borrador de registrar
export const useEditPropertyStore = create<TypePropertyStore>()(initializer)

export type PropertyStoreHook = UseBoundStore<StoreApi<TypePropertyStore>>
