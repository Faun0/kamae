const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

/**
 * URL optimizada de una imagen de Cloudinary: formato automático (WebP/AVIF),
 * calidad automática y ancho máximo opcional.
 * @param {string} publicId  - publicId guardado en Firestore (imagenes[].publicId)
 * @param {{ width?: number }} [opciones]
 */
export function cloudinaryUrl(publicId, { width } = {}) {
  const transformaciones = ['f_auto', 'q_auto', width && `c_limit,w_${width}`]
    .filter(Boolean)
    .join(',')
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformaciones}/${publicId}`
}

const optimizable = (imagen) => Boolean(CLOUD_NAME && imagen?.publicId)

/** src de una imagen de producto ({ url, publicId }); cae a `url` si no hay publicId. */
export function imagenSrc(imagen, width) {
  if (!imagen) return null
  return optimizable(imagen) ? cloudinaryUrl(imagen.publicId, { width }) : imagen.url
}

/** srcset con varios anchos (solo si la imagen es de Cloudinary). */
export function imagenSrcSet(imagen, anchos) {
  if (!optimizable(imagen)) return undefined
  return anchos.map((w) => `${cloudinaryUrl(imagen.publicId, { width: w })} ${w}w`).join(', ')
}
