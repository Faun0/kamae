// Textos compartidos entre la home y "Sobre Kamae" (fuente: README-home.md).

/** Pasos de "Cómo funciona": `resumen` en la home, `detalle` en /sobre. */
export const PASOS = [
  {
    titulo: 'Elegí.',
    resumen: 'Mirá el catálogo y encontrá el producto y la opción que necesitás.',
    detalle:
      'Recorré el catálogo y filtrá por disciplina (Kendo o Iaido) y por categoría. Cada producto muestra sus opciones (talles, colores), el precio y si está disponible, agotado o se hace a pedido.',
  },
  {
    titulo: 'Consultá.',
    resumen:
      'Escribile por WhatsApp a quien lo publicó, o sumá varios productos a tu lista de consulta y mandá un solo mensaje.',
    detalle:
      'El botón de WhatsApp abre una conversación con quien publicó el producto, con un mensaje que ya incluye qué te interesa. Si querés consultar varias cosas, sumalas a tu lista de consulta: se arma un mensaje por cada vendedor.',
  },
  {
    titulo: 'Coordiná.',
    resumen:
      'El precio, el pago y la entrega los acordás directamente con el vendedor. Kamae no participa de la venta.',
    detalle:
      'Todo lo que sigue se acuerda en esa conversación: disponibilidad, forma de pago, envío o entrega. Kamae no cobra, no recibe pagos ni interviene en la entrega.',
  },
  {
    titulo: 'Valorá.',
    proximamente: true,
    resumen: 'Contá cómo te fue, para que la comunidad sepa con quién conviene tratar.',
    detalle:
      'Más adelante vas a poder contar cómo te fue con cada vendedor, para que la comunidad sepa con quién conviene tratar.',
  },
]

// Secciones de /sobre que esperan confirmación del usuario antes de publicarse
// (ver README-home.md, "Pendientes"). Cambiar a true cuando estén revisadas.
export const SOBRE_PUBLICAR = {
  // El significado del nombre se revisa con un sensei o alguien que hable japonés.
  significadoNombre: false,
}
