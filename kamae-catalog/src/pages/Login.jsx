import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { botonPrimario, etiquetaClase, inputClase } from '../components/admin/estilos.js'
import { iniciarSesion, recuperarContrasena, registrarse } from '../firebase/sesion.js'
import { useSesion } from '../hooks/useSesion.js'

const MIN_PASSWORD = 8

const MENSAJES_ERROR = {
  // Producción (con protección contra enumeración de emails) devuelve invalid-credential;
  // el emulador devuelve los otros dos. Mismo mensaje para no revelar si el email existe.
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/email-already-in-use': 'Ya hay una cuenta con ese email. Probá ingresar o recuperar la contraseña.',
  'auth/weak-password': `La contraseña tiene que tener al menos ${MIN_PASSWORD} caracteres.`,
  'auth/password-does-not-meet-requirements': 'La contraseña no cumple los requisitos de seguridad.',
  'auth/operation-not-allowed': 'El registro de cuentas nuevas está deshabilitado.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos y probá de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisá tu internet.',
}

const TITULOS = {
  ingresar: ['Ingresar', 'Acceso para administradores y vendedores.'],
  registro: ['Crear cuenta de vendedor', 'Después de registrarte, un administrador tiene que aprobar tu cuenta.'],
  recuperar: ['Recuperar contraseña', 'Te mandamos un email para elegir una contraseña nueva.'],
}

export default function Login() {
  const { cargando, usuario } = useSesion()
  const navigate = useNavigate()
  const destino = useLocation().state?.desde ?? '/admin'
  const [modo, setModo] = useState('ingresar')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Con sesión iniciada, /admin decide qué mostrar según el rol y el estado de la cuenta.
  if (!cargando && usuario && !enviando) return <Navigate to={destino} replace />

  function cambiarModo(nuevo) {
    setModo(nuevo)
    setError(null)
    setAviso(null)
  }

  function validar() {
    if (modo === 'registro') {
      if (!nombre.trim()) return 'Ingresá tu nombre.'
      if (password.length < MIN_PASSWORD) return MENSAJES_ERROR['auth/weak-password']
      if (password !== password2) return 'Las contraseñas no coinciden.'
    }
    return null
  }

  async function enviar(event) {
    event.preventDefault()
    setError(null)
    setAviso(null)
    const invalido = validar()
    if (invalido) return setError(invalido)

    setEnviando(true)
    try {
      if (modo === 'recuperar') {
        await recuperarContrasena(email.trim())
        // Mismo mensaje exista o no la cuenta (no revela qué emails están registrados).
        setAviso('Si hay una cuenta con ese email, te llegó un link para elegir una contraseña nueva.')
        setEnviando(false)
        return
      }
      if (modo === 'registro') {
        await registrarse({ nombre, email: email.trim(), password })
      } else {
        await iniciarSesion(email.trim(), password)
      }
      navigate(destino, { replace: true })
    } catch (e) {
      if (modo === 'recuperar' && e.code === 'auth/user-not-found') {
        setAviso('Si hay una cuenta con ese email, te llegó un link para elegir una contraseña nueva.')
      } else {
        setError(MENSAJES_ERROR[e.code] ?? 'No se pudo completar. Probá de nuevo.')
      }
      setEnviando(false)
    }
  }

  const [titulo, subtitulo] = TITULOS[modo]
  const textoBoton = {
    ingresar: enviando ? 'Ingresando…' : 'Ingresar',
    registro: enviando ? 'Creando cuenta…' : 'Crear cuenta',
    recuperar: enviando ? 'Enviando…' : 'Enviar email',
  }[modo]
  const incompleto =
    !email || (modo !== 'recuperar' && !password) || (modo === 'registro' && (!nombre || !password2))

  return (
    <section className="mx-auto max-w-sm py-8">
      <title>{`${titulo} · Kamae`}</title>
      <h1 className="font-serif text-2xl">{titulo}</h1>
      <p className="mt-1 text-sm text-sumi-soft">{subtitulo}</p>

      <form onSubmit={enviar} className="mt-8 space-y-4" noValidate>
        {modo === 'registro' && (
          <Campo id="nombre" etiqueta="Nombre">
            <input
              id="nombre"
              autoComplete="name"
              maxLength={80}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClase}
            />
          </Campo>
        )}
        <Campo id="email" etiqueta="Email">
          <input
            id="email"
            type="email"
            autoComplete={modo === 'registro' ? 'email' : 'username'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClase}
          />
        </Campo>
        {modo !== 'recuperar' && (
          <Campo id="password" etiqueta="Contraseña">
            <input
              id="password"
              type="password"
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClase}
            />
          </Campo>
        )}
        {modo === 'registro' && (
          <Campo id="password2" etiqueta="Repetí la contraseña">
            <input
              id="password2"
              type="password"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={inputClase}
            />
          </Campo>
        )}

        {error && (
          <p className="text-sm text-shu" role="alert">
            {error}
          </p>
        )}
        {aviso && (
          <p className="text-sm text-ai" role="status">
            {aviso}
          </p>
        )}

        <button type="submit" disabled={enviando || incompleto} className={`w-full ${botonPrimario}`}>
          {textoBoton}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        {modo === 'ingresar' && (
          <>
            <BotonModo onClick={() => cambiarModo('recuperar')}>¿Olvidaste tu contraseña?</BotonModo>
            <p className="text-sumi-soft">
              ¿Querés vender en Kamae?{' '}
              <BotonModo onClick={() => cambiarModo('registro')}>Crear cuenta</BotonModo>
            </p>
          </>
        )}
        {modo !== 'ingresar' && (
          <BotonModo onClick={() => cambiarModo('ingresar')}>← Volver a ingresar</BotonModo>
        )}
      </div>
    </section>
  )
}

function Campo({ id, etiqueta, children }) {
  return (
    <div>
      <label htmlFor={id} className={etiquetaClase}>
        {etiqueta}
      </label>
      {children}
    </div>
  )
}

function BotonModo({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="text-shu underline underline-offset-4">
      {children}
    </button>
  )
}
