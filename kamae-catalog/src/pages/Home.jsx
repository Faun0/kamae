import { Suspense } from 'react'
import { Await, Link, useLoaderData } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { PASOS } from '../utils/contenido.js'

const CANTIDAD_ULTIMOS = 4

const DISCIPLINAS_HOME = [
  { valor: 'kendo', nombre: 'Kendo', kanji: '剣道', texto: 'Shinai, bogu, keikogi y accesorios.' },
  { valor: 'iaido', nombre: 'Iaido', kanji: '居合道', texto: 'Iaito, bokken, tsubas y más.' },
]

const botonPrimario =
  'inline-flex items-center justify-center rounded-sm bg-sumi px-6 py-3 font-medium text-washi transition-colors hover:bg-ai'
const botonSecundario =
  'inline-flex items-center justify-center rounded-sm border border-sumi/30 px-6 py-3 font-medium transition-colors hover:border-sumi'
const linkFlecha = 'text-sm font-medium text-shu underline-offset-4 hover:underline'

export default function Home() {
  const { productos } = useLoaderData()

  return (
    <div className="space-y-20 sm:space-y-24">
      <title>Kamae · La vidriera de la comunidad de Kendo e Iaido</title>
      <meta
        name="description"
        content="Vidriera comunitaria y sin fines de lucro de equipamiento para Kendo e Iaido en Argentina. Elegís, escribís por WhatsApp y coordinás directo con quien lo tiene."
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-4 sm:pt-10">
        <span
          className="pointer-events-none absolute -top-6 right-0 font-serif text-[9rem] leading-none text-shu/10 select-none sm:-top-4 sm:text-[14rem] lg:text-[17rem]"
          aria-hidden="true"
        >
          構え
        </span>
        <div className="relative max-w-2xl">
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            La vidriera de la comunidad de Kendo e Iaido.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-sumi-soft">
            Acá se muestra lo que la comunidad arma, fabrica o consigue: shinai, bogu,
            indumentaria, tsubas hechas a pedido y más. Elegís, escribís por WhatsApp y
            coordinás directo con quien lo tiene.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalogo" className={botonPrimario}>
              Ver catálogo
            </Link>
            <a href="#como-funciona" onClick={irAComoFunciona} className={botonSecundario}>
              Cómo funciona
            </a>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-24">
        <h2 className="font-serif text-2xl sm:text-3xl">Cómo funciona</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="border-t border-sumi/15 pt-4">
              <span className="font-serif text-3xl text-shu">{i + 1}</span>
              <h3 className="mt-2 flex flex-wrap items-center gap-2 font-medium">
                {paso.titulo}
                {paso.proximamente && (
                  <span className="rounded-sm bg-sumi/10 px-2 py-0.5 text-xs font-normal text-sumi-soft">
                    Próximamente
                  </span>
                )}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-sumi-soft">{paso.resumen}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Explorar */}
      <section>
        <h2 className="font-serif text-2xl sm:text-3xl">Explorar</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {DISCIPLINAS_HOME.map((d) => (
            <Link
              key={d.valor}
              to={`/catalogo?disciplina=${d.valor}`}
              className="group relative flex min-h-44 flex-col justify-end overflow-hidden rounded-sm bg-sumi p-6 text-washi transition-colors hover:bg-ai"
            >
              <span
                className="pointer-events-none absolute -top-2 right-4 font-serif text-7xl text-washi/15 select-none sm:text-8xl"
                aria-hidden="true"
              >
                {d.kanji}
              </span>
              <span className="relative font-serif text-3xl">{d.nombre}</span>
              <span className="relative mt-1 text-sm text-washi/70">{d.texto}</span>
              <span className="relative mt-4 text-sm font-medium">Ver productos →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Lo último que se sumó */}
      <Suspense fallback={<UltimosCargando />}>
        <Await resolve={productos} errorElement={null}>
          {(lista) => <Ultimos productos={lista.slice(0, CANTIDAD_ULTIMOS)} />}
        </Await>
      </Suspense>

      {/* Qué hay detrás */}
      <section className="max-w-2xl">
        <h2 className="font-serif text-2xl sm:text-3xl">Qué hay detrás de Kamae</h2>
        <p className="mt-6 leading-relaxed text-sumi-soft">
          Kamae es una vidriera de la comunidad, sin fines de lucro. Nació porque buena parte
          del equipamiento de Kendo e Iaido es difícil de conseguir en el país, y porque cada
          uno termina publicando lo que tiene en muchos lugares distintos. Acá se junta todo en
          un solo sitio. No cobro comisión ni intervengo en las ventas: cada vendedor se hace
          cargo de lo que publica.
        </p>
        <Link to="/sobre" className={`mt-4 inline-block ${linkFlecha}`}>
          Conocé más →
        </Link>
      </section>

      {/* Invitación a publicar */}
      <section className="rounded-sm bg-washi-dark px-6 py-10 sm:px-10">
        <h2 className="font-serif text-2xl sm:text-3xl">¿Tenés algo para mostrar?</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-sumi-soft">
          Si fabricás, tenés o conseguís equipamiento, podés publicarlo en Kamae. Creás tu
          cuenta, verificás tu email y yo apruebo tu perfil; desde ahí gestionás tus productos
          con tu propio WhatsApp.
        </p>
        <Link to="/login" className={`mt-6 ${botonPrimario}`}>
          Quiero publicar
        </Link>
      </section>
    </div>
  )
}

// El scroll de React Router (ScrollRestoration) pisa el salto nativo a un ancla dentro de
// la misma página: se hace explícito. Suave solo si no se pidió reducir animaciones.
function irAComoFunciona(event) {
  const destino = document.getElementById('como-funciona')
  if (!destino) return
  event.preventDefault()
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  destino.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' })
  window.history.replaceState(window.history.state, '', '#como-funciona')
}

function Ultimos({ productos }) {
  // Sin productos publicados todavía, la sección no se muestra.
  if (!productos.length) return null
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl sm:text-3xl">Lo último que se sumó</h2>
        <Link to="/catalogo" className={linkFlecha}>
          Ver todo el catálogo →
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  )
}

function UltimosCargando() {
  return (
    <section className="animate-pulse" aria-busy="true" aria-label="Cargando productos">
      <div className="h-8 w-64 rounded-sm bg-sumi/10" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {Array.from({ length: CANTIDAD_ULTIMOS }, (_, i) => (
          <div key={i}>
            <div className="aspect-square rounded-sm bg-sumi/10" />
            <div className="mt-3 h-4 w-3/4 rounded-sm bg-sumi/10" />
            <div className="mt-2 h-4 w-1/3 rounded-sm bg-sumi/10" />
          </div>
        ))}
      </div>
    </section>
  )
}
