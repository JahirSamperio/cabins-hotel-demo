import { useEffect } from 'react'
import Header from '../components/layout/Header'
import Hero from '../components/features/Hero'
import Footer from '../components/layout/Footer'
import SEOHead from '../components/ui/SEOHead'

// Lazy loading para componentes pesados
import { lazy, Suspense } from 'react'

const Galeria = lazy(() => import('../components/features/Galeria'))
const Cabanas = lazy(() => import('../components/features/Cabanas'))
const Servicios = lazy(() => import('../components/features/Servicios'))
const Beneficios = lazy(() => import('../components/features/Beneficios'))
const Availability = lazy(() => import('../components/features/Availability'))
const Mapa = lazy(() => import('../components/features/Mapa'))
const VirtualTour = lazy(() => import('../components/features/VirtualTour'))
const Contacto = lazy(() => import('../components/features/Contacto'))
const Testimonios = lazy(() => import('../components/features/Testimonios'))
const Reviews = lazy(() => import('../components/features/Reviews'))

const SectionLoader = () => (
  <div className="section-loader">
    <div className="section-skeleton"></div>
  </div>
)

const HomePage = () => {
  useEffect(() => {
    // Scroll suave para navegación
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute('href')
      if (href && href.startsWith('#')) {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return (
    <>
      <SEOHead 
        title="Cabañas Huasca - Pueblo Mágico | Descanso en la Naturaleza México"
        description="Renta de cabañas en Huasca de Ocampo, pueblo mágico de México. Descanso, naturaleza y turismo familiar. Reserva tu cabaña ahora."
        canonical="https://cabanashuasca.com"
      />
      
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      
      <Header />
      
      <main id="main-content">
        <Hero />
        
        <Suspense fallback={<SectionLoader />}>
          <Galeria />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Cabanas />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Servicios />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Beneficios />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Availability />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Mapa />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <VirtualTour />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Contacto />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Testimonios />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Reviews />
        </Suspense>
      </main>
      
      <Footer />
    </>
  )
}

export default HomePage