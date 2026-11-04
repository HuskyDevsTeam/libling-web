import React from 'react'
import Loader from '@/app/components/admin/loader'
import styles from './page.module.css'

export default function Loading() {
    return (
        <div className={styles.container} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="status" aria-busy="true">
            <div style={{ padding: '0 40px' }}>
                <Loader color="#FB8601" />
            </div>
        </div>
    )
}
