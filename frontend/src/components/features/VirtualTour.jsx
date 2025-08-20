import { Camera, Play, Eye } from 'lucide-react'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import LazyImage from '../ui/LazyImage'
import './VirtualTour.css'

const VirtualTour = () => {
  const { ref, inView } = useLazyLoad()

  const tourSpots = [
    {
      title: 'Exterior de la Cabaña',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
      description: 'Vista panorámica del exterior rústico'
    },
    {
      title: 'Sala Principal',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
      description: 'Espacio acogedor con chimenea'
    },
    {
      title: 'Área de Alberca',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
      description: 'Alberca privada con vista al bosque'
    }
  ]

  return (
    <section id="virtual-tour" className="virtual-tour section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Tour Virtual 360°</h2>
          <p>Explora nuestras cabañas desde la comodidad de tu hogar</p>
        </div>
        
        {inView && (
          <div className="tour-content">
            <div className="tour-main">
              <div className="tour-placeholder">
                <Camera size={64} />
                <h3>Tour Virtual Interactivo</h3>
                <p>Próximamente disponible</p>
                <p>Recorrido 360° por nuestras instalaciones</p>
                <button className="btn-tour" disabled>
                  <Play size={16} />
                  Iniciar Tour
                </button>
              </div>
            </div>
            
            <div className="tour-preview">
              <h3>Vista Previa</h3>
              <div className="preview-grid">
                {tourSpots.map((spot, index) => (
                  <div key={index} className="preview-card">
                    <div className="preview-image">
                      <LazyImage
                        src={spot.image}
                        alt={spot.title}
                        width={400}
                        height={250}
                      />
                      <div className="preview-overlay">
                        <Eye size={24} />
                      </div>
                    </div>
                    <div className="preview-info">
                      <h4>{spot.title}</h4>
                      <p>{spot.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default VirtualTour