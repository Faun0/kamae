import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

// Se muestra si una ruta falla al renderizar o al cargar (p. ej. un chunk lazy).
export default function RouteError() {
  const error = useRouteError()
  const detalle = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : null

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-2xl">Algo salió mal</h1>
      {detalle && <p className="text-sm text-sumi-soft">{detalle}</p>}
      <Link to="/" className="text-shu underline underline-offset-4">
        Volver al catálogo
      </Link>
    </div>
  )
}
