import { createBrowserRouter, data } from 'react-router-dom'
import CargandoCatalogo from './components/CargandoCatalogo.jsx'
import Layout from './components/Layout.jsx'
import RouteError from './components/RouteError.jsx'
import { obtenerCatalogo, obtenerProductoPorSlug } from './firebase/productos.js'
import Catalogo from './pages/Catalogo.jsx'
import ListaConsulta from './pages/ListaConsulta.jsx'
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
    hydrateFallbackElement: (
      <Layout>
        <CargandoCatalogo />
      </Layout>
    ),
    children: [
      {
        // Ruta sin path: los errores se muestran dentro del Layout (con navbar y footer).
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            element: <Catalogo />,
            loader: async () => ({ productos: await obtenerCatalogo() }),
            // Cambiar filtros (?disciplina=...) no vuelve a ejecutar el loader.
            shouldRevalidate: ({ currentUrl, nextUrl }) =>
              currentUrl.pathname !== nextUrl.pathname,
          },
          {
            path: 'producto/:slug',
            element: <ProductoDetalle />,
            loader: async ({ params }) => {
              const producto = await obtenerProductoPorSlug(params.slug)
              if (!producto) throw data('Producto no encontrado', { status: 404 })
              return { producto }
            },
          },
          { path: 'consulta', element: <ListaConsulta /> },
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
    ],
  },
])
