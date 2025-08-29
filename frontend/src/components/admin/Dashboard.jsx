import { useState, useEffect } from 'react'
import { 
  DollarSign, Calendar, Building, Star, 
  TrendingUp, TrendingDown, AlertCircle, 
  CheckCircle, Clock, Users, Coffee
} from 'lucide-react'
import '../../pages/Admin.css'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(false)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { buildApiUrl, API_CONFIG } = await import('../services/apiConfig')
      
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_STATS), {
        headers: {
          'x-token': token,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.ok) {
        setStats(data.stats)
      }
      
      const bookingsResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_RECENT_BOOKINGS), {
        headers: {
          'x-token': token,
          'Content-Type': 'application/json'
        }
      })
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        if (bookingsData.ok) {
          setRecentBookings(bookingsData.reservations)
        }
      }
    } catch (err) {
      // Datos de fallback para desarrollo
      setStats({
        monthlyRevenue: 0,
        revenueChange: 0,
        monthlyReservations: 0,
        reservationsChange: 0,
        occupancyRate: 0,
        availableCabins: 0,
        checkInsToday: 0,
        checkOutsToday: 0,
        pendingReservations: 0,
        pendingReviews: 0,
        pendingPayments: 0,
        averageRating: 0,
        totalReviews: 0,
        breakfastPercentage: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0)
  }

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp size={16} className="trend-up" />
    if (change < 0) return <TrendingDown size={16} className="trend-down" />
    return <TrendingUp size={16} className="trend-neutral" />
  }

  const getTrendText = (change) => {
    if (change === 0) return ''
    const prefix = change > 0 ? '+' : ''
    return `${prefix}${change}% vs mes anterior`
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-section">
      <div className="dashboard-header">
        <h3>Dashboard - Cabañas Huasca</h3>
        <p className="dashboard-subtitle">Resumen de actividad y métricas clave</p>
      </div>

      {/* Métricas Principales */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-header">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-trend">
              {getTrendIcon(stats.revenueChange)}
            </div>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.monthlyRevenue)}</h3>
            <p>Ingresos del Mes</p>
            <span className="trend-text">{getTrendText(stats.revenueChange)}</span>
          </div>
        </div>
        
        <div className="stat-card bookings">
          <div className="stat-header">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-trend">
              {getTrendIcon(stats.reservationsChange)}
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats.monthlyReservations || 0}</h3>
            <p>Reservaciones del Mes</p>
            <span className="trend-text">{getTrendText(stats.reservationsChange)}</span>
            <span className="reservations-text">Creadas este mes</span>
          </div>
        </div>
        
        <div className="stat-card occupancy">
          <div className="stat-header">
            <div className="stat-icon">
              <Building size={24} />
            </div>
            <div className="occupancy-indicator">
              <span className={`occupancy-dot ${stats.occupancyRate > 70 ? 'high' : stats.occupancyRate > 40 ? 'medium' : 'low'}`}></span>
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats.occupancyRate || 0}%</h3>
            <p>Ocupación Hoy</p>
            <span className="availability-text">{stats.availableCabins || 0} cabañas disponibles</span>
          </div>
        </div>
        
        <div className="stat-card stays">
          <div className="stat-header">
            <div className="stat-icon">
              <Users size={24} />
            </div>
          </div>
          <div className="stat-content">
            <h3>{stats.monthlyStays || 0}</h3>
            <p>Estadías del Mes</p>
            <span className="stays-text">Huéspedes que llegan</span>
          </div>
        </div>
        

      </div>

      {/* Métricas de Hoy */}
      <div className="today-metrics">
        <h4>Actividad de Hoy - {new Date().toLocaleDateString('es-MX', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</h4>
        <div className="today-grid">
          <div className="today-card checkins">
            <CheckCircle size={20} />
            <div>
              <span className="today-number">{stats.checkInsToday || 0}</span>
              <span className="today-label">Check-ins</span>
            </div>
          </div>
          <div className="today-card checkouts">
            <Clock size={20} />
            <div>
              <span className="today-number">{stats.checkOutsToday || 0}</span>
              <span className="today-label">Check-outs</span>
            </div>
          </div>
          <div className="today-card pending">
            <AlertCircle size={20} />
            <div>
              <span className="today-number">{stats.pendingReservations || 0}</span>
              <span className="today-label">Pendientes</span>
            </div>
          </div>
          <div className="today-card breakfast">
            <Coffee size={20} />
            <div>
              <span className="today-number">{stats.breakfastPercentage || 0}%</span>
              <span className="today-label">Con Desayunador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {(stats.pendingReservations > 0 || stats.pendingReviews > 0 || stats.pendingPayments > 0) && (
        <div className="alerts-section">
          <h4>Requieren Atención</h4>
          <div className="alerts-grid">
            {stats.pendingReservations > 0 && (
              <div className="alert-card warning">
                <AlertCircle size={16} />
                <span>{stats.pendingReservations} reservaciones por confirmar</span>
              </div>
            )}
            {stats.pendingReviews > 0 && (
              <div className="alert-card info">
                <Star size={16} />
                <span>{stats.pendingReviews} reviews por aprobar</span>
              </div>
            )}
            {stats.pendingPayments > 0 && (
              <div className="alert-card danger">
                <DollarSign size={16} />
                <span>{formatCurrency(stats.pendingPayments)} en pagos pendientes</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reservaciones Recientes */}
      {recentBookings.length > 0 && (
        <div className="recent-section">
          <h4>Actividad Reciente</h4>
          <div className="recent-bookings">
            {recentBookings.slice(0, 5).map(booking => {
              const checkInDate = new Date(booking.check_in)
              const checkOutDate = new Date(booking.check_out)
              const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
              const statusText = {
                'pending': 'Pendiente',
                'confirmed': 'Confirmada', 
                'cancelled': 'Cancelada',
                'completed': 'Completada'
              }[booking.status] || booking.status
              
              return (
                <div key={booking.id} className="booking-item">
                  <div className="booking-guest">
                    <span className="guest-name">{booking.guest_name || 'Huésped'}</span>
                    <span className="cabin-name">Cabaña {booking.cabin?.name}</span>
                  </div>
                  <div className="booking-details">
                    <span className="booking-dates">
                      {checkInDate.toLocaleDateString('es-MX', { 
                        day: '2-digit', 
                        month: 'short' 
                      })} - {checkOutDate.toLocaleDateString('es-MX', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </span>
                    <span className="booking-nights">{nights} noche{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="status-info">
                    <div className={`booking-status ${booking.status}`}></div>
                    <span className="status-text">{statusText}</span>
                  </div>
                  <span className="booking-amount">{formatCurrency(booking.total_price)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard