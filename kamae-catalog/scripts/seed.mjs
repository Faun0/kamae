// Carga datos de prueba en el Emulator Suite (nunca en producción).
// Uso: con `npm run emulators` corriendo, en otra terminal `npm run seed`.
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

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

// Imágenes de ejemplo que trae toda cuenta nueva de Cloudinary (placeholder hasta tener fotos reales).
const CLOUD_NAME = 'uesxf3on'
const img = (publicId, alt) => ({
  publicId,
  url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`,
  alt,
})

const productos = [
  {
    nombre: 'Shinai Dobari 3.8',
    slug: 'shinai-dobari-38',
    descripcion: 'Shinai de bambú con empuñadura gruesa, ideal para práctica diaria.',
    disciplina: ['kendo'],
    categoria: 'shinai',
    precio: 65000,
    disponibilidad: 'disponible',
    tiempoProduccion: '',
    variantes: [
      { etiqueta: '3.7 (escuela secundaria)', disponible: true },
      { etiqueta: '3.8 (adultos)', disponible: true },
      { etiqueta: '3.9 (adultos, largo)', precio: 70000, disponible: false },
    ],
    imagenes: [
      img('cld-sample-4', 'Shinai, vista general'),
      img('cld-sample-5', 'Shinai, detalle de la tsuka'),
      img('samples/look-up', 'Shinai, detalle del sakigawa'),
    ],
    visible: true,
    destacado: true,
    orden: 1,
  },
  {
    nombre: 'Bokken de roble blanco',
    slug: 'bokken-roble-blanco',
    descripcion: 'Bokken de roble blanco japonés para kata de Kendo e Iaido.',
    disciplina: ['kendo', 'iaido'],
    categoria: 'bokken',
    precio: 85000,
    disponibilidad: 'disponible',
    tiempoProduccion: '',
    variantes: [],
    visible: true,
    destacado: false,
    orden: 2,
  },
  {
    nombre: 'Tsuba personalizada impresa en 3D',
    slug: 'tsuba-personalizada-3d',
    descripcion: 'Tsuba con diseño a elección, impresa en 3D y terminada a mano.',
    disciplina: ['iaido'],
    categoria: 'tsuba',
    precio: 25000,
    disponibilidad: 'a_pedido',
    tiempoProduccion: '7-10 días',
    variantes: [
      { etiqueta: 'Negro mate', disponible: true },
      { etiqueta: 'Bronce envejecido', precio: 28000, disponible: true },
    ],
    imagenes: [img('samples/ecommerce/analog-classic', 'Tsuba negro mate')],
    visible: true,
    destacado: true,
    orden: 3,
  },
  {
    nombre: 'Iaito 2.45 shaku',
    slug: 'iaito-245',
    descripcion: 'Iaito de aleación sin filo para práctica de Iaido.',
    disciplina: ['iaido'],
    categoria: 'iaito',
    precio: 420000,
    disponibilidad: 'agotado',
    tiempoProduccion: '',
    variantes: [],
    imagenes: [img('samples/landscapes/architecture-signs', 'Iaito 2.45 shaku')],
    visible: true,
    destacado: false,
    orden: 4,
  },
  {
    nombre: 'Keikogi de algodón (borrador)',
    slug: 'keikogi-algodon',
    descripcion: 'Producto en borrador: no debe aparecer en el catálogo público.',
    disciplina: ['kendo', 'iaido'],
    categoria: 'indumentaria',
    precio: 95000,
    disponibilidad: 'disponible',
    tiempoProduccion: '',
    variantes: [],
    visible: false,
    destacado: false,
    orden: 5,
  },
]

async function seedAdmin() {
  try {
    await auth.deleteUser(ADMIN.uid)
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
  }
  await auth.createUser(ADMIN)
  // Las reglas consideran admin a quien tenga documento en /admins/{uid}.
  await db.doc(`admins/${ADMIN.uid}`).set({ email: ADMIN.email })
  console.log(`✔ Admin: ${ADMIN.email} / ${ADMIN.password} (uid ${ADMIN.uid})`)
}

async function seedProductos() {
  const coleccion = db.collection('productos')
  await db.recursiveDelete(coleccion)

  const batch = db.batch()
  for (const producto of productos) {
    batch.set(coleccion.doc(), {
      imagenes: [], // el bokken queda sin imagen a propósito (prueba el placeholder)
      ...producto,
      moneda: 'ARS',
      fechaCreacion: FieldValue.serverTimestamp(),
      fechaActualizacion: FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()
  console.log(`✔ ${productos.length} productos cargados`)
}

try {
  await seedAdmin()
  await seedProductos()
  process.exit(0)
} catch (error) {
  console.error('✘ Falló el seed. ¿Están corriendo los emuladores (`npm run emulators`)?')
  console.error(error.message)
  process.exit(1)
}
