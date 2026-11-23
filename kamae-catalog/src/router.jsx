import { createBrowserRouter, data, redirect } from 'react-router-dom'
import CargandoCatalogo from './components/CargandoCatalogo.jsx'
import Layout from './components/Layout.jsx'
import RouteError from './components/RouteError.jsx'
import { obtenerCatalogo, obtenerProductoPorSlug } from './firebase/productos.js'
import Catalogo from './pages/Catalogo.jsx'
import Home from './pages/Home.jsx'
import ListaConsulta from './pages/ListaConsulta.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'
import NotFound from './pages/NotFound.jsx'
import Sobre from './pages/Sobre.jsx'
import { busquedaCatalogo } from './utils/busquedaCatalogo.js'

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
            element: <Home />,
            loader: ({ request }) => {
              // Antes el catálogo vivía en "/": los links compartidos con filtros
              // (/?disciplina=kendo) se redirigen a /catalogo conservando los parámetros.
              const { search, searchParams } = new URL(request.url)
              if (searchParams.has('disciplina') || searchParams.has('categoria')) {
                throw redirect(`/catalogo${search}`)
              }
              // Sin await: el hero se pinta al instante y "Lo último" espera con <Await>.
              // Usa el mismo caché por sesión que el catálogo (no suma lecturas).
              return { productos: obtenerCatalogo() }
            },
          },
          {
            path: 'catalogo',
            element: <Catalogo />,
            loader: async ({ request }) => {
              // Al entrar, el buscador del header arranca con el ?q= de la URL (link compartido).
              busquedaCatalogo.iniciar(new URL(request.url).searchParams.get('q') ?? '')
              return { productos: await obtenerCatalogo() }
            },
            // Cambiar filtros (?disciplina=...) no vuelve a ejecutar el loader.
            shouldRevalidate: ({ currentUrl, nextUrl }) =>
              currentUrl.pathname !== nextUrl.pathname,
          },
          { path: 'sobre', element: <Sobre /> },
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
            // Guardia de sesión (solo UX; la seguridad real está en firestore.rules).
            lazy: lazyPage(() => import('./components/admin/AdminLayout.jsx')),
            children: [
              {
                index: true,
                lazy: lazyPage(() => import('./pages/admin/AdminProductos.jsx')),
              },
              {
                path: 'usuarios',
                lazy: lazyPage(() => import('./pages/admin/AdminUsuarios.jsx')),
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
