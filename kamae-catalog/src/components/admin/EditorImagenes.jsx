import { useRef } from 'react'
import ImagenProducto from '../ImagenProducto.jsx'
import { inputClase } from './estilos.js'
import { borrarImagenPorToken, subirImagen } from '../../utils/cloudinarySubida.js'
import { MAX_IMAGENES } from '../../utils/constantes.js'

/**
 * Lista ordenable de imágenes del producto. La primera es la principal.
 * Ítem: { key, url, publicId, alt, deleteToken? } — deleteToken solo en las subidas de esta sesión.
 * `setImagenes` y `setSubiendo` aceptan un valor o una función updater (como setState).
 * `subiendo`: [{ key, nombre, error? }] — vive en el formulario para bloquear el guardado.
 */
export default function EditorImagenes({ imagenes, setImagenes, subiendo, setSubiendo }) {
  const inputRef = useRef(null)
  const lugares = MAX_IMAGENES - imagenes.length - subiendo.filter((s) => !s.error).length

  async function elegirArchivos(event) {
    const archivos = [...event.target.files].slice(0, Math.max(lugares, 0))
    event.target.value = ''

    await Promise.all(
      archivos.map(async (archivo) => {
        const key = crypto.randomUUID()
        setSubiendo((s) => [...s, { key, nombre: archivo.name }])
        try {
          const subida = await subirImagen(archivo)
          setImagenes((lista) => [...lista, { key, alt: '', ...subida }])
          setSubiendo((s) => s.filter((x) => x.key !== key))
        } catch (e) {
          setSubiendo((s) =>
            s.map((x) => (x.key === key ? { ...x, error: e.message } : x)),
          )
        }
      }),
    )
  }

  function mover(indice, delta) {
    setImagenes((lista) => {
      const nueva = [...lista]
      const destino = indice + delta
      ;[nueva[indice], nueva[destino]] = [nueva[destino], nueva[indice]]
      return nueva
    })
  }

  function quitar(imagen) {
    setImagenes((lista) => lista.filter((i) => i.key !== imagen.key))
    // Si se subió en esta edición, se borra de Cloudinary; si ya estaba guardada, queda huérfana.
    borrarImagenPorToken(imagen.deleteToken)
  }

  const cambiarAlt = (key, alt) =>
    setImagenes((lista) => lista.map((i) => (i.key === key ? { ...i, alt } : i)))

  return (
    <div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {imagenes.map((imagen, i) => (
          <li key={imagen.key} className="rounded-sm border border-sumi/10 bg-white p-2">
            <div className="relative">
              <ImagenProducto
                imagen={imagen}
                alt={imagen.alt}
                ancho={300}
                className="aspect-square w-full rounded-sm"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 rounded-sm bg-sumi px-1.5 py-0.5 text-xs text-washi">
                  Principal
                </span>
              )}
            </div>
            <input
              type="text"
              value={imagen.alt}
              onChange={(e) => cambiarAlt(imagen.key, e.target.value)}
              placeholder="Descripción (alt)"
              aria-label={`Descripción de la imagen ${i + 1}`}
              className={`mt-2 ${inputClase} px-2 py-1 text-xs`}
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => mover(i, -1)}
                  className="px-2 text-sumi-soft hover:text-sumi disabled:opacity-30"
                  aria-label="Mover a la izquierda"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={i === imagenes.length - 1}
                  onClick={() => mover(i, 1)}
                  className="px-2 text-sumi-soft hover:text-sumi disabled:opacity-30"
                  aria-label="Mover a la derecha"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => quitar(imagen)}
                className="text-sumi-soft hover:text-shu"
              >
                Quitar
              </button>
            </div>
          </li>
        ))}

        {subiendo.map((s) => (
          <li
            key={s.key}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-sumi/20 p-3 text-center text-xs"
          >
            {s.error ? (
              <>
                <span className="text-shu">No se pudo subir {s.nombre}</span>
                <span className="text-sumi-soft">{s.error}</span>
                <button
                  type="button"
                  onClick={() => setSubiendo((l) => l.filter((x) => x.key !== s.key))}
                  className="underline"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <span className="animate-pulse text-sumi-soft">Subiendo {s.nombre}…</span>
            )}
          </li>
        ))}

        {lugares > 0 && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-sumi/30 text-sm text-sumi-soft hover:border-sumi hover:text-sumi"
            >
              <span className="text-2xl">+</span>
              Agregar imágenes
            </button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={elegirArchivos}
        className="hidden"
      />
      <p className="mt-2 text-xs text-sumi-soft">
        Hasta {MAX_IMAGENES} imágenes. Se comprimen a WebP antes de subir. La primera es la
        que se ve en el catálogo.
      </p>
    </div>
  )
}
