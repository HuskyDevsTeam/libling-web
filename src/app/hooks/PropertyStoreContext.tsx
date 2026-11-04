'use client'
import { createContext, useContext } from 'react'
import { PropertyStoreHook, usePropertyStore } from './usePropertyStore'

// Los pasos del formulario (registrar y editar) leen su estado del store que
// provee este contexto; por defecto el de registrar.
export const PropertyStoreContext = createContext<PropertyStoreHook>(usePropertyStore)

export const usePropertyStoreFromContext = () => useContext(PropertyStoreContext)
