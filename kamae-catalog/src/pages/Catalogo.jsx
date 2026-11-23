import { useEffect, useState } from 'react'
import { useLoaderData, useSearchParams } from 'react-router-dom'
import FiltroChips from '../components/FiltroChips.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIAS, DISCIPLINAS } from '../utils/constantes.js'
import { rangoPrecio } from '../utils/formato.js'

// Cuántas tarjetas cargan su imagen de inmediato (primera fila en escritorio).
const PRIMERA_FILA = 4

const ORDENES = [
  { valor: '', etiqueta: 'Más nuevos' },
  { valor: 'menor-precio', etiqueta: 'Menor precio' },
  { valor: 'mayor-precio', etiqueta: 'Mayor precio' },
]

/** "Tsubá ÑANDÚ" → "tsuba nandu": búsqueda sin importar acentos ni mayúsculas. */
const normalizar = (texto) =>
  (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const etiquetaCategoria = (valor) => CATEGORIAS.find((c) => c.valor === valor)?.etiqueta ?? ''

const textoBuscable = (p) =>
  normalizar(
    [
      p.nombre,
      p.descripcion,
      etiquetaCategoria(p.categoria),
      ...(p.variantes ?? []).map((v) => v.etiqueta),
    ].join(' '),
  )

// Por precio: no se comparan pesos con dólares; primero ARS, después USD.
const ordenMoneda = (p) => (p.moneda === 'USD' ? 1 : 0)
const comparadores = {
  'menor-precio': (a, b) => ordenMoneda(a) - ordenMoneda(b) || rangoPrecio(a).min - rangoPrecio(b).min,
  'mayor-precio': (a, b) => ordenMoneda(a) - ordenMoneda(b) || rangoPrecio(b).min - rangoPrecio(a).min,
}

export default function Catalogo() {
  const { productos } = useLoaderData()
  const [params, setParams] = useSearchParams()
  const disciplina = params.get('disciplina')
  const categoria = params.get('categoria')
  const orden = params.get('orden') ?? ''

  // La búsqueda tiene estado propio: si el input leyera la URL en cada tecla, al tipear
  // rápido se perdían letras. Se filtra al instante y la URL se actualiza al dejar de tipear.
  const [busqueda, setBusqueda] = useState(() => params.get('q') ?? '')
  useEffect(() => {
    const espera = setTimeout(() => {
      setParams(
        (anteriores) => {
          if ((anteriores.get('q') ?? '') === busqueda) return anteriores
          const nuevos = new URLSearchParams(anteriores)
          if (busqueda) nuevos.set('q', busqueda)
          else nuevos.delete('q')
          return nuevos
        },
        { replace: true, preventScrollReset: true },
      )
    }, 300)
    return () => clearTimeout(espera)
  }, [busqueda, setParams])

  // Filtros, búsqueda y orden viven en la URL (?disciplina=kendo&q=shinai): se pueden compartir.
  function cambiarParametro(clave, valor) {
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
  const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)
  const filtrados = porDisciplina
    .filter((p) => !categoria || p.categoria === categoria)
    .filter((p) => {
      if (!terminos.length) return true
      const texto = textoBuscable(p)
      return terminos.every((t) => texto.includes(t))
    })
  // El catálogo ya viene del más nuevo al más viejo; solo se reordena por precio.
  const ordenados = comparadores[orden] ? [...filtrados].sort(comparadores[orden]) : filtrados
  const hayFiltros = Boolean(disciplina || categoria || busqueda)

  return (
    <section>
      <title>Catálogo · Kamae</title>
      <h1 className="font-serif text-3xl tracking-wide">Catálogo</h1>
      <p className="mt-2 text-sumi-soft">Equipamiento para Kendo e Iaido.</p>

      <div className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="busqueda"
            className="mb-2 block text-[0.8125rem] tracking-widest text-sumi-soft uppercase"
          >
            Buscar
          </label>
          <input
            id="busqueda"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Ej.: shinai 38, tsuba, keikogi…"
            enterKeyHint="search"
            className="min-h-11 w-full rounded-sm border border-sumi/50 bg-white px-3 text-base focus:border-sumi focus:outline-none sm:max-w-md"
          />
        </div>
        <FiltroChips
          titulo="Disciplina"
          opciones={DISCIPLINAS}
          valor={disciplina}
          onCambiar={(valor) => cambiarParametro('disciplina', valor)}
        />
        {categorias.length > 1 && (
          <FiltroChips
            titulo="Categoría"
            opciones={categorias}
            valor={categoria}
            onCambiar={(valor) => cambiarParametro('categoria', valor)}
          />
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sumi-soft" aria-live="polite">
          {ordenados.length} {ordenados.length === 1 ? 'producto' : 'productos'}
        </p>
        <label className="flex items-center gap-2 text-sm text-sumi-soft">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => cambiarParametro('orden', e.target.value)}
            className="min-h-11 rounded-sm border border-sumi/50 bg-white px-2 text-sm text-sumi focus:border-sumi focus:outline-none"
          >
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      {ordenados.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {ordenados.map((producto, i) => (
            <ProductCard key={producto.id} producto={producto} prioridad={i < PRIMERA_FILA} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-sm border border-dashed border-sumi/30 py-16 text-center">
          <p className="text-sumi-soft">
            {busqueda
              ? `No hay productos que coincidan con “${busqueda}”${hayFiltros && (disciplina || categoria) ? ' con estos filtros' : ''}.`
              : 'No hay productos con estos filtros.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setBusqueda('')
              setParams({}, { replace: true })
            }}
            className="mt-2 inline-flex min-h-11 items-center text-sm text-shu-texto underline underline-offset-4"
          >
            Ver todo el catálogo
          </button>
        </div>
      )}
    </section>
  )
}
