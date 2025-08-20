import { useEffect, useState } from 'react'
import { Play, Waves, Utensils, Mountain, Trees } from 'lucide-react'
import LazyImage from '../ui/LazyImage'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Hero.css'

const Hero = () => {
  const [typedText, setTypedText] = useState('')
  const { ref, inView } = useLazyLoad()
  const fullText = 'Descubre la Magia de Huasca'

  useEffect(() => {
    if (!inView) return

    let i = 0
    const typeWriter = () => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1) + '|')
        i++
        setTimeout(typeWriter, 100)
      } else {
        setTimeout(() => setTypedText(fullText), 500)
      }
    }
    
    const timer = setTimeout(typeWriter, 800)
    return () => clearTimeout(timer)
  }, [inView, fullText])

  const features = [
    { icon: Waves, text: 'Alberca' },
    { icon: Utensils, text: 'Desayunador' },
    { icon: Mountain, text: 'Prismas Basálticos' },
    { icon: Trees, text: 'Bosques de Pinos' }
  ]

  return (
    <section id="inicio" className="hero" ref={ref}>
      <div className="hero-overlay" aria-hidden="true"></div>
      <div className="hero-content">
        <h2 className="hero-title">
          <span className="hero-brand">Cabañas Huasca</span>
          <span className="hero-title-main">{typedText}</span>
        </h2>
        <p className="hero-subtitle">
          Cabañas rústicas en el corazón del pueblo mágico más hermoso de México
        </p>
        <div className="hero-features" role="list" aria-label="Características principales">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="feature" role="listitem">
              <Icon size={20} aria-hidden="true" />
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div className="hero-buttons">
          <a 
            href="#contacto" 
            className="btn-primary-hero"
            aria-label="Reservar cabaña ahora"
          >
            Reserva Ahora
          </a>
          <a 
            href="#galeria" 
            className="btn-secondary-hero"
            aria-label="Ver galería de imágenes"
          >
            <Play size={16} aria-hidden="true" />
            Ver Galería
          </a>
        </div>
      </div>

      <div className="hero-decoration" aria-hidden="true">
        <div className="decoration-element"></div>
        <div className="decoration-element"></div>
        <div className="decoration-element"></div>
      </div>
    </section>
  )
}

export default Hero