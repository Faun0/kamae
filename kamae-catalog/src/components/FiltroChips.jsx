const chipClase = (activo) =>
  `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm transition-colors ${
    activo
      ? 'border-sumi bg-sumi text-washi'
      : 'border-sumi/50 text-sumi-soft hover:border-sumi hover:text-sumi'
  }`

/** Grupo de chips de selección única; `valor` null = "Todas". */
export default function FiltroChips({ titulo, opciones, valor, onCambiar }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-[0.8125rem] tracking-widest text-sumi-soft uppercase">
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
