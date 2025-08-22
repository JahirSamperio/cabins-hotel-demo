import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SEOHead from './components/ui/SEOHead'
import WhatsAppButton from './components/ui/WhatsAppButton'
import './styles/App.css'

// Lazy loading para páginas
const HomePage = lazy(() => import('./pages/Home'))
const LoginPage = lazy(() => import('./pages/Login'))
const RegisterPage = lazy(() => import('./pages/Register'))
const UserDashboard = lazy(() => import('./pages/Dashboard'))
const AdminDashboard = lazy(() => import('./pages/Admin'))

// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner" role="status" aria-label="Cargando">
    <div className="spinner"></div>
    <span>Cargando...</span>
  </div>
)

function App() {
  return (
    <Router>
      <div className="App">
        <SEOHead />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
        <WhatsAppButton />
      </div>
    </Router>
  )
}

export default App