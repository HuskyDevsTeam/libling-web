'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { dict } from '@/app/utils'
import { restoreProperty, restorePropertyImage } from '@/services'

interface IProps {
    lang: 'es' | 'en' | 'fr'
    properties: { id: number; title: string; address: string; days: number }[]
    images: { id: number; src: string; propertyTitle: string; days: number }[]
}

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #e5e7eb' }
const btn: React.CSSProperties = { marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, border: '1px solid #1d3557', background: '#fff', color: '#1d3557', cursor: 'pointer', fontWeight: 600 }

export default function TrashList({ lang, properties, images }: IProps) {
    const glosary = dict[lang]?.adminTrash
    const router = useRouter()
    const [busy, setBusy] = useState<string | null>(null)
    const restore = async (kind: 'p' | 'i', id: number) => {
        setBusy(`${kind}${id}`)
        try {
            const result = kind === 'p' ? await restoreProperty(id) : await restorePropertyImage(id)
            if (!result.count) throw new Error('not restored')
            toast.success(kind === 'p' ? glosary.propertyRestored : glosary.imageRestored)
            router.refresh()
        } catch {
            toast.error(glosary.error)
        } finally {
            setBusy(null)
        }
    }
    const removedIn = (days: number) => glosary.removedIn.replace('{days}', String(days))
    if (!properties.length && !images.length) return <p>{glosary.empty}</p>
    return (
        <div>
            <p>{glosary.intro}</p>
            {properties.length > 0 && <h3>{glosary.properties}</h3>}
            {properties.map(p => (
                <div key={`p${p.id}`} style={row} data-testid={`trash-property-${p.id}`}>
                    <div><strong>{p.title}</strong><br /><small>{p.address} · {removedIn(p.days)}</small></div>
                    <button type="button" style={btn} disabled={busy === `p${p.id}`} onClick={() => restore('p', p.id)}>{glosary.restore}</button>
                </div>
            ))}
            {images.length > 0 && <h3>{glosary.images}</h3>}
            {images.map(i => (
                <div key={`i${i.id}`} style={row} data-testid={`trash-image-${i.id}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- miniatura pequena de la papelera */}
                    <img src={i.src} alt="" width={64} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} />
                    <div><strong>{i.propertyTitle}</strong><br /><small>{removedIn(i.days)}</small></div>
                    <button type="button" style={btn} disabled={busy === `i${i.id}`} onClick={() => restore('i', i.id)}>{glosary.restore}</button>
                </div>
            ))}
        </div>
    )
}
