import { useSyncExternalStore } from 'react'
import { listaConsulta } from '../utils/listaConsulta.js'

/** Ítems de la lista de consulta; se re-renderiza al cambiar (también desde otra pestaña). */
export function useListaConsulta() {
  return useSyncExternalStore(
    listaConsulta.subscribe,
    listaConsulta.getSnapshot,
    listaConsulta.getSnapshot,
  )
}
