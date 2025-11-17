import { useState, useEffect } from 'react'
import { Users, ArrowRight } from 'lucide-react'

const CabanasSimple = () => {
  const [cabanas, setCabanas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Datos de prueba
    const testCabanas = [
      {
        id: 'test-1',
        name: 'Cabaña Test 1',
        capacity: 4,
        price_per_night: 1200,
        description: 'Cabaña de prueba 1'
      },
      {
        id: 'test-2', 
        name: 'Cabaña Test 2',
        capacity: 6,
        price_per_night: 1500,
        description: 'Cabaña de prueba 2'
      }
    ]
    
    setTimeout(() => {
      setCabanas(testCabanas)
      setLoading(false)
    }, 1000)
  }, [])

  const handleNavigation = (url) => {
    console.log('Navegando a:', url)
    window.location.hash = url
  }

  if (loading) {
    return (
      <section className="cabanas section" style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Cargando cabañas...</h2>
        </div>
      </section>
    )
  }

  return (
    <section className="cabanas section" style={{ padding: '4rem 0', background: '#ffeb3b', border: '5px solid red' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ 
          background: 'red', 
          color: 'white', 
          padding: '2rem', 
          textAlign: 'center', 
          fontSize: '2rem', 
          fontWeight: 'bold',
          marginBottom: '2rem'
        }}>
          🔥 COMPONENTE CABAÑAS CARGADO 🔥
        </div>
        <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '2rem', background: '#00ff00', borderRadius: '8px', border: '3px solid blue' }}>
          <h3>Prueba de Navegación</h3>
          <button 
            onClick={() => {
              console.log('Botón de prueba clickeado')
              window.location.hash = '#/test'
            }}
            style={{
              padding: '2rem 3rem',
              background: '#ff0000',
              color: 'white',
              border: '5px solid black',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '2rem',
              fontWeight: 'bold',
              animation: 'blink 1s infinite'
            }}
          >
            🚀 BOTÓN DE PRUEBA - Click aquí
          </button>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Este botón debería llevarte a #/test</p>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2>Nuestras Cabañas (Simple)</h2>
          <p>Espacios únicos diseñados para tu comodidad y descanso</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {cabanas.map((cabana) => (
            <div key={cabana.id} style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #2c5530 0%, #1e3a21 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem'
              }}>
                Imagen de {cabana.name}
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#2c5530' }}>{cabana.name}</h3>
                <p style={{ marginBottom: '1rem', color: '#6b7280' }}>{cabana.description}</p>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  color: '#374151'
                }}>
                  <Users size={16} />
                  <span>{cabana.capacity} personas</span>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  <button 
                    onClick={() => handleNavigation(`/test/${cabana.id}`)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: 'transparent',
                      border: '1px solid #2c5530',
                      color: '#2c5530',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#2c5530'
                      e.target.style.color = 'white'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent'
                      e.target.style.color = '#2c5530'
                    }}
                  >
                    Ver Detalles
                  </button>
                  <button 
                    onClick={() => handleNavigation(`/test?cabin=${cabana.id}`)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: '#2c5530',
                      border: '1px solid #2c5530',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#1e3a21'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = '#2c5530'
                    }}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => handleNavigation('/test')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '2px solid #2c5530',
              color: '#2c5530',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#2c5530'
              e.target.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#2c5530'
            }}
          >
            Ver Todas las Cabañas
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default CabanasSimple