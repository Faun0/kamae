import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { suscribirProductos } from '../../firebase/productosAdmin.js'
import {
  aprobarUsuario,
  eliminarUsuario,
  rechazarUsuario,
  suscribirUsuarios,
  suspenderUsuario,
} from '../../firebase/usuariosAdmin.js'
import { useSesion } from '../../hooks/useSesion.js'

const GRUPOS = [
  { estado: 'pendiente', titulo: 'Solicitudes pendientes', vacio: 'No hay solicitudes pendientes.' },
  { estado: 'aprobado', titulo: 'Vendedores aprobados', vacio: 'Todavía no hay vendedores aprobados.' },
  { estado: 'suspendido', titulo: 'Suspendidos' },
  { estado: 'rechazado', titulo: 'Rechazados' },
]

const fecha = (ts) =>
  ts?.toDate?.().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) ?? '—'

export default function AdminUsuarios() {
  const { esAdmin } = useSesion()
  const [usuarios, setUsuarios] = useState(null)
  const [cantidades, setCantidades] = useState({}) // vendedorUid → cantidad de productos
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [confirmando, setConfirmando] = useState(null) // { uid, accion }
  const [ocupado, setOcupado] = useState(null)

  useEffect(() => {
    if (!esAdmin) return
    return suscribirUsuarios(setUsuarios, setError)
  }, [esAdmin])

  useEffect(() => {
    if (!esAdmin) return
    return suscribirProductos((productos) => {
      const conteo = {}
      for (const p of productos) conteo[p.vendedorUid] = (conteo[p.vendedorUid] ?? 0) + 1
      setCantidades(conteo)
    }, setError)
  }, [esAdmin])

  // Solo el admin gestiona usuarios (las reglas tampoco dejan a nadie más).
  if (!esAdmin) return <Navigate to="/admin" replace />

  async function ejecutar(usuario, accion) {
    setOcupado(usuario.uid)
    setError(null)
    setAviso(null)
    try {
      const resultado = await accion.fn(usuario.uid)
      setAviso(accion.exito(usuario, resultado))
    } catch (e) {
      setError(e)
    } finally {
      setOcupado(null)
      setConfirmando(null)
    }
  }

  const ACCIONES = {
    aprobar: {
      etiqueta: 'Aprobar',
      fn: aprobarUsuario,
      exito: (u) => `${u.nombre} ya puede publicar.`,
    },
    rechazar: {
      etiqueta: 'Rechazar',
      fn: rechazarUsuario,
      exito: (u) => `Solicitud de ${u.nombre} rechazada.`,
    },
    reactivar: {
      etiqueta: 'Reactivar',
      fn: aprobarUsuario,
      exito: (u) => `${u.nombre} puede volver a publicar.`,
    },
    suspender: {
      etiqueta: 'Suspender',
      fn: suspenderUsuario,
      peligro: true,
      confirmacion: (n) =>
        n ? `¿Suspender? Se borran sus ${n} producto${n === 1 ? '' : 's'}.` : '¿Suspender?',
      exito: (u, n) => `${u.nombre} suspendido. Productos borrados: ${n}.`,
    },
    eliminar: {
      etiqueta: 'Eliminar',
      fn: eliminarUsuario,
      peligro: true,
      confirmacion: (n) =>
        n
          ? `¿Eliminar? Se borran su perfil y sus ${n} producto${n === 1 ? '' : 's'}.`
          : '¿Eliminar su perfil?',
      exito: (u, n) => `${u.nombre} eliminado. Productos borrados: ${n}.`,
    },
  }

  const accionesPorEstado = {
    pendiente: ['aprobar', 'rechazar'],
    aprobado: ['suspender', 'eliminar'],
    suspendido: ['reactivar', 'eliminar'],
    rechazado: ['aprobar', 'eliminar'],
  }

  return (
    <section>
      <title>Usuarios · Admin Kamae</title>
      <h1 className="font-serif text-2xl">Usuarios</h1>
      <p className="mt-1 text-sm text-sumi-soft">
        Las personas que se registran quedan pendientes hasta que las apruebes. Un vendedor
        solo puede ver y editar sus propios productos. Suspender o eliminar borra todos sus
        productos.
      </p>

      {error && (
        <p className="mt-4 rounded-sm bg-shu/10 px-3 py-2 text-sm text-shu" role="alert">
          Error: {error.code === 'permission-denied' ? 'sin permisos.' : error.message}
        </p>
      )}
      {aviso && (
        <p className="mt-4 rounded-sm bg-ai/10 px-3 py-2 text-sm text-ai" role="status">
          {aviso}
        </p>
      )}
      {usuarios === null && !error && <p className="mt-8 text-sumi-soft">Cargando usuarios…</p>}

      {usuarios &&
        GRUPOS.map(({ estado, titulo, vacio }) => {
          const lista = usuarios.filter((u) => u.estado === estado)
          if (!lista.length && !vacio) return null
          return (
            <div key={estado} className="mt-8">
              <h2 className="text-xs tracking-widest text-sumi-soft uppercase">
                {titulo} ({lista.length})
              </h2>
              {lista.length === 0 ? (
                <p className="mt-2 text-sm text-sumi-soft">{vacio}</p>
              ) : (
                <ul className="mt-2 divide-y divide-sumi/10 border-y border-sumi/10">
                  {lista.map((u) => {
                    const productos = cantidades[u.uid] ?? 0
                    return (
                      <li
                        key={u.uid}
                        className={`flex flex-wrap items-center gap-x-4 gap-y-2 py-3 ${ocupado === u.uid ? 'opacity-50' : ''}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{u.nombre}</p>
                          <p className="text-sm break-all text-sumi-soft">{u.email}</p>
                          <p className="mt-0.5 text-xs text-sumi-soft">
                            Solicitó el {fecha(u.fechaSolicitud)}
                            {estado !== 'pendiente' && ` · ${productos} producto${productos === 1 ? '' : 's'}`}
                            {!u.emailVerificado && (
                              <span className="ml-2 text-shu">· Email sin verificar</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {confirmando?.uid === u.uid ? (
                            <>
                              <span className="text-shu">
                                {ACCIONES[confirmando.accion].confirmacion(productos)}
                              </span>
                              <button
                                type="button"
                                onClick={() => ejecutar(u, ACCIONES[confirmando.accion])}
                                className="font-medium text-shu"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmando(null)}
                                className="text-sumi-soft"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            accionesPorEstado[estado].map((clave) => {
                              const accion = ACCIONES[clave]
                              return (
                                <button
                                  key={clave}
                                  type="button"
                                  disabled={ocupado === u.uid}
                                  onClick={() =>
                                    accion.peligro
                                      ? setConfirmando({ uid: u.uid, accion: clave })
                                      : ejecutar(u, accion)
                                  }
                                  className={
                                    accion.peligro
                                      ? 'text-sumi-soft hover:text-shu'
                                      : 'font-medium text-ai hover:text-sumi'
                                  }
                                >
                                  {accion.etiqueta}
                                </button>
                              )
                            })
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}

      <p className="mt-10 text-xs text-sumi-soft">
        Eliminar borra el perfil, pero la cuenta de acceso sigue existiendo: esa persona podría
        volver a pedir acceso y aparecería como pendiente. Para bloquearla, usá Suspender.
      </p>
    </section>
  )
}
