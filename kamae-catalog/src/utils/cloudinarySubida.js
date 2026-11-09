// Subida de imágenes a Cloudinary desde el navegador (solo admin).
// Usa un upload preset SIN firma: ver requisitos del preset en CLAUDE.md.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const API = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`

const MAX_ORIGINAL_MB = 25

/** Comprime en el cliente a WebP (máx. 1600px) antes de subir. */
async function comprimir(archivo) {
  const { default: imageCompression } = await import('browser-image-compression')
  return imageCompression(archivo, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    fileType: 'image/webp',
    initialQuality: 0.85,
    useWebWorker: true,
  })
}

/**
 * Comprime y sube una imagen.
 * @returns {Promise<{ url: string, publicId: string, deleteToken?: string }>}
 */
export async function subirImagen(archivo) {
  if (!CLOUD_NAME || !PRESET) {
    throw new Error('Falta configurar VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET.')
  }
  if (!archivo.type.startsWith('image/')) throw new Error('El archivo no es una imagen.')
  if (archivo.size > MAX_ORIGINAL_MB * 1024 * 1024) {
    throw new Error(`La imagen supera ${MAX_ORIGINAL_MB} MB.`)
  }

  const comprimido = await comprimir(archivo)
  const datos = new FormData()
  datos.append('file', comprimido, archivo.name.replace(/\.[^.]+$/, '') + '.webp')
  datos.append('upload_preset', PRESET)

  const respuesta = await fetch(`${API}/image/upload`, { method: 'POST', body: datos })
  const json = await respuesta.json()
  if (!respuesta.ok) throw new Error(json.error?.message ?? 'Cloudinary rechazó la imagen.')

  return { url: json.secure_url, publicId: json.public_id, deleteToken: json.delete_token }
}

/**
 * Borra una imagen recién subida usando su delete token (válido ~10 min, requiere
 * "Return delete token" en el preset). Best effort: si falla, la imagen queda huérfana.
 */
export async function borrarImagenPorToken(deleteToken) {
  if (!deleteToken) return false
  try {
    const datos = new FormData()
    datos.append('token', deleteToken)
    const respuesta = await fetch(`${API}/delete_by_token`, { method: 'POST', body: datos })
    return respuesta.ok
  } catch {
    return false
  }
}
