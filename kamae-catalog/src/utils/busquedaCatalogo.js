// Texto del buscador del catálogo, compartido entre el header (donde se escribe) y la
// página /catalogo (donde se filtra). Vive fuera de la URL mientras se tipea: leer la URL en
// cada tecla perdía letras. `pages/Catalogo.jsx` la sincroniza con `?q=` (300 ms de espera).
let texto = ''
// Último valor de ?q= conocido: distingue los cambios de URL propios (al dejar de tipear) de
// los externos (atrás/adelante), para no pisar lo que se está escribiendo.
let enUrl = ''
const oyentes = new Set()

export const busquedaCatalogo = {
  get: () => texto,
  set(valor) {
    if (valor === texto) return
    texto = valor
    oyentes.forEach((oyente) => oyente())
  },
  subscribe(oyente) {
    oyentes.add(oyente)
    return () => oyentes.delete(oyente)
  },
  /** Al entrar a /catalogo: el campo arranca con el ?q= de la URL. */
  iniciar(q) {
    enUrl = q
    busquedaCatalogo.set(q)
  },
  /** La URL cambió: si no fue por nosotros, el campo toma ese valor. */
  desdeUrl(q) {
    if (q === enUrl) return
    busquedaCatalogo.iniciar(q)
  },
  /** Vamos a escribir este ?q= en la URL. */
  escritoEnUrl(q) {
    enUrl = q
  },
}
