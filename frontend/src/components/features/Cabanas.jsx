import { Users, Bed, Bath, Wifi } from 'lucide-react'
import LazyImage from '../ui/LazyImage'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Cabanas.css'

const Cabanas = () => {
  const { ref, inView } = useLazyLoad()

  const cabanas = [
    {
      id: 1,
      name: 'Cabaña Familiar',
      capacity: 6,
      bedrooms: 2,
      bathrooms: 2,
      price: 1200,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
      features: ['Cocina equipada', 'Chimenea', 'Terraza privada', 'WiFi']
    },
    {
      id: 2,
      name: 'Cabaña Romántica',
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      price: 900,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
      features: ['Jacuzzi privado', 'Vista al bosque', 'Desayunador', 'WiFi']
    }
  ]

  return (
    <section id="cabanas" className="cabanas section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Nuestras Cabañas</h2>
          <p>Espacios únicos diseñados para tu comodidad y descanso</p>
        </div>

        {inView && (
          <div className="cabanas-grid">
            {cabanas.map((cabana) => (
              <div key={cabana.id} className="cabana-card">
                <div className="cabana-image">
                  <LazyImage
                    src={cabana.image}
                    alt={`${cabana.name} - Cabaña en Huasca de Ocampo`}
                    width={400}
                    height={250}
                  />
                  <div className="price-badge">
                    ${cabana.price}/noche
                  </div>
                </div>
                
                <div className="cabana-content">
                  <h3>{cabana.name}</h3>
                  
                  <div className="cabana-specs">
                    <div className="spec">
                      <Users size={16} />
                      <span>{cabana.capacity} personas</span>
                    </div>
                    <div className="spec">
                      <Bed size={16} />
                      <span>{cabana.bedrooms} habitaciones</span>
                    </div>
                    <div className="spec">
                      <Bath size={16} />
                      <span>{cabana.bathrooms} baños</span>
                    </div>
                  </div>

                  <div className="cabana-features">
                    {cabana.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button className="btn btn-primary">
                    Ver Disponibilidad
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Cabanas