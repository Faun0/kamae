import { inputBase } from './estilos.js'
import { MAX_VARIANTES } from '../../utils/constantes.js'

/**
 * Variantes del producto (talles, colores…). Ítem en el form:
 * { key, etiqueta, precio: string ('' = usa el precio del producto), disponible }
 */
export default function EditorVariantes({
  variantes,
  setVariantes,
  errores = {},
  moneda = 'ARS',
}) {
  const actualizar = (key, cambios) =>
    setVariantes(variantes.map((v) => (v.key === key ? { ...v, ...cambios } : v)))

  const agregar = () =>
    setVariantes([
      ...variantes,
      { key: crypto.randomUUID(), etiqueta: '', precio: '', disponible: true },
    ])

  return (
    <div>
      {variantes.length > 0 && (
        <ul className="space-y-2">
          {variantes.map((v, i) => (
            <li key={v.key} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={v.etiqueta}
                onChange={(e) => actualizar(v.key, { etiqueta: e.target.value })}
                placeholder="Ej. 3.8 (adultos)"
                aria-label={`Etiqueta de la opción ${i + 1}`}
                aria-invalid={Boolean(errores[v.key])}
                className={`${inputBase} min-w-40 flex-1`}
              />
              <input
                type="number"
                min="0"
                step={moneda === 'ARS' ? '1' : '0.01'}
                inputMode="decimal"
                value={v.precio}
                onChange={(e) => actualizar(v.key, { precio: e.target.value })}
                placeholder={`Precio ${moneda} (opcional)`}
                aria-label={`Precio de la opción ${i + 1}`}
                className={`${inputBase} w-40`}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={v.disponible}
                  onChange={(e) => actualizar(v.key, { disponible: e.target.checked })}
                  className="accent-sumi"
                />
                Con stock
              </label>
              <button
                type="button"
                onClick={() => setVariantes(variantes.filter((x) => x.key !== v.key))}
                className="px-2 text-sm text-sumi-soft hover:text-shu"
                aria-label={`Quitar la opción ${i + 1}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {variantes.length < MAX_VARIANTES && (
        <button
          type="button"
          onClick={agregar}
          className="mt-2 text-sm text-sumi-soft underline underline-offset-4 hover:text-sumi"
        >
          + Agregar opción
        </button>
      )}
      <p className="mt-1 text-xs text-sumi-soft">
        Si una opción no tiene precio, usa el precio del producto.
      </p>
    </div>
  )
}
