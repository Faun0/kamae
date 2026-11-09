// Valores válidos del modelo `productos` (ver CLAUDE.md). Fuente única para filtros y formulario.

export const DISCIPLINAS = [
  { valor: 'kendo', etiqueta: 'Kendo' },
  { valor: 'iaido', etiqueta: 'Iaido' },
]

export const CATEGORIAS = [
  { valor: 'shinai', etiqueta: 'Shinai' },
  { valor: 'bokken', etiqueta: 'Bokken' },
  { valor: 'iaito', etiqueta: 'Iaito' },
  { valor: 'tsuba', etiqueta: 'Tsuba' },
  { valor: 'bogu', etiqueta: 'Bogu' },
  { valor: 'indumentaria', etiqueta: 'Indumentaria' },
  { valor: 'accesorios', etiqueta: 'Accesorios' },
]

export const MONEDAS = [
  { valor: 'ARS', etiqueta: 'ARS ($)' },
  { valor: 'USD', etiqueta: 'USD (US$)' },
]

// Límites que también valida firestore.rules.
export const MAX_IMAGENES = 10
export const MAX_VARIANTES = 30

export const DISPONIBILIDAD = [
  { valor: 'disponible', etiqueta: 'Disponible' },
  { valor: 'agotado', etiqueta: 'Agotado' },
  { valor: 'a_pedido', etiqueta: 'A pedido' },
]
