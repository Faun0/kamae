import { useParams } from 'react-router-dom'

// Fase 5: formulario compartido entre /admin/nuevo y /admin/editar/:id.
export default function ProductoForm() {
  const { id } = useParams()
  const esEdicion = Boolean(id)

  return (
    <section>
      <h1 className="font-serif text-2xl">
        {esEdicion ? 'Editar producto' : 'Nuevo producto'}
      </h1>
    </section>
  )
}
