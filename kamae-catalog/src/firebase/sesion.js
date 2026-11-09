// Estado de sesión del admin (store para useSyncExternalStore, ver hooks/useSesion.js).
// Solo se importa desde páginas lazy de /login y /admin.
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { adminDb, auth } from './admin.js'
import { marcaAdmin } from '../utils/marcaAdmin.js'

let estado = { cargando: true, usuario: null, esAdmin: false }
const listeners = new Set()

function emitir(nuevo) {
  estado = nuevo
  // Mantiene sincronizado el link "Panel" del header público.
  if (!nuevo.cargando) marcaAdmin.set(nuevo.esAdmin)
  listeners.forEach((listener) => listener())
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return emitir({ cargando: false, usuario: null, esAdmin: false })

  emitir({ cargando: true, usuario, esAdmin: false })
  // Las reglas permiten leer solo el propio doc de /admins: si existe, es admin.
  const esAdmin = await getDoc(doc(adminDb, 'admins', usuario.uid))
    .then((snap) => snap.exists())
    .catch(() => false)
  // Si mientras tanto cambió el usuario, descartar este resultado.
  if (auth.currentUser?.uid === usuario.uid) emitir({ cargando: false, usuario, esAdmin })
})

export const sesion = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => estado,
}

export const iniciarSesion = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const cerrarSesion = () => signOut(auth)
