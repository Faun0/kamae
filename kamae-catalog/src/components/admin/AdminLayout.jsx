import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { botonPrimario, botonSecundario, etiquetaClase, inputClase } from './estilos.js'
import {
  cerrarSesion,
  recargarSesion,
  reenviarVerificacion,
  solicitarAcceso,
} from '../../firebase/sesion.js'
import { suscribirUsuarios } from '../../firebase/usuariosAdmin.js'
import { useSesion } from '../../hooks/useSesion.js'

// Guardia de /admin. Es solo UX: la seguridad real está en firestore.rules.
export default function AdminLayout() {
  const { cargando, usuario, esAdmin, esVendedor, perfil } = useSesion()
  const location = useLocation()

  if (cargando) {
    return <p className="py-16 text-center text-sumi-soft">Verificando sesión…</p>
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }
  if (esAdmin || esVendedor) {
    return <Panel usuario={usuario} esAdmin={esAdmin} />
  }
  if (!perfil) return <SolicitarAcceso usuario={usuario} />
  if (!usuario.emailVerified) return <VerificarEmail usuario={usuario} perfil={perfil} />
  return <EstadoCuenta usuario={usuario} perfil={perfil} />
}

const tabClase = ({ isActive }) =>
  `rounded-sm px-2 py-1 transition-colors ${isActive ? 'bg-washi/15' : 'text-washi/70 hover:text-washi'}`

function Panel({ usuario, esAdmin }) {
  const pendientes = usePendientes(esAdmin)

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm bg-sumi px-4 py-2 text-sm text-washi">
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin" className="mr-2 font-medium tracking-wide">
            {esAdmin ? 'Panel de administración' : 'Panel de vendedor'}
          </Link>
          {esAdmin && (
            <>
              <NavLink to="/admin" end className={tabClase}>
                Productos
              </NavLink>
              <NavLink to="/admin/usuarios" className={tabClase}>
                Usuarios
                {pendientes > 0 && (
                  <span
                    className="ml-1.5 rounded-full bg-shu px-1.5 text-xs text-washi"
                    aria-label={`${pendientes} pendientes`}
                  >
                    {pendientes}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-washi/60 sm:inline">{usuario.email}</span>
          <button type="button" onClick={cerrarSesion} className="hover:text-shu">
            Salir
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  )
}

/** Cantidad de solicitudes pendientes (solo admin), para el contador de la pestaña. */
function usePendientes(esAdmin) {
  const [pendientes, setPendientes] = useState(0)
  useEffect(() => {
    if (!esAdmin) return
    return suscribirUsuarios(
      (usuarios) => setPendientes(usuarios.filter((u) => u.estado === 'pendiente').length),
      () => {},
    )
  }, [esAdmin])
  return esAdmin ? pendientes : 0
}

function Aviso({ titulo, children, acciones }) {
  return (
    <section className="mx-auto max-w-md py-12 text-center">
      <title>{`${titulo} · Kamae`}</title>
      <h1 className="font-serif text-2xl">{titulo}</h1>
      <div className="mt-3 space-y-2 text-sumi-soft">{children}</div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {acciones}
        <button type="button" onClick={cerrarSesion} className={botonSecundario}>
          Cerrar sesión
        </button>
      </div>
    </section>
  )
}

function SolicitarAcceso({ usuario }) {
  const [nombre, setNombre] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(event) {
    event.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await solicitarAcceso(nombre)
    } catch {
      setError('No se pudo enviar la solicitud. Probá de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <Aviso titulo="Pedir acceso para vender">
      <p>
        La cuenta {usuario.email} todavía no tiene acceso al panel. Pedilo y un
        administrador lo va a revisar.
      </p>
      <form onSubmit={enviar} className="mx-auto mt-4 max-w-xs space-y-3 text-left">
        <div>
          <label htmlFor="nombre-solicitud" className={etiquetaClase}>
            Tu nombre
          </label>
          <input
            id="nombre-solicitud"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={80}
            className={inputClase}
          />
        </div>
        {error && <p className="text-sm text-shu">{error}</p>}
        <button
          type="submit"
          disabled={enviando || !nombre.trim()}
          className={`w-full ${botonPrimario}`}
        >
          {enviando ? 'Enviando…' : 'Pedir acceso'}
        </button>
      </form>
    </Aviso>
  )
}

function VerificarEmail({ usuario, perfil }) {
  const [mensaje, setMensaje] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  async function ejecutar(accion, exito) {
    setOcupado(true)
    setMensaje(null)
    try {
      await accion()
      setMensaje(exito)
    } catch (e) {
      setMensaje(
        e.code === 'auth/too-many-requests'
          ? 'Demasiados intentos. Esperá unos minutos.'
          : 'No se pudo completar. Probá de nuevo.',
      )
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Aviso
      titulo="Verificá tu email"
      acciones={
        <>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => ejecutar(recargarSesion, 'Todavía no figura verificado. Revisá el link del email.')}
            className={botonPrimario}
          >
            Ya lo verifiqué
          </button>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => ejecutar(reenviarVerificacion, 'Te reenviamos el email.')}
            className={botonSecundario}
          >
            Reenviar email
          </button>
        </>
      }
    >
      <p>
        Te mandamos un link a <strong>{usuario.email}</strong>. Abrilo para confirmar que el
        email es tuyo (revisá Spam o Promociones).
      </p>
      {perfil.estado === 'pendiente' && (
        <p>Tu solicitud de acceso ya está enviada; un administrador la va a revisar.</p>
      )}
      {mensaje && (
        <p className="text-sm text-sumi" role="status">
          {mensaje}
        </p>
      )}
    </Aviso>
  )
}

const ESTADOS = {
  pendiente: {
    titulo: 'Solicitud enviada',
    texto: 'Un administrador tiene que aprobar tu cuenta antes de que puedas publicar. Volvé a entrar más tarde.',
  },
  rechazado: {
    titulo: 'Solicitud rechazada',
    texto: 'Tu solicitud para vender en Kamae no fue aprobada.',
  },
  suspendido: {
    titulo: 'Cuenta suspendida',
    texto: 'Tu cuenta de vendedor está suspendida y tus productos fueron dados de baja.',
  },
}

function EstadoCuenta({ perfil }) {
  const info = ESTADOS[perfil.estado] ?? ESTADOS.pendiente
  return (
    <Aviso
      titulo={info.titulo}
      acciones={
        perfil.estado === 'pendiente' && (
          <button type="button" onClick={recargarSesion} className={botonPrimario}>
            Volver a revisar
          </button>
        )
      }
    >
      <p>{info.texto}</p>
    </Aviso>
  )
}
