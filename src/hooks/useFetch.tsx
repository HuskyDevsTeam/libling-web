import axios, { AxiosRequestConfig } from 'axios'
import { useRouter } from 'next/navigation'

interface AuthFetchProps {
    endpoint: string
    redirectRoute?: string
    formData: any
    options?: AxiosRequestConfig<any>
}

export function useAuthFetch() {
    const router = useRouter()

    const authRouter = async ({
        endpoint,
        formData,
        redirectRoute,
        options
    }: AuthFetchProps) => {
        try {
            const { data } = await axios.post(
                `/api/auth/${endpoint}`,
                formData,
                options
            )
            if (redirectRoute) router.push(redirectRoute)
            else return data
        } catch (error: any) {
            console.error(error.response.data.message)
            throw new Error(error.response.data.message)
        }
    }

    return authRouter
}