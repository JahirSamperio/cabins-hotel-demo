import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart3, Calendar, 
  Home, LogOut, Building,
  X, Star, DollarSign
} from 'lucide-react'
import Swal from 'sweetalert2'
import './Admin.css'
import Agenda from '../components/admin/Agenda'
import Reservations from '../components/admin/Reservations'
import Cabins from '../components/admin/Cabins'
import Reviews from '../components/admin/Reviews'
import Dashboard from '../components/admin/Dashboard'
import FinancialDashboard from '../components/admin/FinancialDashboard'

const Admin = () => {
  const [user, setUser] = useState(null)
  const [reservations, setReservations] = useState([])
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
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedCalendarReservation, setSelectedCalendarReservation] = useState(null)
  const [showNewReservationModal, setShowNewReservationModal] = useState(false)
  const [preselectedDate, setPreselectedDate] = useState('')
  const [preselectedCabin, setPreselectedCabin] = useState('')
  const [preselectedCheckOut, setPreselectedCheckOut] = useState('')
  const navigate = useNavigate()

  const validateToken = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return false
    }
    
    try {
      const { buildApiUrl, API_CONFIG } = await import('../services/apiConfig')
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH_RENEW), {
        headers: { 'x-token': token }
      })
      
      if (!response.ok) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        navigate('/login')
        return false
      }
      
      const data = await response.json()
      if (!data.ok || !data.user.is_admin) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        navigate('/login')
        return false
      }
      
      return true
    } catch (error) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      navigate('/login')
      return false
    }
  }

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
    
    // Validar token antes de continuar
    validateToken().then(isValid => {
      if (isValid) {
        setUser(userData)
      }
    })
    
    setUser(userData)
    
    // Cargar datos del admin
    const loadAdminData = async () => {
      setLoading(true)
      try {
        // Cargar datos según la pestaña activa
        if (activeTab === 'agenda') {
          await loadAgendaReservations(token)
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



  const loadAgendaReservations = async (token) => {
    try {
      const { adminService } = await import('../services/adminService')
      const today = new Date()
      const bufferDays = 30
      const maxDays = 90
      
      const startDate = new Date(today.getTime() - bufferDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = new Date(today.getTime() + maxDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const response = await adminService.getReservationsByDateRange(token, startDate, endDate)
      if (response.ok) {
        setReservations(response.reservations || [])
      }
    } catch (err) {
      console.error('Error loading agenda reservations:', err)
    }
  }







  useEffect(() => {
    if (activeTab === 'agenda') {
      const token = localStorage.getItem('token')
      if (token) {
        loadAgendaReservations(token)
      }
    }
  }, [activeTab])

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
          <button 
            className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            <DollarSign size={16} /> Finanzas
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
            <Dashboard />
          )}

          {activeTab === 'reservations' && !loading && (
            <Reservations />
          )}

          {activeTab === 'cabins' && !loading && (
            <Cabins />
          )}

          {activeTab === 'agenda' && !loading && (
            <Agenda 
              reservations={reservations}
              onReservationClick={openReservationModal}
              onNewReservation={openNewReservationModal}
              onStatusUpdate={handleStatusUpdate}
            />
          )}

          {activeTab === 'reviews' && !loading && (
            <Reviews />
          )}

          {activeTab === 'financial' && !loading && (
            <FinancialDashboard />
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {modalType === 'reservation' && 'Nueva Reservación'}
                </h3>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {modalType === 'reservation' && (
                  <ReservationForm onClose={closeModal} onSave={() => {
                    closeModal()
                    // Recargar reservaciones
                  }} />
                )}
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
                         selectedCalendarReservation.status === 'cancelled' ? 'Cancelada' :
                         selectedCalendarReservation.status === 'completed' ? 'Completada' : selectedCalendarReservation.status}
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
      r.status !== 'cancelled' &&
      dateStr >= r.check_in &&
      dateStr <= r.check_out
    )
  }
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return '#d4edda'
      case 'pending': return '#fff3cd'
      case 'completed': return '#e2d9f3'
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



export default Admin