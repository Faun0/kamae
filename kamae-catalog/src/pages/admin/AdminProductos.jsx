import { Link } from 'react-router-dom'

// Fase 5: tabla CRUD en tiempo real (onSnapshot).
export default function AdminProductos() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Productos</h1>
        <Link
          to="/admin/nuevo"
          className="rounded bg-sumi px-4 py-2 text-sm text-washi hover:bg-ai"
        >
          Nuevo producto
        </Link>
      </div>
    </section>
  )
}
