import { useEffect, useState } from 'react'
import { botonPrimario, botonSecundario, etiquetaClase, inputClase } from './estilos.js'
import { guardarPerfilPublico, obtenerPerfilPublico } from '../../firebase/vendedoresAdmin.js'

/**
 * Perfil público (nombre y ciudad) que se muestra en los productos de quien publica.
 * Un vendedor usa el nombre con el que fue aprobado (las reglas no le dejan otro);
 * el admin elige el suyo. `onCambio(perfil | null)` avisa si ya está completo.
 */
export default function PerfilPublico({ uid, esAdmin, perfil, onCambio }) {
  const [publico, setPublico] = useState(undefined) // undefined = cargando
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true
    obtenerPerfilPublico(uid)
      .then((datos) => {
        if (!activo) return
        setPublico(datos)
        onCambio?.(datos)
        // Valores iniciales: lo guardado, o lo que cargó al registrarse.
        setNombre(datos?.nombre ?? perfil?.nombre ?? '')
        setCiudad(datos?.ciudad ?? perfil?.ciudad ?? '')
      })
      .catch(() => activo && setPublico(null))
    return () => {
      activo = false
    }
    // Solo al montar / cambiar de usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  if (publico === undefined) return null

  async function guardar(event) {
    event.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      const datos = { nombre: esAdmin ? nombre : (perfil?.nombre ?? nombre), ciudad }
      await guardarPerfilPublico(uid, datos)
      const guardado = { nombre: datos.nombre.trim(), ciudad: datos.ciudad.trim() }
      setPublico(guardado)
      onCambio?.(guardado)
      setEditando(false)
    } catch (e) {
      setError(
        e.code === 'permission-denied'
          ? 'No se pudo guardar (¿tu cuenta sigue aprobada?).'
          : 'No se pudo guardar. Probá de nuevo.',
      )
    } finally {
      setGuardando(false)
    }
  }

  if (publico && !editando) {
    return (
      <p className="mb-6 text-sm text-sumi-soft">
        Tu perfil público: <strong className="font-medium text-sumi">{publico.nombre}</strong> ·{' '}
        {publico.ciudad}
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="ml-2 inline-flex min-h-11 items-center text-shu-texto underline underline-offset-4"
        >
          Editar
        </button>
      </p>
    )
  }

  return (
    <form
      onSubmit={guardar}
      className="mb-8 rounded-sm border border-shu/30 bg-shu/5 p-5"
      aria-labelledby="titulo-perfil-publico"
    >
      <h2 id="titulo-perfil-publico" className="font-serif text-xl">
        {publico ? 'Editar tu perfil público' : 'Completá tu perfil público'}
      </h2>
      <p className="mt-1 text-sm text-sumi-soft">
        Se muestra en tus productos para que quien compra sepa con quién va a hablar. Solo tu
        nombre y tu ciudad; tu email no se publica.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="perfil-nombre" className={etiquetaClase}>
            Nombre
          </label>
          <input
            id="perfil-nombre"
            value={esAdmin ? nombre : (perfil?.nombre ?? nombre)}
            onChange={(e) => setNombre(e.target.value)}
            readOnly={!esAdmin}
            maxLength={80}
            className={`${inputClase} read-only:bg-washi-dark read-only:text-sumi-soft`}
          />
          {!esAdmin && (
            <p className="mt-1 text-xs text-sumi-soft">Es el nombre con el que se aprobó tu cuenta.</p>
          )}
        </div>
        <div>
          <label htmlFor="perfil-ciudad" className={etiquetaClase}>
            Ciudad
          </label>
          <input
            id="perfil-ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            maxLength={60}
            placeholder="Ej.: Córdoba"
            className={inputClase}
          />
        </div>
      </div>
      {error && (
        <p className="mt-3 text-sm text-shu-texto" role="alert">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={guardando || !ciudad.trim() || !(esAdmin ? nombre.trim() : true)}
          className={botonPrimario}
        >
          {guardando ? 'Guardando…' : 'Guardar perfil público'}
        </button>
        {publico && (
          <button type="button" onClick={() => setEditando(false)} className={botonSecundario}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
