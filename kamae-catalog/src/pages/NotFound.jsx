import { Link } from 'react-router-dom'

export default function NotFound({ mensaje = 'Página no encontrada' }) {
  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center">
      <title>No encontrado · Kamae</title>
      <p className="font-serif text-6xl text-shu">404</p>
      <h1 className="font-serif text-2xl">{mensaje}</h1>
      <Link to="/" className="text-shu underline underline-offset-4">
        Volver al catálogo
      </Link>
    </section>
  )
}
