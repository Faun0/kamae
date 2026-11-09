// Carga datos de prueba en el Emulator Suite (nunca en producción).
// Uso: con `npm run emulators` corriendo, en otra terminal `npm run seed`.
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const PROJECT_ID = 'demo-kamae'

// Fijar los hosts del emulador ANTES de inicializar: así el Admin SDK no puede salir a producción.
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
// Evita que el SDK busque credenciales en el servidor de metadata de GCP (no aplica en local).
process.env.METADATA_SERVER_DETECTION = 'none'

initializeApp({ projectId: PROJECT_ID })
const db = getFirestore()
const auth = getAuth()

const ADMIN = {
  uid: 'admin-dev',
  email: 'admin@kamae.test',
  password: 'kamae123',
  displayName: 'Admin Kamae',
}

// Vendedores de prueba (perfil en /usuarios). El aprobado ya verificó su email.
const VENDEDORES = [
  {
    uid: 'vendedor-dev',
    email: 'vendedor@kamae.test',
    password: 'kamae123',
    displayName: 'Vendedor Aprobado',
    emailVerified: true,
    estado: 'aprobado',
  },
  {
    uid: 'pendiente-dev',
    email: 'pendiente@kamae.test',
    password: 'kamae123',
    displayName: 'Vendedor Pendiente',
    emailVerified: true,
    estado: 'pendiente',
  },
]

// Dueño de cada producto (por slug); el resto queda a nombre del admin.
const DUENOS = {
  'shinai-dobari-38': 'vendedor-dev',
  'keikogi-algodon': 'vendedor-dev',
}

