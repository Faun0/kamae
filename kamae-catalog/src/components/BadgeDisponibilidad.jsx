const ESTILOS = {
  disponible: { texto: 'Disponible', clase: 'bg-ai/10 text-ai' },
  a_pedido: { texto: 'A pedido', clase: 'bg-shu/10 text-shu' },
  agotado: { texto: 'Agotado', clase: 'bg-sumi/10 text-sumi-soft' },
}

export default function BadgeDisponibilidad({ disponibilidad, className = '' }) {
  const estilo = ESTILOS[disponibilidad] ?? ESTILOS.disponible
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium tracking-wide ${estilo.clase} ${className}`}
    >
      {estilo.texto}
    </span>
  )
}
