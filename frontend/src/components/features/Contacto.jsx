import { useState } from 'react'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Contacto.css'

const Contacto = () => {
  const { ref, inView } = useLazyLoad()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    cabin: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    setTimeout(() => {
      alert('¡Mensaje enviado correctamente! Te contactaremos pronto.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        cabin: '',
        message: ''
      })
      setIsSubmitting(false)
    }, 1000)
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono',
      value: '+52 771 797 0123',
      subtitle: 'Lun - Dom: 8:00 AM - 10:00 PM'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'reservas@cabanashuasca.com',
      subtitle: 'Respuesta en 24 horas'
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      value: 'Huasca de Ocampo, Hidalgo',
      subtitle: 'Pueblo Mágico de México'
    }
  ]

  return (
    <section id="contacto" className="contacto section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Contacto y Reservas</h2>
          <p>¿Listo para tu escapada? Contáctanos ahora</p>
        </div>
        
        {inView && (
          <div className="contacto-content">
            <div className="contacto-info">
              <h3>Información de Contacto</h3>
              
              <div className="info-cards">
                {contactInfo.map((info, index) => (
                  <div key={index} className="info-card">
                    <div className="info-icon">
                      <info.icon size={24} />
                    </div>
                    <div className="info-details">
                      <h4>{info.title}</h4>
                      <p>{info.value}</p>
                      <span>{info.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="contacto-form-container">
              <form onSubmit={handleSubmit} className="contacto-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre completo *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Huéspedes</label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} persona{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de entrada</label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de salida</label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Tipo de cabaña</label>
                  <select
                    name="cabin"
                    value={formData.cabin}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar cabaña</option>
                    <option value="familiar">Cabaña Familiar</option>
                    <option value="romantica">Cabaña Romántica</option>
                    <option value="premium">Cabaña Premium</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Mensaje adicional</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Cuéntanos sobre tu estadía ideal..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Contacto