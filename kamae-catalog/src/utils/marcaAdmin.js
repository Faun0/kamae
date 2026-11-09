// Marca liviana "este navegador tiene una sesión de admin" para el header público.
// Evita cargar Firebase Auth (~160 kB) en el catálogo solo para mostrar el link "Panel".
// Es SOLO UX: la escribe firebase/sesion.js y la seguridad real está en firestore.rules.
// Si quedara desactualizada, /admin igual verifica la sesión y redirige a /login.

const CLAVE = 'kamae:admin'
const listeners = new Set()

function leer() {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

let valor = leer()

function emitir() {
  listeners.forEach((listener) => listener())
}

window.addEventListener('storage', (event) => {
  if (event.key !== CLAVE) return
  valor = leer()
  emitir()
})

export const marcaAdmin = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => valor,

  set(esAdmin) {
    if (esAdmin === valor) return
    valor = esAdmin
    try {
      if (esAdmin) localStorage.setItem(CLAVE, '1')
      else localStorage.removeItem(CLAVE)
    } catch {
      // Sin storage: el link vive solo en esta pestaña.
    }
    emitir()
  },
}
