import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import NotFound from '../pages/NotFound.jsx'

// Errores de render o de loaders (p. ej. producto inexistente, Firestore caído, chunk lazy que no carga).
export default function RouteError() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound mensaje={typeof error.data === 'string' ? error.data : undefined} />
  }

  if (import.meta.env.DEV) console.error(error)

  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-serif text-2xl">Algo salió mal</h1>
      <p className="text-sm text-sumi-soft">
        Revisá tu conexión e intentá de nuevo en unos segundos.
      </p>
      <div className="flex gap-6">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-shu underline underline-offset-4"
        >
          Reintentar
        </button>
        <Link to="/" className="text-sumi-soft underline underline-offset-4">
          Volver al catálogo
        </Link>
      </div>
    </section>
  )
}
