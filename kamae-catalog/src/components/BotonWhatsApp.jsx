import IconoWhatsApp from './IconoWhatsApp.jsx'
import { registrarEvento } from '../firebase/analytics.js'
import { linkWhatsApp } from '../utils/whatsapp.js'

/** CTA principal: abre WhatsApp con el mensaje y registra `click_whatsapp`. */
export default function BotonWhatsApp({ numero, mensaje, evento, children, className = '' }) {
  if (!numero) return null

  return (
    <a
      href={linkWhatsApp(numero, mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => registrarEvento('click_whatsapp', evento)}
      className={`inline-flex items-center justify-center gap-2 rounded-sm bg-sumi px-6 py-3 font-medium text-washi transition-colors hover:bg-ai ${className}`}
    >
      <IconoWhatsApp />
      {children}
    </a>
  )
}
