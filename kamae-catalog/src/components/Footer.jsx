import IconoWhatsApp from './IconoWhatsApp.jsx'
import { linkWhatsApp } from '../utils/whatsapp.js'

export default function Footer() {
  return (
    <footer className="border-t border-sumi/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-sumi-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Kamae · Equipamiento para Kendo e Iaido</p>
        <a
          href={linkWhatsApp('¡Hola! Tengo una consulta sobre Kamae.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-sumi"
        >
          <IconoWhatsApp className="h-4 w-4" />
          Consultas por WhatsApp
        </a>
      </div>
    </footer>
  )
}
