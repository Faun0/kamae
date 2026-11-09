import { Link } from 'react-router-dom'
import BadgeDisponibilidad from './BadgeDisponibilidad.jsx'
import ImagenProducto from './ImagenProducto.jsx'
import { formatearPrecio, rangoPrecio } from '../utils/formato.js'

export default function ProductCard({ producto }) {
  const { min, max } = rangoPrecio(producto)
  const agotado = producto.disponibilidad === 'agotado'

  return (
    <Link to={`/producto/${producto.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-sm">
        <ImagenProducto
          imagen={producto.imagenes?.[0]}
          alt={producto.nombre}
          ancho={400}
          anchos={[300, 400, 600, 800]}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={`h-full w-full transition duration-500 group-hover:scale-105 ${
            agotado ? 'opacity-60 grayscale' : ''
          }`}
        />
        {producto.disponibilidad !== 'disponible' && (
          <BadgeDisponibilidad
            disponibilidad={producto.disponibilidad}
            className="absolute top-2 left-2 bg-washi/90"
          />
        )}
      </div>
      <h3 className="mt-3 text-sm leading-snug font-medium group-hover:text-shu sm:text-base">
        {producto.nombre}
      </h3>
      <p className="mt-1 text-sm text-sumi-soft">
        {min !== max && 'Desde '}
        {formatearPrecio(min, producto.moneda)}
      </p>
    </Link>
  )
}
