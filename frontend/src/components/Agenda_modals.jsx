        {!loading && (
          <CalendarView 
            reservations={reservations} 
            page={calendarPage}
            view={calendarView}
            cabinFilter={calendarCabinFilter}
            dateRangeStart={dateRangeStart}
            dateRangeEnd={dateRangeEnd}
            onReservationClick={openReservationModal}
            onNewReservation={openNewReservationModal}
          />
        )}
      </div>

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
                            onStatusUpdate(selectedCalendarReservation.id, 'confirmed')
                            setReservations(prev => prev.map(res => 
                              res.id === selectedCalendarReservation.id ? { ...res, status: 'confirmed' } : res
                            ))
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
                            onStatusUpdate(selectedCalendarReservation.id, 'cancelled')
                            setReservations(prev => prev.map(res => 
                              res.id === selectedCalendarReservation.id ? { ...res, status: 'cancelled' } : res
                            ))
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
                      onClick={() => onWhatsAppContact(selectedCalendarReservation)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.251"/>
                      </svg>
                      Contactar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nueva Reservación */}
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
                  loadAgendaReservations()
                }}
                preselectedCabin={preselectedCabin}
                preselectedDate={preselectedDate}
                preselectedCheckOut={preselectedCheckOut}
              />
            </div>
          </div>
        </div>
      )}
    </>
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