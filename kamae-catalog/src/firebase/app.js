import { initializeApp } from 'firebase/app'

const env = import.meta.env

export const usarEmuladores = env.VITE_USE_EMULATORS === 'true'

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
}

if (!firebaseConfig.projectId) {
  throw new Error('Falta VITE_FIREBASE_PROJECT_ID: revisá tu .env (ver .env.example).')
}

// Red de seguridad: en desarrollo solo se permite un proyecto demo-* (no puede tocar producción).
if (import.meta.env.DEV && !firebaseConfig.projectId.startsWith('demo-')) {
  throw new Error(
    `En desarrollo se usa el Emulator Suite con un proyecto demo-*, no "${firebaseConfig.projectId}".`,
  )
}

export const app = initializeApp(firebaseConfig)

export const EMULADORES = {
  host: '127.0.0.1',
  firestorePort: 8080,
  authPort: 9099,
}
