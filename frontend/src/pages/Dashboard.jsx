import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, User, LogOut, Home, Clock, MapPin, Plus, Star, CreditCard, Bell, X } from 'lucide-react'
import { reservationAlerts, validationAlerts, handleBackendError } from '../utils/alerts'
import './Dashboard.css'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [reservations, setReservations] = useState([])
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [cabins, setCabins] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [reservationData, setReservationData] = useState({
    cabin_id: '',
    check_in: '',
    check_out: '',
    guests: 2,
    special_requests: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!savedUser || !token) {
      navigate('/login')
      return
    }
    
    try {
      const userData = JSON.parse(savedUser)
      setUser(userData)
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      navigate('/login')
      return
    }
    
    // Cargar reservaciones del usuario
    const loadReservations = async () => {
      try {
        const { userAPI } = await import('../services/api')
        const response = await userAPI.getReservations(token)
        console.log('Initial reservations response:', response)
        if (response.ok && Array.isArray(response.reservations)) {
          setReservations(response.reservations)
        } else {
          setReservations([])
        }
      } catch (err) {
        console.error('Error loading reservations:', err)
        setReservations([])
      }
    }
    
    // Cargar cabañas disponibles
    const loadCabins = async () => {
      try {
        const response = await fetch('http://localhost:3000/cabins')
        const data = await response.json()
        if (data.ok) {
          setCabins(data.cabins)
        }
      } catch (err) {
        console.error('Error loading cabins:', err)
      }
    }
    
    loadReservations()
    loadCabins()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/')
  }

  const handleNewReservation = () => {
    setShowReservationModal(true)
  }

  const handleCloseModal = () => {
    setShowReservationModal(false)
    setReservationData({
      cabin_id: '',
      check_in: '',
      check_out: '',
      guests: 2,
      special_requests: ''
    })
  }

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation)
    setShowDetailsModal(true)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedReservation(null)
  }



  const handleInputChange = (e) => {
    const { name, value } = e.target
    setReservationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitReservation = async (e) => {
    e.preventDefault()
    
    // Validaciones del lado cliente
    if (!reservationData.cabin_id) {
      validationAlerts.cabinRequired()
      return
    }

    if (!reservationData.check_in || !reservationData.check_out) {
      validationAlerts.datesRequired()
      return
    }

    if (new Date(reservationData.check_in) >= new Date(reservationData.check_out)) {
      validationAlerts.invalidDateRange()
      return
    }

    const selectedCabin = cabins.find(c => c.id === reservationData.cabin_id)
    if (selectedCabin && reservationData.guests > selectedCabin.capacity) {
      validationAlerts.capacityExceeded(selectedCabin.name, selectedCabin.capacity)
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      console.log('Token:', token)
      console.log('Reservation data:', reservationData)
      
      const response = await fetch('http://localhost:3000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        },
        body: JSON.stringify(reservationData)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      console.log('About to show alert, data.ok:', data.ok)

      if (data.ok) {
        console.log('Showing success alert')
        await reservationAlerts.success()
        handleCloseModal()
        // Recargar reservaciones
        const { userAPI } = await import('../services/api')
        const reservationsResponse = await userAPI.getReservations(token)
        console.log('Reservations response:', reservationsResponse)
        if (reservationsResponse.ok && Array.isArray(reservationsResponse.reservations)) {
          setReservations(reservationsResponse.reservations)
        } else {
          setReservations([])
        }
      } else {
        console.log('Showing error alert for:', data.msg)
        await handleBackendError(data.msg)
      }
    } catch (error) {
      console.log('Showing connection error')
      await reservationAlerts.connectionError()
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div>
              <h1>Bienvenido, {user.name}</h1>
              <p>Panel de Usuario - Cabañas Huasca</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/')} className="btn-home">
              <Home size={16} />
              Inicio
            </button>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <h2>¡Bienvenido de vuelta!</h2>
              <p>Gestiona tus reservaciones y descubre nuevas experiencias en Cabañas Huasca</p>
              <button className="btn-new-reservation" onClick={handleNewReservation}>
                <Plus size={20} />
                Nueva Reservación
              </button>
            </div>

          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3 style={{textAlign: 'left'}}>{reservations.length}</h3>
              <p>Total Reservaciones</p>
              <span className="stat-subtitle">Todas tus estancias</span>
            </div>
          </div>
          
          <div className="stat-card upcoming">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{reservations.filter(r => r.status === 'Confirmada').length}</h3>
              <p>Próximas Estancias</p>
              <span className="stat-subtitle">Confirmadas</span>
            </div>
          </div>
          
          <div className="stat-card pending">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{reservations.filter(r => r.status === 'pending' || r.status === 'pendiente').length}</h3>
              <p>Confirmaciones Pendientes</p>
              <span className="stat-subtitle">Esperando confirmación</span>
            </div>
          </div>
        </div>

        <div className="reservations-section">
          <div className="section-header">
            <h2>Mis Reservaciones</h2>
            <div className="filter-tabs">
              <button className="tab active">Todas</button>
              <button className="tab">Próximas</button>
              <button className="tab">Pasadas</button>
            </div>
          </div>
          
          <div className="reservations-list">
            {reservations.length > 0 ? reservations.map(reservation => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-image">
                  <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&q=80" alt={reservation.cabin} />
                </div>
                
                <div className="reservation-content">
                  <div className="reservation-header">
                    <h3>{reservation.cabin?.name || 'Cabaña'}</h3>
                    <span className={`status ${reservation.status.toLowerCase()}`}>
                      {reservation.status}
                    </span>
                  </div>
                  
                  <div className="reservation-details">
                    <div className="detail">
                      <Calendar size={16} />
                      <span>{reservation.checkIn} - {reservation.checkOut}</span>
                    </div>
                    <div className="detail">
                      <User size={16} />
                      <span>{reservation.guests} huéspedes</span>
                    </div>
                    <div className="detail">
                      <MapPin size={16} />
                      <span>Huasca de Ocampo, Hidalgo</span>
                    </div>
                  </div>
                </div>
                
                <div className="reservation-actions">
                  <div className="total">
                    <span className="price">${reservation.total}</span>
                    <span className="price-label">Total pagado</span>
                  </div>
                  <div className="action-buttons">

                    <button className="btn-primary" onClick={() => handleViewDetails(reservation)}>Ver Detalles</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <Calendar size={48} />
                <h3>No tienes reservaciones aún</h3>
                <p>Comienza tu aventura reservando tu primera cabaña</p>
                <button className="btn-new-reservation" onClick={handleNewReservation}>
                  <Plus size={20} />
                  Hacer Primera Reservación
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nueva Reservación */}
      {showReservationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nueva Reservación</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form className="reservation-form" onSubmit={handleSubmitReservation}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cabaña</label>
                    <select
                      name="cabin_id"
                      value={reservationData.cabin_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar cabaña</option>
                      {cabins.map(cabin => (
                        <option key={cabin.id} value={cabin.id}>
                          {cabin.name} - ${cabin.price_per_night}/noche (Cap: {cabin.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Huéspedes</label>
                    <select
                      name="guests"
                      value={reservationData.guests}
                      onChange={handleInputChange}
                      required
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Entrada</label>
                    <input
                      type="date"
                      name="check_in"
                      value={reservationData.check_in}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Salida</label>
                    <input
                      type="date"
                      name="check_out"
                      value={reservationData.check_out}
                      onChange={handleInputChange}
                      min={reservationData.check_in || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Solicitudes Especiales (Opcional)</label>
                  <textarea
                    name="special_requests"
                    value={reservationData.special_requests}
                    onChange={handleInputChange}
                    placeholder="Ej: Cama extra, decoración especial, etc."
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Reservación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Reservación */}
      {showDetailsModal && selectedReservation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Detalles de Reservación</h3>
              <button className="close-btn" onClick={handleCloseDetailsModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="reservation-details-full">
                <div className="detail-section">
                  <h4>Información General</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Cabaña:</label>
                      <span>{selectedReservation.cabin?.name || 'Cabaña'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Estado:</label>
                      <span className={`status ${selectedReservation.status?.toLowerCase()}`}>
                        {selectedReservation.status === 'confirmed' ? 'Confirmada' :
                         selectedReservation.status === 'pending' ? 'Pendiente' :
                         selectedReservation.status === 'cancelled' ? 'Cancelada' : selectedReservation.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Fecha de entrada:</label>
                      <span>{selectedReservation.check_in}</span>
                    </div>
                    <div className="detail-item">
                      <label>Fecha de salida:</label>
                      <span>{selectedReservation.check_out}</span>
                    </div>
                    <div className="detail-item">
                      <label>Número de huéspedes:</label>
                      <span>{selectedReservation.guests}</span>
                    </div>
                    <div className="detail-item">
                      <label>Total:</label>
                      <span className="price">${selectedReservation.total_price || selectedReservation.total}</span>
                    </div>
                    <div className="detail-item">
                      <label>Monto Pagado:</label>
                      <span className="price">${selectedReservation.amount_paid || 0}</span>
                    </div>
                  </div>
                </div>
                

              </div>
              
              <div className="form-actions">
                <button className="btn-secondary" onClick={handleCloseDetailsModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default Dashboard