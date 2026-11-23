// Controles del toolbar del catálogo (formato en ANALISIS-UX-UI.md, "Búsqueda y filtros").

/** Selección única con "Todo" (= sin filtro). `opciones`: [{ valor, etiqueta, cantidad }]. */
export function Segmentado({ titulo, opciones, valor, onCambiar, className = '' }) {
  const todas = [{ valor: null, etiqueta: 'Todo' }, ...opciones]
  return (
    <div
      role="group"
      aria-label={titulo}
      className={`flex rounded-full border border-sumi/50 bg-white/40 ${className}`}
    >
      {todas.map((opcion) => {
        const activo = (valor ?? null) === opcion.valor
        const vacio = !activo && opcion.cantidad === 0
        return (
          <button
            key={opcion.valor ?? 'todo'}
            type="button"
            aria-pressed={activo}
            disabled={vacio}
            onClick={() => onCambiar(opcion.valor)}
            className={`min-h-11 flex-1 rounded-full px-4 text-sm whitespace-nowrap transition-colors md:flex-none ${
              activo
                ? 'bg-sumi text-washi'
                : vacio
                  ? 'cursor-not-allowed text-sumi-soft/50'
                  : 'text-sumi-soft hover:text-sumi'
            }`}
          >
            {opcion.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Chips interruptores de selección única: tocar el activo lo desactiva (no hay "Todas").
 * Una opción que dejaría el catálogo vacío se deshabilita, para no llegar a un callejón sin salida.
 */
export function GrupoChips({ titulo, opciones, valor, onCambiar }) {
  return (
    <div role="group" aria-label={titulo} className="flex shrink-0 gap-2">
      {opciones.map((opcion) => {
        const activo = valor === opcion.valor
        const vacio = !activo && opcion.cantidad === 0
        return (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={activo}
            disabled={vacio}
            title={vacio ? 'Sin productos con los filtros elegidos' : undefined}
            onClick={() => onCambiar(activo ? null : opcion.valor)}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors ${
              activo
                ? 'border-sumi bg-sumi text-washi'
                : vacio
                  ? 'cursor-not-allowed border-sumi/20 text-sumi-soft/50'
                  : 'border-sumi/50 text-sumi hover:border-sumi'
            }`}
          >
            {opcion.etiqueta}
          </button>
        )
      })}
    </div>
  )
}

/** Separador vertical de 1 × 24 px entre grupos. */
export function Separador({ className = '' }) {
  return <span aria-hidden="true" className={`h-6 w-px shrink-0 bg-sumi/20 ${className}`} />
}
