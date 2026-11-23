// Perfil PÚBLICO de quien publica ({ nombre, ciudad }) desde el panel.
// Las reglas: cada uno escribe el suyo; un vendedor solo puede usar el nombre con el que
// el admin lo aprobó (el de /usuarios); el admin elige el suyo.
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { adminDb } from './admin.js'
import { invalidarCatalogo } from './productos.js'

export async function obtenerPerfilPublico(uid) {
  const snap = await getDoc(doc(adminDb, 'vendedores', uid))
  return snap.exists() ? snap.data() : null
}

export async function guardarPerfilPublico(uid, { nombre, ciudad }) {
  await setDoc(doc(adminDb, 'vendedores', uid), {
    nombre: nombre.trim(),
    ciudad: ciudad.trim(),
  })
  invalidarCatalogo() // el nombre/ciudad aparece en tarjetas y detalle
}

/** Solo admin (al suspender o eliminar un vendedor). */
export const borrarPerfilPublico = (uid) => deleteDoc(doc(adminDb, 'vendedores', uid))
