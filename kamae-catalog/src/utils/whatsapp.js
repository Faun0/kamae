import { formatearPrecio } from './formato.js'

// Número general (opcional): solo para el link de contacto del footer.
// Cada producto tiene su propio número (campo `whatsapp`) para las consultas.
export const WHATSAPP_GENERAL = import.meta.env.VITE_WHATSAPP || null

export const linkWhatsApp = (numero, mensaje) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`

export const urlProducto = (slug) => `${window.location.origin}/producto/${slug}`

/** "5493511234567" → "+54 9 351 123-4567" (para mostrar). */
export function formatearWhatsApp(numero) {
  const m = /^549(\d{3})(\d{3})(\d{4})$/.exec(numero ?? '')
  return m ? `+54 9 ${m[1]} ${m[2]}-${m[3]}` : numero
}

const lineaItem = ({ nombre, variante, precio, moneda, cantidad = 1 }) =>
  [
    cantidad > 1 ? `${cantidad} × ${nombre}` : nombre,
    variante,
    formatearPrecio(precio, moneda),
  ]
    .filter(Boolean)
    .join(' — ')

/** Mensaje para consultar un producto desde su página de detalle. */
export function mensajeProducto(item) {
  return [
    '¡Hola! Quiero consultar por este producto de Kamae:',
    '',
    `• ${lineaItem(item)}`,
    urlProducto(item.slug),
  ].join('\n')
}

/** Mensaje para consultar varios productos (todos del mismo número de WhatsApp). */
export function mensajeLista(items) {
  const lineas = items.flatMap((item, i) => [
    `${i + 1}. ${lineaItem(item)}`,
    `   ${urlProducto(item.slug)}`,
  ])
  return ['¡Hola! Quiero consultar por estos productos de Kamae:', '', ...lineas].join(
    '\n',
  )
}

/**
 * Agrupa la lista de consulta por número de WhatsApp (un mensaje por vendedor).
 * Ítems viejos sin número usan el general; si tampoco hay, quedan con numero null.
 * @returns {{ numero: string|null, items: object[] }[]}
 */
export function agruparPorWhatsApp(items) {
  const grupos = new Map()
  for (const item of items) {
    const numero = item.whatsapp || WHATSAPP_GENERAL
    if (!grupos.has(numero)) grupos.set(numero, [])
    grupos.get(numero).push(item)
  }
  return [...grupos].map(([numero, itemsGrupo]) => ({ numero, items: itemsGrupo }))
}
