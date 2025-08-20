import { MapPin, Navigation } from 'lucide-react'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Mapa.css'

const Mapa = () => {
  const { ref, inView } = useLazyLoad()
  
  const ubicacion = {
    direccion: 'Carretera Huasca-San Miguel Regla Km 3',
    ciudad: 'Huasca de Ocampo, Hidalgo',
    codigoPostal: '43500',
    coordenadas: { lat: 20.2167, lng: -98.5667 }
  }



  return (
    <section className="mapa section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Nuestra Ubicación</h2>
          <p>Encuentra nuestras cabañas en el corazón del pueblo mágico</p>
        </div>
        
        {inView && (
          <>
            <div className="mapa-content">
              <div className="mapa-info">
                <div className="ubicacion-card">
                  <h3>Dirección</h3>
                  <div className="direccion-details">
                    <div className="direccion-item">
                      <MapPin size={24} />
                      <div>
                        <p><strong>{ubicacion.direccion}</strong></p>
                        <p>{ubicacion.ciudad}</p>
                        <p>C.P. {ubicacion.codigoPostal}</p>
                      </div>
                    </div>
                    
                    <div className="coordenadas">
                      <p><strong>Coordenadas:</strong></p>
                      <p>Lat: {ubicacion.coordenadas.lat}, Lng: {ubicacion.coordenadas.lng}</p>
                    </div>
                  </div>
                </div>
                

              </div>
              
              <div className="mapa-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.5!2d-98.5667!3d20.2167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1a0a0a0a0a0a0%3A0x0!2sHuasca%20de%20Ocampo%2C%20Hgo.!5e0!3m2!1ses!2smx!4v1640995200000"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Cabañas Huasca en Huasca de Ocampo, Hidalgo"
                ></iframe>
                
                <div className="mapa-controles">
                  <button 
                    className="btn-direcciones"
                    onClick={() => window.open(`https://www.google.com/maps/dir//${ubicacion.coordenadas.lat},${ubicacion.coordenadas.lng}`, '_blank')}
                  >
                    <Navigation size={16} />
                    Cómo llegar
                  </button>
                </div>
              </div>
            </div>
            

          </>
        )}
      </div>
    </section>
  )
}

export default Mapa