import type { IUserSession } from '@/server/data'
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TypeInterfaceStore {
	showBar: boolean
	barContent?: React.ElementType<any> | null
	user?: IUserSession
	limit?: number
	loading?: boolean

	//actions
	setUser?: (user: IUserSession | undefined) => void
	setShowBar: (show: boolean) => void
	setBarContent: (item: React.ElementType<any>) => void
	setLoading: (loading: boolean) => void
	setLimit: (limit: number) => void
	resetLimit: () => void
	resetBar: VoidFunction
}

export const useInterfaceStore = create<TypeInterfaceStore>()(
	persist(
		(set, get) => ({
			showBar: false,
			user: undefined,
			barContent: undefined,
			limit: 15,
			loading:false,
			setLoading: (loading: boolean) => set({ loading }),
			setLimit: (limit: number) => set({ limit }),
			resetLimit: () => set({ limit: 15 }),
			setUser: (user: IUserSession | undefined) => set({ user }),
			setShowBar: (showBar: boolean) => set({ showBar }),
			setBarContent: (contenido: React.ElementType<any>) =>
				set({ barContent: contenido }),
			resetBar: () => set({ barContent: undefined, showBar: false }),
		}),
		{
			name: "interface-libling-storage",
		}
	)
)
