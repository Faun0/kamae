import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EditorImagenes from '../../components/admin/EditorImagenes.jsx'
import EditorVariantes from '../../components/admin/EditorVariantes.jsx'
import {
  botonPrimario,
  botonSecundario,
  etiquetaClase,
  inputBase,
  inputClase,
} from '../../components/admin/estilos.js'
import {
  actualizarProducto,
  crearProducto,
  obtenerProducto,
  slugUnico,
} from '../../firebase/productosAdmin.js'
import { borrarImagenPorToken } from '../../utils/cloudinarySubida.js'
import { camposFaltantes } from '../../utils/completitud.js'
import { CATEGORIAS, DISCIPLINAS, DISPONIBILIDAD, MONEDAS } from '../../utils/constantes.js'
import { slugify } from '../../utils/slug.js'

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  disciplina: [],
  categoria: '',
  precio: '',
  moneda: 'ARS',
  disponibilidad: 'disponible',
  tiempoProduccion: '',
  variantes: [],
  imagenes: [],
  whatsapp: '', // en el form: solo los 10 dígitos locales (sin 549)
}

// El último número usado se recuerda en este navegador para precompletar productos nuevos.
const CLAVE_ULTIMO_WHATSAPP = 'kamae:admin:ultimo-whatsapp'

function leerUltimoWhatsApp() {
  try {
    return localStorage.getItem(CLAVE_ULTIMO_WHATSAPP) ?? ''
  } catch {
    return ''
  }
}

function recordarWhatsApp(local) {
  try {
    if (local) localStorage.setItem(CLAVE_ULTIMO_WHATSAPP, local)
  } catch {
    // Sin storage: no se precompleta la próxima vez.
  }
}

// Firestore → estado del formulario (números como string, keys locales para listas).
function aFormulario(p) {
  return {
    ...FORM_VACIO,
    ...p,
    precio: p.precio == null ? '' : String(p.precio),
    moneda: p.moneda ?? 'ARS',
    whatsapp: (p.whatsapp ?? '').replace(/^549/, ''),
    variantes: (p.variantes ?? []).map((v) => ({
      key: crypto.randomUUID(),
      etiqueta: v.etiqueta ?? '',
      precio: v.precio == null ? '' : String(v.precio),
      disponible: v.disponible !== false,
    })),
    imagenes: (p.imagenes ?? []).map((i) => ({ key: crypto.randomUUID(), alt: '', ...i })),
  }
}

// Estado del formulario → documento con EXACTAMENTE los campos que validan las reglas
// (sin slug ni fechas: los agregan el submit / productosAdmin).
// `visible` no se elige: se publica solo si está completo (utils/completitud.js).
function aFirestore(f) {
  const datos = {
    nombre: f.nombre.trim(),
    descripcion: f.descripcion.trim(),
    disciplina: f.disciplina,
    categoria: f.categoria,
    precio: f.precio === '' ? null : Number(f.precio),
    moneda: f.moneda,
    disponibilidad: f.disponibilidad,
    tiempoProduccion: f.disponibilidad === 'a_pedido' ? f.tiempoProduccion.trim() : '',
    variantes: f.variantes.map((v) => ({
      etiqueta: v.etiqueta.trim(),
      disponible: v.disponible,
      ...(v.precio !== '' && { precio: Number(v.precio) }),
    })),
    imagenes: f.imagenes.map(({ url, publicId, alt }) => ({
      url,
      publicId,
      alt: alt.trim(),
    })),
    whatsapp: f.whatsapp ? `549${f.whatsapp}` : '',
  }
  return { ...datos, visible: camposFaltantes(datos).length === 0 }
}

const esPrecioValido = (valor) => Number.isFinite(Number(valor)) && Number(valor) >= 0

// Solo errores de formato: lo que falte no bloquea, deja el producto como borrador.
function validar(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio (incluso para un borrador).'
  else if (!slugify(f.nombre)) e.nombre = 'El nombre tiene que incluir letras o números.'
  if (f.precio !== '' && !esPrecioValido(f.precio)) e.precio = 'Ingresá un precio válido.'
  if (f.whatsapp && !/^\d{10}$/.test(f.whatsapp)) {
    e.whatsapp = 'Tienen que ser 10 dígitos: código de área sin 0 + número sin 15.'
  }

  const variantes = {}
  for (const v of f.variantes) {
    if (!v.etiqueta.trim()) variantes[v.key] = 'Falta la etiqueta.'
    else if (v.precio !== '' && !esPrecioValido(v.precio)) variantes[v.key] = 'Precio inválido.'
  }
  if (Object.keys(variantes).length) e.variantes = variantes
  return e
}

export default function ProductoForm() {
  const { id } = useParams()
  // key: pasar de /admin/editar/a a /admin/nuevo reinicia el formulario.
  return <Formulario key={id ?? 'nuevo'} id={id} />
}

