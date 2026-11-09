// Un producto se publica solo si está completo; si no, queda como borrador.
// Mismo criterio que productoCompleto() en firestore.rules: mantenerlos sincronizados.

const REQUISITOS = [
  ['descripción', (p) => Boolean(p.descripcion?.trim())],
  ['disciplina', (p) => p.disciplina?.length > 0],
  ['categoría', (p) => Boolean(p.categoria)],
  ['precio', (p) => p.precio !== null && p.precio !== '' && p.precio !== undefined],
  ['imagen', (p) => p.imagenes?.length > 0],
]

/** Nombres de los datos que faltan para publicar (vacío = completo). */
export const camposFaltantes = (producto) =>
  REQUISITOS.filter(([, cumple]) => !cumple(producto)).map(([nombre]) => nombre)
