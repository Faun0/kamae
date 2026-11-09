import { useSyncExternalStore } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useListaConsulta } from '../hooks/useListaConsulta.js'
import { marcaAdmin } from '../utils/marcaAdmin.js'

const linkClass = ({ isActive }) =>
  `flex items-center gap-1.5 text-sm tracking-wide transition-colors ${
    isActive ? 'text-shu' : 'text-sumi-soft hover:text-sumi'
  }`

export default function Navbar() {
  const items = useListaConsulta()
  const cantidad = items.reduce((total, item) => total + item.cantidad, 0)
  const esAdmin = useSyncExternalStore(
    marcaAdmin.subscribe,
    marcaAdmin.getSnapshot,
    marcaAdmin.getSnapshot,
  )

  return (
    <header className="sticky top-0 z-10 border-b border-sumi/10 bg-washi/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-semibold tracking-widest">
            KAMAE
          </span>
          <span className="font-serif text-sm text-shu" aria-hidden="true">
            構え
          </span>
        </Link>
        <div className="flex items-center gap-5 sm:gap-6">
          <NavLink to="/" end className={linkClass}>
            Catálogo
          </NavLink>
          <NavLink to="/consulta" className={linkClass}>
            Consulta
            {cantidad > 0 && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-shu px-1 text-xs text-washi"
                aria-label={`${cantidad} productos`}
              >
                {cantidad}
              </span>
            )}
          </NavLink>
          {/* Solo con sesión de admin en este navegador (ver utils/marcaAdmin.js). */}
          {esAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Panel
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}
