// Firestore para el catálogo público. Usa la versión "lite" (solo lecturas puntuales con
// getDocs/getDoc, sin listeners), bastante más liviana que el SDK completo.
// El admin usa el SDK completo desde ./admin.js, que se carga solo en las rutas /admin.
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore/lite'
import { app, EMULADORES, usarEmuladores } from './app.js'

export const db = getFirestore(app)

if (usarEmuladores) {
  connectFirestoreEmulator(db, EMULADORES.host, EMULADORES.firestorePort)
}
