// Gestión de vendedores desde el panel del admin (las reglas solo se lo permiten al admin).
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { adminDb } from './admin.js'
import { borrarProductosDeVendedor } from './productosAdmin.js'

/** Perfiles de vendedores en tiempo real, del más reciente al más viejo. */
export function suscribirUsuarios(onDatos, onError) {
  return onSnapshot(
    query(collection(adminDb, 'usuarios'), orderBy('fechaSolicitud', 'desc')),
    (snap) => onDatos(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
    onError,
  )
}

const cambiarEstado = (uid, estado) =>
  updateDoc(doc(adminDb, 'usuarios', uid), { estado, fechaActualizacion: serverTimestamp() })

export const aprobarUsuario = (uid) => cambiarEstado(uid, 'aprobado')
export const rechazarUsuario = (uid) => cambiarEstado(uid, 'rechazado')

/**
 * Suspende al vendedor y borra todos sus productos. Primero cambia el estado, así las
 * reglas le impiden publicar algo nuevo mientras se borra lo existente.
 */
export async function suspenderUsuario(uid) {
  await cambiarEstado(uid, 'suspendido')
  return borrarProductosDeVendedor(uid)
}

/**
 * Elimina el perfil del vendedor y todos sus productos. Su cuenta de acceso (Firebase Auth)
 * no se puede borrar desde la web: podría volver a pedir acceso, y quedaría pendiente.
 */
export async function eliminarUsuario(uid) {
  await cambiarEstado(uid, 'suspendido')
  const borrados = await borrarProductosDeVendedor(uid)
  await deleteDoc(doc(adminDb, 'usuarios', uid))
  return borrados
}
