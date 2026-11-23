import { useState } from 'react'
import { Link, useLoaderData, useLocation } from 'react-router-dom'
import BadgeDisponibilidad from '../components/BadgeDisponibilidad.jsx'
import BotonWhatsApp from '../components/BotonWhatsApp.jsx'
import ImagenProducto from '../components/ImagenProducto.jsx'
import { useListaConsulta } from '../hooks/useListaConsulta.js'
import { formatearPrecio, precioDe } from '../utils/formato.js'
import { claveItem, listaConsulta } from '../utils/listaConsulta.js'
import { mensajeProducto } from '../utils/whatsapp.js'

const AVISO_VENTA = 'Coordinás directo con el vendedor; Kamae no interviene en la venta.'

export default function ProductoDetalle() {
  const { producto } = useLoaderData()
  // key: al pasar de un producto a otro se reinicia el estado (variante, imagen).
  return <Detalle key={producto.id} producto={producto} />
}

function Detalle({ producto }) {
  const location = useLocation()
  const variantes = producto.variantes ?? []
  const imagenes = producto.imagenes ?? []
  const enLista = useListaConsulta()

  const [varianteIdx, setVarianteIdx] = useState(() => {
    if (!variantes.length) return null
    const primeraDisponible = variantes.findIndex((v) => v.disponible)
    return primeraDisponible === -1 ? 0 : primeraDisponible
  })
  const [imagenIdx, setImagenIdx] = useState(0)

  const variante = varianteIdx === null ? null : variantes[varianteIdx]
  const precio = precioDe(producto, variante)
  const sinStockVariante = variante && !variante.disponible

  const item = {
    id: producto.id,
    slug: producto.slug,
    nombre: producto.nombre,
    variante: variante?.etiqueta ?? null,
    precio,
    moneda: producto.moneda,
    whatsapp: producto.whatsapp,
    vendedor: producto.vendedor?.nombre ?? null, // para agrupar la lista de consulta por vendedor
  }
  // La opción elegida ya está en la lista: el botón lo muestra (evita agregarla dos veces sin querer).
  const yaEnLista = enLista.some((i) => claveItem(i) === claveItem(item))

  // Si se llegó desde el catálogo, volver con los mismos filtros, búsqueda y orden.
  const desde = location.state?.volverA
  const volverA = desde?.startsWith('/catalogo') ? desde : '/catalogo'

  const textoCta =
    producto.disponibilidad === 'agotado' || sinStockVariante
      ? 'Consultar reposición'
      : 'Consultar por WhatsApp'
  const cta = (className) => (
    <BotonWhatsApp
      numero={producto.whatsapp}
      mensaje={mensajeProducto(item)}
      evento={{ origen: 'detalle', producto: producto.slug, variante: item.variante }}
      className={className}
    >
      {textoCta}
    </BotonWhatsApp>
  )

  return (
    <article>
      <title>{`${producto.nombre} · Kamae`}</title>
      <meta name="description" content={producto.descripcion} />

      <Link
        to={volverA}
        className="-my-2 inline-flex min-h-11 items-center text-sm text-sumi-soft hover:text-sumi"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Galería: la foto se muestra entera (cada vendedor sube lo que tiene). */}
        <div>
          <ImagenProducto
            imagen={imagenes[imagenIdx]}
            alt={producto.nombre}
            ancho={900}
            anchos={[450, 700, 900, 1200]}
            sizes="(min-width: 768px) 50vw, 100vw"
            prioridad
            ajuste="contain"
            className="aspect-square w-full rounded-sm ring-1 ring-sumi/10"
          />
          {imagenes.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {imagenes.map((imagen, i) => (
                <button
                  key={imagen.publicId ?? imagen.url}
                  type="button"
                  onClick={() => setImagenIdx(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-current={i === imagenIdx}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-sm border-2 ${
                    i === imagenIdx ? 'border-shu' : 'border-transparent opacity-70'
                  }`}
                >
                  <ImagenProducto imagen={imagen} alt="" ancho={128} className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información y compra */}
        <div>
          <div className="flex flex-wrap gap-2">
            <BadgeDisponibilidad disponibilidad={producto.disponibilidad} />
            {producto.condicion && (
              <span className="inline-block rounded-sm bg-sumi/10 px-2 py-0.5 text-xs font-medium tracking-wide text-sumi">
                {producto.condicion === 'usado' ? 'Usado' : 'Nuevo'}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-serif text-3xl leading-tight">{producto.nombre}</h1>
          <p className="mt-3 text-2xl">{formatearPrecio(precio, producto.moneda)}</p>

          {producto.disponibilidad === 'a_pedido' && producto.tiempoProduccion && (
            <p className="mt-2 text-sm text-shu-texto">
              Se fabrica a pedido · {producto.tiempoProduccion}
            </p>
          )}

          {variantes.length > 0 && (
            <fieldset className="mt-6 min-w-0">
              <legend className="mb-2 text-[0.8125rem] tracking-widest text-sumi-soft uppercase">
                Opción
              </legend>
              <div className="flex flex-wrap gap-2">
                {variantes.map((v, i) => (
                  <label
                    key={v.etiqueta}
                    className={`inline-flex min-h-11 cursor-pointer items-center rounded-sm border px-3 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-shu ${
                      i === varianteIdx
                        ? 'border-sumi bg-sumi text-washi'
                        : 'border-sumi/50 hover:border-sumi'
                    } ${v.disponible ? '' : 'line-through decoration-sumi-soft/60'}`}
                  >
                    <input
                      type="radio"
                      name="variante"
                      className="sr-only"
                      checked={i === varianteIdx}
                      onChange={() => setVarianteIdx(i)}
                    />
                    {v.etiqueta}
                    {!v.disponible && <span className="sr-only"> (sin stock)</span>}
                  </label>
                ))}
              </div>
              {sinStockVariante && (
                <p className="mt-2 text-sm text-sumi-soft">
                  Esta opción está sin stock: consultanos por reposición.
                </p>
              )}
            </fieldset>
          )}

          {/* Quién publica: el comprador sabe con quién va a hablar antes de escribir. */}
          {producto.vendedor && (
            <p className="mt-8 text-sm text-sumi-soft">
              Publicado por <strong className="font-medium text-sumi">{producto.vendedor.nombre}</strong>{' '}
              · {producto.vendedor.ciudad}
            </p>
          )}

          <div className={`${producto.vendedor ? 'mt-3' : 'mt-8'} flex flex-col gap-3 sm:flex-row`}>
            {cta('flex-1')}
            {yaEnLista ? (
              <Link
                to="/consulta"
                className="inline-flex items-center justify-center rounded-sm border border-ai/40 bg-ai/10 px-6 py-3 font-medium text-ai transition-colors hover:border-ai"
              >
                ✓ En tu consulta · Ver lista
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => listaConsulta.agregar(item)}
                className="rounded-sm border border-sumi/50 px-6 py-3 font-medium transition-colors hover:border-sumi"
              >
                Agregar a la consulta
              </button>
            )}
          </div>
          <p className="mt-3 text-sm text-sumi-soft">{AVISO_VENTA}</p>

          {producto.descripcion && (
            <div className="mt-10 border-t border-sumi/10 pt-6">
              <h2 className="text-[0.8125rem] tracking-widest text-sumi-soft uppercase">
                Descripción
              </h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line">{producto.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Celular: la acción principal siempre a mano (con la foto a ancho completo queda abajo). */}
      <div
        data-barra-cta
        className="fixed inset-x-0 bottom-0 z-10 border-t border-sumi/10 bg-washi/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-sumi-soft">{variante?.etiqueta ?? producto.nombre}</p>
            <p className="font-medium">{formatearPrecio(precio, producto.moneda)}</p>
          </div>
          {cta('ml-auto shrink-0 px-4')}
        </div>
      </div>
    </article>
  )
}
