'use client'
import dynamic from 'next/dynamic'

/** MapLibre pesa ~1 MB: se descarga aparte y despues de pintar la pagina, no junto con el resto del JavaScript. */
const MapLazy = dynamic(() => import('./map'), {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: 300 }} aria-hidden="true" />,
})
export default MapLazy
