import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// Variables sin las cuales el sitio de producción queda roto.
const REQUERIDAS_EN_PRODUCCION = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET',
]

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === 'production') {
    const env = loadEnv(mode, process.cwd())
    const faltantes = REQUERIDAS_EN_PRODUCCION.filter((clave) => !env[clave])
    // Opcional (link del footer), pero si está tiene que ser válido.
    if (env.VITE_WHATSAPP && !/^549\d{10}$/.test(env.VITE_WHATSAPP)) {
      faltantes.push('VITE_WHATSAPP válido (formato 549 + 10 dígitos, o vacío)')
    }
    if (faltantes.length) {
      throw new Error(`Faltan variables en .env.production: ${faltantes.join(', ')}`)
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    build: {
      // El chunk del admin (Firestore completo + Auth, ~160 kB gzip) supera los 500 kB
      // minificados; solo se descarga en /login y /admin, no afecta al catálogo público.
      chunkSizeWarningLimit: 600,
    },
  }
})
