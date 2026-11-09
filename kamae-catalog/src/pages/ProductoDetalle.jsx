import { Link, useParams } from 'react-router-dom'

// Fase 4: datos del producto, selector de variante y CTA a WhatsApp.
export default function ProductoDetalle() {
  const { slug } = useParams()

  return (
    <section>
      <Link to="/" className="text-sm text-sumi-soft hover:text-sumi">
        ← Volver al catálogo
      </Link>
      <h1 className="mt-4 font-serif text-3xl">{slug}</h1>
    </section>
  )
}
