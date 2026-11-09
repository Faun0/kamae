// Estado de sesión del panel (store para useSyncExternalStore, ver hooks/useSesion.js).
// Solo se importa desde páginas lazy de /login y /admin.
//
// Roles: admin (doc en /admins/{uid}) o vendedor (perfil en /usuarios/{uid}, que puede
// publicar solo si está 'aprobado' y verificó su email). Todo esto es UX: la seguridad
// real está en firestore.rules.
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { adminDb, auth } from './admin.js'
import { marcaAdmin } from '../utils/marcaAdmin.js'

const SIN_SESION = { cargando: false, usuario: null, esAdmin: false, perfil: null, esVendedor: false }

let estado = { ...SIN_SESION, cargando: true }
const listeners = new Set()

function emitir(nuevo) {
  estado = nuevo
  // Mantiene sincronizado el link "Panel" del header público.
  if (!nuevo.cargando) marcaAdmin.set(nuevo.esAdmin || nuevo.esVendedor)
  listeners.forEach((listener) => listener())
}

async function leerRol(usuario) {
  const esAdmin = await getDoc(doc(adminDb, 'admins', usuario.uid))
    .then((snap) => snap.exists())
    .catch(() => false)
  if (esAdmin) return { esAdmin: true, perfil: null, esVendedor: false }

  const snap = await getDoc(doc(adminDb, 'usuarios', usuario.uid)).catch(() => null)
  const perfil = snap?.exists() ? snap.data() : null

  // Si verificó el email desde el último ingreso, se refleja en el perfil (lo ve el admin).
  if (perfil && usuario.emailVerified && !perfil.emailVerificado) {
    await updateDoc(doc(adminDb, 'usuarios', usuario.uid), {
      emailVerificado: true,
      fechaActualizacion: serverTimestamp(),
    }).catch(() => {})
    perfil.emailVerificado = true
  }

  return {
    esAdmin: false,
    perfil,
    esVendedor: perfil?.estado === 'aprobado' && usuario.emailVerified,
  }
}

async function evaluar(usuario) {
  if (!usuario) return emitir(SIN_SESION)
  emitir({ ...estado, cargando: true, usuario })
  const rol = await leerRol(usuario)
  // Si mientras tanto cambió el usuario, descartar este resultado.
  if (auth.currentUser?.uid === usuario.uid) emitir({ cargando: false, usuario, ...rol })
}

onAuthStateChanged(auth, evaluar)

export const sesion = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => estado,
}

/** Vuelve a leer rol y perfil (después de registrarse, verificar el email, etc.). */
export async function recargarSesion() {
  const usuario = auth.currentUser
  if (!usuario) return
  await usuario.reload()
  await usuario.getIdToken(true) // token nuevo: las reglas ven email_verified actualizado
  await evaluar(auth.currentUser)
}

export const iniciarSesion = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const cerrarSesion = () => signOut(auth)

export const recuperarContrasena = (email) => sendPasswordResetEmail(auth, email)

export const reenviarVerificacion = () => sendEmailVerification(auth.currentUser)

/** Crea el perfil de vendedor en estado 'pendiente' para el usuario actual. */
export async function solicitarAcceso(nombre) {
  const usuario = auth.currentUser
  await setDoc(doc(adminDb, 'usuarios', usuario.uid), {
    nombre: nombre.trim(),
    email: usuario.email,
    estado: 'pendiente',
    emailVerificado: usuario.emailVerified,
    fechaSolicitud: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  })
  await recargarSesion()
}

/** Registro de vendedor: cuenta + email de verificación + solicitud pendiente. */
export async function registrarse({ nombre, email, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await sendEmailVerification(user).catch(() => {}) // se puede reenviar después
  await solicitarAcceso(nombre)
}
