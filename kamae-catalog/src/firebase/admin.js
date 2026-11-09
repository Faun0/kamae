// SDK completo de Firestore (onSnapshot para la tabla en tiempo real) + Auth.
// Importar solo desde páginas de /login y /admin, que se cargan con lazy() y no
// entran en el bundle del catálogo público.
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { app, EMULADORES, usarEmuladores } from './app.js'

export const auth = getAuth(app)
auth.languageCode = 'es' // emails de verificación y de recuperación de contraseña en español
export const adminDb = getFirestore(app)

if (usarEmuladores) {
  connectAuthEmulator(auth, `http://${EMULADORES.host}:${EMULADORES.authPort}`, {
    disableWarnings: true,
  })
  connectFirestoreEmulator(adminDb, EMULADORES.host, EMULADORES.firestorePort)
}
