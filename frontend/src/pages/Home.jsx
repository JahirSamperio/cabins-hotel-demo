import { lazy, Suspense } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

// Lazy loading de componentes
const Hero = lazy(() => import('../components/features/Hero'))
const Cabanas = lazy(() => import('../components/features/Cabanas'))
const Servicios = lazy(() => import('../components/features/Servicios'))
const Beneficios = lazy(() => import('../components/features/Beneficios'))
const Galeria = lazy(() => import('../components/features/Galeria'))
const Availability = lazy(() => import('../components/features/Availability'))
const VirtualTour = lazy(() => import('../components/features/VirtualTour'))
const Testimonios = lazy(() => import('../components/features/Testimonios'))
const Reviews = lazy(() => import('../components/features/Reviews'))
const Mapa = lazy(() => import('../components/features/Mapa'))
const Contacto = lazy(() => import('../components/features/Contacto'))

const SectionLoader = () => (
  <div className="section-loader">
    <div className="section-skeleton"></div>
  </div>
)

const Home = () => {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SectionLoader />}>
          <Hero />
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
          <Galeria />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Availability />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <VirtualTour />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Testimonios />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Reviews />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Mapa />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Contacto />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

export default Home