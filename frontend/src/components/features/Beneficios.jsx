import { Leaf, Home, MapPin } from 'lucide-react'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Beneficios.css'

const Beneficios = () => {
  const { ref, inView } = useLazyLoad()
  
  const beneficios = [
    {
      icon: Leaf,
      title: 'Naturaleza Pura',
      description: 'Rodeado de bosques de pinos y aire fresco de montaña'
    },
    {
      icon: Home,
      title: 'Comodidad Total',
      description: 'Cabañas completamente equipadas con todas las amenidades'
    },
    {
      icon: MapPin,
      title: 'Ubicación Privilegiada',
      description: 'En el corazón del pueblo mágico de Huasca de Ocampo'
    }
  ]

  return (
    <section className="beneficios section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>¿Por qué elegir Cabañas Huasca?</h2>
        </div>
        
        {inView && (
          <div className="beneficios-grid">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="beneficio">
                <beneficio.icon size={48} />
                <h3>{beneficio.title}</h3>
                <p>{beneficio.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Beneficios