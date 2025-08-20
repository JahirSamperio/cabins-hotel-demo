import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SEOHead from './components/ui/SEOHead'
import WhatsAppButton from './components/ui/WhatsAppButton'
import './styles/App.css'

// Lazy loading para páginas
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

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