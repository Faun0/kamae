import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
// Noto Serif JP servida desde el propio sitio (sin pedidos a Google).
// Alfabeto latino completo + solo los fragmentos de kanji que usa el sitio: el CSS
// completo del paquete suma ~200 kB que bloquean el render (ver scripts/fuente-kanji.mjs).
import '@fontsource/noto-serif-jp/latin-400.css'
import '@fontsource/noto-serif-jp/latin-600.css'
import './fuente-kanji.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
