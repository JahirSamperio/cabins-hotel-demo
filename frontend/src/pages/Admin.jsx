import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart3, Users, Calendar, Settings, 
  Home, LogOut, Building, DollarSign,
  TrendingUp, Clock, CheckCircle, AlertCircle,
  X, Star, Edit, Plus, Trash2, Eye
} from 'lucide-react'
import Swal from 'sweetalert2'
import './Admin.css'

const Admin = () => {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [recentBookings, setRecentBookings] = useState([])
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [customDate, setCustomDate] = useState('')
  const [cabins, setCabins] = useState([])
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab')
    if (savedTab) {
      localStorage.removeItem('activeTab')
      return savedTab
    }
    return 'dashboard'
  })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!savedUser || !token) {
      navigate('/login')
      return
    }
    
    const userData = JSON.parse(savedUser)
    if (!userData.is_admin) {
      navigate('/dashboard')
      return
    }
    
    setUser(userData)
    
    // Cargar datos del admin
    const loadAdminData = async () => {
      setLoading(true)
      try {
        const { adminAPI, reservationsAPI, cabinsAPI, reviewsAPI } = await import('../services/api')
        
        // Cargar estadísticas y reservaciones recientes siempre
        const [statsResponse, bookingsResponse] = await Promise.all([
          adminAPI.getStats(token),
          adminAPI.getRecentBookings(token)
        ])
        
        if (statsResponse.ok) {
          setStats(statsResponse.stats)
        }
        
        if (bookingsResponse.ok) {
          setRecentBookings(bookingsResponse.reservations)
        }

        // Cargar datos según la pestaña activa
        if (activeTab === 'reservations') {
          const reservationsResponse = await reservationsAPI.getAll(token)
          if (reservationsResponse.ok) {
            // Ordenar por fecha de creación (más recientes primero) y luego por estado
            setReservations(reservationsResponse.reservations || [])
            setFilteredReservations(reservationsResponse.reservations || [])
          }
        } else if (activeTab === 'cabins') {
          const cabinsResponse = await cabinsAPI.getAll()
          if (cabinsResponse.ok) {
            setCabins(cabinsResponse.cabins || [])
          }
        } else if (activeTab === 'reviews') {
          const reviewsResponse = await reviewsAPI.getAll()
          if (reviewsResponse.ok) {
            // Filtrar solo reviews no aprobados para el panel admin
            const pendingReviews = reviewsResponse.reviews?.filter(review => !review.approved) || []
            setReviews(pendingReviews)
          }
        }
      } catch (err) {
        console.error('Error loading admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadAdminData()
  }, [navigate, activeTab])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/')
  }

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const { reservationsAPI } = await import('../services/api')
      
      const response = await reservationsAPI.update(reservationId, { status: newStatus }, token)
      if (response.ok) {
        setReservations(prev => prev.map(res => 
          res.id === reservationId ? { ...res, status: newStatus } : res
        ))
        setRecentBookings(prev => prev.map(res => 
          res.id === reservationId ? { ...res, status: newStatus } : res
        ))
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handlePaymentStatusUpdate = async (reservationId, newPaymentStatus) => {
    try {
      const token = localStorage.getItem('token')
      const { reservationsAPI } = await import('../services/api')
      
      const response = await reservationsAPI.update(reservationId, { payment_status: newPaymentStatus }, token)
      if (response.ok) {
        setReservations(prev => prev.map(res => 
          res.id === reservationId ? { ...res, payment_status: newPaymentStatus } : res
        ))
        setFilteredReservations(prev => prev.map(res => 
          res.id === reservationId ? { ...res, payment_status: newPaymentStatus } : res
        ))
      }
    } catch (err) {
      console.error('Error updating payment status:', err)
    }
  }

  const handleAmountPaidUpdate = async (reservationId, newAmountPaid) => {
    try {
      const token = localStorage.getItem('token')
      const { reservationsAPI } = await import('../services/api')
      
      const response = await reservationsAPI.update(reservationId, { amount_paid: parseFloat(newAmountPaid) }, token)
      if (response.ok) {
        setReservations(prev => prev.map(res => 
          res.id === reservationId ? { ...res, amount_paid: parseFloat(newAmountPaid) } : res
        ))
        setFilteredReservations(prev => prev.map(res => 
          res.id === reservationId ? { ...res, amount_paid: parseFloat(newAmountPaid) } : res
        ))
      }
    } catch (err) {
      console.error('Error updating amount paid:', err)
    }
  }

  const handleReviewAction = async (reviewId, action) => {
    try {
      const token = localStorage.getItem('token')
      const { reviewsAPI } = await import('../services/api')
      
      const approved = action === 'approve'
      const response = await reviewsAPI.approve(reviewId, approved, token)
      
      if (response.ok) {
        // Remover de la lista de pendientes
        setReviews(prev => prev.filter(review => review.id !== reviewId))
      }
    } catch (err) {
      console.error('Error handling review:', err)
    }
  }

  const handleDeleteItem = async (id, type) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2c5530',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    
    if (!result.isConfirmed) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      let response
      
      if (type === 'cabin') {
        const { cabinsAPI } = await import('../services/api')
        response = await cabinsAPI.delete(id, token)
        if (response.ok) {
          setCabins(prev => prev.filter(item => item.id !== id))
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El elemento ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonColor: '#2c5530'
          })
        } else {
          Swal.fire({
            title: 'Error',
            text: response.msg || 'No se pudo eliminar el elemento',
            icon: 'error',
            confirmButtonColor: '#2c5530'
          })
        }
      }
      // Note: No hay endpoint de delete para reservaciones y reviews en el backend actual
    } catch (err) {
      console.error('Error deleting item:', err)
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al eliminar el elemento',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    }
  }

  const openModal = (type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setSelectedItem(null)
  }

  const openPaymentModal = (reservation) => {
    setSelectedReservation(reservation)
    setPaymentAmount(reservation.amount_paid || 0)
    setShowPaymentModal(true)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedReservation(null)
    setPaymentAmount(0)
  }

  const getPaymentStatus = (amount, total) => {
    const paid = parseFloat(amount) || 0
    const totalPrice = parseFloat(total) || 0
    
    if (paid === 0) return 'pending'
    if (paid >= totalPrice) return 'paid'
    return 'partial'
  }

  const getPaymentStatusText = (amount, total) => {
    const status = getPaymentStatus(amount, total)
    return status === 'pending' ? 'Pendiente' : status === 'paid' ? 'Pagado Completo' : 'Pago Parcial'
  }

  const handlePaymentSave = async () => {
    if (!selectedReservation) return
    
    try {
      const token = localStorage.getItem('token')
      const { reservationsAPI } = await import('../services/api')
      
      const response = await reservationsAPI.update(selectedReservation.id, { amount_paid: parseFloat(paymentAmount) }, token)
      console.log('Payment update response:', response)
      if (response.ok) {
        const updatedReservation = {
          ...selectedReservation,
          amount_paid: parseFloat(paymentAmount),
          payment_status: response.reservation.payment_status
        }
        console.log('Updated reservation:', updatedReservation)
        
        setReservations(prev => prev.map(res => 
          res.id === selectedReservation.id ? updatedReservation : res
        ))
        setFilteredReservations(prev => prev.map(res => 
          res.id === selectedReservation.id ? updatedReservation : res
        ))
        closePaymentModal()
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Pago actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: response.msg || 'Error al actualizar el pago',
          icon: 'error',
          confirmButtonColor: '#2c5530'
        })
      }
    } catch (err) {
      console.error('Error updating payment:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...reservations]
    
    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.status === statusFilter)
    }
    
    // Filtro por estado de pago
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(res => res.payment_status === paymentFilter)
    }
    
    // Filtro por tipo de reservación
    if (bookingTypeFilter !== 'all') {
      filtered = filtered.filter(res => res.booking_type === bookingTypeFilter)
    }
    
    // Filtro por fecha
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    if (dateFilter === 'today') {
      filtered = filtered.filter(res => res.check_in === todayStr)
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(res => {
        const checkIn = new Date(res.check_in)
        return checkIn >= today && checkIn <= weekFromNow
      })
    } else if (dateFilter === 'month') {
      const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
      filtered = filtered.filter(res => {
        const checkIn = new Date(res.check_in)
        return checkIn >= today && checkIn <= monthFromNow
      })
    } else if (dateFilter === 'custom' && customDate) {
      filtered = filtered.filter(res => res.check_in === customDate)
    }
    
    // Filtro por fecha personalizada independiente
    if (customDate && dateFilter === 'all') {
      filtered = filtered.filter(res => res.check_in === customDate)
    }
    
    setFilteredReservations(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [statusFilter, paymentFilter, bookingTypeFilter, dateFilter, customDate, reservations])

  if (!user) return null

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
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={16} /> Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            <Calendar size={16} /> Reservaciones
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cabins' ? 'active' : ''}`}
            onClick={() => setActiveTab('cabins')}
          >
            <Building size={16} /> Cabañas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={16} /> Reviews
          </button>
        </div>

        <div className="admin-panel-body">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          )}

          {activeTab === 'dashboard' && !loading && (
            <div className="dashboard-section">
              <h3>Resumen General</h3>
              <div className="stats-grid">
                <div className="stat-card revenue">
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>${stats.totalRevenue?.toLocaleString()}</h3>
                    <p>Ingresos Totales</p>
                    <div className="stat-trend">
                      <TrendingUp size={16} />
                      <span>+12% vs mes anterior</span>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card bookings">
                  <div className="stat-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalBookings}</h3>
                    <p>Reservaciones</p>
                    <div className="stat-trend">
                      <TrendingUp size={16} />
                      <span>+8% vs mes anterior</span>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card occupancy">
                  <div className="stat-icon">
                    <BarChart3 size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.occupancyRate}%</h3>
                    <p>Ocupación</p>
                    <div className="stat-trend">
                      <TrendingUp size={16} />
                      <span>+5% vs mes anterior</span>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card cabins">
                  <div className="stat-icon">
                    <Building size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.availableCabins}</h3>
                    <p>Cabañas Disponibles</p>
                    <div className="stat-trend">
                      <Clock size={16} />
                      <span>Para hoy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reservations' && !loading && (
            <div className="reservations-section">
              <div className="section-header">
                <h3>Gestión de Reservaciones</h3>
                <div className="section-actions">
                  <button className="btn-primary" onClick={() => openModal('reservation')}>
                    <Plus size={16} /> Nueva Reservación
                  </button>
                </div>
              </div>
              
              <div className="filters-section">
                <div className="filter-group">
                  <label>Estado:</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="confirmed">Confirmadas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Pago:</label>
                  <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="partial">Parcial</option>
                    <option value="paid">Pagado</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Tipo:</label>
                  <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="online">Online</option>
                    <option value="walk_in">Walk-in</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Fecha:</label>
                  <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                    <option value="all">Todas</option>
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                    <option value="custom">Fecha específica</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Seleccionar fecha:</label>
                  <input 
                    type="date" 
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value)
                      if (e.target.value) {
                        setDateFilter('all')
                      }
                    }}
                    style={{padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </div>
                <div className="filter-stats">
                  <span>{filteredReservations.length} de {reservations.length} reservaciones</span>
                </div>
              </div>
              {filteredReservations.length > 0 ? (
                <div className="reservations-table-container">
                  <table className="reservations-table">
                    <thead>
                      <tr>
                        <th>Cabaña</th>
                        <th>Huésped</th>
                        <th>Fechas</th>
                        <th>Huéspedes</th>
                        <th>Total</th>
                        <th>Pagado</th>
                        <th>Estado</th>
                        <th>Pago</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map(reservation => (
                        <tr key={reservation.id}>
                          <td className="cabin-name">{reservation.cabin?.name || 'Cabaña'}</td>
                          <td className="guest-info">
                            <div>{reservation.guest_name || reservation.user?.name || 'Huésped'}</div>
                            {reservation.guest_phone && (
                              <small>📞 {reservation.guest_phone}</small>
                            )}
                          </td>
                          <td className="dates">
                            <div>{reservation.check_in}</div>
                            <small>a {reservation.check_out}</small>
                          </td>
                          <td className="guests-count">{reservation.guests}</td>
                          <td className="total-price">${reservation.total_price || 0}</td>
                          <td className="amount-paid">${reservation.amount_paid || 0}</td>
                          <td>
                            <span className={`status ${reservation.status.toLowerCase()}`}>
                              {reservation.status === 'pending' ? 'Pendiente' :
                               reservation.status === 'confirmed' ? 'Confirmada' :
                               reservation.status === 'cancelled' ? 'Cancelada' : reservation.status}
                            </span>
                          </td>
                          <td>
                            <span className={`payment-status ${reservation.payment_status}`}>
                              {reservation.payment_status === 'pending' ? 'Pendiente' :
                               reservation.payment_status === 'paid' ? 'Pagado' : 'Parcial'}
                            </span>
                          </td>
                          <td className="actions">
                            <div className="action-buttons">
                              <button 
                                className="edit-btn"
                                onClick={() => openPaymentModal(reservation)}
                                title="Editar Pago"
                              >
                                <Edit size={14} />
                              </button>
                              {reservation.status === 'pending' && (
                                <>
                                  <button 
                                    className="confirm-btn"
                                    onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                                    title="Confirmar"
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                  <button 
                                    className="cancel-btn"
                                    onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                                    title="Cancelar"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              )}
                              {reservation.status === 'confirmed' && (
                                <button 
                                  className="cancel-btn"
                                  onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                                  title="Cancelar"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <Calendar size={48} />
                  <h4>{reservations.length === 0 ? 'No hay reservaciones' : 'No hay reservaciones que coincidan con los filtros'}</h4>
                  <p>{reservations.length === 0 ? 'Las reservaciones aparecerán aquí cuando los huéspedes hagan reservas' : 'Intenta cambiar los filtros para ver más resultados'}</p>
                  <button className="btn-primary" onClick={() => openModal('reservation')}>
                    <Plus size={16} /> Crear Primera Reservación
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cabins' && !loading && (
            <div className="cabins-section">
              <div className="section-header">
                <h3>Gestión de Cabañas</h3>
                <div className="section-actions">
                  <button className="btn-primary" onClick={() => openModal('cabin')}>
                    <Plus size={16} /> Nueva Cabaña
                  </button>
                </div>
              </div>
              {cabins.length > 0 ? (
                <div className="cabins-grid">
                  {cabins.map(cabin => (
                    <div key={cabin.id} className="cabin-card">
                      <h4>{cabin.name}</h4>
                      <p><Users size={16} /> {cabin.capacity} personas</p>
                      <p><DollarSign size={16} /> ${cabin.price_per_night}/noche</p>
                      <p>{cabin.description}</p>
                      <div className="cabin-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => openModal('cabin', cabin)}
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button 
                          className="view-btn"
                          onClick={() => openModal('view-cabin', cabin)}
                        >
                          <Eye size={16} /> Ver
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteItem(cabin.id, 'cabin')}
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <Building size={48} />
                  <h4>No hay cabañas registradas</h4>
                  <p>Comienza agregando tu primera cabaña para empezar a recibir reservaciones</p>
                  <button className="btn-primary" onClick={() => openModal('cabin')}>
                    <Plus size={16} /> Crear Primera Cabaña
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && !loading && (
            <div className="reviews-section">
              <div className="section-header">
                <h3>Reviews Pendientes</h3>
              </div>
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-info">
                        <h4>{review.user?.name || 'Usuario'}</h4>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              fill={i < review.rating ? '#ffc107' : 'none'} 
                              color="#ffc107" 
                            />
                          ))}
                        </div>
                        <p>{review.comment}</p>
                        <small>Cabaña: {review.cabin?.name || 'N/A'}</small>
                      </div>
                      <div className="review-actions">
                        <button 
                          className="approve-btn"
                          onClick={() => handleReviewAction(review.id, 'approve')}
                        >
                          <CheckCircle size={14} /> Aprobar
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleReviewAction(review.id, 'reject')}
                        >
                          <X size={14} /> Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <Star size={48} />
                  <h4>No hay reviews pendientes</h4>
                  <p>Todas las reviews han sido procesadas o no hay reviews nuevas</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {modalType === 'cabin' && (selectedItem ? 'Editar Cabaña' : 'Nueva Cabaña')}
                  {modalType === 'reservation' && 'Nueva Reservación'}
                  {modalType === 'view-cabin' && 'Detalles de Cabaña'}
                </h3>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {modalType === 'cabin' && (
                  <CabinForm cabin={selectedItem} onClose={closeModal} onSave={() => {
                    closeModal()
                    // Recargar cabañas
                  }} />
                )}
                {modalType === 'reservation' && (
                  <ReservationForm onClose={closeModal} onSave={() => {
                    closeModal()
                    // Recargar reservaciones
                  }} />
                )}
                {modalType === 'view-cabin' && selectedItem && (
                  <CabinDetails cabin={selectedItem} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pago */}
        {showPaymentModal && selectedReservation && (
          <div className="modal-overlay" onClick={closePaymentModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Gestionar Pago</h3>
                <button className="close-btn" onClick={closePaymentModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="payment-info">
                  <p><strong>Reservación:</strong> {selectedReservation.cabin?.name}</p>
                  <p><strong>Huésped:</strong> {selectedReservation.guest_name || selectedReservation.user?.name}</p>
                  <p><strong>Total:</strong> ${selectedReservation.total_price}</p>
                  <p><strong>Estado actual:</strong> 
                    <span className={`payment-status ${selectedReservation.payment_status}`}>
                      {selectedReservation.payment_status === 'pending' ? 'Pendiente' :
                       selectedReservation.payment_status === 'paid' ? 'Pagado' : 'Parcial'}
                    </span>
                  </p>
                </div>
                
                <div className="form-group">
                  <label>Monto Pagado</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedReservation.total_price}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px'}}
                  />
                  <small style={{color: '#666', fontSize: '0.85rem'}}>
                    Restante: ${(selectedReservation.total_price - paymentAmount).toFixed(2)}
                  </small>
                </div>
                
                <div className="form-group">
                  <label>Estado de Pago</label>
                  <div style={{padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd'}}>
                    <span className={`payment-status ${getPaymentStatus(paymentAmount, selectedReservation.total_price)}`}>
                      {getPaymentStatusText(paymentAmount, selectedReservation.total_price)}
                    </span>
                    <small style={{display: 'block', marginTop: '0.5rem', color: '#666'}}>
                      Se actualizará automáticamente según el monto
                    </small>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="btn-secondary" onClick={closePaymentModal}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={handlePaymentSave}>
                    Guardar Pago
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para formulario de cabañas
const CabinForm = ({ cabin, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: cabin?.name || '',
    description: cabin?.description || '',
    capacity: cabin?.capacity || '',
    price_per_night: cabin?.price_per_night || ''
  })
  const [imageUrls, setImageUrls] = useState('')
  const [amenitiesList, setAmenitiesList] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (cabin?.images && Array.isArray(cabin.images)) {
      setImageUrls(cabin.images.join('\n'))
    }
    if (cabin?.amenities && Array.isArray(cabin.amenities)) {
      setAmenitiesList(cabin.amenities.join('\n'))
    }
  }, [cabin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { cabinsAPI } = await import('../services/api')
      
      const manualUrls = imageUrls.split('\n').filter(url => url.trim()).map(url => url.trim())
      const uploadedUrls = uploadedImages.map(img => img.imageUrl)
      const allImages = [...uploadedUrls, ...manualUrls]
      const amenitiesArray = amenitiesList.split('\n').filter(item => item.trim()).map(item => item.trim())
      
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price_per_night: parseFloat(formData.price_per_night),
        images: allImages,
        amenities: amenitiesArray
      }
      
      const response = cabin 
        ? await cabinsAPI.update(cabin.id, submitData, token)
        : await cabinsAPI.create(submitData, token)
      
      if (response.ok) {
        onSave(response.cabin)
        await Swal.fire({
          title: '¡Éxito!',
          text: cabin ? 'Cabaña actualizada correctamente' : 'Cabaña creada correctamente',
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000,
          showConfirmButton: false
        })
        if (!cabin) {
          localStorage.setItem('activeTab', 'cabins')
          window.location.reload()
        }
      } else {
        Swal.fire({
          title: 'Error',
          text: response.msg || 'Error al guardar la cabaña',
          icon: 'error',
          confirmButtonColor: '#2c5530'
        })
      }
    } catch (err) {
      console.error('Error saving cabin:', err)
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al guardar la cabaña',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return
    
    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const { uploadAPI } = await import('../services/api')
      
      const response = await uploadAPI.uploadImages(selectedFiles, 'cabins', token)
      
      if (response.success) {
        setUploadedImages(prev => [...prev, ...response.data])
        setSelectedFiles([])
        const fileInput = document.querySelector('.file-input')
        if (fileInput) fileInput.value = ''
        Swal.fire({
          title: '¡Éxito!',
          text: `${response.data.length} imagen(es) subida(s) correctamente`,
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: response.message || 'Error al subir imágenes',
          icon: 'error',
          confirmButtonColor: '#2c5530'
        })
      }
    } catch (err) {
      console.error('Error uploading images:', err)
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al subir las imágenes',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    } finally {
      setUploading(false)
    }
  }

  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="cabin-form">
      <div className="form-group">
        <label>Nombre</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required 
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Capacidad</label>
          <input 
            type="number" 
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            required 
          />
        </div>
        <div className="form-group">
          <label>Precio por noche</label>
          <input 
            type="number" 
            step="0.01"
            value={formData.price_per_night}
            onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
            required 
          />
        </div>
      </div>
      <div className="form-group">
        <label>Amenidades (una por línea)</label>
        <textarea 
          value={amenitiesList}
          onChange={(e) => setAmenitiesList(e.target.value)}
          placeholder="Ejemplo:\nWiFi gratuito\nCocina equipada\nChimenea\nJacuzzi"
          rows="4"
        />
      </div>
      <div className="form-group">
        <label>Subir Imágenes</label>
        <input 
          type="file" 
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <p>{selectedFiles.length} archivo(s) seleccionado(s)</p>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleUploadImages}
              disabled={uploading}
            >
              {uploading && <div className="button-spinner"></div>}
              {uploading ? 'Subiendo...' : 'Subir Imágenes'}
            </button>
          </div>
        )}
        {uploadedImages.length > 0 && (
          <div className="uploaded-images">
            <p>Imágenes subidas:</p>
            <div className="images-grid">
              {uploadedImages.map((img, index) => (
                <div key={index} className="uploaded-image">
                  <img src={img.imageUrl} alt={`Subida ${index + 1}`} />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => removeUploadedImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="form-group">
        <label>URLs Adicionales (una por línea)</label>
        <textarea 
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          placeholder="URLs adicionales si las tienes"
          rows="3"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <div className="button-spinner"></div>}
          {loading ? 'Guardando...' : (cabin ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  )
}

// Componente para formulario de reservaciones (Walk-in)
const ReservationForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cabin_id: '',
    check_in: '',
    check_out: '',
    guests: '',
    guest_name: '',
    guest_phone: '',
    payment_method: 'cash',
    payment_status: 'pending'
  })
  const [cabins, setCabins] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadCabins = async () => {
      try {
        const { cabinsAPI } = await import('../services/api')
        const response = await cabinsAPI.getAll()
        if (response.ok) {
          setCabins(response.cabins || [])
        }
      } catch (err) {
        console.error('Error loading cabins:', err)
      }
    }
    loadCabins()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { reservationsAPI } = await import('../services/api')
      
      const submitData = {
        ...formData,
        guests: parseInt(formData.guests)
      }
      
      const response = await reservationsAPI.createWalkIn(submitData, token)
      
      if (response.ok) {
        onSave(response.reservation)
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Reservación creada correctamente',
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000,
          showConfirmButton: false
        })
        localStorage.setItem('activeTab', 'reservations')
        window.location.reload()
      } else {
        Swal.fire({
          title: 'No disponible',
          text: response.msg || 'La cabaña no está disponible en las fechas seleccionadas',
          icon: 'warning',
          confirmButtonColor: '#2c5530'
        })
      }
    } catch (err) {
      console.error('Error creating reservation:', err)
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al crear la reservación',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="reservation-form">
      <div className="form-group">
        <label>Cabaña</label>
        <select 
          value={formData.cabin_id}
          onChange={(e) => setFormData({...formData, cabin_id: e.target.value})}
          required
        >
          <option value="">Seleccionar cabaña</option>
          {cabins.map(cabin => (
            <option key={cabin.id} value={cabin.id}>
              {cabin.name} - ${cabin.price_per_night}/noche
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Nombre del huésped</label>
        <input 
          type="text" 
          value={formData.guest_name}
          onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Teléfono</label>
        <input 
          type="tel" 
          value={formData.guest_phone}
          onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
          required 
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Check-in</label>
          <input 
            type="date" 
            value={formData.check_in}
            onChange={(e) => setFormData({...formData, check_in: e.target.value})}
            required 
          />
        </div>
        <div className="form-group">
          <label>Check-out</label>
          <input 
            type="date" 
            value={formData.check_out}
            onChange={(e) => setFormData({...formData, check_out: e.target.value})}
            required 
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Número de huéspedes</label>
          <input 
            type="number" 
            min="1"
            value={formData.guests}
            onChange={(e) => setFormData({...formData, guests: e.target.value})}
            required 
          />
        </div>
        <div className="form-group">
          <label>Método de pago</label>
          <select 
            value={formData.payment_method}
            onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <div className="button-spinner"></div>}
          {loading ? 'Creando...' : 'Crear Reservación'}
        </button>
      </div>
    </form>
  )
}

// Componente para detalles de cabaña
const CabinDetails = ({ cabin }) => {
  return (
    <div className="cabin-details">
      <h4>{cabin.name}</h4>
      <p><strong>Capacidad:</strong> {cabin.capacity} personas</p>
      <p><strong>Precio:</strong> ${cabin.price_per_night}/noche</p>
      <p><strong>Descripción:</strong> {cabin.description}</p>
      
      {cabin.amenities && Array.isArray(cabin.amenities) && cabin.amenities.length > 0 && (
        <div>
          <p><strong>Amenidades:</strong></p>
          <ul>
            {cabin.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}
      
      {cabin.images && Array.isArray(cabin.images) && cabin.images.length > 0 && (
        <div>
          <p><strong>Imágenes:</strong></p>
          <div className="images-preview">
            {cabin.images.slice(0, 3).map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`${cabin.name} ${index + 1}`}
                className="cabin-image-preview"
                onError={(e) => e.target.style.display = 'none'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin