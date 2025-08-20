import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const contactInfo = [
    { icon: MapPin, text: 'Carretera Huasca-San Miguel Regla Km 3, Huasca de Ocampo, Hidalgo' },
    { icon: Phone, text: '+52 771 797 0123' },
    { icon: Mail, text: 'reservas@cabanashuasca.com' }
  ]

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' }
  ]

  const quickLinks = [
    { href: '#inicio', text: 'Inicio' },
    { href: '#cabanas', text: 'Cabañas' },
    { href: '#availability', text: 'Disponibilidad' },
    { href: '#contacto', text: 'Contacto' }
  ]

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <h3>Cabañas Huasca</h3>
            <p>Pueblo Mágico</p>
          </div>
          <p className="footer-description">
            Descubre la magia de Huasca de Ocampo en nuestras cabañas rústicas. 
            Una experiencia única en el corazón de la naturaleza mexicana.
          </p>
        </div>

        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul className="footer-links">
            {quickLinks.map(({ href, text }) => (
              <li key={href}>
                <a href={href} aria-label={`Ir a ${text}`}>
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <div className="contact-info">
            {contactInfo.map(({ icon: Icon, text }) => (
              <div key={text} className="contact-item">
                <Icon size={16} aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="social-links">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a 
                key={label}
                href={href} 
                className="social-link"
                aria-label={`Seguir en ${label}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} Cabañas Huasca. Todos los derechos reservados.</p>
          <div className="footer-legal">
            <a href="#privacy" aria-label="Política de privacidad">Privacidad</a>
            <a href="#terms" aria-label="Términos de servicio">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer