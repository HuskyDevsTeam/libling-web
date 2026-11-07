'use client'
import React, { useEffect, useState } from 'react'
import styles from './body.module.css'
import { ToastContainer } from 'react-toastify';
import Aside from './aside';
import { poppinsMedium, poppinsRegular } from '@/app/fonts';
import Navbar from './navbar';
import { dict } from '@/app/utils';
import { FiGrid, FiHome, FiCreditCard, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { SIDEBAR_COOKIE } from './sidebarCookie';
import type { IUserSession } from '@/server/data'
import ActionBar from './actionBar';
import useStore from '@/app/hooks/useStore';
import { useInterfaceStore } from '@/app/hooks/useInterfaceStore';

export interface IRoute {
    // Name of the route (displayed in navigation elements)
    name: string;

    // URI representing the route path
    uri: string;

    // Optional icon component for navigation display
    icon?: React.ComponentType<any>;

    // Opens in a new tab (e.g. the public website)
    external?: boolean;
}

export const Body = ({
    children,
    lang,
    user,
    initialOpen = true
}: {
    children: React.ReactNode,
    lang: "es" | "en" | "fr",
    user?: IUserSession,
    initialOpen?: boolean

}) => {
    const [open, setOpen] = useState<boolean>(initialOpen)
    const [mobileOpen, setMobileOpen] = useState<boolean>(false)
    const glosary = dict[lang]?.adminNav
    const store = useStore(useInterfaceStore, (state) => state)


    const routes = [
        {
            name: glosary.dashboardTitle,
            uri: '/admin/dashboard',
            icon: FiGrid
        },
        {
            name: glosary.propertiesTitle,
            uri: '/admin/properties',
            icon: FiHome
        },
        {
            name: glosary.affiliateTitle,
            uri: '/admin/affiliates',
            icon: FiCreditCard
        },
        {
            name: glosary.trashTitle,
            uri: '/admin/trash',
            icon: FiTrash2
        },
        {
            name: glosary.websiteTitle,
            uri: `/${lang}`,
            icon: FiExternalLink,
            external: true
        },
    ]
    const toggleOpen = () => {
        // On mobile the sidebar is a temporary overlay (never persisted).
        if (window.matchMedia('(max-width: 768px)').matches) {
            setMobileOpen(state => !state)
            return
        }
        const next = !open
        setOpen(next)
        document.cookie = `${SIDEBAR_COOKIE}=${next ? '1' : '0'}; path=/; max-age=31536000; samesite=lax`
    }
    useEffect(() => {
        if (store?.setUser) {
            store.setUser(user)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el efecto se ejecuta solo cuando cambian estas dependencias a proposito
    }, [store?.setUser, user])
    return (
        <body style={poppinsRegular.style} className={styles.layout}>
            {
                store?.loading
                &&
                <div className={styles.overlayLoader}>
                    <span className={styles.loader}></span>
                </div>
            }
            <Navbar lang={lang} handleAside={toggleOpen} user={user} />
            <div className={!!store?.showBar && !!store?.barContent ? styles.containerBar : styles.container}>
                <Aside lang={lang} open={open} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} routes={routes} />
                {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />}
                <main className={styles.main}>
                    {children}
                    <div className={styles.footerBar}>
                        © Libling 2024
                    </div>
                </main>
            </div>
            {
                (!!store?.showBar && !!store?.barContent)
                &&
                <ActionBar show={!!store?.showBar} Content={store?.barContent} />
            }
            <ToastContainer />
        </body>
    )
}
