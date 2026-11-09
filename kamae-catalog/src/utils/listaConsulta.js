// "Carrito sin pago": productos a consultar por WhatsApp en un solo mensaje.
// Store mínimo sobre localStorage para usar con useSyncExternalStore (ver hooks/useListaConsulta).
// Ítem: { id, slug, nombre, variante, precio, moneda, whatsapp, cantidad }
// (ítems viejos pueden no tener moneda → ARS, ni whatsapp → número general)

const CLAVE = 'kamae:lista-consulta'
const listeners = new Set()

function leer() {
  try {
    const valor = JSON.parse(localStorage.getItem(CLAVE))
    return Array.isArray(valor) ? valor : []
  } catch {
    return []
  }
}

let items = leer()

function guardar(nuevos) {
  items = nuevos
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items))
  } catch {
    // Sin storage (modo privado, cuota llena): la lista vive solo en memoria.
  }
  listeners.forEach((listener) => listener())
}

// Sincroniza entre pestañas abiertas.
window.addEventListener('storage', (event) => {
  if (event.key !== CLAVE) return
  items = leer()
  listeners.forEach((listener) => listener())
})

export const claveItem = (item) => `${item.id}::${item.variante ?? ''}`

export const listaConsulta = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => items,

  agregar(item) {
    const clave = claveItem(item)
    const existente = items.find((i) => claveItem(i) === clave)
    guardar(
      existente
        ? items.map((i) => (i === existente ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...items, { ...item, cantidad: 1 }],
    )
  },

  cambiarCantidad(clave, cantidad) {
    if (cantidad < 1) return listaConsulta.quitar(clave)
    guardar(items.map((i) => (claveItem(i) === clave ? { ...i, cantidad } : i)))
  },

  quitar(clave) {
    guardar(items.filter((i) => claveItem(i) !== clave))
  },

  vaciar() {
    guardar([])
  },
}
