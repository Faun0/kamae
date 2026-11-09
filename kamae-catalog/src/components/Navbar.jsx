import { Link, NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `text-sm tracking-wide transition-colors ${
    isActive ? 'text-shu' : 'text-sumi-soft hover:text-sumi'
  }`

export default function Navbar() {
  return (
    <header className="border-b border-sumi/10 bg-washi/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-semibold tracking-widest">
            KAMAE
          </span>
          <span className="font-serif text-sm text-shu" aria-hidden="true">
            構え
          </span>
        </Link>
        <NavLink to="/" end className={linkClass}>
          Catálogo
        </NavLink>
      </nav>
    </header>
  )
}
