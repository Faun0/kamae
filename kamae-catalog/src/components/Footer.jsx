export default function Footer() {
  return (
    <footer className="border-t border-sumi/10">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-sumi-soft sm:px-6">
        © {new Date().getFullYear()} Kamae · Equipamiento para Kendo e Iaido
      </div>
    </footer>
  )
}
