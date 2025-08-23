import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart3, Users, Calendar, Settings, 
  Home, LogOut, Building, DollarSign,
  TrendingUp, Clock, CheckCircle, AlertCircle,
  X, Star, Edit, Plus, Trash2, Eye, Search
} from 'lucide-react'
import Swal from 'sweetalert2'
import './Admin.css'
import Agenda from '../components/Agenda'

const Admin = () => {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [recentBookings, setRecentBookings] = useState([])
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [paginationInfo, setPaginationInfo] = useState({})
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
  const [customTotal, setCustomTotal] = useState(0)

  const [searchTerm, setSearchTerm] = useState('')
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedCalendarReservation, setSelectedCalendarReservation] = useState(null)
  const [showNewReservationModal, setShowNewReservationModal] = useState(false)
  const [preselectedDate, setPreselectedDate] = useState('')
  const [preselectedCabin, setPreselectedCabin] = useState('')
  const [preselectedCheckOut, setPreselectedCheckOut] = useState('')
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
          // Los filtros se cargarán por separado
        } else if (activeTab === 'cabins') {
          const cabinsResponse = await cabinsAPI.getAll()
          if (cabinsResponse.ok) {
            setCabins(cabinsResponse.cabins || [])
          }
        } else if (activeTab === 'agenda') {
          await loadAgendaReservations(token)
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
    if (newStatus === 'cancelled') {
      const result = await Swal.fire({
        title: '¿Cancelar reservación?',
        text: 'Esta acción cambiará el estado de la reservación a cancelada',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#2c5530',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No cancelar'
      })
      
      if (!result.isConfirmed) {
        return
      }
    }
    
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
        
        // Recargar reservaciones si estamos en la pestaña de reservaciones
        if (activeTab === 'reservations') {
          loadReservationsWithFilters()
        }
        
        if (newStatus === 'cancelled') {
          Swal.fire({
            title: 'Cancelada',
            text: 'La reservación ha sido cancelada',
            icon: 'success',
            confirmButtonColor: '#2c5530',
            timer: 2000
          })
        }
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
    setCustomTotal(reservation.total_price || 0)
    setShowPaymentModal(true)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedReservation(null)
    setPaymentAmount(0)
    setCustomTotal(0)
  }

  const openReservationModal = (reservation) => {
    setSelectedCalendarReservation(reservation)
    setShowReservationModal(true)
  }

  const closeReservationModal = () => {
    setShowReservationModal(false)
    setSelectedCalendarReservation(null)
  }

  const openNewReservationModal = (cabinName, checkIn, checkOut = '') => {
    setPreselectedCabin(cabinName)
    setPreselectedDate(checkIn)
    setPreselectedCheckOut(checkOut)
    setShowNewReservationModal(true)
  }

  const closeNewReservationModal = () => {
    setShowNewReservationModal(false)
    setPreselectedCabin('')
    setPreselectedDate('')
    setPreselectedCheckOut('')
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

  const loadAgendaReservations = async (token) => {
    try {
      const { adminService } = await import('../services/adminService')
      const today = new Date()
      const bufferDays = 30
      const maxDays = 90
      
      let startDate, endDate
      
      if (dateRangeStart && dateRangeEnd) {
        startDate = dateRangeStart
        endDate = dateRangeEnd
      } else if (dateRangeStart && !dateRangeEnd) {
        // Solo fecha "Desde" - mostrar 31 días hacia adelante
        startDate = dateRangeStart
        endDate = new Date(new Date(dateRangeStart).getTime() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      } else if (!dateRangeStart && dateRangeEnd) {
        // Solo fecha "Hasta" - mostrar 31 días hacia atrás
        startDate = new Date(new Date(dateRangeEnd).getTime() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        endDate = dateRangeEnd
      } else {
        if (calendarView === 'month') {
          const monthOffset = calendarPage
          const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
          startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0]
          endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0]
        } else {
          const pageOffset = calendarPage * 7
          startDate = new Date(today.getTime() - bufferDays * 24 * 60 * 60 * 1000 + pageOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          endDate = new Date(today.getTime() + (maxDays + pageOffset) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
      
      const response = await adminService.getReservationsByDateRange(token, startDate, endDate)
      if (response.ok) {
        setReservations(response.reservations || [])
      }
    } catch (err) {
      console.error('Error loading agenda reservations:', err)
    }
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setPaymentFilter('all')
    setBookingTypeFilter('all')
    setDateFilter('all')
    setCustomDate('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const totalPages = paginationInfo.totalPages || 1
  const currentReservations = filteredReservations



  const handleWhatsAppContact = (reservation) => {
    const phone = reservation.guest_phone || reservation.user?.phone
    if (!phone) return
    
    // Limpiar el número (quitar espacios, guiones, paréntesis, puntos, etc.)
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    
    // Validar que el número tenga al menos 10 dígitos
    if (cleanPhone.length < 10) {
      alert('Número de teléfono inválido')
      return
    }
    
    // Asegurar que tenga el formato correcto (agregar 52 si no lo tiene)
    let finalPhone = cleanPhone
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      finalPhone = '52' + cleanPhone
    }
    
    // Mensaje predeterminado
    const message = `Hola! Te contacto desde Cabañas Huasca sobre tu reservación para ${reservation.cabin?.name} del ${reservation.check_in} al ${reservation.check_out}.`
    
    // URL de WhatsApp
    const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`
    
    // Abrir en nueva ventana
    window.open(whatsappUrl, '_blank')
  }

  const handlePaymentSave = async () => {
    if (!selectedReservation) return
    
    try {
      const token = localStorage.getItem('token')
      const { reservationsAPI } = await import('../services/api')
      
      const updateData = { 
        amount_paid: parseFloat(paymentAmount),
        total_price: parseFloat(customTotal)
      }
      
      const response = await reservationsAPI.update(selectedReservation.id, updateData, token)
      console.log('Payment update response:', response)
      if (response.ok) {
        const updatedReservation = {
          ...selectedReservation,
          amount_paid: parseFloat(paymentAmount),
          payment_status: response.reservation.payment_status,
          total_price: parseFloat(customTotal)
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

  const loadReservationsWithFilters = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { adminService } = await import('../services/adminService')
      
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        paymentStatus: paymentFilter,
        bookingType: bookingTypeFilter,
        dateFilter,
        customDate,
        search: searchTerm
      }
      
      const data = await adminService.getReservationsWithFilters(token, filters)
      
      if (data.ok) {
        setReservations(data.reservations || [])
        setFilteredReservations(data.reservations || [])
        setPaginationInfo(data.pagination || {})
      }
    } catch (err) {
      console.error('Error loading filtered reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'reservations') {
      loadReservationsWithFilters()
    }
  }, [statusFilter, paymentFilter, bookingTypeFilter, dateFilter, customDate, activeTab, currentPage])

  useEffect(() => {
    if (activeTab === 'agenda') {
      const token = localStorage.getItem('token')
      if (token) {
        loadAgendaReservations(token)
      }
    }
  }, [activeTab])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, paymentFilter, bookingTypeFilter, dateFilter, customDate])

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
            className={`tab-btn ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            <Calendar size={16} /> Agenda
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
                <div className="filter-group search-group">
                  <label>Buscar cliente:</label>
                  <div className="search-input-group">
                    <input 
                      type="text" 
                      placeholder="Nombre del cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && loadReservationsWithFilters()}
                      style={{padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px 0 0 4px', minWidth: '150px'}}
                    />
                    <button 
                      type="button"
                      onClick={loadReservationsWithFilters}
                      style={{padding: '0.5rem 1rem', border: '1px solid #ddd', borderLeft: 'none', borderRadius: '0 4px 4px 0', background: '#f8f9fa', cursor: 'pointer'}}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>
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
                <button 
                  className="btn-clear-filters"
                  onClick={clearFilters}
                  title="Limpiar filtros"
                >
                  <X size={14} /> Limpiar
                </button>
                <div className="filter-stats" style={{flexShrink: 0, whiteSpace: 'nowrap'}}>
                  <span>Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, paginationInfo.totalItems || 0)} de {paginationInfo.totalItems || 0}</span>
                </div>
              </div>
              {filteredReservations.length > 0 ? (
                <>
                  <div className="reservations-table-container">
                  <table className="reservations-table">
                    <thead>
                      <tr>
                        <th>Cabaña</th>
                        <th>Huésped</th>
                        <th>Fechas</th>
                        <th>Huéspedes</th>
                        <th>Desayunador</th>
                        <th>Total</th>
                        <th>Pagado</th>
                        <th>Estado Reservación</th>
                        <th>Estado Pago</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReservations.map(reservation => (
                        <tr key={reservation.id}>
                          <td>{reservation.cabin?.name || 'Cabaña'}</td>
                          <td className="guest-info">
                            <div>{reservation.guest_name || reservation.user?.name || 'Huésped'}</div>
                            {reservation.guest_phone && (
                              <small>📞 {reservation.guest_phone}</small>
                            )}
                            {!reservation.guest_phone && reservation.user && (
                              <small>📞 {reservation.user.phone || 'Sin teléfono'}</small>
                            )}
                          </td>
                          <td className="dates">
                            <div>{reservation.check_in}</div>
                            <small>a {reservation.check_out}</small>
                          </td>
                          <td className="guests-count">{reservation.guests}</td>
                          <td className="breakfast-status">
                            {reservation.includes_breakfast ? '✓ Sí' : '✗ No'}
                          </td>
                          <td className="total-price">${reservation.total_price || 0}</td>
                          <td className="amount-paid">${reservation.amount_paid || 0}</td>
                          <td>
                            <span className={`reservation-status ${reservation.status.toLowerCase()}`}>
                              {reservation.status === 'pending' ? 'Por Confirmar' :
                               reservation.status === 'confirmed' ? 'Confirmada' :
                               reservation.status === 'cancelled' ? 'Cancelada' : reservation.status}
                            </span>
                          </td>
                          <td>
                            <span className={`payment-status ${reservation.payment_status}`}>
                              {reservation.payment_status === 'pending' ? 'Sin Pagar' :
                               reservation.payment_status === 'paid' ? 'Pagado Completo' : 'Pago Parcial'}
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
                              {(reservation.guest_phone || reservation.user?.phone) && (
                                <button 
                                  className="whatsapp-btn"
                                  onClick={() => handleWhatsAppContact(reservation)}
                                  title="Contactar por WhatsApp"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.251"/>
                                  </svg>
                                </button>
                              )}
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
                
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ← Anterior
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="pagination-dots">...</span>
                      }
                      return null
                    })}
                    
                    <button 
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente →
                    </button>
                  </div>
                  )}
                </>
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

          {activeTab === 'agenda' && !loading && (
            <Agenda 
              reservations={reservations}
              onReservationClick={openReservationModal}
              onNewReservation={openNewReservationModal}
              onStatusUpdate={handleStatusUpdate}
              onWhatsAppContact={handleWhatsAppContact}
            />
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
                  <p><strong>Estado actual:</strong> 
                    <span className={`payment-status ${selectedReservation.payment_status}`}>
                      {selectedReservation.payment_status === 'pending' ? 'Pendiente' :
                       selectedReservation.payment_status === 'paid' ? 'Pagado' : 'Parcial'}
                    </span>
                  </p>
                </div>
                
                <div className="form-group">
                  <label>Total de la Reservación</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={customTotal}
                    onChange={(e) => setCustomTotal(e.target.value)}
                    style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px'}}
                  />
                  <small style={{color: '#666', fontSize: '0.85rem'}}>
                    Puedes aplicar descuentos o ajustes personalizados
                  </small>
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
                    Restante: ${(customTotal - paymentAmount).toFixed(2)}
                  </small>
                </div>
                
                <div className="form-group">
                  <label>Estado de Pago</label>
                  <div style={{padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd'}}>
                    <span className={`payment-status ${getPaymentStatus(paymentAmount, customTotal)}`}>
                      {getPaymentStatusText(paymentAmount, customTotal)}
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
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalles de Reservación */}
        {showReservationModal && selectedCalendarReservation && (
          <div className="modal-overlay" onClick={closeReservationModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Detalles de Reservación</h3>
                <button className="close-btn" onClick={closeReservationModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="reservation-sections">
                  <div className="section">
                    <h4>Reservación</h4>
                    <div className="info-row">
                      <span className="label">Cabaña</span>
                      <span className="value">{selectedCalendarReservation.cabin?.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Estado</span>
                      <span className={`status ${selectedCalendarReservation.status}`}>
                        {selectedCalendarReservation.status === 'confirmed' ? 'Confirmada' :
                         selectedCalendarReservation.status === 'pending' ? 'Pendiente' :
                         selectedCalendarReservation.status === 'cancelled' ? 'Cancelada' : selectedCalendarReservation.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="section">
                    <h4>Huésped</h4>
                    <div className="info-row">
                      <span className="label">Nombre</span>
                      <span className="value">{selectedCalendarReservation.guest_name || selectedCalendarReservation.user?.name}</span>
                    </div>
                    {(selectedCalendarReservation.guest_phone || selectedCalendarReservation.user?.phone) && (
                      <div className="info-row">
                        <span className="label">Teléfono</span>
                        <span className="value">{selectedCalendarReservation.guest_phone || selectedCalendarReservation.user?.phone}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="label">Huéspedes</span>
                      <span className="value">{selectedCalendarReservation.guests}</span>
                    </div>
                  </div>
                  
                  <div className="section">
                    <h4>Fechas</h4>
                    <div className="info-row">
                      <span className="label">Entrada</span>
                      <span className="value">{selectedCalendarReservation.check_in}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Salida</span>
                      <span className="value">{selectedCalendarReservation.check_out}</span>
                    </div>
                  </div>
                  
                  <div className="section">
                    <h4>Servicios</h4>
                    <div className="info-row">
                      <span className="label">Desayunador</span>
                      <span className="value">{selectedCalendarReservation.includes_breakfast ? 'Incluido' : 'No incluido'}</span>
                    </div>
                    {selectedCalendarReservation.special_requests && (
                      <div className="info-row">
                        <span className="label">Solicitudes especiales</span>
                        <span className="value">{selectedCalendarReservation.special_requests}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="section">
                    <h4>Pago</h4>
                    <div className="info-row">
                      <span className="label">Total</span>
                      <span className="value price">${selectedCalendarReservation.total_price}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Pagado</span>
                      <span className="value price">${selectedCalendarReservation.amount_paid || 0}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Estado</span>
                      <span className={`payment-status ${selectedCalendarReservation.payment_status}`}>
                        {selectedCalendarReservation.payment_status === 'pending' ? 'Sin Pagar' :
                         selectedCalendarReservation.payment_status === 'paid' ? 'Pagado Completo' : 'Pago Parcial'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <div className="action-group-left">
                    <button className="btn-secondary" onClick={closeReservationModal}>
                      Cerrar
                    </button>
                  </div>
                  <div className="action-group-center">
                    {selectedCalendarReservation.status === 'pending' && (
                      <button 
                        className="btn-primary" 
                        onClick={() => {
                          Swal.fire({
                            title: '¿Confirmar reservación?',
                            text: 'Esta acción cambiará el estado a confirmada',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#2c5530',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Sí, confirmar',
                            cancelButtonText: 'Cancelar'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleStatusUpdate(selectedCalendarReservation.id, 'confirmed')
                              closeReservationModal()
                            }
                          })
                        }}
                      >
                        <CheckCircle size={16} /> Confirmar
                      </button>
                    )}
                    {(selectedCalendarReservation.status === 'pending' || selectedCalendarReservation.status === 'confirmed') && (
                      <button 
                        className="btn-danger" 
                        onClick={() => {
                          Swal.fire({
                            title: '¿Cancelar reservación?',
                            text: 'Esta acción cambiará el estado a cancelada',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#dc3545',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Sí, cancelar',
                            cancelButtonText: 'No cancelar'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleStatusUpdate(selectedCalendarReservation.id, 'cancelled')
                              closeReservationModal()
                            }
                          })
                        }}
                      >
                        <X size={16} /> Cancelar Reservación
                      </button>
                    )}
                  </div>
                  <div className="action-group-right">
                    {(selectedCalendarReservation.guest_phone || selectedCalendarReservation.user?.phone) && (
                      <button 
                        className="btn-whatsapp" 
                        onClick={() => handleWhatsAppContact(selectedCalendarReservation)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.251"/>
                        </svg>
                        Contactar
                      </button>
                    )}
                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        closeReservationModal()
                        openPaymentModal(selectedCalendarReservation)
                      }}
                    >
                      Editar Pago
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Nueva Reservación desde Calendario */}
        {showNewReservationModal && (
          <div className="modal-overlay" onClick={closeNewReservationModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Nueva Reservación</h3>
                <button className="close-btn" onClick={closeNewReservationModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <ReservationForm 
                  onClose={closeNewReservationModal} 
                  onSave={() => {
                    closeNewReservationModal()
                    // Recargar reservaciones
                    if (activeTab === 'agenda') {
                      localStorage.setItem('activeTab', 'agenda')
                      window.location.reload()
                    }
                  }}
                  preselectedCabin={preselectedCabin}
                  preselectedDate={preselectedDate}
                  preselectedCheckOut={preselectedCheckOut}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para vista de agenda
const CalendarView = ({ reservations, page = 0, view = 'week', cabinFilter = 'all', dateRangeStart = '', dateRangeEnd = '', onReservationClick, onNewReservation }) => {
  const today = new Date()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [selectedCabin, setSelectedCabin] = useState('')
  
  let startDate, endDate
  if (dateRangeStart && dateRangeEnd) {
    startDate = new Date(dateRangeStart)
    endDate = new Date(dateRangeEnd)
  } else if (view === 'month') {
    const currentMonth = new Date(today.getFullYear(), today.getMonth() + page, 1)
    startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  } else {
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (page * 7) - 3)
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (page * 7) + 14)
  }
  
  const dates = []
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }
  
  const allCabins = [...new Set(reservations.map(r => r.cabin?.name).filter(Boolean))]
  const cabins = cabinFilter === 'all' ? allCabins : allCabins.filter(name => name === cabinFilter)
  
  const getReservationForCabinAndDate = (cabinName, date) => {
    const dateStr = date.toISOString().split('T')[0]
    return reservations.find(r => 
      r.cabin?.name === cabinName &&
      dateStr >= r.check_in &&
      dateStr <= r.check_out
    )
  }
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return '#d4edda'
      case 'pending': return '#fff3cd'
      case 'cancelled': return '#f8d7da'
      default: return '#e2e3e5'
    }
  }
  
  const formatDate = (date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()]
    }
  }

  const handleStart = (cabinName, dateStr) => {
    if (dateStr < today.toISOString().split('T')[0]) return
    setIsDragging(true)
    setDragStart(dateStr)
    setDragEnd(dateStr)
    setSelectedCabin(cabinName)
  }

  const handleMove = (cabinName, dateStr) => {
    if (isDragging && cabinName === selectedCabin && dateStr >= today.toISOString().split('T')[0]) {
      setDragEnd(dateStr)
    }
  }

  const handleEnd = () => {
    if (isDragging && dragStart && dragEnd && selectedCabin) {
      const startDate = new Date(dragStart)
      const endDate = new Date(dragEnd)
      const checkIn = startDate <= endDate ? dragStart : dragEnd
      const checkOut = startDate <= endDate ? dragEnd : dragStart
      
      onNewReservation && onNewReservation(selectedCabin, checkIn, checkOut)
    }
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
    setSelectedCabin('')
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    if (element && element.closest('.calendar-cell')) {
      const cell = element.closest('.calendar-cell')
      const cellDate = cell.getAttribute('data-date')
      const cellCabin = cell.getAttribute('data-cabin')
      if (cellDate && cellCabin) {
        handleMove(cellCabin, cellDate)
      }
    }
  }

  const isInDragRange = (cabinName, dateStr) => {
    if (!isDragging || cabinName !== selectedCabin || !dragStart || !dragEnd) return false
    const start = new Date(Math.min(new Date(dragStart), new Date(dragEnd)))
    const end = new Date(Math.max(new Date(dragStart), new Date(dragEnd)))
    const current = new Date(dateStr)
    return current >= start && current <= end
  }
  
  return (
    <div className="calendar-view">
      <div 
        className="calendar-grid" 
        style={{'--date-columns': dates.length}}
      >
        <div className="calendar-header">
          <div className="cabin-header">
            <span>Cabañas</span>
          </div>
          {dates.map(date => {
            const formatted = formatDate(date)
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
            return (
              <div key={date.toISOString()} className={`date-header ${isToday ? 'today-header' : ''}`}>
                <div className="date-day-name">{formatted.day}</div>
                <div className="date-number">{formatted.date}</div>
                <div className="date-month">{formatted.month}</div>
              </div>
            )
          })}
        </div>
        
        {cabins.map(cabinName => (
          <div key={cabinName} className="calendar-row">
            <div className="cabin-name">{cabinName}</div>
            {dates.map(date => {
              const reservation = getReservationForCabinAndDate(cabinName, date)
              const dateStr = date.toISOString().split('T')[0]
              const isToday = dateStr === today.toISOString().split('T')[0]
              
              let borderClass = ''
              if (reservation) {
                const isCheckIn = reservation.check_in === dateStr
                const isCheckOut = reservation.check_out === dateStr
                const isMiddle = dateStr > reservation.check_in && dateStr < reservation.check_out
                
                if (isCheckIn && isCheckOut) {
                  borderClass = 'single-day'
                } else if (isCheckIn) {
                  borderClass = 'range-start'
                } else if (isCheckOut) {
                  borderClass = 'range-end'
                } else if (isMiddle) {
                  borderClass = 'range-middle'
                }
              }
              
              return (
                <div 
                  key={date.toISOString()} 
                  className={`calendar-cell ${
                    reservation ? 'occupied' : 'available'
                  } ${isToday ? 'today' : ''} ${borderClass} ${
                    reservation ? `status-${reservation.status}` : ''
                  } ${isInDragRange(cabinName, dateStr) ? 'drag-selected' : ''}`}
                  title={`${dateStr} - ${borderClass}`}
                  data-date={dateStr}
                  data-cabin={cabinName}
                  onClick={() => reservation && onReservationClick && onReservationClick(reservation)}
                  onMouseDown={() => !reservation && handleStart(cabinName, dateStr)}
                  onMouseEnter={() => handleMove(cabinName, dateStr)}
                  onMouseUp={handleEnd}
                  onTouchStart={() => !reservation && handleStart(cabinName, dateStr)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleEnd}
                  style={{ 
                    cursor: reservation ? 'pointer' : (isDragging ? 'grabbing' : 'grab'),
                    backgroundColor: reservation ? getStatusColor(reservation.status) : undefined,
                    userSelect: 'none'
                  }}
                >
                  {reservation ? (
                    <div className="reservation-info">
                      <div className="guest-name">
                        {reservation.guest_name || reservation.user?.name || 'Huésped'}
                      </div>
                      <div className="reservation-dates">
                        {reservation.check_in === dateStr ? 'IN' : ''}
                        {reservation.check_out === dateStr ? 'OUT' : ''}
                      </div>
                    </div>
                  ) : (
                    dateStr >= today.toISOString().split('T')[0] && (
                      <button 
                        className="add-reservation-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNewReservation && onNewReservation(cabinName, dateStr)
                        }}
                        title={`Crear reservación para ${cabinName} el ${dateStr}`}
                      >
                        +
                      </button>
                    )
                  )}
                </div>
              )
            })}
          </div>
        ))}
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
const ReservationForm = ({ onClose, onSave, preselectedCabin = '', preselectedDate = '', preselectedCheckOut = '' }) => {
  const [formData, setFormData] = useState({
    cabin_id: '',
    check_in: preselectedDate,
    check_out: preselectedCheckOut,
    guests: '',
    guest_name: '',
    guest_phone: '',
    payment_method: 'cash',
    payment_status: 'pending',
    includes_breakfast: false
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
          // Set preselected cabin if provided
          if (preselectedCabin && response.cabins) {
            const selectedCabin = response.cabins.find(cabin => cabin.name === preselectedCabin)
            if (selectedCabin) {
              setFormData(prev => ({ ...prev, cabin_id: selectedCabin.id }))
            }
          }
        }
      } catch (err) {
        console.error('Error loading cabins:', err)
      }
    }
    loadCabins()
  }, [preselectedCabin])

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
      <div className="form-group">
        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <input
            type="checkbox"
            checked={formData.includes_breakfast}
            onChange={(e) => setFormData({...formData, includes_breakfast: e.target.checked})}
          />
          Incluir servicio de desayunador (+$150 por persona por noche)
        </label>
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