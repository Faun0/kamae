import { useState } from 'react'
import { Link } from 'react-router-dom'
import BotonWhatsApp from '../components/BotonWhatsApp.jsx'
import { useListaConsulta } from '../hooks/useListaConsulta.js'
import { formatearPrecio } from '../utils/formato.js'
import { claveItem, listaConsulta } from '../utils/listaConsulta.js'
import { mensajeLista } from '../utils/whatsapp.js'

export default function ListaConsulta() {
  const items = useListaConsulta()
  const [confirmarVaciar, setConfirmarVaciar] = useState(false)
  const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0)

  if (items.length === 0) {
    return (
      <section className="py-16 text-center">
        <title>Lista de consulta · Kamae</title>
        <h1 className="font-serif text-2xl">Tu lista de consulta está vacía</h1>
        <p className="mt-2 text-sumi-soft">
          Agregá productos para consultarlos todos juntos por WhatsApp.
        </p>
        <Link to="/" className="mt-6 inline-block text-shu underline underline-offset-4">
          Ir al catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl">
      <title>Lista de consulta · Kamae</title>
      <h1 className="font-serif text-3xl">Lista de consulta</h1>
      <p className="mt-2 text-sm text-sumi-soft">
        Enviá todos los productos en un solo mensaje. No es una compra: te respondemos
        por WhatsApp con disponibilidad y forma de pago.
      </p>

      <ul className="mt-8 divide-y divide-sumi/10 border-y border-sumi/10">
        {items.map((item) => {
          const clave = claveItem(item)
          return (
            <li key={clave} className="flex items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <Link
                  to={`/producto/${item.slug}`}
                  className="font-medium hover:text-shu"
                >
                  {item.nombre}
                </Link>
                {item.variante && (
                  <p className="text-sm text-sumi-soft">{item.variante}</p>
                )}
                <p className="text-sm text-sumi-soft">{formatearPrecio(item.precio)}</p>
              </div>

              <div className="flex items-center rounded-sm border border-sumi/20">
                <button
                  type="button"
                  onClick={() => listaConsulta.cambiarCantidad(clave, item.cantidad - 1)}
                  className="px-3 py-1 text-sumi-soft hover:text-sumi"
                  aria-label={`Quitar una unidad de ${item.nombre}`}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{item.cantidad}</span>
                <button
                  type="button"
                  onClick={() => listaConsulta.cambiarCantidad(clave, item.cantidad + 1)}
                  className="px-3 py-1 text-sumi-soft hover:text-sumi"
                  aria-label={`Agregar una unidad de ${item.nombre}`}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => listaConsulta.quitar(clave)}
                className="text-sm text-sumi-soft hover:text-shu"
                aria-label={`Quitar ${item.nombre} de la lista`}
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex items-baseline justify-between">
        <span className="text-sumi-soft">Total estimado</span>
        <span className="text-xl">{formatearPrecio(total)}</span>
      </div>

      <BotonWhatsApp
        mensaje={mensajeLista(items)}
        evento={{ origen: 'lista', productos: items.length }}
        className="mt-6 w-full"
      >
        Consultar todo por WhatsApp
      </BotonWhatsApp>

      <div className="mt-4 text-center text-sm">
        {confirmarVaciar ? (
          <span className="text-sumi-soft">
            ¿Vaciar la lista?{' '}
            <button
              type="button"
              onClick={() => listaConsulta.vaciar()}
              className="text-shu underline underline-offset-4"
            >
              Sí, vaciar
            </button>{' '}
            ·{' '}
            <button
              type="button"
              onClick={() => setConfirmarVaciar(false)}
              className="underline underline-offset-4"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmarVaciar(true)}
            className="text-sumi-soft underline underline-offset-4 hover:text-sumi"
          >
            Vaciar lista
          </button>
        )}
      </div>
    </section>
  )
}
