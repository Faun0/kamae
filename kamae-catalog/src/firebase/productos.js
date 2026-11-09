// Lecturas del catálogo público. Toda query incluye `visible == true`: las reglas
// rechazan cualquier query que pueda devolver borradores.
import { collection, getDocs, limit, query, where } from 'firebase/firestore/lite'
import { db } from './db.js'

const productosRef = collection(db, 'productos')
const desdeDoc = (doc) => ({ id: doc.id, ...doc.data() })

// Destacados primero, después por `orden`.
const compararProductos = (a, b) =>
  Number(Boolean(b.destacado)) - Number(Boolean(a.destacado)) ||
  (a.orden ?? Infinity) - (b.orden ?? Infinity)

// El catálogo es chico: se trae completo una vez por sesión y se filtra en memoria
// (sin lecturas extra por filtro y sin índices compuestos).
let catalogoPromise = null

export function obtenerCatalogo() {
  catalogoPromise ??= getDocs(query(productosRef, where('visible', '==', true)))
    .then((snap) => snap.docs.map(desdeDoc).sort(compararProductos))
    .catch((error) => {
      catalogoPromise = null // permite reintentar
      throw error
    })
  return catalogoPromise
}

/** Descarta el catálogo en memoria (lo llama el admin después de escribir). */
export function invalidarCatalogo() {
  catalogoPromise = null
}

export async function obtenerProductoPorSlug(slug) {
  // Si el catálogo ya se cargó, no se gasta otra lectura.
  if (catalogoPromise) {
    const productos = await obtenerCatalogo()
    return productos.find((p) => p.slug === slug) ?? null
  }

  const snap = await getDocs(
    query(
      productosRef,
      where('visible', '==', true),
      where('slug', '==', slug),
      limit(1),
    ),
  )
  return snap.empty ? null : desdeDoc(snap.docs[0])
}
