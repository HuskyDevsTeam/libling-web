'use client'
import React from 'react'
import styles from './pagination.module.css'
import { IMetaPaginate } from '../interfaces/models'
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

interface IPagination {
    pagination: IMetaPaginate
    searchParams: string
    url: string

}

const Pagination: React.FC<IPagination> = ({ pagination, searchParams, url }) => {
    const initialPage = (pagination.page - 2) <= 1 ? 1 : (pagination.page - 2)
    const lastPage = (pagination.page + 2) >= pagination.totalPages ? pagination.totalPages : (pagination.page + 2)
    const count = (lastPage + 1) - initialPage
    const arrayPage = new Array(count).fill(1)
    const router = useRouter()
    return (
        <div className={styles.paginationContainer}>
            {
                !!pagination.prevPage &&
                <div className={styles.buttonPrev}>
                    <FiChevronsLeft />
                </div>
            }
            {
                arrayPage.map((_, index) => (
                    <div key={index} className={index + initialPage === pagination.page ? styles.pageSelected : styles.page} onClick={index + initialPage === pagination.page ? () => { } : () => {
                        const urlQuery = new URLSearchParams(searchParams)

                        urlQuery.set('page', index + initialPage.toString())

                        router.push(`${url}?${urlQuery.toString()}`)
                    }}>{index + initialPage}</div>
                ))
            }
            {
                !!pagination.nextPage &&
                <div className={styles.buttonNext}>
                    <FiChevronsRight />
                </div>
            }
        </div>
    )
}

export default Pagination