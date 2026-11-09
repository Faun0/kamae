/** "Tsuba Ñandú 3D" → "tsuba-nandu-3d" (mismo patrón que valida firestore.rules). */
export function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/, '')
}

export const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/
