import { useSyncExternalStore } from 'react'
import { busquedaCatalogo } from '../utils/busquedaCatalogo.js'

/** Texto actual del buscador del catálogo (ver `utils/busquedaCatalogo.js`). */
export function useBusquedaCatalogo() {
  return useSyncExternalStore(busquedaCatalogo.subscribe, busquedaCatalogo.get, busquedaCatalogo.get)
}
