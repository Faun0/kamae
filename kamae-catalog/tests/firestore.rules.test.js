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
  writeBatch,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const ADMIN = 'admin-test'
const VEND_A = 'vendedor-a' // aprobado y verificado: dueño de 'visible' y 'borrador'
const VEND_B = 'vendedor-b' // aprobado y verificado: dueño de 'ajeno' y 'ajeno-borrador'
const SIN_VERIFICAR = 'vendedor-sin-verificar' // aprobado pero sin verificar el email
const PENDIENTE = 'vendedor-pendiente'
const SUSPENDIDO = 'vendedor-suspendido'
const RECHAZADO = 'vendedor-rechazado'
const NUEVO = 'usuario-nuevo' // registrado en Auth, todavía sin perfil

let testEnv
const FECHA = Timestamp.fromDate(new Date('2026-01-01'))

const producto = (vendedorUid, cambios = {}) => ({
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
  imagenes: [{ url: 'https://example.com/a.webp', publicId: 'kamae/a', alt: '' }],
  whatsapp: '5493511234567',
  vendedorUid,
  fechaCreacion: serverTimestamp(),
  fechaActualizacion: serverTimestamp(),
  ...cambios,
})

const perfil = (estado, cambios = {}) => ({
  nombre: 'Vendedor',
  email: 'v@test.com',
  estado,
  emailVerificado: true,
  fechaSolicitud: FECHA,
  fechaActualizacion: FECHA,
  ...cambios,
})

// Alta de producto como la hace la app: producto + slug en el mismo batch.
function crear(db, id, datos, slug = datos.slug) {
  const batch = writeBatch(db)
  batch.set(doc(db, 'productos', id), datos)
  batch.set(doc(db, 'slugs', slug), { productoId: id, vendedorUid: datos.vendedorUid })
  return batch.commit()
}

// Contextos de cliente
const ctx = (uid, verificado = true, email = `${uid}@test.com`) =>
  testEnv.authenticatedContext(uid, { email, email_verified: verificado }).firestore()
const anonimo = () => testEnv.unauthenticatedContext().firestore()
const admin = () => ctx(ADMIN, false) // el admin no necesita email verificado
const vendA = () => ctx(VEND_A)

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
  await testEnv.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore()
    const base = (uid, cambios) =>
      producto(uid, { fechaCreacion: FECHA, fechaActualizacion: FECHA, ...cambios })
    await setDoc(doc(db, 'admins', ADMIN), {})
    await setDoc(doc(db, 'usuarios', VEND_A), perfil('aprobado'))
    await setDoc(doc(db, 'usuarios', VEND_B), perfil('aprobado'))
    await setDoc(doc(db, 'usuarios', SIN_VERIFICAR), perfil('aprobado', { emailVerificado: false }))
    await setDoc(doc(db, 'usuarios', PENDIENTE), perfil('pendiente'))
    await setDoc(doc(db, 'usuarios', SUSPENDIDO), perfil('suspendido'))
    await setDoc(doc(db, 'usuarios', RECHAZADO), perfil('rechazado'))
    const productos = {
      visible: base(VEND_A, { slug: 'visible' }),
      borrador: base(VEND_A, { slug: 'borrador', visible: false }),
      ajeno: base(VEND_B, { slug: 'ajeno' }),
      'ajeno-borrador': base(VEND_B, { slug: 'ajeno-borrador', visible: false }),
    }
    for (const [id, datos] of Object.entries(productos)) {
      await setDoc(doc(db, 'productos', id), datos)
      await setDoc(doc(db, 'slugs', datos.slug), { productoId: id, vendedorUid: datos.vendedorUid })
    }
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
    await assertSucceeds(getDocs(query(collection(anonimo(), 'productos'), where('visible', '==', true))))
  })

  it('un anónimo NO lista la colección sin filtrar', async () => {
    await assertFails(getDocs(collection(anonimo(), 'productos')))
  })

  it('un usuario logueado sin rol NO lee borradores ajenos', async () => {
    await assertFails(getDoc(doc(ctx(NUEVO), 'productos', 'borrador')))
    await assertFails(getDocs(collection(ctx(NUEVO), 'productos')))
  })
})

