import { Waves, Utensils, Flame, Car, Wifi, Mountain } from 'lucide-react'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Servicios.css'

const Servicios = () => {
  const { ref, inView } = useLazyLoad()
  
  const servicios = [
    {
      id: 1,
      icon: Waves,
      title: 'Alberca',
      description: 'Disfruta de nuestra alberca con agua cristalina y vista panorámica.'
    },
    {
      id: 2,
      icon: Utensils,
      title: 'Cocina Equipada',
      description: 'Cocinas completamente equipadas para preparar tus comidas favoritas.'
    },
    {
      id: 3,
      icon: Flame,
      title: 'Chimenea',
      description: 'Noches acogedoras junto al fuego en nuestras chimeneas de leña.'
    },
    {
      id: 4,
      icon: Car,
      title: 'Estacionamiento',
      description: 'Estacionamiento privado y seguro para tu vehículo.'
    },
    {
      id: 5,
      icon: Wifi,
      title: 'WiFi Gratuito',
      description: 'Conexión a internet de alta velocidad en todas las áreas.'
    },
    {
      id: 6,
      icon: Mountain,
      title: 'Vista Panorámica',
      description: 'Vistas espectaculares de los bosques y montañas de Huasca.'
    }
  ]

  return (
    <section className="servicios section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Servicios y Amenidades</h2>
          <p>Todo lo que necesitas para una estadía perfecta</p>
        </div>
        
        {inView && (
          <div className="servicios-grid">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="servicio-card">
                <div className="servicio-icon">
                  <servicio.icon size={40} />
                </div>
                <h3>{servicio.title}</h3>
                <p>{servicio.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Servicios