import { useState } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import BadgeDisponibilidad from '../components/BadgeDisponibilidad.jsx'
import BotonWhatsApp from '../components/BotonWhatsApp.jsx'
import ImagenProducto from '../components/ImagenProducto.jsx'
import { formatearPrecio, precioDe } from '../utils/formato.js'
import { listaConsulta } from '../utils/listaConsulta.js'
import { mensajeProducto } from '../utils/whatsapp.js'

export default function ProductoDetalle() {
  const { producto } = useLoaderData()
  // key: al pasar de un producto a otro se reinicia el estado (variante, imagen).
  return <Detalle key={producto.id} producto={producto} />
}

function Detalle({ producto }) {
  const variantes = producto.variantes ?? []
  const imagenes = producto.imagenes ?? []

  const [varianteIdx, setVarianteIdx] = useState(() => {
    if (!variantes.length) return null
    const primeraDisponible = variantes.findIndex((v) => v.disponible)
    return primeraDisponible === -1 ? 0 : primeraDisponible
  })
  const [imagenIdx, setImagenIdx] = useState(0)
  const [agregado, setAgregado] = useState(false)

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
  }

  function agregarALista() {
    listaConsulta.agregar(item)
    setAgregado(true)
  }

  return (
    <article>
      <title>{`${producto.nombre} · Kamae`}</title>
      <meta name="description" content={producto.descripcion} />

      <Link to="/" className="text-sm text-sumi-soft hover:text-sumi">
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Galería */}
        <div>
          <ImagenProducto
            imagen={imagenes[imagenIdx]}
            alt={producto.nombre}
            ancho={900}
            anchos={[450, 700, 900, 1200]}
            sizes="(min-width: 768px) 50vw, 100vw"
            prioridad
            className="aspect-square w-full rounded-sm"
          />
          {imagenes.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
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
                  <ImagenProducto
                    imagen={imagen}
                    alt=""
                    ancho={128}
                    className="h-full w-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información y compra */}
        <div>
          <BadgeDisponibilidad disponibilidad={producto.disponibilidad} />
          <h1 className="mt-3 font-serif text-3xl leading-tight">{producto.nombre}</h1>
          <p className="mt-3 text-2xl">{formatearPrecio(precio, producto.moneda)}</p>

          {producto.disponibilidad === 'a_pedido' && producto.tiempoProduccion && (
            <p className="mt-2 text-sm text-shu">
              Se fabrica a pedido · {producto.tiempoProduccion}
            </p>
          )}

          {variantes.length > 0 && (
            <fieldset className="mt-6 min-w-0">
              <legend className="mb-2 text-xs tracking-widest text-sumi-soft uppercase">
                Opción
              </legend>
              <div className="flex flex-wrap gap-2">
                {variantes.map((v, i) => (
                  <label
                    key={v.etiqueta}
                    className={`cursor-pointer rounded-sm border px-3 py-2 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-shu ${
                      i === varianteIdx
                        ? 'border-sumi bg-sumi text-washi'
                        : 'border-sumi/20 hover:border-sumi/50'
                    } ${v.disponible ? '' : 'line-through decoration-sumi-soft/60'}`}
                  >
                    <input
                      type="radio"
                      name="variante"
                      className="sr-only"
                      checked={i === varianteIdx}
                      onChange={() => {
                        setVarianteIdx(i)
                        setAgregado(false)
                      }}
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BotonWhatsApp
              mensaje={mensajeProducto(item)}
              evento={{ origen: 'detalle', producto: producto.slug, variante: item.variante }}
              className="flex-1"
            >
              {producto.disponibilidad === 'agotado' || sinStockVariante
                ? 'Consultar reposición'
                : 'Consultar por WhatsApp'}
            </BotonWhatsApp>
            <button
              type="button"
              onClick={agregarALista}
              className="rounded-sm border border-sumi/30 px-6 py-3 font-medium transition-colors hover:border-sumi"
            >
              Agregar a la consulta
            </button>
          </div>
          {agregado && (
            <p className="mt-3 text-sm text-ai" role="status">
              Agregado a tu lista.{' '}
              <Link to="/consulta" className="underline underline-offset-4">
                Ver lista de consulta
              </Link>
            </p>
          )}

          {producto.descripcion && (
            <div className="mt-10 border-t border-sumi/10 pt-6">
              <h2 className="text-xs tracking-widest text-sumi-soft uppercase">
                Descripción
              </h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line">
                {producto.descripcion}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
