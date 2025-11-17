import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Users, ArrowLeft, Calendar, MapPin, Wifi, Car, 
  Coffee, Flame, Bath, Bed, Star, ChevronLeft, ChevronRight 
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import SEOHead from '../components/ui/SEOHead'
import LazyImage from '../components/ui/LazyImage'
import { cabinsAPI } from '../services/api'
import './CabanaDetailPage.css'

const CabanaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cabana, setCabana] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const loadCabana = async () => {
      try {
        setLoading(true)
        const response = await cabinsAPI.getById(id)
        
        if (response.ok && response.cabin) {
          setCabana(response.cabin)
        } else {
          setError('Cabaña no encontrada')
        }
      } catch (err) {
        console.error('Error loading cabin:', err)
        setError('Error al cargar la cabaña')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadCabana()
    }
  }, [id])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price)
  }

  const parseImages = (images) => {
    if (typeof images === 'string') {
      try {
        return JSON.parse(images)
      } catch {
        return []
      }
    }
    return Array.isArray(images) ? images : []
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

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase()
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi size={20} />
    if (amenityLower.includes('estacionamiento') || amenityLower.includes('parking')) return <Car size={20} />
    if (amenityLower.includes('cocina') || amenityLower.includes('desayuno')) return <Coffee size={20} />
    if (amenityLower.includes('chimenea') || amenityLower.includes('fogata')) return <Flame size={20} />
    if (amenityLower.includes('baño') || amenityLower.includes('jacuzzi')) return <Bath size={20} />
    if (amenityLower.includes('habitación') || amenityLower.includes('cama')) return <Bed size={20} />
    return <Star size={20} />
  }

  const nextImage = () => {
    const images = parseImages(cabana?.images)
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = parseImages(cabana?.images)
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
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
            <h2 style={{ marginBottom: '1rem' }}>Cargando detalles de la cabaña</h2>
            <p style={{ color: '#6b7280' }}>ID: {id}</p>
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

  if (error || !cabana) {
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
            maxWidth: '500px',
            padding: '2rem'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>⚠️</div>
            <h2 style={{ 
              color: '#dc2626',
              marginBottom: '1rem'
            }}>Cabaña no encontrada</h2>
            <p style={{ 
              color: '#6b7280',
              marginBottom: '1rem'
            }}>ID buscado: {id}</p>
            <p style={{ 
              color: '#6b7280',
              marginBottom: '2rem'
            }}>{error || 'La cabaña que buscas no existe o no está disponible.'}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate(-1)}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Volver
              </button>
              <button 
                onClick={() => navigate('/')}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  background: '#2c5530',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const images = parseImages(cabana.images)
  const amenities = parseAmenities(cabana.amenities)

  return (
    <>
      <SEOHead 
        title={`${cabana.name} - Cabaña en Huasca de Ocampo | Reserva Ahora`}
        description={`${cabana.description || `Renta ${cabana.name} en Huasca de Ocampo`}. Capacidad para ${cabana.capacity} personas. Desde ${formatPrice(cabana.price_per_night)} por noche.`}
        canonical={`https://cabanashuasca.com/cabana/${cabana.id}`}
      />
      
      <Header />
      
      <main className="cabana-detail-page">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/cabanas">Cabañas</Link>
            <span>/</span>
            <span>{cabana.name}</span>
          </nav>

          {/* Back button */}
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={16} />
            Volver
          </button>

          <div className="cabana-detail-content">
            {/* Image Gallery */}
            <div className="image-gallery">
              {images.length > 0 ? (
                <>
                  <div className="main-image">
                    <LazyImage
                      src={images[currentImageIndex]}
                      alt={`${cabana.name} - Imagen ${currentImageIndex + 1}`}
                      width={800}
                      height={500}
                    />
                    {images.length > 1 && (
                      <>
                        <button className="image-nav prev" onClick={prevImage}>
                          <ChevronLeft size={24} />
                        </button>
                        <button className="image-nav next" onClick={nextImage}>
                          <ChevronRight size={24} />
                        </button>
                        <div className="image-counter">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="image-thumbnails">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img src={image} alt={`Miniatura ${index + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-image">
                  <p>Sin imágenes disponibles</p>
                </div>
              )}
            </div>

            {/* Cabin Info */}
            <div className="cabana-info">
              <div className="cabana-header">
                <h1>{cabana.name}</h1>
                <div className="price-info">
                  <span className="price">{formatPrice(cabana.price_per_night)}</span>
                  <span className="period">por noche</span>
                </div>
              </div>

              <div className="cabana-specs">
                <div className="spec">
                  <Users size={20} />
                  <span>Hasta {cabana.capacity} personas</span>
                </div>
                <div className="spec">
                  <MapPin size={20} />
                  <span>Huasca de Ocampo, Hidalgo</span>
                </div>
              </div>

              {cabana.description && (
                <div className="cabana-description">
                  <h3>Descripción</h3>
                  <p>{cabana.description}</p>
                </div>
              )}

              {amenities.length > 0 && (
                <div className="cabana-amenities">
                  <h3>Servicios y Amenidades</h3>
                  <div className="amenities-grid">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="booking-section">
                <div className="booking-card">
                  <h3>Reserva esta cabaña</h3>
                  <div className="booking-price">
                    <span className="price">{formatPrice(cabana.price_per_night)}</span>
                    <span>por noche</span>
                  </div>
                  <div className="booking-actions">
                    <Link 
                      to={`/reservar?cabin=${cabana.id}`} 
                      className="btn btn-primary btn-large"
                    >
                      <Calendar size={16} />
                      Reservar Ahora
                    </Link>
                    <Link to="/cabanas" className="btn btn-secondary">
                      Ver otras cabañas
                    </Link>
                  </div>
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

export default CabanaDetailPage