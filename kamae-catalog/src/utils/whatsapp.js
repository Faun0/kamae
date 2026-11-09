import { formatearPrecio } from './formato.js'

const NUMERO = import.meta.env.VITE_WHATSAPP

export const linkWhatsApp = (mensaje) =>
  `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`

export const urlProducto = (slug) => `${window.location.origin}/producto/${slug}`

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

/** Mensaje para consultar todos los productos de la lista de consulta. */
export function mensajeLista(items) {
  const lineas = items.flatMap((item, i) => [
    `${i + 1}. ${lineaItem(item)}`,
    `   ${urlProducto(item.slug)}`,
  ])
  return ['¡Hola! Quiero consultar por estos productos de Kamae:', '', ...lineas].join(
    '\n',
  )
}
