import { useLoaderData, useSearchParams } from 'react-router-dom'
import FiltroChips from '../components/FiltroChips.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIAS, DISCIPLINAS } from '../utils/constantes.js'

export default function Catalogo() {
  const { productos } = useLoaderData()
  const [params, setParams] = useSearchParams()
  const disciplina = params.get('disciplina')
  const categoria = params.get('categoria')

  // Los filtros viven en la URL (?disciplina=kendo&categoria=shinai): se pueden compartir.
  function cambiarFiltro(clave, valor) {
    setParams(
      (anteriores) => {
        const nuevos = new URLSearchParams(anteriores)
        if (valor) nuevos.set(clave, valor)
        else nuevos.delete(clave)
        return nuevos
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const porDisciplina = disciplina
    ? productos.filter((p) => p.disciplina?.includes(disciplina))
    : productos
  // Solo se ofrecen categorías con productos (dentro de la disciplina elegida).
  const categorias = CATEGORIAS.filter((c) =>
    porDisciplina.some((p) => p.categoria === c.valor),
  )
  const filtrados = categoria
    ? porDisciplina.filter((p) => p.categoria === categoria)
    : porDisciplina

  return (
    <section>
      <title>Kamae · Equipamiento para Kendo e Iaido</title>
      <h1 className="font-serif text-3xl tracking-wide">Catálogo</h1>
      <p className="mt-2 text-sumi-soft">Equipamiento para Kendo e Iaido.</p>

      <div className="mt-8 space-y-5">
        <FiltroChips
          titulo="Disciplina"
          opciones={DISCIPLINAS}
          valor={disciplina}
          onCambiar={(valor) => cambiarFiltro('disciplina', valor)}
        />
        {categorias.length > 1 && (
          <FiltroChips
            titulo="Categoría"
            opciones={categorias}
            valor={categoria}
            onCambiar={(valor) => cambiarFiltro('categoria', valor)}
          />
        )}
      </div>

      <p className="mt-8 text-xs text-sumi-soft" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}
      </p>

      {filtrados.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {filtrados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-sm border border-dashed border-sumi/20 py-16 text-center">
          <p className="text-sumi-soft">No hay productos con estos filtros.</p>
          <button
            type="button"
            onClick={() => setParams({}, { replace: true })}
            className="mt-3 text-sm text-shu underline underline-offset-4"
          >
            Ver todo el catálogo
          </button>
        </div>
      )}
    </section>
  )
}
