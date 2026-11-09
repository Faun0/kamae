import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BadgeDisponibilidad from '../../components/BadgeDisponibilidad.jsx'
import ImagenProducto from '../../components/ImagenProducto.jsx'
import { botonPrimario } from '../../components/admin/estilos.js'
import { borrarProducto, suscribirProductos } from '../../firebase/productosAdmin.js'
import { camposFaltantes } from '../../utils/completitud.js'
import { CATEGORIAS } from '../../utils/constantes.js'
import { formatearPrecio } from '../../utils/formato.js'

const etiquetaCategoria = (valor) =>
  CATEGORIAS.find((c) => c.valor === valor)?.etiqueta ?? valor

export default function AdminProductos() {
  const [productos, setProductos] = useState(null)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(null)
  const [ocupado, setOcupado] = useState(null) // id del producto con una operación en curso

  useEffect(() => suscribirProductos(setProductos, setError), [])

  async function ejecutar(id, operacion) {
    setOcupado(id)
    setError(null)
    try {
      await operacion()
    } catch (e) {
      setError(e)
    } finally {
      setOcupado(null)
      setConfirmandoBorrar(null)
    }
  }

  const termino = busqueda.trim().toLowerCase()
  const filtrados = (productos ?? []).filter(
    (p) => !termino || p.nombre.toLowerCase().includes(termino),
  )

  return (
    <section>
      <title>Admin · Kamae</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl">
          Productos
          {productos && (
            <span className="ml-2 text-base text-sumi-soft">({productos.length})</span>
          )}
        </h1>
        <Link to="/admin/nuevo" className={botonPrimario}>
          + Nuevo producto
        </Link>
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mt-6 w-full rounded-sm border border-sumi/20 bg-white px-3 py-2 text-sm sm:max-w-xs"
        aria-label="Buscar productos"
      />

      {error && (
        <p className="mt-4 rounded-sm bg-shu/10 px-3 py-2 text-sm text-shu" role="alert">
          Error: {error.code === 'permission-denied' ? 'sin permisos.' : error.message}
        </p>
      )}

      {productos === null && !error && (
        <p className="mt-8 text-sumi-soft">Cargando productos…</p>
      )}

      {productos?.length === 0 && (
        <p className="mt-8 text-sumi-soft">Todavía no hay productos. Creá el primero.</p>
      )}

      <ul className="mt-6 divide-y divide-sumi/10 border-y border-sumi/10">
        {filtrados.map((p) => (
          <li
            key={p.id}
            className={`flex flex-wrap items-center gap-4 py-3 ${ocupado === p.id ? 'opacity-50' : ''}`}
          >
            <ImagenProducto
              imagen={p.imagenes?.[0]}
              alt={p.nombre}
              ancho={96}
              className="h-14 w-14 shrink-0 rounded-sm"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/admin/editar/${p.id}`}
                  className="truncate font-medium hover:text-shu"
                >
                  {p.nombre}
                </Link>
                {p.visible ? (
                  <span className="rounded-sm bg-ai/10 px-2 py-0.5 text-xs text-ai">
                    Publicado
                  </span>
                ) : (
                  <span className="rounded-sm bg-sumi/10 px-2 py-0.5 text-xs text-sumi-soft">
                    Borrador
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-sumi-soft">
                {[
                  p.categoria && etiquetaCategoria(p.categoria),
                  p.precio != null && formatearPrecio(p.precio, p.moneda),
                ]
                  .filter(Boolean)
                  .join(' · ')}
                {p.categoria || p.precio != null ? ' · ' : ''}
                <BadgeDisponibilidad disponibilidad={p.disponibilidad} />
              </p>
              {!p.visible && (
                <p className="mt-0.5 text-xs text-shu">
                  Falta: {camposFaltantes(p).join(', ')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              {p.visible && (
                <Link
                  to={`/producto/${p.slug}`}
                  className="text-sumi-soft hover:text-sumi"
                  target="_blank"
                >
                  Ver
                </Link>
              )}
              <Link to={`/admin/editar/${p.id}`} className="text-sumi-soft hover:text-sumi">
                Editar
              </Link>

              {confirmandoBorrar === p.id ? (
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ejecutar(p.id, () => borrarProducto(p.id))}
                    className="font-medium text-shu"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoBorrar(null)}
                    className="text-sumi-soft"
                  >
                    Cancelar
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoBorrar(p.id)}
                  className="text-sumi-soft hover:text-shu"
                >
                  Borrar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {productos?.length > 0 && filtrados.length === 0 && (
        <p className="mt-6 text-sumi-soft">Ningún producto coincide con “{busqueda}”.</p>
      )}
    </section>
  )
}