describe('vendedor aprobado', () => {
  it('crea un producto propio (producto + slug en el mismo batch)', async () => {
    await assertSucceeds(crear(vendA(), 'nuevo', producto(VEND_A, { slug: 'nuevo' })))
  })

  it('NO crea un producto sin registrar el slug', async () => {
    await assertFails(setDoc(doc(vendA(), 'productos', 'nuevo'), producto(VEND_A, { slug: 'nuevo' })))
  })

  it('NO crea un producto a nombre de otro vendedor', async () => {
    await assertFails(crear(vendA(), 'nuevo', producto(VEND_B, { slug: 'nuevo' })))
  })

  it('NO reutiliza un slug existente (aunque sea un borrador ajeno)', async () => {
    await assertFails(crear(vendA(), 'nuevo', producto(VEND_A, { slug: 'ajeno-borrador' })))
  })

  it('NO registra un slug que no coincide con el del producto', async () => {
    await assertFails(crear(vendA(), 'nuevo', producto(VEND_A, { slug: 'nuevo' }), 'otro-slug'))
  })

  it('lista sus productos (incluidos borradores) filtrando por vendedorUid', async () => {
    const q = query(collection(vendA(), 'productos'), where('vendedorUid', '==', VEND_A))
    await assertSucceeds(getDocs(q))
    await assertSucceeds(getDoc(doc(vendA(), 'productos', 'borrador')))
  })

  it('NO lee borradores ajenos ni lista toda la colección', async () => {
    await assertFails(getDoc(doc(vendA(), 'productos', 'ajeno-borrador')))
    await assertFails(getDocs(collection(vendA(), 'productos')))
    await assertFails(getDocs(query(collection(vendA(), 'productos'), where('vendedorUid', '==', VEND_B))))
  })

  it('consulta si un slug está tomado (get) pero no lista slugs', async () => {
    await assertSucceeds(getDoc(doc(vendA(), 'slugs', 'ajeno-borrador')))
    await assertFails(getDocs(collection(vendA(), 'slugs')))
  })

  it('edita y borra SUS productos (con su slug)', async () => {
    const db = vendA()
    await assertSucceeds(
      updateDoc(doc(db, 'productos', 'visible'), { precio: 1, fechaActualizacion: serverTimestamp() }),
    )
    const batch = writeBatch(db)
    batch.delete(doc(db, 'productos', 'borrador'))
    batch.delete(doc(db, 'slugs', 'borrador'))
    await assertSucceeds(batch.commit())
  })

  it('NO edita ni borra productos ajenos (ni sus slugs)', async () => {
    await assertFails(
      updateDoc(doc(vendA(), 'productos', 'ajeno'), { precio: 1, fechaActualizacion: serverTimestamp() }),
    )
    await assertFails(deleteDoc(doc(vendA(), 'productos', 'ajeno')))
    await assertFails(deleteDoc(doc(vendA(), 'slugs', 'ajeno')))
  })

  it('NO cambia el dueño ni el slug de su producto', async () => {
    const ref = doc(vendA(), 'productos', 'visible')
    await assertFails(updateDoc(ref, { vendedorUid: VEND_B, fechaActualizacion: serverTimestamp() }))
    await assertFails(updateDoc(ref, { slug: 'otro', fechaActualizacion: serverTimestamp() }))
  })
})

describe('usuarios sin permiso para publicar', () => {
  const casos = {
    'sin email verificado (aunque esté aprobado)': () => ctx(SIN_VERIFICAR, false),
    pendiente: () => ctx(PENDIENTE),
    suspendido: () => ctx(SUSPENDIDO),
    rechazado: () => ctx(RECHAZADO),
    'logueado sin perfil': () => ctx(NUEVO),
    anónimo: anonimo,
  }

  for (const [caso, db] of Object.entries(casos)) {
    it(`${caso}: NO crea, edita ni borra`, async () => {
      const uid = caso === 'anónimo' ? 'x' : undefined
      await assertFails(crear(db(), 'nuevo', producto(uid ?? 'x', { slug: 'nuevo' })))
      await assertFails(
        updateDoc(doc(db(), 'productos', 'visible'), { precio: 1, fechaActualizacion: serverTimestamp() }),
      )
      await assertFails(deleteDoc(doc(db(), 'productos', 'visible')))
    })
  }

  it('un suspendido NO crea productos aunque los ponga a su nombre', async () => {
    await assertFails(crear(ctx(SUSPENDIDO), 'nuevo', producto(SUSPENDIDO, { slug: 'nuevo' })))
  })
})