function Formulario({ id }) {
  const esEdicion = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(() =>
    esEdicion ? null : { ...FORM_VACIO, whatsapp: leerUltimoWhatsApp() },
  )
  const [errorCarga, setErrorCarga] = useState(null)
  const [errores, setErrores] = useState({})
  const [subiendo, setSubiendo] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState(null)

  useEffect(() => {
    if (!esEdicion) return
    let activo = true
    obtenerProducto(id)
      .then((p) => {
        if (!activo) return
        if (p) setForm(aFormulario(p))
        else setErrorCarga('El producto no existe (¿lo borraron?).')
      })
      .catch((e) => activo && setErrorCarga(e.message))
    return () => {
      activo = false
    }
  }, [id, esEdicion])

  if (errorCarga) {
    return (
      <div className="py-8">
        <p className="text-shu">{errorCarga}</p>
        <Link to="/admin" className="mt-4 inline-block underline underline-offset-4">
          Volver a la lista
        </Link>
      </div>
    )
  }
  if (!form) return <p className="py-8 text-sumi-soft">Cargando producto…</p>

  // Al editar un campo se borra su error (los demás se mantienen hasta el próximo guardado).
  function limpiarError(campo) {
    setErrores((e) => {
      if (!(campo in e)) return e
      const copia = { ...e }
      delete copia[campo]
      return copia
    })
  }

  function set(campo, valor) {
    setForm((f) => ({
      ...f,
      [campo]: typeof valor === 'function' ? valor(f[campo]) : valor,
    }))
    limpiarError(campo)
  }

  function alternarDisciplina(valor) {
    set('disciplina', (actual) =>
      actual.includes(valor) ? actual.filter((d) => d !== valor) : [...actual, valor],
    )
  }

  function cancelar() {
    // Las imágenes subidas en esta edición y no guardadas se borran de Cloudinary.
    form.imagenes.forEach((i) => borrarImagenPorToken(i.deleteToken))
    navigate('/admin')
  }

  async function guardar(event) {
    event.preventDefault()
    setErrorGuardar(null)
    const nuevosErrores = validar(form)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return

    setGuardando(true)
    try {
      const datos = aFirestore(form)
      if (esEdicion) {
        // La URL (slug) queda fija al editar: los links ya compartidos siguen andando.
        await actualizarProducto(id, datos)
      } else {
        const slug = await slugUnico(slugify(datos.nombre))
        await crearProducto({ ...datos, slug })
      }
      recordarWhatsApp(form.whatsapp)
      navigate('/admin')
    } catch (e) {
      setErrorGuardar(
        e.code === 'permission-denied'
          ? 'Firestore rechazó los datos (sin permisos o formato inválido).'
          : `No se pudo guardar: ${e.message}`,
      )
    } finally {
      setGuardando(false)
    }
  }

  const subidasEnCurso = subiendo.some((s) => !s.error)
  const faltantes = camposFaltantes({
    ...form,
    precio: form.precio === '' ? null : form.precio,
  })
  const mensajeError =
    errorGuardar ?? (Object.keys(errores).length > 0 ? 'Revisá los campos marcados.' : null)

  return (
    <form onSubmit={guardar} noValidate className="pb-28">
      <title>{`${esEdicion ? 'Editar' : 'Nuevo'} producto · Admin Kamae`}</title>
      <Link to="/admin" className="text-sm text-sumi-soft hover:text-sumi">
        ← Volver a la lista
      </Link>
      <h1 className="mt-4 font-serif text-2xl">
        {esEdicion ? `Editar: ${form.nombre || 'producto'}` : 'Nuevo producto'}
      </h1>

      <Seccion titulo="Información">
        <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
          <input
            id="nombre"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            maxLength={120}
            aria-invalid={Boolean(errores.nombre)}
            className={inputClase}
          />
        </Campo>
        <Campo id="descripcion" etiqueta="Descripción">
          <textarea
            id="descripcion"
            rows={5}
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
            maxLength={5000}
            className={inputClase}
          />
        </Campo>
      </Seccion>

      <Seccion titulo="Clasificación">
        <fieldset className="min-w-0">
          <legend className={etiquetaClase}>Disciplina</legend>
          <div className="flex gap-6">
            {DISCIPLINAS.map((d) => (
              <label key={d.valor} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.disciplina.includes(d.valor)}
                  onChange={() => alternarDisciplina(d.valor)}
                  className="accent-sumi"
                />
                {d.etiqueta}
              </label>
            ))}
          </div>
        </fieldset>
        <Campo id="categoria" etiqueta="Categoría">
          <select
            id="categoria"
            value={form.categoria}
            onChange={(e) => set('categoria', e.target.value)}
            className={inputClase}
          >
            <option value="">Elegí…</option>
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.etiqueta}
              </option>
            ))}
          </select>
        </Campo>
      </Seccion>

      <Seccion titulo="Precio y disponibilidad">
        <Campo id="precio" etiqueta="Precio" error={errores.precio}>
          <div className="flex gap-2">
            <select
              value={form.moneda}
              onChange={(e) => set('moneda', e.target.value)}
              aria-label="Moneda"
              className={`${inputBase} w-32 shrink-0`}
            >
              {MONEDAS.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.etiqueta}
                </option>
              ))}
            </select>
            <input
              id="precio"
              type="number"
              min="0"
              step={form.moneda === 'ARS' ? '1' : '0.01'}
              inputMode="decimal"
              value={form.precio}
              onChange={(e) => set('precio', e.target.value)}
              aria-invalid={Boolean(errores.precio)}
              className={`${inputBase} min-w-0 flex-1`}
            />
          </div>
        </Campo>
        <Campo id="disponibilidad" etiqueta="Disponibilidad">
          <select
            id="disponibilidad"
            value={form.disponibilidad}
            onChange={(e) => set('disponibilidad', e.target.value)}
            className={inputClase}
          >
            {DISPONIBILIDAD.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.etiqueta}
              </option>
            ))}
          </select>
        </Campo>
        {form.disponibilidad === 'a_pedido' && (
          <Campo id="tiempoProduccion" etiqueta="Tiempo de producción">
            <input
              id="tiempoProduccion"
              value={form.tiempoProduccion}
              onChange={(e) => set('tiempoProduccion', e.target.value)}
              placeholder="Ej. 7-10 días"
              maxLength={50}
              className={inputClase}
            />
          </Campo>
        )}
      </Seccion>

      <Seccion titulo="Contacto">
        <Campo
          id="whatsapp"
          etiqueta="WhatsApp de contacto"
          error={errores.whatsapp}
          ayuda="Código de área sin 0 + número sin 15. Ej: 351 1234567. Las consultas de este producto llegan a este número."
        >
          <div className="flex">
            <span className="flex items-center rounded-l-sm border border-r-0 border-sumi/20 bg-washi-dark px-3 text-sm text-sumi-soft">
              +54 9
            </span>
            <input
              id="whatsapp"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={form.whatsapp}
              // Solo dígitos (acepta pegar "351 123-4567"); máximo 10.
              onChange={(e) => set('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="3511234567"
              aria-invalid={Boolean(errores.whatsapp)}
              className={`${inputBase} min-w-0 flex-1 rounded-l-none font-mono`}
            />
          </div>
        </Campo>
      </Seccion>

      <Seccion titulo="Opciones (talles, colores…)" ancho>
        <EditorVariantes
          variantes={form.variantes}
          setVariantes={(v) => set('variantes', v)}
          errores={errores.variantes}
          moneda={form.moneda}
        />
        {errores.variantes && (
          <MensajeError>Revisá las opciones: {Object.values(errores.variantes)[0]}</MensajeError>
        )}
      </Seccion>

      <Seccion titulo="Imágenes" ancho>
        <EditorImagenes
          imagenes={form.imagenes}
          setImagenes={(v) => set('imagenes', v)}
          subiendo={subiendo}
          setSubiendo={setSubiendo}
        />
      </Seccion>

      {/* Barra de acciones fija abajo (cómoda en el celular). */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-sumi/10 bg-washi/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-3 px-4 py-3 sm:px-6">
          <div className="mr-auto text-sm">
            {mensajeError ? (
              <p className="text-shu" role="alert">
                {mensajeError}
              </p>
            ) : subidasEnCurso ? (
              <p className="text-sumi-soft">Esperando que terminen las subidas…</p>
            ) : faltantes.length === 0 ? (
              <p className="text-ai">✓ Completo: se publica en el catálogo al guardar.</p>
            ) : (
              <p className="text-sumi-soft">
                Se guarda como <strong>borrador</strong>. Para publicarlo falta:{' '}
                {faltantes.join(', ')}.
              </p>
            )}
          </div>
          <button type="button" onClick={cancelar} className={botonSecundario}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando || subidasEnCurso}
            className={botonPrimario}
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Seccion({ titulo, ancho = false, children }) {
  return (
    <section className="mt-8 border-t border-sumi/10 pt-6">
      <h2 className="font-serif text-lg">{titulo}</h2>
      <div className={`mt-4 space-y-4 ${ancho ? '' : 'max-w-xl'}`}>{children}</div>
    </section>
  )
}

function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div>
      <label htmlFor={id} className={etiquetaClase}>
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && <p className="mt-1 text-xs text-sumi-soft">{ayuda}</p>}
      {error && <MensajeError>{error}</MensajeError>}
    </div>
  )
}

function MensajeError({ children }) {
  return <p className="mt-1 text-sm text-shu">{children}</p>
}
