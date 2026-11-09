import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // El chunk del admin (Firestore completo + Auth, ~160 kB gzip) supera los 500 kB
    // minificados; solo se descarga en /login y /admin, no afecta al catálogo público.
    chunkSizeWarningLimit: 600,
  },
})
