import { Link } from 'react-router-dom'
import { PASOS, SOBRE_PUBLICAR } from '../utils/contenido.js'

// "Sobre Kamae". Fuera por ahora (decisión del usuario): "Quién está detrás" y "Contacto".
// El significado del nombre se publica cuando esté confirmado (SOBRE_PUBLICAR).
export default function Sobre() {
  return (
    <article className="mx-auto max-w-2xl">
      <title>Sobre Kamae · La vidriera de la comunidad de Kendo e Iaido</title>
      <meta
        name="description"
        content="Qué es Kamae, por qué existe y cómo funciona: una vidriera comunitaria y sin fines de lucro de equipamiento para Kendo e Iaido."
      />

      <header>
        <p className="font-serif text-shu" aria-hidden="true">
          構え
        </p>
        <h1 className="mt-1 font-serif text-4xl">Sobre Kamae</h1>
      </header>

      <Seccion titulo="Qué es Kamae">
        <p>
          Kamae es una <strong>vidriera comunitaria sin fines de lucro</strong> para la gente
          de Kendo e Iaido de Argentina. Acá la comunidad muestra lo que fabrica, tiene o
          consigue, sin tener que publicar en muchos lugares distintos.
        </p>
        <p>
          Kamae no es intermediaria: no cobra comisión y no participa del pago ni de la
          entrega. Cada vendedor es responsable de lo que publica y de la venta.
        </p>
      </Seccion>

      <Seccion titulo="Por qué existe">
        <p>
          Buena parte del equipamiento de Kendo e Iaido es difícil de conseguir en el país, y
          quien tiene algo para ofrecer termina publicándolo en muchos lugares distintos. Para
          la comunidad eso es incómodo: hay que buscar en todos lados. Kamae junta todo en un
          solo sitio.
        </p>
      </Seccion>

      {SOBRE_PUBLICAR.significadoNombre && (
        <Seccion titulo="Qué significa el nombre">
          <p>
            構え (<em>kamae</em>) es la postura de guardia: la posición desde la que empieza
            todo en Kendo y en Iaido. Estar listo, firme y atento antes de actuar. Elegí ese
            nombre porque quiero que el sitio sea eso para la comunidad: el punto de partida
            para conseguir y mostrar el equipamiento. El mismo carácter se usa en 店構え (
            <em>misegamae</em>), la fachada o vidriera de un local, que también encaja con la
            idea del proyecto.
          </p>
        </Seccion>
      )}

      <Seccion titulo="Cómo funciona">
        <ol className="space-y-5">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="flex gap-4">
              <span className="font-serif text-2xl leading-none text-shu">{i + 1}</span>
              <div>
                <h3 className="flex flex-wrap items-center gap-2 font-medium text-sumi">
                  {paso.titulo}
                  {paso.proximamente && (
                    <span className="rounded-sm bg-sumi/10 px-2 py-0.5 text-xs font-normal text-sumi-soft">
                      Próximamente
                    </span>
                  )}
                </h3>
                <p className="mt-1">{paso.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
      </Seccion>

      <Seccion titulo="Responsabilidades">
        <p>
          Kamae solo ofrece la vidriera. Cada vendedor es responsable de lo que publica, de la
          venta y de la entrega. No hay comisiones ni pagos dentro del sitio.
        </p>
      </Seccion>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-sumi/10 pt-8">
        <Link
          to="/catalogo"
          className="inline-flex items-center justify-center rounded-sm bg-sumi px-6 py-3 font-medium text-washi transition-colors hover:bg-ai"
        >
          Ver catálogo
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-sm border border-sumi/30 px-6 py-3 font-medium transition-colors hover:border-sumi"
        >
          Quiero publicar
        </Link>
      </div>
    </article>
  )
}

function Seccion({ titulo, children }) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl">{titulo}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-sumi-soft">{children}</div>
    </section>
  )
}
