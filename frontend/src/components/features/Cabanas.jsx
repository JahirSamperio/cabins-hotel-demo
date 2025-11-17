import { useState, useEffect } from 'react'
import { Users, Bed, Bath, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import LazyImage from '../ui/LazyImage'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import { cabinsAPI } from '../../services/api'
import './Cabanas.css'

const Cabanas = ({ showAll = false, limit = 3, cabanas: propCabanas }) => {
  const { ref, inView } = useLazyLoad()
  const navigate = useNavigate()
  const [cabanas, setCabanas] = useState(propCabanas || [])
  const [loading, setLoading] = useState(!propCabanas)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Si se pasan cabañas como prop, no cargar desde API
    if (propCabanas) {
      setCabanas(propCabanas)
      setLoading(false)
      return
    }

    const loadCabanas = async () => {
      try {
        setLoading(true)
        const response = await cabinsAPI.getAll()
        
        if (response.ok && response.cabins) {
          // Filtrar solo cabañas activas
          const activeCabins = response.cabins.filter(cabin => cabin.is_active)
          
          // Si no es showAll, mostrar solo las primeras 'limit' cabañas
          const displayCabins = showAll ? activeCabins : activeCabins.slice(0, limit)
          
          setCabanas(displayCabins)
        } else {
          setError('No se pudieron cargar las cabañas')
        }
      } catch (err) {
        console.error('Error loading cabins:', err)
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    if (inView && !propCabanas) {
      loadCabanas()
    }
  }, [inView, showAll, limit, propCabanas])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price)
  }

  const parseAmenities = (amenities) => {
    if (typeof amenities === 'string') {
      try {
        return JSON.parse(amenities)
      } catch {
        return []
      }
    }
    return Array.isArray(amenities) ? amenities : []
  }

  const getMainImage = (images) => {
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
      } catch {
        return null
      }
    }
    return Array.isArray(images) && images.length > 0 ? images[0] : null
  }

  if (loading && inView) {
    return (
      <section id="cabanas" className="cabanas section" ref={ref}>
        <div className="container">
          <div className="section-header text-center">
            <h2>Nuestras Cabañas</h2>
            <p>Espacios únicos diseñados para tu comodidad y descanso</p>
          </div>
          <div className="cabanas-loading">
            <div className="loading-spinner"></div>
            <p>Cargando cabañas...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="cabanas" className="cabanas section" ref={ref}>
        <div className="container">
          <div className="section-header text-center">
            <h2>Nuestras Cabañas</h2>
            <p>Espacios únicos diseñados para tu comodidad y descanso</p>
          </div>
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-secondary">
              Reintentar
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="cabanas" className="cabanas section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>{showAll ? 'Todas Nuestras Cabañas' : 'Nuestras Cabañas'}</h2>
          <p>Espacios únicos diseñados para tu comodidad y descanso</p>
        </div>

        {inView && cabanas.length > 0 && (
          <>
            <div className="cabanas-grid">
              {cabanas.map((cabana) => {
                const mainImage = getMainImage(cabana.images)
                const amenities = parseAmenities(cabana.amenities)
                
                return (
                  <div key={cabana.id} className="cabana-card">
                    <div className="cabana-image">
                      <LazyImage
                        src={mainImage || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80'}
                        alt={`${cabana.name} - Cabaña en Huasca de Ocampo`}
                        width={400}
                        height={250}
                      />
                      <div className="price-badge">
                        {formatPrice(cabana.price_per_night)}/noche
                      </div>
                    </div>
                    
                    <div className="cabana-content">
                      <h3>{cabana.name}</h3>
                      
                      {cabana.description && (
                        <p className="cabana-description">{cabana.description}</p>
                      )}
                      
                      <div className="cabana-specs">
                        <div className="spec">
                          <Users size={16} />
                          <span>{cabana.capacity} personas</span>
                        </div>
                      </div>

                      {amenities.length > 0 && (
                        <div className="cabana-features">
                          {amenities.slice(0, 4).map((feature, index) => (
                            <span key={index} className="feature-tag">
                              {feature}
                            </span>
                          ))}
                          {amenities.length > 4 && (
                            <span className="feature-tag more">
                              +{amenities.length - 4} más
                            </span>
                          )}
                        </div>
                      )}

                      <div className="cabana-actions">
                        <button 
                          onClick={() => {
                            console.log('Navegando a detalles:', `/cabana/${cabana.id}`)
                            navigate(`/cabana/${cabana.id}`)
                          }}
                          className="btn btn-secondary"
                        >
                          Ver Detalles
                        </button>
                        <button 
                          onClick={() => {
                            console.log('Navegando a reservar:', `/reservar?cabin=${cabana.id}`)
                            navigate(`/reservar?cabin=${cabana.id}`)
                          }}
                          className="btn btn-primary"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {!showAll && (
              <div className="text-center mt-4">
                <button 
                  onClick={() => {
                    console.log('Navegando a cabanas')
                    navigate('/cabanas')
                  }}
                  className="btn btn-outline"
                >
                  Ver Todas las Cabañas
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {inView && cabanas.length === 0 && !loading && (
          <div className="no-cabanas">
            <p>No hay cabañas disponibles en este momento.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Cabanas