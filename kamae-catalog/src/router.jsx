import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RouteError from './components/RouteError.jsx'
import Catalogo from './pages/Catalogo.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'
import NotFound from './pages/NotFound.jsx'

// Las páginas de admin se cargan bajo demanda para no inflar el bundle público.
const lazyPage = (importer) => async () => ({
  Component: (await importer()).default,
})

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Catalogo /> },
      { path: 'producto/:slug', element: <ProductoDetalle /> },
      { path: 'login', lazy: lazyPage(() => import('./pages/Login.jsx')) },
      {
        path: 'admin',
        // TODO Fase 5: envolver en <AdminRoute> (solo UX; la seguridad real está en las reglas).
        children: [
          {
            index: true,
            lazy: lazyPage(() => import('./pages/admin/AdminProductos.jsx')),
          },
          {
            path: 'nuevo',
            lazy: lazyPage(() => import('./pages/admin/ProductoForm.jsx')),
          },
          {
            path: 'editar/:id',
            lazy: lazyPage(() => import('./pages/admin/ProductoForm.jsx')),
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
