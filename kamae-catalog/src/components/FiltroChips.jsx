const chipClase = (activo) =>
  `shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
    activo
      ? 'border-sumi bg-sumi text-washi'
      : 'border-sumi/20 text-sumi-soft hover:border-sumi/50 hover:text-sumi'
  }`

/** Grupo de chips de selección única; `valor` null = "Todas". */
export default function FiltroChips({ titulo, opciones, valor, onCambiar }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs tracking-widest text-sumi-soft uppercase">
        {titulo}
      </legend>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          className={chipClase(!valor)}
          aria-pressed={!valor}
          onClick={() => onCambiar(null)}
        >
          Todas
        </button>
        {opciones.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            className={chipClase(valor === opcion.valor)}
            aria-pressed={valor === opcion.valor}
            onClick={() => onCambiar(opcion.valor)}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
