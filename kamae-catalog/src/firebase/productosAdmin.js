// Operaciones del panel sobre `productos` (SDK completo). Las reglas validan el esquema:
// cada escritura debe mandar exactamente los campos del modelo (ver firestore.rules).
// Cada producto tiene dueño (`vendedorUid`) y su slug registrado en /slugs/{slug}.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { adminDb } from './admin.js'
import { invalidarCatalogo } from './productos.js'

const productosRef = collection(adminDb, 'productos')
const desdeDoc = (d) => ({ id: d.id, ...d.data() })
const masNuevoPrimero = (a, b) =>
  (b.fechaCreacion?.toMillis?.() ?? Infinity) - (a.fechaCreacion?.toMillis?.() ?? Infinity)

/**
 * Productos en tiempo real (incluye borradores). Devuelve la función para desuscribirse.
 * Con `vendedorUid`: solo los de ese vendedor (lo único que las reglas le dejan listar).
 * Ese caso se ordena en el cliente para no necesitar un índice compuesto.
 */
export function suscribirProductos(onDatos, onError, { vendedorUid } = {}) {
  const q = vendedorUid
    ? query(productosRef, where('vendedorUid', '==', vendedorUid))
    : query(productosRef, orderBy('fechaCreacion', 'desc'))
  return onSnapshot(
    q,
    (snap) => onDatos(snap.docs.map(desdeDoc).sort(masNuevoPrimero)),
    onError,
  )
}

export async function obtenerProducto(id) {
  const snap = await getDoc(doc(adminDb, 'productos', id))
  return snap.exists() ? desdeDoc(snap) : null
}

const slugLibre = async (slug) => !(await getDoc(doc(adminDb, 'slugs', slug))).exists()

/** Slug libre a partir de una base: "tenugui", "tenugui-2", "tenugui-3"… */
export async function slugUnico(base) {
  for (let n = 1; n <= 100; n++) {
    const sufijo = n === 1 ? '' : `-${n}`
    const candidato = base.slice(0, 100 - sufijo.length).replace(/-+$/, '') + sufijo
    if (await slugLibre(candidato)) return candidato
  }
  throw new Error('No se encontró un slug libre para este nombre.')
}

/**
 * Alta: producto + registro del slug en el mismo batch. Si otro se quedó con el slug
 * en el medio, las reglas rechazan el batch completo (no quedan URLs repetidas).
 */
export async function crearProducto(datos, vendedorUid) {
  const ref = doc(productosRef)
  const batch = writeBatch(adminDb)
  batch.set(ref, {
    ...datos,
    vendedorUid,
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  })
  batch.set(doc(adminDb, 'slugs', datos.slug), { productoId: ref.id, vendedorUid })
  await batch.commit()
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

/** Borra el producto y libera su slug. */
export async function borrarProducto(producto) {
  const batch = writeBatch(adminDb)
  batch.delete(doc(adminDb, 'productos', producto.id))
  batch.delete(doc(adminDb, 'slugs', producto.slug))
  await batch.commit()
  invalidarCatalogo()
}

/**
 * Borra TODOS los productos de un vendedor (al suspenderlo o eliminarlo). Solo admin.
 * Las imágenes quedan huérfanas en Cloudinary (ver CLAUDE.md).
 * @returns {Promise<number>} cantidad de productos borrados
 */
export async function borrarProductosDeVendedor(vendedorUid) {
  const snap = await getDocs(query(productosRef, where('vendedorUid', '==', vendedorUid)))
  const productos = snap.docs.map(desdeDoc)
  // 2 operaciones por producto; los batches admiten hasta 500.
  for (let i = 0; i < productos.length; i += 200) {
    const batch = writeBatch(adminDb)
    for (const p of productos.slice(i, i + 200)) {
      batch.delete(doc(adminDb, 'productos', p.id))
      batch.delete(doc(adminDb, 'slugs', p.slug))
    }
    await batch.commit()
  }
  if (productos.length) invalidarCatalogo()
  return productos.length
}
