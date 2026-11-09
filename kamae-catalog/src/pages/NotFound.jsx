import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="font-serif text-6xl text-shu">404</p>
      <h1 className="font-serif text-2xl">Página no encontrada</h1>
      <Link to="/" className="text-shu underline underline-offset-4">
        Volver al catálogo
      </Link>
    </section>
  )
}
