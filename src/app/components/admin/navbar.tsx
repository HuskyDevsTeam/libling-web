'use client'
import React, { useEffect, useRef, useState } from 'react'
import styles from './navbar.module.css'
import { logOut } from '@/app/actions';
import { dict } from '@/app/utils';
import { usePathname } from 'next/navigation';
import LogoSVG from '../../img/Recurso 1 1.svg'
import Image from 'next/image';
import Link from 'next/link';
import { poppinsBold, poppinsMedium } from '@/app/fonts';
import { LanguageSelector } from '../languageSelector';
import LogoNavSVG from '../icons/logoNavSVG';
import { FiLogOut, FiMenu, FiUser } from 'react-icons/fi'
import { userInitial } from '@/app/utils/profile'
import { useSession } from "next-auth/react"
import { UserDTO } from '@/dto';
import type { IUserSession } from '@/server/data'
import { Button } from './button';


export default function Navbar({ lang, handleAside, user }: { lang: "es" | "en" | "fr", handleAside: VoidFunction, user?: IUserSession }) {
    const glosary = dict[lang]?.adminNav
    const [showMenu, setShowMenu] = useState<boolean>(false)
    const menuRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!showMenu) return
        const onDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
        }
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowMenu(false) }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [showMenu])
    return (<>
        <nav className={styles.navbar}>
            <div className={styles.logoContainer}>
                <div onClick={handleAside}>
                    <FiMenu className={styles.menuIcon} />
                </div>
                <Link href="/admin/dashboard" aria-label={glosary.dashboardTitle} className={styles.logoLink}>
                    <LogoNavSVG />
                </Link>
            </div>
            <div className={styles.userContainer}>
                <div className={styles.formSelector}>
                    <LanguageSelector lang={lang} />
                </div>
                <div className={styles.userData} ref={menuRef}>
                    <button type="button" className={styles.avatar} aria-label={glosary.userMenu} aria-haspopup="menu" aria-expanded={showMenu} onClick={() => setShowMenu(state => !state)}>
                        {userInitial(user?.name, user?.email)}
                    </button>
                    {showMenu && (
                        <div className={styles.menu} role="menu">
                            <div className={styles.menuUser}>
                                <span className={styles.menuName}>{user?.name || user?.email}</span>
                                {!!user?.name && <span className={styles.menuEmail}>{user?.email}</span>}
                            </div>
                            <Link href="/admin/profile" role="menuitem" className={styles.menuItem} onClick={() => setShowMenu(false)}>
                                <FiUser /> {glosary.profileMenu}
                            </Link>
                            <button type="button" role="menuitem" className={styles.menuItem} onClick={async () => { await logOut() }}>
                                <FiLogOut /> {glosary.closeSession}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    </>
    )
}
