import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Calendar, Users, ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import SEOHead from '../components/ui/SEOHead'
import { cabinsAPI } from '../services/api'
import './ReservarPage.css'

const ReservarPage = () => {
  const [searchParams] = useSearchParams()
  const cabinId = searchParams.get('cabin')
  
  const [selectedCabin, setSelectedCabin] = useState(null)
  const [cabins, setCabins] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    cabin_id: cabinId || '',
    check_in: '',
    check_out: '',
    guests: 2,
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    special_requests: '',
    includes_breakfast: false,
    honeypot: '' // Campo trampa para bots
  })

  useEffect(() => {
    const loadCabins = async () => {
      try {
        setLoading(true)
        const response = await cabinsAPI.getAll()
        
        if (response.ok && response.cabins) {
          const activeCabins = response.cabins.filter(cabin => cabin.is_active)
          setCabins(activeCabins)
          
          if (cabinId) {
            const selected = activeCabins.find(cabin => cabin.id === cabinId)
            setSelectedCabin(selected)
          }
        }
      } catch (err) {
        console.error('Error loading cabins:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCabins()
  }, [cabinId])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const inputValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({ ...prev, [name]: inputValue }))
    
    if (name === 'cabin_id') {
      const selected = cabins.find(cabin => cabin.id === value)
      setSelectedCabin(selected)
    }
  }

  const calculateTotal = () => {
    if (!selectedCabin || !formData.check_in || !formData.check_out) return 0
    
    const checkIn = new Date(formData.check_in)
    const checkOut = new Date(formData.check_out)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    
    if (nights <= 0) return 0
    
    const basePrice = nights * selectedCabin.price_per_night
    const breakfastPrice = formData.includes_breakfast ? (formData.guests * nights * 150) : 0
    
    return basePrice + breakfastPrice
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones básicas
    const errors = []
    
    if (!selectedCabin) errors.push('Selecciona una cabaña')
    if (!formData.check_in) errors.push('Selecciona fecha de check-in')
    if (!formData.check_out) errors.push('Selecciona fecha de check-out')
    if (!formData.guest_name.trim()) errors.push('Ingresa tu nombre completo')
    if (!formData.guest_email.trim()) errors.push('Ingresa tu email')
    if (!formData.guest_phone.trim()) errors.push('Ingresa tu teléfono')
    
    if (formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (checkIn < today) errors.push('La fecha de check-in no puede ser pasada')
      if (checkOut <= checkIn) errors.push('La fecha de check-out debe ser posterior al check-in')
      
      const diffTime = checkOut - checkIn
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      if (diffDays > 30) errors.push('La estadía no puede ser mayor a 30 días')
    }
    
    if (formData.guest_phone && !/^[0-9]{10,}$/.test(formData.guest_phone.replace(/[^0-9]/g, ''))) {
      errors.push('Ingresa un teléfono válido (mínimo 10 dígitos)')
    }
    
    if (errors.length > 0) {
      Swal.fire({
        title: 'Errores en el formulario',
        html: errors.map(error => `• ${error}`).join('<br>'),
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
      return
    }
    
    setLoading(true)
    
    try {
      // Usar el endpoint específico para reservas de invitados
      const reservationData = {
        cabin_id: formData.cabin_id,
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests: parseInt(formData.guests),
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        special_requests: formData.special_requests,
        includes_breakfast: formData.includes_breakfast
      }
      
      const { reservationsAPI } = await import('../services/api')
      const response = await reservationsAPI.createGuest(reservationData)
      
      if (response.ok) {
        // Limpiar formulario
        setFormData({
          cabin_id: '',
          check_in: '',
          check_out: '',
          guests: 2,
          guest_name: '',
          guest_email: '',
          guest_phone: '',
          special_requests: '',
          includes_breakfast: false,
          honeypot: ''
        })
        setSelectedCabin(null)
        
        // Mostrar confirmación exitosa
        await Swal.fire({
          title: '¡Reserva Creada!',
          html: `
            <div style="text-align: left; margin: 1rem 0;">
              <p><strong>Cabaña:</strong> ${selectedCabin.name}</p>
              <p><strong>Fechas:</strong> ${formData.check_in} a ${formData.check_out}</p>
              <p><strong>Huéspedes:</strong> ${formData.guests}</p>
              <p><strong>Desayunador:</strong> ${formData.includes_breakfast ? 'Incluido (+$' + (formData.guests * nights * 150) + ')' : 'No incluido'}</p>
              <p><strong>Total:</strong> ${formatPrice(total)}</p>
            </div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
              Recibirás una confirmación por email. El hotel se pondrá en contacto contigo para confirmar la disponibilidad y coordinar el pago.
            </p>
          `,
          icon: 'success',
          confirmButtonColor: '#2c5530',
          confirmButtonText: 'Entendido'
        })
        
      } else {
        // Manejar errores específicos
        let title = 'Error'
        let icon = 'error'
        
        if (response.code === 'RATE_LIMIT_EXCEEDED') {
          title = 'Demasiadas reservas'
          icon = 'warning'
        } else if (response.code === 'CABIN_NOT_AVAILABLE') {
          title = 'No disponible'
          icon = 'warning'
        } else if (response.code === 'VALIDATION_ERROR') {
          title = 'Datos inválidos'
          icon = 'error'
        } else if (response.code === 'DUPLICATE_EMAIL' || response.code === 'DUPLICATE_PHONE') {
          title = 'Reserva duplicada'
          icon = 'info'
        }
        
        Swal.fire({
          title: title,
          text: response.msg || 'Error al procesar la reserva',
          icon: icon,
          confirmButtonColor: '#2c5530'
        })
      }
      
    } catch (error) {
      console.error('Error creating reservation:', error)
      
      let errorMessage = 'Error al crear la reserva'
      let showWhatsApp = true
      
      if (error.message === 'Failed to fetch') {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      } else if (error.name === 'TypeError') {
        errorMessage = 'Error de comunicación con el servidor. Intenta nuevamente.'
      }
      
      Swal.fire({
        title: 'Error de Conexión',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#2c5530',
        footer: showWhatsApp ? '<a href="https://wa.me/5215512345678" target="_blank">¿Necesitas ayuda? Contáctanos por WhatsApp</a>' : ''
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#2c5530'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2c5530',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 2rem'
            }}></div>
            <h2 style={{ marginBottom: '1rem' }}>Preparando formulario de reserva</h2>
            {cabinId && <p style={{ color: '#6b7280' }}>Cabaña ID: {cabinId}</p>}
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const total = calculateTotal()
  const nights = formData.check_in && formData.check_out ? 
    Math.ceil((new Date(formData.check_out) - new Date(formData.check_in)) / (1000 * 60 * 60 * 24)) : 0

  return (
    <>
      <SEOHead 
        title="Reservar Cabaña - Huasca de Ocampo | Reserva tu Estadía"
        description="Reserva tu cabaña en Huasca de Ocampo. Proceso simple y rápido para asegurar tu estadía en el pueblo mágico."
        canonical="https://cabanashuasca.com/reservar"
      />
      
      <Header />
      
      <main className="reservar-page">
        <div className="container">
          <div className="page-header">
            <Link to="/cabanas" className="back-link">
              <ArrowLeft size={16} />
              Volver a cabañas
            </Link>
            <h1>Reservar Cabaña</h1>
            <p>Completa la información para reservar tu estadía</p>
          </div>

          <div className="reservation-content">
            <form onSubmit={handleSubmit} className="reservation-form">
              <div className="form-section">
                <h3>Selecciona tu cabaña</h3>
                <select
                  name="cabin_id"
                  value={formData.cabin_id}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Selecciona una cabaña</option>
                  {cabins.map(cabin => (
                    <option key={cabin.id} value={cabin.id}>
                      {cabin.name} - {formatPrice(cabin.price_per_night)}/noche (hasta {cabin.capacity} personas)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <h3>Fechas de estadía</h3>
                <div className="date-inputs">
                  <div className="input-group">
                    <label>Check-in</label>
                    <input
                      type="date"
                      name="check_in"
                      value={formData.check_in}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Check-out</label>
                    <input
                      type="date"
                      name="check_out"
                      value={formData.check_out}
                      onChange={handleInputChange}
                      min={formData.check_in || new Date().toISOString().split('T')[0]}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Huéspedes</h3>
                <div className="input-group">
                  <label>Número de huéspedes</label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    {[...Array(selectedCabin?.capacity || 8)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'persona' : 'personas'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>Información del huésped</h3>
                <div className="guest-inputs">
                  <div className="input-group">
                    <label>Nombre completo *</label>
                    <input
                      type="text"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="input-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="guest_email"
                      value={formData.guest_email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="input-group">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      name="guest_phone"
                      value={formData.guest_phone}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="55 1234 5678"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Servicios adicionales</h3>
                <div className="input-group">
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      name="includes_breakfast"
                      checked={formData.includes_breakfast}
                      onChange={handleInputChange}
                      style={{width: 'auto'}}
                    />
                    Incluir servicio de desayunador (+$150 por persona por noche)
                  </label>
                  {formData.includes_breakfast && (
                    <small style={{color: '#2c5530', fontWeight: '500', marginTop: '0.5rem', display: 'block'}}>
                      Costo adicional: {formatPrice(formData.guests * nights * 150)}
                    </small>
                  )}
                </div>
              </div>

              {/* Campo honeypot invisible para detectar bots */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleInputChange}
                style={{ display: 'none' }}
                tabIndex="-1"
                autoComplete="off"
              />

              <div className="form-section">
                <h3>Solicitudes especiales</h3>
                <textarea
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="3"
                  placeholder="¿Alguna solicitud especial? (opcional)"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={loading || !selectedCabin || !formData.check_in || !formData.check_out}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    Confirmar Reserva
                  </>
                )}
              </button>
            </form>

            <div className="reservation-summary">
              <div className="summary-card">
                <h3>Resumen de reserva</h3>
                
                {selectedCabin && (
                  <div className="selected-cabin">
                    <h4>{selectedCabin.name}</h4>
                    <div className="cabin-details">
                      <span><Users size={16} /> Hasta {selectedCabin.capacity} personas</span>
                      <span>{formatPrice(selectedCabin.price_per_night)} por noche</span>
                    </div>
                  </div>
                )}

                {formData.check_in && formData.check_out && (
                  <div className="stay-details">
                    <div className="detail-row">
                      <span>Check-in:</span>
                      <span>{new Date(formData.check_in).toLocaleDateString('es-MX')}</span>
                    </div>
                    <div className="detail-row">
                      <span>Check-out:</span>
                      <span>{new Date(formData.check_out).toLocaleDateString('es-MX')}</span>
                    </div>
                    <div className="detail-row">
                      <span>Noches:</span>
                      <span>{nights}</span>
                    </div>
                    <div className="detail-row">
                      <span>Huéspedes:</span>
                      <span>{formData.guests}</span>
                    </div>
                  </div>
                )}

                {total > 0 && (
                  <div className="total-section">
                    <div className="detail-row">
                      <span>Alojamiento ({nights} {nights === 1 ? 'noche' : 'noches'}):</span>
                      <span>{formatPrice(nights * selectedCabin.price_per_night)}</span>
                    </div>
                    {formData.includes_breakfast && (
                      <div className="detail-row">
                        <span>Desayunador ({formData.guests} personas × {nights} {nights === 1 ? 'noche' : 'noches'}):</span>
                        <span>{formatPrice(formData.guests * nights * 150)}</span>
                      </div>
                    )}
                    <div className="total-row">
                      <span>Total:</span>
                      <span className="total-price">{formatPrice(total)}</span>
                    </div>
                  </div>
                )}

                <div className="summary-note">
                  <p><strong>Nota:</strong> Al confirmar, crearás tu reserva inmediatamente. Recibirás una confirmación por email con los detalles de pago.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  )
}

export default ReservarPage