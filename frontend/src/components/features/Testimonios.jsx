import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Testimonios.css'

const Testimonios = () => {
  const { ref, inView } = useLazyLoad()
  const [currentTestimonio, setCurrentTestimonio] = useState(0)

  const testimonios = [
    {
      id: 1,
      name: 'María González',
      location: 'Ciudad de México',
      rating: 5,
      text: 'Una experiencia increíble en plena naturaleza. Las cabañas son hermosas y la ubicación perfecta para conocer Huasca. El servicio fue excepcional.',
      date: 'Diciembre 2023'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      location: 'Guadalajara',
      rating: 5,
      text: 'Perfecto para una escapada romántica. La cabaña tenía todo lo necesario y la vista al bosque era espectacular. Definitivamente regresaremos.',
      date: 'Noviembre 2023'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      location: 'Monterrey',
      rating: 5,
      text: 'Ideal para vacaciones familiares. Los niños disfrutaron mucho la alberca y nosotros la tranquilidad del lugar. Muy recomendable.',
      date: 'Octubre 2023'
    },
    {
      id: 4,
      name: 'Roberto Silva',
      location: 'Puebla',
      rating: 4,
      text: 'Excelente ubicación cerca de los prismas basálticos. Las cabañas están muy bien equipadas y el personal es muy amable.',
      date: 'Septiembre 2023'
    }
  ]

  const nextTestimonio = () => {
    setCurrentTestimonio((prev) => (prev + 1) % testimonios.length)
  }

  const prevTestimonio = () => {
    setCurrentTestimonio((prev) => (prev - 1 + testimonios.length) % testimonios.length)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#d4af37' : 'none'}
        color={i < rating ? '#d4af37' : '#ddd'}
      />
    ))
  }

  return (
    <section className="testimonios section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Lo que dicen nuestros huéspedes</h2>
          <p>Experiencias reales de quienes han disfrutado nuestras cabañas</p>
        </div>
        
        {inView && (
          <div className="testimonios-container">
            <div className="testimonio-card">
              <div className="quote-icon">
                <Quote size={40} />
              </div>
              
              <div className="testimonio-content">
                <div className="rating">
                  {renderStars(testimonios[currentTestimonio].rating)}
                </div>
                
                <p className="testimonio-text">
                  "{testimonios[currentTestimonio].text}"
                </p>
                
                <div className="testimonio-author">
                  <div className="author-info">
                    <h4>{testimonios[currentTestimonio].name}</h4>
                    <span className="location">{testimonios[currentTestimonio].location}</span>
                    <span className="date">{testimonios[currentTestimonio].date}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonios-controls">
              <button onClick={prevTestimonio} className="control-btn">
                <ChevronLeft size={20} />
              </button>
              
              <div className="testimonios-dots">
                {testimonios.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentTestimonio ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonio(index)}
                  />
                ))}
              </div>
              
              <button onClick={nextTestimonio} className="control-btn">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="testimonios-stats">
              <div className="stat">
                <span className="stat-number">150+</span>
                <span className="stat-label">Reseñas</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.8</span>
                <span className="stat-label">Calificación</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Recomiendan</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Testimonios