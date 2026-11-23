import { Link, useLocation } from 'react-router-dom'
import BadgeDisponibilidad from './BadgeDisponibilidad.jsx'
import ImagenProducto from './ImagenProducto.jsx'
import { formatearPrecio, rangoPrecio } from '../utils/formato.js'

/** `prioridad`: para la primera fila visible (carga inmediata en vez de lazy). */
export default function ProductCard({ producto, prioridad = false }) {
  const location = useLocation()
  const { min, max } = rangoPrecio(producto)
  const agotado = producto.disponibilidad === 'agotado'

  return (
    <Link
      to={`/producto/${producto.slug}`}
      // El detalle usa esto para "Volver al catálogo" conservando filtros, búsqueda y orden.
      state={{ volverA: location.pathname + location.search }}
      className="group block"
    >
      {/* Borde fino neutro: las fotos de fondo blanco no "flotan" sobre el washi. No toca la foto. */}
      <div className="relative aspect-square overflow-hidden rounded-sm ring-1 ring-sumi/10">
        <ImagenProducto
          imagen={producto.imagenes?.[0]}
          alt={producto.nombre}
          ancho={400}
          anchos={[300, 400, 600, 800]}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          prioridad={prioridad}
          className={`h-full w-full motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-105 ${
            agotado ? 'opacity-60 grayscale' : ''
          }`}
        />
        {producto.disponibilidad !== 'disponible' && (
          <BadgeDisponibilidad
            disponibilidad={producto.disponibilidad}
            className="absolute top-2 left-2 bg-washi/90"
          />
        )}
        {producto.condicion === 'usado' && (
          <span className="absolute top-2 right-2 rounded-sm bg-washi/90 px-2 py-0.5 text-xs font-medium tracking-wide text-sumi">
            Usado
          </span>
        )}
      </div>
      <h3 className="mt-3 text-sm leading-snug font-medium group-hover:text-shu-texto sm:text-base">
        {producto.nombre}
      </h3>
      <p className="mt-1 text-sm text-sumi-soft">
        {min !== max && 'Desde '}
        {formatearPrecio(min, producto.moneda)}
      </p>
      {producto.disponibilidad === 'a_pedido' && producto.tiempoProduccion && (
        <p className="mt-0.5 text-sm text-shu-texto">A pedido · {producto.tiempoProduccion}</p>
      )}
      {producto.vendedor && (
        <p className="mt-1 truncate text-xs text-sumi-soft">
          {producto.vendedor.nombre} · {producto.vendedor.ciudad}
        </p>
      )}
    </Link>
  )
}
