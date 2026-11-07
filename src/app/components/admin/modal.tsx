'use client'
import React from 'react'
import ReactModal from 'react-modal'

interface IModal {
    open: boolean
    onRequestClose?: VoidFunction
    children: React.ReactNode
    width?:string
}

const Modal: React.FC<IModal> = ({ open, onRequestClose, children, width }) => {
    const parent = typeof document !== 'undefined' ? document.getElementById('#main') : null
    return (
        <ReactModal isOpen={open} onRequestClose={onRequestClose} appElement={parent || undefined} style={{
            overlay: { backgroundColor: '#00000052', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex:4 },
            content: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 10, boxShadow: '0px 12px 30px #1973FA14', width: !!width ? width : 384, maxWidth: 'calc(100vw - 32px)', position: 'relative', display: 'flex', flexDirection: 'column', gap:16, color:'#000000DE', inset:0 , zIndex:5}
        }}>
            {children}
        </ReactModal>
    )
}

export default Modal