describe('registro de vendedores (usuarios/{uid})', () => {
  const solicitud = (cambios = {}) => ({
    nombre: 'Nuevo Vendedor',
    email: `${NUEVO}@test.com`,
    estado: 'pendiente',
    emailVerificado: false,
    fechaSolicitud: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
    ...cambios,
  })
  const nuevo = () => ctx(NUEVO, false)

  it('un usuario nuevo crea su perfil como pendiente', async () => {
    await assertSucceeds(setDoc(doc(nuevo(), 'usuarios', NUEVO), solicitud()))
  })

  const invalidas = {
    'ya aprobado': { estado: 'aprobado' },
    'con otro email': { email: 'otro@test.com' },
    'diciendo que verificó el email sin haberlo hecho': { emailVerificado: true },
    'sin nombre': { nombre: '' },
    'con campos extra': { rol: 'admin' },
  }
  for (const [caso, cambios] of Object.entries(invalidas)) {
    it(`NO crea su perfil ${caso}`, async () => {
      await assertFails(setDoc(doc(nuevo(), 'usuarios', NUEVO), solicitud(cambios)))
    })
  }

  it('NO crea el perfil de otro usuario', async () => {
    await assertFails(setDoc(doc(nuevo(), 'usuarios', 'otro-uid'), solicitud()))
  })

  it('NO se aprueba a sí mismo', async () => {
    await assertFails(
      updateDoc(doc(ctx(PENDIENTE), 'usuarios', PENDIENTE), {
        estado: 'aprobado',
        fechaActualizacion: serverTimestamp(),
      }),
    )
  })

  it('actualiza emailVerificado solo con el valor real de su token', async () => {
    const ref = (db) => doc(db, 'usuarios', SIN_VERIFICAR)
    // Sigue sin verificar → no puede poner true
    await assertFails(
      updateDoc(ref(ctx(SIN_VERIFICAR, false)), { emailVerificado: true, fechaActualizacion: serverTimestamp() }),
    )
    // Ya verificó (token con email_verified) → puede poner true
    await assertSucceeds(
      updateDoc(ref(ctx(SIN_VERIFICAR, true)), { emailVerificado: true, fechaActualizacion: serverTimestamp() }),
    )
  })

  it('lee solo su propio perfil y no lista', async () => {
    await assertSucceeds(getDoc(doc(vendA(), 'usuarios', VEND_A)))
    await assertFails(getDoc(doc(vendA(), 'usuarios', VEND_B)))
    await assertFails(getDocs(collection(vendA(), 'usuarios')))
    await assertFails(getDoc(doc(anonimo(), 'usuarios', VEND_A)))
  })

  it('NO borra su perfil', async () => {
    await assertFails(deleteDoc(doc(vendA(), 'usuarios', VEND_A)))
  })
})

