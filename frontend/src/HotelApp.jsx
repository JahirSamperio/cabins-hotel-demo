import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from './PublicLayout'
import SEOHead from './components/ui/SEOHead'
import WhatsAppButton from './components/ui/WhatsAppButton'

// Lazy loading para páginas
const HomePage = lazy(() => import('./pages/HomePage'))
const Home = lazy(() => import('./pages/Home'))
const LoginPage = lazy(() => import('./pages/Login'))
const RegisterPage = lazy(() => import('./pages/Register'))
const UserDashboard = lazy(() => import('./pages/Dashboard'))
const AdminDashboard = lazy(() => import('./pages/Admin'))
const CabanasPage = lazy(() => import('./pages/CabanasPage'))
const CabanaDetailPage = lazy(() => import('./pages/CabanaDetailPage'))
const ReservarPage = lazy(() => import('./pages/ReservarPage'))
const TestPage = lazy(() => import('./pages/TestPage'))

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    gap: '1rem',
    color: '#2c5530'
  }} role="status" aria-label="Cargando">
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #f3f4f6',
      borderTop: '3px solid #2c5530',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <span style={{
      fontSize: '1.2rem',
      fontWeight: '500'
    }}>Cargando...</span>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

export const HotelApp = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <SEOHead />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Ruta principal - usa HomePage con todas las secciones */}
            <Route path="/" element={<HomePage />} />
            
            {/* Rutas de autenticación */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Rutas de usuario */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Rutas de cabañas */}
            <Route path="/cabanas" element={<CabanasPage />} />
            <Route path="/cabana/:id" element={<CabanaDetailPage />} />
            <Route path="/reservar" element={<ReservarPage />} />
            
            {/* Ruta de prueba */}
            <Route path="/test" element={<TestPage />} />
            <Route path="/test/:id" element={<TestPage />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  )
}