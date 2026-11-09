import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { botonPrimario, etiquetaClase, inputClase } from '../components/admin/estilos.js'
import { iniciarSesion } from '../firebase/sesion.js'
import { useSesion } from '../hooks/useSesion.js'

const MENSAJES_ERROR = {
  // Producción (con protección contra enumeración de emails) devuelve invalid-credential;
  // el emulador devuelve los otros dos. Mismo mensaje para no revelar si el email existe.
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos y probá de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisá tu internet.',
}

export default function Login() {
  const { cargando, usuario } = useSesion()
  const navigate = useNavigate()
  const destino = useLocation().state?.desde ?? '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Con sesión iniciada, /admin decide si tiene permisos.
  if (!cargando && usuario && !enviando) return <Navigate to={destino} replace />

  async function enviar(event) {
    event.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(email.trim(), password)
      navigate(destino, { replace: true })
    } catch (e) {
      setError(MENSAJES_ERROR[e.code] ?? 'No se pudo iniciar sesión.')
      setEnviando(false)
    }
  }

  return (
    <section className="mx-auto max-w-sm py-8">
      <title>Ingresar · Kamae</title>
      <h1 className="font-serif text-2xl">Ingresar</h1>
      <p className="mt-1 text-sm text-sumi-soft">Acceso para administración.</p>

      <form onSubmit={enviar} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className={etiquetaClase}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClase}
          />
        </div>
        <div>
          <label htmlFor="password" className={etiquetaClase}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClase}
          />
        </div>
        {error && (
          <p className="text-sm text-shu" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={enviando || !email || !password}
          className={`w-full ${botonPrimario}`}
        >
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </section>
  )
}