// Imágenes de ejemplo que trae toda cuenta nueva de Cloudinary (placeholder hasta tener fotos reales).
const CLOUD_NAME = 'uesxf3on'
const img = (publicId, alt) => ({
  publicId,
  url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`,
  alt,
})

// El Admin SDK no pasa por las reglas: respetar a mano el esquema de firestore.rules
// (un producto visible debe estar completo: descripción, disciplina, categoría, precio, imagen).
// Orden del array = del más nuevo al más viejo (el catálogo ordena por fechaCreacion desc).
// Dos vendedores ficticios para probar la lista de consulta agrupada por número.
const WHATSAPP_A = '5493510000001'
const WHATSAPP_B = '5491100000002'

const productos = [
  {
    nombre: 'Shinai Dobari 3.8',
    slug: 'shinai-dobari-38',
    descripcion: 'Shinai de bambú con empuñadura gruesa, ideal para práctica diaria.',
    disciplina: ['kendo'],
    categoria: 'shinai',
    precio: 65000,
    moneda: 'ARS',
    disponibilidad: 'disponible',
    tiempoProduccion: '',
    variantes: [
      { etiqueta: '3.7 (escuela secundaria)', disponible: true },
      { etiqueta: '3.8 (adultos)', disponible: true },
      { etiqueta: '3.9 (adultos, largo)', precio: 70000, disponible: false },
    ],
    visible: true,
    whatsapp: WHATSAPP_A,
    imagenes: [
      img('cld-sample-4', 'Shinai, vista general'),
      img('cld-sample-5', 'Shinai, detalle de la tsuka'),
      img('samples/look-up', 'Shinai, detalle del sakigawa'),
    ],
  },
  {
    nombre: 'Tsuba personalizada impresa en 3D',
    slug: 'tsuba-personalizada-3d',
    descripcion: 'Tsuba con diseño a elección, impresa en 3D y terminada a mano.',
    disciplina: ['iaido'],
    categoria: 'tsuba',
    precio: 25000,
    moneda: 'ARS',
    disponibilidad: 'a_pedido',
    tiempoProduccion: '7-10 días',
    variantes: [
      { etiqueta: 'Negro mate', disponible: true },
      { etiqueta: 'Bronce envejecido', precio: 28000, disponible: true },
    ],
    visible: true,
    whatsapp: WHATSAPP_A,
    imagenes: [img('samples/ecommerce/analog-classic', 'Tsuba negro mate')],
  },
  {
    nombre: 'Bokken de roble blanco',
    slug: 'bokken-roble-blanco',
    descripcion: 'Bokken de roble blanco japonés para kata de Kendo e Iaido.',
    disciplina: ['kendo', 'iaido'],
    categoria: 'bokken',
    precio: 85000,
    moneda: 'ARS',
    disponibilidad: 'disponible',
    tiempoProduccion: '',
    variantes: [],
    visible: true,
    whatsapp: WHATSAPP_A,
    imagenes: [img('samples/ecommerce/leather-bag-gray', 'Bokken de roble blanco')],
  },
  {
    nombre: 'Iaito 2.45 shaku',
    slug: 'iaito-245',
    descripcion: 'Iaito de aleación sin filo para práctica de Iaido. Importado: precio en dólares.',
    disciplina: ['iaido'],
    categoria: 'iaito',
    precio: 380,
    moneda: 'USD',
    disponibilidad: 'agotado',
    tiempoProduccion: '',
    variantes: [],
    visible: true,
    whatsapp: WHATSAPP_B, // otro vendedor
    imagenes: [img('samples/landscapes/architecture-signs', 'Iaito 2.45 shaku')],
  },
  {
    // Borrador incompleto (sin imagen ni categoría): no aparece en el catálogo público.
    nombre: 'Keikogi de algodón',
    slug: 'keikogi-algodon',
    descripcion: '',
    disciplina: ['kendo', 'iaido'],
    categoria: '',
    precio: 95000,
    moneda: 'ARS',
    disponibilidad: 'disponible',
    tiempoProduccion: '',
    variantes: [],
    visible: false,
    whatsapp: '',
    imagenes: [],
  },
]

async function recrearUsuario(datos) {
  try {
    await auth.deleteUser(datos.uid)
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
  }
  await auth.createUser(datos)
}

async function seedUsuarios() {
  // Empezar de cero: borra también usuarios registrados a mano en pruebas anteriores.
  const { users } = await auth.listUsers()
  if (users.length) await auth.deleteUsers(users.map((u) => u.uid))
  await db.recursiveDelete(db.collection('usuarios'))
  await db.recursiveDelete(db.collection('admins'))

  await recrearUsuario(ADMIN)
  // Las reglas consideran admin a quien tenga documento en /admins/{uid}.
  await db.doc(`admins/${ADMIN.uid}`).set({ email: ADMIN.email })
  console.log(`✔ Admin: ${ADMIN.email} / ${ADMIN.password} (uid ${ADMIN.uid})`)

  const fecha = Timestamp.now()
  for (const { estado, ...cuenta } of VENDEDORES) {
    await recrearUsuario(cuenta)
    await db.doc(`usuarios/${cuenta.uid}`).set({
      nombre: cuenta.displayName,
      email: cuenta.email,
      estado,
      emailVerificado: cuenta.emailVerified,
      fechaSolicitud: fecha,
      fechaActualizacion: fecha,
    })
    console.log(`✔ Vendedor ${estado}: ${cuenta.email} / ${cuenta.password}`)
  }
}

async function seedProductos() {
  const coleccion = db.collection('productos')
  await db.recursiveDelete(coleccion)
  await db.recursiveDelete(db.collection('slugs'))

  const ahora = Date.now()
  const batch = db.batch()
  productos.forEach((producto, i) => {
    // Fechas escalonadas (1 h entre cada uno) para un orden estable.
    const fecha = Timestamp.fromMillis(ahora - i * 3_600_000)
    const ref = coleccion.doc()
    const vendedorUid = DUENOS[producto.slug] ?? ADMIN.uid
    batch.set(ref, { ...producto, vendedorUid, fechaCreacion: fecha, fechaActualizacion: fecha })
    // Registro del slug (lo exige la regla de alta para que las URLs sean únicas).
    batch.set(db.doc(`slugs/${producto.slug}`), { productoId: ref.id, vendedorUid })
  })
  await batch.commit()
  console.log(`✔ ${productos.length} productos cargados`)
}

try {
  await seedUsuarios()
  await seedProductos()
  process.exit(0)
} catch (error) {
  console.error('✘ Falló el seed. ¿Están corriendo los emuladores (`npm run emulators`)?')
  console.error(error.message)
  process.exit(1)
}
