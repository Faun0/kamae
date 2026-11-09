// Operaciones del admin sobre `productos` (SDK completo). Las reglas validan el esquema:
// cada escritura debe mandar exactamente los campos del modelo (ver firestore.rules).
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { adminDb } from './admin.js'
import { invalidarCatalogo } from './productos.js'

const productosRef = collection(adminDb, 'productos')
const desdeDoc = (d) => ({ id: d.id, ...d.data() })

/** Tabla en tiempo real (incluye borradores). Devuelve la función para desuscribirse. */
export function suscribirProductos(onDatos, onError) {
  return onSnapshot(
    query(productosRef, orderBy('orden')),
    (snap) => onDatos(snap.docs.map(desdeDoc)),
    onError,
  )
}

export async function obtenerProducto(id) {
  const snap = await getDoc(doc(adminDb, 'productos', id))
  return snap.exists() ? desdeDoc(snap) : null
}

/** true si ningún otro producto usa ese slug. */
export async function slugDisponible(slug, idActual) {
  const snap = await getDocs(query(productosRef, where('slug', '==', slug), limit(2)))
  return snap.docs.every((d) => d.id === idActual)
}

/** Orden para un producto nuevo: al final de la lista. */
export async function siguienteOrden() {
  const snap = await getDocs(query(productosRef, orderBy('orden', 'desc'), limit(1)))
  return snap.empty ? 1 : (snap.docs[0].data().orden ?? 0) + 1
}

export async function crearProducto(datos) {
  const ref = await addDoc(productosRef, {
    ...datos,
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  })
  invalidarCatalogo()
  return ref.id
}

export async function actualizarProducto(id, cambios) {
  await updateDoc(doc(adminDb, 'productos', id), {
    ...cambios,
    fechaActualizacion: serverTimestamp(),
  })
  invalidarCatalogo()
}

export async function borrarProducto(id) {
  await deleteDoc(doc(adminDb, 'productos', id))
  invalidarCatalogo()
}
