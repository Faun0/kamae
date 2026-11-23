import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useSearchParams } from 'react-router-dom'
import { GrupoChips, Segmentado, Separador } from '../components/FiltrosCatalogo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useBusquedaCatalogo } from '../hooks/useBusquedaCatalogo.js'
import { busquedaCatalogo } from '../utils/busquedaCatalogo.js'
import { CATEGORIAS, CONDICIONES, DISCIPLINAS } from '../utils/constantes.js'
import { rangoPrecio } from '../utils/formato.js'

// Cuántas tarjetas cargan su imagen de inmediato (primera fila en escritorio).
const PRIMERA_FILA = 4

const ORDENES = [
  { valor: '', etiqueta: 'Más nuevos' },
  { valor: 'menor-precio', etiqueta: 'Precio de menor a mayor' },
  { valor: 'mayor-precio', etiqueta: 'Precio de mayor a menor' },
]

/** "Tsubá ÑANDÚ" → "tsuba nandu": búsqueda sin importar acentos ni mayúsculas. */
const normalizar = (texto) =>
  (texto ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // quita las marcas de acento (diacríticos)
    .toLowerCase()

const etiqueta = (lista, valor) => lista.find((o) => o.valor === valor)?.etiqueta ?? ''

const textoBuscable = (p) =>
  normalizar(
    [
      p.nombre,
      p.descripcion,
      etiqueta(CATEGORIAS, p.categoria),
      ...(p.variantes ?? []).map((v) => v.etiqueta),
      p.condicion,
      p.vendedor?.nombre,
      p.vendedor?.ciudad,
    ].join(' '),
  )

// Por precio: no se comparan pesos con dólares; primero ARS, después USD.
const ordenMoneda = (p) => (p.moneda === 'USD' ? 1 : 0)
const comparadores = {
  'menor-precio': (a, b) => ordenMoneda(a) - ordenMoneda(b) || rangoPrecio(a).min - rangoPrecio(b).min,
  'mayor-precio': (a, b) => ordenMoneda(a) - ordenMoneda(b) || rangoPrecio(b).min - rangoPrecio(a).min,
}

// Cada filtro, como predicado. Se usan también para contar cuántos productos daría cada opción.
const FILTROS = {
  disciplina: (p, v) => p.disciplina?.includes(v),
  categoria: (p, v) => p.categoria === v,
  condicion: (p, v) => p.condicion === v,
}

export default function Catalogo() {
  const { productos } = useLoaderData()
  const [params, setParams] = useSearchParams()
  const filtros = {
    disciplina: params.get('disciplina'),
    categoria: params.get('categoria'),
    condicion: params.get('condicion'),
  }
  const orden = params.get('orden') ?? ''
  const qUrl = params.get('q') ?? ''

  // El texto se escribe en el header (BuscadorCatalogo) y se filtra al instante; la URL se
  // actualiza al dejar de tipear (300 ms). Atrás/adelante con otro ?q= actualiza el campo.
  const busqueda = useBusquedaCatalogo()
  useEffect(() => busquedaCatalogo.desdeUrl(qUrl), [qUrl])
  useEffect(() => {
    const espera = setTimeout(() => {
      setParams(
        (anteriores) => {
          if ((anteriores.get('q') ?? '') === busqueda) return anteriores
          busquedaCatalogo.escritoEnUrl(busqueda)
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
  function cambiarParametros(cambios) {
    setParams(
      (anteriores) => {
        const nuevos = new URLSearchParams(anteriores)
        for (const [clave, valor] of Object.entries(cambios)) {
          if (clave === 'q') busquedaCatalogo.escritoEnUrl(valor ?? '')
          if (valor) nuevos.set(clave, valor)
          else nuevos.delete(clave)
        }
        return nuevos
      },
      { replace: true, preventScrollReset: true },
    )
  }
  const cambiar = (clave) => (valor) => cambiarParametros({ [clave]: valor })
  function quitarBusqueda() {
    busquedaCatalogo.set('')
    cambiarParametros({ q: null })
  }
  function limpiarTodo() {
    busquedaCatalogo.set('')
    cambiarParametros({ q: null, disciplina: null, categoria: null, condicion: null })
  }

  const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)
  const coincide = (p) => {
    if (!terminos.length) return true
    const texto = textoBuscable(p)
    return terminos.every((t) => texto.includes(t))
  }
  /** Productos que pasan la búsqueda y todos los filtros, salvo `excepto` (para contar opciones). */
  const filtrar = (excepto) =>
    productos.filter(
      (p) =>
        coincide(p) &&
        Object.entries(filtros).every(
          ([clave, valor]) => clave === excepto || !valor || FILTROS[clave](p, valor),
        ),
    )
  const conCantidad = (lista, clave) => {
    const base = filtrar(clave)
    return lista.map((o) => ({ ...o, cantidad: base.filter((p) => FILTROS[clave](p, o.valor)).length }))
  }

  // Se ofrecen solo las categorías y condiciones que existen en el catálogo; las que darían
  // 0 productos con los demás filtros se deshabilitan.
  const categorias = conCantidad(
    CATEGORIAS.filter((c) => productos.some((p) => p.categoria === c.valor)),
    'categoria',
  )
  const condiciones = conCantidad(
    CONDICIONES.filter((c) => productos.some((p) => p.condicion === c.valor)),
    'condicion',
  )
  const disciplinas = conCantidad(DISCIPLINAS, 'disciplina')
  const verCategorias = categorias.length > 1 || filtros.categoria
  const verCondiciones = condiciones.length > 1 || filtros.condicion

  const filtrados = filtrar()
  // El catálogo ya viene del más nuevo al más viejo; solo se reordena por precio.
  const ordenados = comparadores[orden] ? [...filtrados].sort(comparadores[orden]) : filtrados

  const hayFiltros = Boolean(busqueda || filtros.disciplina || filtros.categoria || filtros.condicion)
  // Filtros quitables uno por uno (la disciplina se cambia en el segmentado).
  const activos = [
    filtros.categoria && { clave: 'categoria', etiqueta: etiqueta(CATEGORIAS, filtros.categoria) },
    filtros.condicion && { clave: 'condicion', etiqueta: etiqueta(CONDICIONES, filtros.condicion) },
  ].filter(Boolean)

  const n = ordenados.length
  const contador = busqueda.trim()
    ? `${n} ${n === 1 ? 'resultado' : 'resultados'} para «${busqueda.trim()}»`
    : `${n} ${n === 1 ? 'producto' : 'productos'}`

  // Degradé a la derecha de la fila de chips solo si hay más para scrollear.
  const filaChips = useRef(null)
  const [hayMas, setHayMas] = useState(false)
  useEffect(() => {
    const fila = filaChips.current
    if (!fila) return
    const medir = () => setHayMas(fila.scrollLeft + fila.clientWidth < fila.scrollWidth - 1)
    medir()
    fila.addEventListener('scroll', medir, { passive: true })
    const observador = new ResizeObserver(medir)
    observador.observe(fila)
    return () => {
      fila.removeEventListener('scroll', medir)
      observador.disconnect()
    }
  }, [verCategorias, verCondiciones])

  const botonTexto = 'inline-flex min-h-11 items-center text-sm text-shu-texto underline underline-offset-4 hover:text-sumi'

  return (
    <section>
      <title>Catálogo · Kamae</title>
      <h1 className="font-serif text-3xl tracking-wide">Catálogo</h1>

      {/* Toolbar: celular en columnas; tablet en dos filas; desde 1024 px en una sola fila. */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Segmentado
          titulo="Disciplina"
          opciones={disciplinas}
          valor={filtros.disciplina}
          onCambiar={cambiar('disciplina')}
          className="order-1 w-full md:w-auto"
        />

        {(verCategorias || verCondiciones) && (
          <>
            <Separador className="order-2 hidden lg:block" />
            <div className="relative order-3 w-full min-w-0 md:order-4 lg:order-3 lg:w-auto lg:flex-1">
              <div ref={filaChips} className="flex items-center gap-3 overflow-x-auto p-0.5 [scrollbar-width:none]">
                {verCategorias && (
                  <GrupoChips
                    titulo="Categoría"
                    opciones={categorias}
                    valor={filtros.categoria}
                    onCambiar={cambiar('categoria')}
                  />
                )}
                {verCategorias && verCondiciones && <Separador />}
                {verCondiciones && (
                  <GrupoChips
                    titulo="Condición"
                    opciones={condiciones}
                    valor={filtros.condicion}
                    onCambiar={cambiar('condicion')}
                  />
                )}
              </div>
              {hayMas && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-washi"
                />
              )}
            </div>
          </>
        )}

        {/* Estado: contador + filtros activos + limpiar (en celular, en la misma fila que el orden). */}
        <div className="order-4 flex min-w-0 flex-1 flex-wrap items-center gap-x-3 md:order-5 md:gap-x-2 md:w-full md:flex-none">
          <p className="text-sm text-sumi-soft" aria-live="polite">
            {contador}
          </p>
          {activos.map((a) => (
            <span key={a.clave} className="hidden items-center text-sm text-sumi-soft lg:inline-flex">
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => cambiarParametros({ [a.clave]: null })}
                aria-label={`Quitar filtro: ${a.etiqueta}`}
                className="ml-2 inline-flex min-h-11 items-center gap-1 text-sumi hover:text-shu-texto"
              >
                {a.etiqueta} <span aria-hidden="true">✕</span>
              </button>
            </span>
          ))}
          {hayFiltros && (
            <>
              <span aria-hidden="true" className="hidden text-sm text-sumi-soft md:inline">
                ·
              </span>
              <button type="button" onClick={limpiarTodo} className={botonTexto}>
                Limpiar
              </button>
            </>
          )}
        </div>

        <label className="order-5 flex shrink-0 items-center gap-2 text-sm text-sumi-soft md:order-2 md:ml-auto lg:order-4 lg:ml-0">
          <span className="sr-only md:not-sr-only">Ordenar por</span>
          <select
            value={orden}
            onChange={(e) => cambiarParametros({ orden: e.target.value })}
            className="min-h-11 max-w-40 rounded-sm border border-sumi/50 bg-white px-2 text-sm text-sumi md:max-w-none"
          >
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      {n > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {ordenados.map((producto, i) => (
            <ProductCard key={producto.id} producto={producto} prioridad={i < PRIMERA_FILA} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-sm border border-dashed border-sumi/30 px-4 py-16 text-center">
          <p className="text-sumi-soft">
            {busqueda.trim()
              ? `No hay productos que coincidan con «${busqueda.trim()}»${activos.length || filtros.disciplina ? ' con estos filtros' : ''}.`
              : 'No hay productos con estos filtros.'}
          </p>
          {/* Salidas: quitar lo que dejó el catálogo en 0, o verlo todo. */}
          <div className="mt-2 flex flex-wrap justify-center gap-x-6">
            {busqueda.trim() && (
              <button type="button" onClick={quitarBusqueda} className={botonTexto}>
                Quitar «{busqueda.trim()}»
              </button>
            )}
            {activos.map((a) => (
              <button
                key={a.clave}
                type="button"
                onClick={() => cambiarParametros({ [a.clave]: null })}
                className={botonTexto}
              >
                Quitar filtro: {a.etiqueta}
              </button>
            ))}
            {filtros.disciplina && (
              <button type="button" onClick={() => cambiarParametros({ disciplina: null })} className={botonTexto}>
                Quitar filtro: {etiqueta(DISCIPLINAS, filtros.disciplina)}
              </button>
            )}
            <button type="button" onClick={limpiarTodo} className={botonTexto}>
              Ver todo el catálogo
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
