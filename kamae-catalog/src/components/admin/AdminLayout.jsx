import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { cerrarSesion } from '../../firebase/sesion.js'
import { useSesion } from '../../hooks/useSesion.js'

// Guardia de /admin. Es solo UX: la seguridad real está en firestore.rules.
export default function AdminLayout() {
  const { cargando, usuario, esAdmin } = useSesion()
  const location = useLocation()

  if (cargando) {
    return <p className="py-16 text-center text-sumi-soft">Verificando sesión…</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (!esAdmin) {
    return (
      <section className="py-16 text-center">
        <title>Sin acceso · Kamae</title>
        <h1 className="font-serif text-2xl">Sin acceso</h1>
        <p className="mt-2 text-sumi-soft">
          La cuenta {usuario.email} no tiene permisos de administración.
        </p>
        <button
          type="button"
          onClick={cerrarSesion}
          className="mt-6 text-shu underline underline-offset-4"
        >
          Cerrar sesión
        </button>
      </section>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm bg-sumi px-4 py-2 text-sm text-washi">
        <Link to="/admin" className="font-medium tracking-wide">
          Panel de administración
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-washi/60 sm:inline">{usuario.email}</span>
          <button type="button" onClick={cerrarSesion} className="hover:text-shu">
            Salir
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
