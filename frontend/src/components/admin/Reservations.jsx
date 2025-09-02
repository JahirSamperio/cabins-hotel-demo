import { useState, useEffect } from 'react'
import { X, CheckCircle, Edit, Plus, Search } from 'lucide-react'
import Swal from 'sweetalert2'
import '../../pages/Admin.css'

const Reservations = () => {
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [paginationInfo, setPaginationInfo] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [customDate, setCustomDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState({})
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [customTotal, setCustomTotal] = useState(0)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(window.innerWidth <= 991)

  const loadReservationsWithFilters = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { adminService } = await import('../../services/adminService')
      
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

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchLoading(true)
      loadReservationsWithFilters().finally(() => setSearchLoading(false))
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleStatusUpdate = async (reservationId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [reservationId]: newStatus }))
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
        setActionLoading(prev => ({ ...prev, [reservationId]: false }))
        return
      }
    }
    
    try {
      const token = localStorage.getItem('token')
      const { reservationsAPI } = await import('../../services/api')
      
      const response = await reservationsAPI.update(reservationId, { status: newStatus }, token)
      if (response.ok) {
        setReservations(prev => prev.map(res => 
          res.id === reservationId ? { ...res, status: newStatus } : res
        ))
        setFilteredReservations(prev => prev.map(res => 
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
    } finally {
      setActionLoading(prev => ({ ...prev, [reservationId]: false }))
    }
  }

  const handleWhatsAppContact = (reservation) => {
    const phone = reservation.guest_phone || reservation.user?.phone
    if (!phone) return
    
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    
    if (cleanPhone.length < 10) {
      alert('Número de teléfono inválido')
      return
    }
    
    let finalPhone = cleanPhone
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      finalPhone = '52' + cleanPhone
    }
    
    const message = `Hola! Te contacto desde Cabañas Huasca sobre tu reservación para ${reservation.cabin?.name} del ${reservation.check_in} al ${reservation.check_out}.`
    const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
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
    
    setPaymentLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { reservationsAPI } = await import('../../services/api')
      
      const updateData = { 
        amount_paid: parseFloat(paymentAmount),
        total_price: parseFloat(customTotal)
      }
      
      const response = await reservationsAPI.update(selectedReservation.id, updateData, token)
      if (response.ok) {
        const updatedReservation = {
          ...selectedReservation,
          amount_paid: parseFloat(paymentAmount),
          payment_status: response.reservation.payment_status,
          total_price: parseFloat(customTotal)
        }
        
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
    } finally {
      setPaymentLoading(false)
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

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  useEffect(() => {
    loadReservationsWithFilters()
  }, [statusFilter, paymentFilter, bookingTypeFilter, dateFilter, customDate, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, paymentFilter, bookingTypeFilter, dateFilter, customDate])

  const totalPages = paginationInfo.totalPages || 1

  return (
    <div className="reservations-section">
      <div className="section-header">
        <h3>Gestión de Reservaciones</h3>
        <div className="section-actions">
          <button className="btn-primary" onClick={openModal}>
            <Plus size={16} /> Nueva Reservación
          </button>
        </div>
      </div>
      
      <div className="filters-section">
        <div className="filters-header">
          <button 
            className="filters-toggle"
            onClick={() => setFiltersCollapsed(!filtersCollapsed)}
            title={filtersCollapsed ? 'Mostrar filtros' : 'Ocultar filtros'}
          >
            <span className={`toggle-icon ${filtersCollapsed ? 'collapsed' : 'expanded'}`}>
              ▶ 
            </span>
          </button>
          <h4 onClick={() => setFiltersCollapsed(!filtersCollapsed)} style={{cursor: 'pointer', margin: 0}}>Filtros</h4>
        </div>
        
        <div className={`filters-grid ${filtersCollapsed ? 'collapsed' : ''}`}>
          <div className="filter-group search-group">
            <label>Búsqueda avanzada:</label>
            <input 
              type="text" 
              placeholder="Nombre, teléfono, cabaña o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '100%'}}
            />

          </div>
          <div className="filter-group filter-status">
            <label>Estado:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
          <div className="filter-group filter-payment">
            <label>Pago:</label>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="partial">Parcial</option>
              <option value="paid">Pagado</option>
            </select>
          </div>
          <div className="filter-group filter-type">
            <label>Tipo:</label>
            <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="online">Online</option>
              <option value="walk_in">Walk-in</option>
            </select>
          </div>
          <div className="filter-group filter-date">
            <label>Fecha:</label>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">Todas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="custom">Fecha específica</option>
            </select>
          </div>
          <div className="filter-group filter-date-input">
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
            className="btn-clear-filters filter-clear"
            onClick={clearFilters}
            title="Limpiar filtros"
          >
            <X size={14} /> Limpiar
          </button>
          <div className="filter-group filter-items">
            <label>Por página:</label>
            <select value={itemsPerPage} onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value))
              setCurrentPage(1)
            }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="filter-stats" style={{flexShrink: 0, whiteSpace: 'nowrap'}}>
            <span>Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, paginationInfo.totalItems || 0)} de {paginationInfo.totalItems || 0}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando reservaciones...</p>
        </div>
      )}

      {!loading && filteredReservations.length > 0 ? (
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
                {filteredReservations.map(reservation => (
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
                         reservation.status === 'cancelled' ? 'Cancelada' :
                         reservation.status === 'completed' ? 'Completada' : reservation.status}
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
                              disabled={actionLoading[reservation.id]}
                              title="Confirmar"
                            >
                              {actionLoading[reservation.id] === 'confirmed' ? 
                                <div className="button-spinner"></div> : 
                                <CheckCircle size={14} />
                              }
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                              disabled={actionLoading[reservation.id]}
                              title="Cancelar"
                            >
                              {actionLoading[reservation.id] === 'cancelled' ? 
                                <div className="button-spinner"></div> : 
                                <X size={14} />
                              }
                            </button>
                          </>
                        )}
                        {reservation.status === 'confirmed' && (
                          <button 
                            className="cancel-btn"
                            onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                            disabled={actionLoading[reservation.id]}
                            title="Cancelar"
                          >
                            {actionLoading[reservation.id] === 'cancelled' ? 
                              <div className="button-spinner"></div> : 
                              <X size={14} />
                            }
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
      ) : !loading && (
        <div className="no-data">
          <Plus size={48} />
          <h4>{reservations.length === 0 ? 'No hay reservaciones' : 'No hay reservaciones que coincidan con los filtros'}</h4>
          <p>{reservations.length === 0 ? 'Las reservaciones aparecerán aquí cuando los huéspedes hagan reservas' : 'Intenta cambiar los filtros para ver más resultados'}</p>
          <button className="btn-primary" onClick={openModal}>
            <Plus size={16} /> Crear Primera Reservación
          </button>
        </div>
      )}

      {/* Modal de Nueva Reservación */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Reservación</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <ReservationForm 
                onClose={closeModal} 
                onSave={() => {
                  closeModal()
                  loadReservationsWithFilters()
                }} 
              />
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
                <button className="btn-primary" onClick={handlePaymentSave} disabled={paymentLoading}>
                  {paymentLoading ? <div className="button-spinner"></div> : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ReservationForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cabin_id: '',
    check_in: '',
    check_out: '',
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
        const { cabinsAPI } = await import('../../services/api')
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
      const { reservationsAPI } = await import('../../services/api')
      
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

export default Reservations