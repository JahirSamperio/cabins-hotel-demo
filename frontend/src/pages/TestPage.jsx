import { useParams, useSearchParams, Link } from 'react-router-dom'

const TestPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const cabin = searchParams.get('cabin')
  
  console.log('TestPage loaded!', { id, cabin })

  return (
    <div style={{ 
      padding: '4rem', 
      textAlign: 'center',
      background: '#ff0000',
      color: 'white',
      minHeight: '100vh',
      fontSize: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '2rem' }}>
        🎉 ¡FUNCIONA! 🎉
      </h1>
      <h2>Página de Prueba Cargada Correctamente</h2>
      <p>Esta es una página de prueba para verificar que las rutas funcionen.</p>
      
      {id && <p style={{ background: 'yellow', color: 'black', padding: '1rem', margin: '1rem 0' }}>
        <strong>ID de cabaña:</strong> {id}
      </p>}
      {cabin && <p style={{ background: 'green', color: 'white', padding: '1rem', margin: '1rem 0' }}>
        <strong>Parámetro cabin:</strong> {cabin}
      </p>}
      
      <div style={{ marginTop: '3rem' }}>
        <button 
          onClick={() => {
            const navigate = () => window.location.href = '/'
            navigate()
          }}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.5rem',
            background: 'white',
            color: 'red',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Volver al inicio
        </button>
        <button 
          onClick={() => {
            const navigate = () => window.location.href = '/cabanas'
            navigate()
          }}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.5rem',
            background: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          Ver cabañas
        </button>
      </div>
    </div>
  )
}

export default TestPage