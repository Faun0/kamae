import { useSyncExternalStore } from 'react'
import { sesion } from '../firebase/sesion.js'

/** { cargando, usuario, esAdmin } — usar solo en páginas lazy de /login y /admin. */
export function useSesion() {
  return useSyncExternalStore(sesion.subscribe, sesion.getSnapshot, sesion.getSnapshot)
}
