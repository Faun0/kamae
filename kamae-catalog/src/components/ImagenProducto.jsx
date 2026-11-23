import { imagenSrc, imagenSrcSet } from '../utils/cloudinary.js'

/**
 * Imagen de producto optimizada (Cloudinary) con placeholder si no hay imagen.
 * Por defecto lazy; para la imagen principal del detalle pasar prioridad.
 * `ajuste`: 'cover' recorta para llenar (grilla); 'contain' muestra la foto entera
 * sobre fondo neutro (detalle: cada vendedor sube fotos de proporciones distintas).
 */
export default function ImagenProducto({
  imagen,
  alt,
  ancho = 600,
  anchos,
  sizes,
  prioridad = false,
  ajuste = 'cover',
  className = '',
}) {
  const src = imagenSrc(imagen, ancho)

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-washi-dark ${className}`}
        role="img"
        aria-label={`${alt} (sin imagen)`}
      >
        <span className="font-serif text-4xl text-sumi/15" aria-hidden="true">
          構
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      srcSet={anchos ? imagenSrcSet(imagen, anchos) : undefined}
      sizes={sizes}
      alt={imagen.alt || alt}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={`bg-washi-dark ${ajuste === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  )
}
