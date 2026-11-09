const formatoARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const formatearPrecio = (valor) => formatoARS.format(valor ?? 0)

/** Precio efectivo: el de la variante si lo define, si no el del producto. */
export const precioDe = (producto, variante) => variante?.precio ?? producto.precio

/** Menor y mayor precio considerando variantes (para "Desde $X" en la grilla). */
export function rangoPrecio(producto) {
  const precios = [
    producto.precio,
    ...(producto.variantes ?? []).map((v) => v.precio),
  ].filter(Number.isFinite)
  return { min: Math.min(...precios), max: Math.max(...precios) }
}
