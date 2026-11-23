import { useBusquedaCatalogo } from '../hooks/useBusquedaCatalogo.js'
import { busquedaCatalogo } from '../utils/busquedaCatalogo.js'

/** Campo de búsqueda del catálogo (va en el header; solo se muestra en /catalogo). */
export default function BuscadorCatalogo({ id, autoFocus = false, className = '' }) {
  const texto = useBusquedaCatalogo()

  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault()
        // En el celular, Enter cierra el teclado para ver los resultados.
        e.currentTarget.querySelector('input')?.blur()
      }}
    >
      <label htmlFor={id} className="sr-only">
        Buscar en el catálogo
      </label>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-sumi-soft"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path strokeLinecap="round" d="M16 16l4 4" />
      </svg>
      <input
        id={id}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoFocus={autoFocus}
        value={texto}
        onChange={(e) => busquedaCatalogo.set(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && texto && (e.stopPropagation(), busquedaCatalogo.set(''))}
        placeholder="Buscar shinai, tsuba, keikogi…"
        className="h-11 w-full rounded-sm border border-sumi/50 bg-white pr-11 pl-10 text-base text-sumi placeholder:text-sumi-soft"
      />
      {texto && (
        <button
          type="button"
          onClick={(e) => {
            busquedaCatalogo.set('')
            e.currentTarget.closest('form').querySelector('input').focus()
          }}
          aria-label="Borrar búsqueda"
          className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center text-sumi-soft hover:text-sumi"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </form>
  )
}
