import { useNavigate } from 'react-router-dom'
import { 
  BarChart3, Calendar, Home, LogOut, Building, Star, DollarSign 
} from 'lucide-react'
import { useAuthStore, useAdminStore } from './hooks'


export const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { activeTab, setActiveTab } = useAdminStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
            <button className="btn-home" onClick={() => navigate('/')}>
              <Home size={16} />
              Sitio Web
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="admin-panel-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button 
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        <div className="admin-panel-body">
          {children}
        </div>
      </div>
    </div>
  )
}