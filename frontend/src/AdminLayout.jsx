import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { 
  BarChart3, Calendar, Home, LogOut, Building, Star, DollarSign, Bell 
} from 'lucide-react'
import { useAuthStore, useAdminStore } from './hooks'


export const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { activeTab, setActiveTab } = useAdminStore()
  const [pendingCount, setPendingCount] = useState(0)

  const handleLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  const handlePendingClick = useCallback(() => {
    const { goToPendingReservations } = useAdminStore.getState()
    goToPendingReservations()
  }, [])

  // Cargar estadísticas de pendientes
  useEffect(() => {
    const loadPendingStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const { buildApiUrl, API_CONFIG } = await import('./services/apiConfig')
        
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_STATS), {
          headers: {
            'x-token': token,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.ok) {
            setPendingCount(data.stats.pendingReservations || 0)
          }
        }
      } catch (err) {
        console.error('Error loading pending stats:', err)
      }
    }
    
    loadPendingStats()
    // Solo se actualiza al cargar la página para minimizar costos
    
    // Listener para actualizar cuando se confirma/cancela una reservación
    const handleUpdatePendingCount = () => {
      loadPendingStats()
    }
    
    window.addEventListener('updatePendingCount', handleUpdatePendingCount)
    return () => window.removeEventListener('updatePendingCount', handleUpdatePendingCount)
  }, [])

  useEffect(() => {
    const scrollContainer = document.querySelector('.tabs-scroll-container')
    const tabsContainer = document.querySelector('.admin-panel-tabs')
    if (!scrollContainer || !tabsContainer) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
      const isAtStart = scrollLeft <= 5
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5
      
      tabsContainer.classList.toggle('at-start', isAtStart)
      tabsContainer.classList.toggle('scrolled', !isAtStart)
      tabsContainer.classList.toggle('at-end', isAtEnd)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'reservations', label: 'Reservaciones', icon: Calendar },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'cabins', label: 'Cabañas', icon: Building },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'financial', label: 'Finanzas', icon: DollarSign }
  ]

  return (
    <div className="admin-panel-modal">
      <div className="admin-panel-content">
        <div className="admin-panel-header">
          <div className="admin-info">
            <h2>Panel de Administrador</h2>
            <p>Bienvenido, {user?.name}</p>
          </div>
          <div className="header-actions">
            {pendingCount > 0 && (
              <div 
                className="pending-notification" 
                title={`${pendingCount} reservaciones pendientes - Clic para ver`}
                onClick={handlePendingClick}
              >
                <Bell size={16} />
                <span className="pending-badge">{pendingCount}</span>
              </div>
            )}
            <button className="btn-home" onClick={() => navigate('/')} title="Sitio Web">
              <Home size={16} />
              <span>Sitio Web</span>
            </button>
            <button className="btn-logout" onClick={handleLogout} title="Cerrar Sesión">
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        <div className="admin-panel-tabs">
          <div className="tabs-scroll-container">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button 
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} /> <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="admin-panel-body">
          {children}
        </div>
      </div>
    </div>
  )
}