describe('admin', () => {
  it('lee borradores de cualquiera y lista toda la colección', async () => {
    await assertSucceeds(getDoc(doc(admin(), 'productos', 'ajeno-borrador')))
    await assertSucceeds(getDocs(collection(admin(), 'productos')))
  })

  it('crea un producto propio', async () => {
    await assertSucceeds(crear(admin(), 'nuevo', producto(ADMIN, { slug: 'nuevo' })))
  })

  it('edita y borra productos de cualquier vendedor (con su slug)', async () => {
    const db = admin()
    await assertSucceeds(
      updateDoc(doc(db, 'productos', 'ajeno'), { precio: 60000, fechaActualizacion: serverTimestamp() }),
    )
    const batch = writeBatch(db)
    batch.delete(doc(db, 'productos', 'ajeno'))
    batch.delete(doc(db, 'slugs', 'ajeno'))
    await assertSucceeds(batch.commit())
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

  it('lista usuarios y cambia su estado (aprobar, suspender, rechazar)', async () => {
    await assertSucceeds(getDocs(collection(admin(), 'usuarios')))
    for (const estado of ['aprobado', 'suspendido', 'rechazado', 'pendiente']) {
      await assertSucceeds(
        updateDoc(doc(admin(), 'usuarios', PENDIENTE), { estado, fechaActualizacion: serverTimestamp() }),
      )
    }
  })

  it('NO pone un estado inválido ni cambia nombre o email', async () => {
    const ref = doc(admin(), 'usuarios', PENDIENTE)
    await assertFails(updateDoc(ref, { estado: 'admin', fechaActualizacion: serverTimestamp() }))
    await assertFails(updateDoc(ref, { nombre: 'Otro', fechaActualizacion: serverTimestamp() }))
    await assertFails(updateDoc(ref, { email: 'x@test.com', fechaActualizacion: serverTimestamp() }))
  })

  it('elimina el perfil de un vendedor', async () => {
    await assertSucceeds(deleteDoc(doc(admin(), 'usuarios', SUSPENDIDO)))
  })
})

describe('validación del esquema (aun siendo admin)', () => {
  const nuevoAdmin = (cambios) => crear(admin(), 'nuevo', producto(ADMIN, { slug: 'nuevo', ...cambios }))

  const invalidos = {
    'categoría inexistente': { categoria: 'armas' },
    'precio negativo': { precio: -1 },
    'precio como texto': { precio: '50000' },
    'moneda no soportada': { moneda: 'EUR' },
    'disponibilidad inválida': { disponibilidad: 'quizas' },
    'disciplina inválida': { disciplina: ['kendo', 'judo'] },
    'nombre vacío (incluso en borrador)': { nombre: '', visible: false },
    'whatsapp sin 549': { whatsapp: '3511234567' },
    'whatsapp con +': { whatsapp: '+5493511234567' },
    'whatsapp con dígitos de menos': { whatsapp: '549351123456' },
    'whatsapp numérico en vez de texto': { whatsapp: 5493511234567 },
    'campos eliminados del modelo (destacado)': { destacado: true },
    'campos eliminados del modelo (orden)': { orden: 1 },
    'visible no booleano': { visible: 'si' },
    'campo extra': { stock: 10 },
    'fecha del cliente en vez de serverTimestamp': { fechaCreacion: Timestamp.fromDate(new Date('2020-01-01')) },
    'más de 10 imágenes': {
      imagenes: Array.from({ length: 11 }, (_, i) => ({ url: `u${i}`, publicId: `p${i}`, alt: '' })),
    },
  }

  for (const [caso, cambios] of Object.entries(invalidos)) {
    it(`rechaza: ${caso}`, async () => {
      await assertFails(nuevoAdmin(cambios))
    })
  }

  it('rechaza: slug con mayúsculas/espacios', async () => {
    await assertFails(crear(admin(), 'nuevo', producto(ADMIN, { slug: 'Shinai de Prueba' })))
  })

  it('acepta precios en USD', async () => {
    await assertSucceeds(nuevoAdmin({ moneda: 'USD', precio: 120 }))
  })

  const incompletos = {
    'sin descripción': { descripcion: '' },
    'sin disciplina': { disciplina: [] },
    'sin categoría': { categoria: '' },
    'sin precio': { precio: null },
    'sin imágenes': { imagenes: [] },
    'sin WhatsApp': { whatsapp: '' },
  }

  for (const [caso, cambios] of Object.entries(incompletos)) {
    it(`no publica un producto incompleto (${caso})`, async () => {
      await assertFails(nuevoAdmin(cambios))
    })
  }

  it('acepta un borrador con datos incompletos', async () => {
    await assertSucceeds(
      nuevoAdmin({
        visible: false,
        descripcion: '',
        disciplina: [],
        categoria: '',
        precio: null,
        imagenes: [],
        whatsapp: '',
      }),
    )
  })

  it('no permite publicar un borrador incompleto editando solo `visible`', async () => {
    await testEnv.withSecurityRulesDisabled(async (c) => {
      await setDoc(
        doc(c.firestore(), 'productos', 'incompleto'),
        producto(VEND_A, { slug: 'incompleto', visible: false, categoria: '', fechaCreacion: FECHA, fechaActualizacion: FECHA }),
      )
    })
    await assertFails(
      updateDoc(doc(admin(), 'productos', 'incompleto'), { visible: true, fechaActualizacion: serverTimestamp() }),
    )
  })

  it('rechaza un producto al que le falta un campo (vendedorUid)', async () => {
    const { vendedorUid, ...sinDueno } = producto(ADMIN, { slug: 'nuevo' })
    void vendedorUid
    const db = admin()
    const batch = writeBatch(db)
    batch.set(doc(db, 'productos', 'nuevo'), sinDueno)
    batch.set(doc(db, 'slugs', 'nuevo'), { productoId: 'nuevo', vendedorUid: ADMIN })
    await assertFails(batch.commit())
  })
})

describe('colección admins', () => {
  it('cada usuario lee solo su propio documento', async () => {
    await assertSucceeds(getDoc(doc(admin(), 'admins', ADMIN)))
    await assertSucceeds(getDoc(doc(vendA(), 'admins', VEND_A)))
    await assertFails(getDoc(doc(vendA(), 'admins', ADMIN)))
    await assertFails(getDoc(doc(anonimo(), 'admins', ADMIN)))
  })

  it('nadie lista ni escribe admins desde el cliente (ni siquiera un admin)', async () => {
    await assertFails(getDocs(collection(admin(), 'admins')))
    await assertFails(setDoc(doc(vendA(), 'admins', VEND_A), {}))
    await assertFails(setDoc(doc(admin(), 'admins', 'otro'), {}))
    await assertFails(deleteDoc(doc(admin(), 'admins', ADMIN)))
  })
})

describe('otras colecciones', () => {
  it('cerradas por defecto', async () => {
    await assertFails(getDoc(doc(admin(), 'pedidos', 'x')))
    await assertFails(setDoc(doc(admin(), 'pedidos', 'x'), { a: 1 }))
  })
})
