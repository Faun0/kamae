// Tests de las reglas de Firestore contra el emulador.
// `npm run test:rules` levanta un emulador aislado; si ya tenés `npm run emulators`
// corriendo, usá `npx vitest run` (usa otro projectId, no toca los datos del seed).
import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const ADMIN_UID = 'admin-test'
let testEnv

const productoValido = (cambios = {}) => ({
  nombre: 'Shinai de prueba',
  slug: 'shinai-de-prueba',
  descripcion: 'Descripción',
  disciplina: ['kendo'],
  categoria: 'shinai',
  precio: 50000,
  moneda: 'ARS',
  disponibilidad: 'disponible',
  tiempoProduccion: '',
  variantes: [{ etiqueta: '3.8', disponible: true }],
  visible: true,
  destacado: false,
  orden: 1,
  imagenes: [],
  fechaCreacion: serverTimestamp(),
  fechaActualizacion: serverTimestamp(),
  ...cambios,
})

// Contextos de cliente
const anonimo = () => testEnv.unauthenticatedContext().firestore()
const usuario = () => testEnv.authenticatedContext('usuario-cualquiera').firestore()
const admin = () => testEnv.authenticatedContext(ADMIN_UID).firestore()

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-kamae-rules-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

afterAll(() => testEnv?.cleanup())

beforeEach(async () => {
  await testEnv.clearFirestore()
  // Datos base cargados sin reglas: un admin, un producto visible y un borrador.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    const fecha = Timestamp.fromDate(new Date('2026-01-01'))
    const base = productoValido({ fechaCreacion: fecha, fechaActualizacion: fecha })
    await setDoc(doc(db, 'admins', ADMIN_UID), {})
    await setDoc(doc(db, 'productos', 'visible'), base)
    await setDoc(doc(db, 'productos', 'borrador'), { ...base, slug: 'borrador', visible: false })
  })
})

describe('lectura pública de productos', () => {
  it('un anónimo lee un producto visible', async () => {
    await assertSucceeds(getDoc(doc(anonimo(), 'productos', 'visible')))
  })

  it('un anónimo NO lee un borrador', async () => {
    await assertFails(getDoc(doc(anonimo(), 'productos', 'borrador')))
  })

  it('un anónimo lista productos filtrando visible == true', async () => {
    const q = query(collection(anonimo(), 'productos'), where('visible', '==', true))
    await assertSucceeds(getDocs(q))
  })

  it('un anónimo NO lista la colección sin filtrar', async () => {
    await assertFails(getDocs(collection(anonimo(), 'productos')))
  })

  it('un usuario logueado que no es admin NO lee borradores', async () => {
    await assertFails(getDoc(doc(usuario(), 'productos', 'borrador')))
    await assertFails(getDocs(collection(usuario(), 'productos')))
  })
})

describe('escritura de productos sin ser admin', () => {
  for (const [quien, db] of [
    ['anónimo', anonimo],
    ['usuario logueado', usuario],
  ]) {
    it(`un ${quien} NO crea, edita ni borra`, async () => {
      await assertFails(setDoc(doc(db(), 'productos', 'nuevo'), productoValido()))
      await assertFails(
        updateDoc(doc(db(), 'productos', 'visible'), {
          precio: 1,
          fechaActualizacion: serverTimestamp(),
        }),
      )
      await assertFails(deleteDoc(doc(db(), 'productos', 'visible')))
    })
  }
})

describe('admin', () => {
  it('lee borradores y lista toda la colección', async () => {
    await assertSucceeds(getDoc(doc(admin(), 'productos', 'borrador')))
    await assertSucceeds(getDocs(collection(admin(), 'productos')))
  })

  it('crea un producto válido', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'productos', 'nuevo'), productoValido()))
  })

  it('edita un producto actualizando fechaActualizacion', async () => {
    await assertSucceeds(
      updateDoc(doc(admin(), 'productos', 'visible'), {
        precio: 60000,
        fechaActualizacion: serverTimestamp(),
      }),
    )
  })

  it('borra un producto', async () => {
    await assertSucceeds(deleteDoc(doc(admin(), 'productos', 'visible')))
  })

  it('NO edita sin actualizar fechaActualizacion', async () => {
    await assertFails(updateDoc(doc(admin(), 'productos', 'visible'), { precio: 1 }))
  })

  it('NO modifica fechaCreacion', async () => {
    await assertFails(
      updateDoc(doc(admin(), 'productos', 'visible'), {
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      }),
    )
  })
})

describe('validación del esquema (aun siendo admin)', () => {
  const invalidos = {
    'categoría inexistente': { categoria: 'armas' },
    'precio negativo': { precio: -1 },
    'precio como texto': { precio: '50000' },
    'moneda distinta de ARS': { moneda: 'USD' },
    'disponibilidad inválida': { disponibilidad: 'quizas' },
    'disciplina inválida': { disciplina: ['kendo', 'judo'] },
    'sin disciplina': { disciplina: [] },
    'nombre vacío': { nombre: '' },
    'slug con mayúsculas/espacios': { slug: 'Shinai de Prueba' },
    'visible no booleano': { visible: 'si' },
    'campo extra': { stock: 10 },
    'fecha del cliente en vez de serverTimestamp': {
      fechaCreacion: Timestamp.fromDate(new Date('2020-01-01')),
    },
    'más de 10 imágenes': {
      imagenes: Array.from({ length: 11 }, (_, i) => ({ url: `u${i}`, publicId: `p${i}`, alt: '' })),
    },
  }

  for (const [caso, cambios] of Object.entries(invalidos)) {
    it(`rechaza: ${caso}`, async () => {
      await assertFails(setDoc(doc(admin(), 'productos', 'nuevo'), productoValido(cambios)))
    })
  }

  it('rechaza un producto al que le falta un campo', async () => {
    const { descripcion, ...sinDescripcion } = productoValido()
    void descripcion
    await assertFails(setDoc(doc(admin(), 'productos', 'nuevo'), sinDescripcion))
  })
})

describe('colección admins', () => {
  it('cada usuario lee solo su propio documento', async () => {
    await assertSucceeds(getDoc(doc(admin(), 'admins', ADMIN_UID)))
    // Un no-admin puede consultar su doc (no existe → sabe que no es admin).
    await assertSucceeds(getDoc(doc(usuario(), 'admins', 'usuario-cualquiera')))
    await assertFails(getDoc(doc(usuario(), 'admins', ADMIN_UID)))
    await assertFails(getDoc(doc(anonimo(), 'admins', ADMIN_UID)))
  })

  it('nadie lista ni escribe admins desde el cliente (ni siquiera un admin)', async () => {
    await assertFails(getDocs(collection(admin(), 'admins')))
    await assertFails(setDoc(doc(usuario(), 'admins', 'usuario-cualquiera'), {}))
    await assertFails(setDoc(doc(admin(), 'admins', 'otro'), {}))
    await assertFails(deleteDoc(doc(admin(), 'admins', ADMIN_UID)))
  })
})

describe('otras colecciones', () => {
  it('cerradas por defecto', async () => {
    await assertFails(getDoc(doc(admin(), 'pedidos', 'x')))
    await assertFails(setDoc(doc(admin(), 'pedidos', 'x'), { a: 1 }))
  })
})
