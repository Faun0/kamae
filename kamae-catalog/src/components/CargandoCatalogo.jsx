// Esqueleto mientras se resuelve el primer loader (HydrateFallback del router).
export default function CargandoCatalogo() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Cargando">
      <div className="h-9 w-48 rounded-sm bg-sumi/10" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-square rounded-sm bg-sumi/10" />
            <div className="mt-3 h-4 w-3/4 rounded-sm bg-sumi/10" />
            <div className="mt-2 h-4 w-1/3 rounded-sm bg-sumi/10" />
          </div>
        ))}
      </div>
    </div>
  )
}
