import { MessageCircle } from 'lucide-react'
import './WhatsAppButton.css'

const WhatsAppButton = () => {
  const phoneNumber = '5217717970123'
  const message = 'Hola, me interesa reservar una cabaña en Huasca. ¿Podrían darme más información?'
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button 
      className="whatsapp-button"
      onClick={handleWhatsAppClick}
      aria-label="Contactar por WhatsApp para reservas"
      title="¡Contáctanos por WhatsApp!"
    >
      <MessageCircle size={24} />
      <span className="whatsapp-text">WhatsApp</span>
    </button>
  )
}

export default WhatsAppButton