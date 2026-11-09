import { useState } from 'react'
import { Link } from 'react-router-dom'
import BotonWhatsApp from '../components/BotonWhatsApp.jsx'
import { useListaConsulta } from '../hooks/useListaConsulta.js'
import { formatearPrecio, totalesPorMoneda } from '../utils/formato.js'
import { claveItem, listaConsulta } from '../utils/listaConsulta.js'
import { agruparPorWhatsApp, mensajeLista } from '../utils/whatsapp.js'

export default function ListaConsulta() {
  const items = useListaConsulta()
  const [confirmarVaciar, setConfirmarVaciar] = useState(false)

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

  // Cada producto tiene su número de WhatsApp: un mensaje por número.
  const grupos = agruparPorWhatsApp(items)
  const varios = grupos.length > 1

  return (
    <section className="mx-auto max-w-2xl">
      <title>Lista de consulta · Kamae</title>
      <h1 className="font-serif text-3xl">Lista de consulta</h1>
      <p className="mt-2 text-sm text-sumi-soft">
        {varios
          ? `Tus productos los atienden ${grupos.length} vendedores distintos: enviá una consulta a cada uno.`
          : 'Enviá todos los productos en un solo mensaje.'}{' '}
        No es una compra: te respondemos por WhatsApp con disponibilidad y forma de pago.
      </p>

      {grupos.map((grupo, i) => (
        <GrupoConsulta
          key={grupo.numero ?? 'sin-numero'}
          grupo={grupo}
          titulo={varios ? `Consulta ${i + 1} de ${grupos.length}` : null}
        />
      ))}

      <div className="mt-8 text-center text-sm">
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

function GrupoConsulta({ grupo, titulo }) {
  const { numero, items } = grupo
  const totales = totalesPorMoneda(items)

  return (
    <div className="mt-8">
      {titulo && (
        <h2 className="mb-2 text-xs tracking-widest text-sumi-soft uppercase">{titulo}</h2>
      )}
      <ul className="divide-y divide-sumi/10 border-y border-sumi/10">
        {items.map((item) => (
          <ItemConsulta key={claveItem(item)} item={item} />
        ))}
      </ul>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-sumi-soft">{titulo ? 'Subtotal estimado' : 'Total estimado'}</span>
        {/* Una línea por moneda: no se suman pesos con dólares. */}
        <span className="text-right text-xl">
          {totales.map(({ moneda, total }, i) => (
            <span key={moneda} className="block">
              {i > 0 && '+ '}
              {formatearPrecio(total, moneda)}
            </span>
          ))}
        </span>
      </div>

      {numero ? (
        <BotonWhatsApp
          numero={numero}
          mensaje={mensajeLista(items)}
          evento={{ origen: 'lista', productos: items.length }}
          className="mt-4 w-full"
        >
          {titulo ? `Enviar consulta ${titulo.split(' ')[1]}` : 'Consultar todo por WhatsApp'}
        </BotonWhatsApp>
      ) : (
        <p className="mt-4 text-sm text-shu">
          Estos productos no tienen un WhatsApp de contacto. Abrí cada producto para ver
          sus datos actualizados.
        </p>
      )}
    </div>
  )
}

function ItemConsulta({ item }) {
  const clave = claveItem(item)
  return (
    <li className="flex items-center gap-4 py-4">
      <div className="min-w-0 flex-1">
        <Link to={`/producto/${item.slug}`} className="font-medium hover:text-shu">
          {item.nombre}
        </Link>
        {item.variante && <p className="text-sm text-sumi-soft">{item.variante}</p>}
        <p className="text-sm text-sumi-soft">{formatearPrecio(item.precio, item.moneda)}</p>
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
}
