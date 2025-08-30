import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { AppTheme } from './AppTheme'
import { store } from './store'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import { PublicLayout } from './PublicLayout'
import './styles/App.css'

// Router siguiendo patrón EGEL
const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas públicas con layout */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      
      {/* Rutas de autenticación sin layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas de usuario con layout público */}
      <Route path="/dashboard" element={<PublicLayout><Dashboard /></PublicLayout>} />
      
      {/* Rutas de administrador con layout propio */}
      <Route path="/admin" element={<Admin />} />
      
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export const HotelApp = () => {
  return (
    <Provider store={store}>
      <AppTheme>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AppTheme>
    </Provider>
  )
}