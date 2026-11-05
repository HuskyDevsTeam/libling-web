import React from 'react'
import Loader from '@/app/components/admin/loader'

export default function Loading() {
    return (
        <div role="status" aria-busy="true" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader color="#FB8601" />
        </div>
    )
}
