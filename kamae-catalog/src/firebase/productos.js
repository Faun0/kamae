// Lecturas del catálogo público. Toda query incluye `visible == true`: las reglas
// rechazan cualquier query que pueda devolver borradores.
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore/lite'
import { db } from './db.js'

const productosRef = collection(db, 'productos')
const desdeDoc = (d) => ({ id: d.id, ...d.data() })

// Más nuevos primero (no hay orden manual: con varios admins se pisarían).
const compararProductos = (a, b) =>
  (b.fechaCreacion?.toMillis?.() ?? 0) - (a.fechaCreacion?.toMillis?.() ?? 0)

// Perfiles públicos de quienes publican ({ nombre, ciudad }), indexados por uid.
// Si la lectura falla, el catálogo se muestra igual, sin el dato del vendedor.
let vendedoresPromise = null

function obtenerVendedores() {
  vendedoresPromise ??= getDocs(collection(db, 'vendedores'))
    .then((snap) => Object.fromEntries(snap.docs.map((d) => [d.id, d.data()])))
    .catch(() => {
      vendedoresPromise = null
      return {}
    })
  return vendedoresPromise
}

const conVendedor = (producto, vendedores) => ({
  ...producto,
  vendedor: vendedores[producto.vendedorUid] ?? null,
})

// El catálogo es chico: se trae completo una vez por sesión y se filtra en memoria
// (sin lecturas extra por filtro y sin índices compuestos).
let catalogoPromise = null

export function obtenerCatalogo() {
  catalogoPromise ??= Promise.all([
    getDocs(query(productosRef, where('visible', '==', true))),
    obtenerVendedores(),
  ])
    .then(([snap, vendedores]) =>
      snap.docs.map((d) => conVendedor(desdeDoc(d), vendedores)).sort(compararProductos),
    )
    .catch((error) => {
      catalogoPromise = null // permite reintentar
      throw error
    })
  return catalogoPromise
}

/** Descarta el catálogo en memoria (lo llama el panel después de escribir). */
export function invalidarCatalogo() {
  catalogoPromise = null
  vendedoresPromise = null
}

export async function obtenerProductoPorSlug(slug) {
  // Si el catálogo ya se cargó, no se gasta otra lectura.
  if (catalogoPromise) {
    const productos = await obtenerCatalogo()
    return productos.find((p) => p.slug === slug) ?? null
  }

  const snap = await getDocs(
    query(productosRef, where('visible', '==', true), where('slug', '==', slug), limit(1)),
  )
  if (snap.empty) return null
  const producto = desdeDoc(snap.docs[0])
  const vendedor = await getDoc(doc(db, 'vendedores', producto.vendedorUid))
    .then((d) => (d.exists() ? d.data() : null))
    .catch(() => null)
  return { ...producto, vendedor }
}
