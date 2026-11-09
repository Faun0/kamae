const formatos = {}

/** 65000 → "$ 65.000" · 380 → "US$ 380" · 12.5 → "US$ 12,50" (decimales solo si los hay). */
export function formatearPrecio(valor, moneda = 'ARS') {
  const numero = valor ?? 0
  const decimales = moneda === 'ARS' || Number.isInteger(numero) ? 0 : 2
  const clave = `${moneda}:${decimales}`
  formatos[clave] ??= new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
  return formatos[clave].format(numero)
}

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

/** Suma por moneda: [{ moneda: 'ARS', total }, { moneda: 'USD', total }] (sin mezclar). */
export function totalesPorMoneda(items) {
  const totales = {}
  for (const item of items) {
    const moneda = item.moneda ?? 'ARS'
    totales[moneda] = (totales[moneda] ?? 0) + item.precio * item.cantidad
  }
  return Object.entries(totales).map(([moneda, total]) => ({ moneda, total }))
}
