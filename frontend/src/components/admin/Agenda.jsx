import { useState, useEffect, useMemo, useCallback } from 'react'
import { X, CheckCircle, Download, Search } from 'lucide-react'
import Swal from 'sweetalert2'
import './Agenda.css'
import './Agenda-responsive.css'

const Agenda = ({ onStatusUpdate }) => {
  
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

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)



  const [error, setError] = useState('')
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedCalendarReservation, setSelectedCalendarReservation] = useState(null)
  const [showNewReservationModal, setShowNewReservationModal] = useState(false)
  const [preselectedDate, setPreselectedDate] = useState('')
  const [preselectedCabin, setPreselectedCabin] = useState('')
  const [preselectedCheckOut, setPreselectedCheckOut] = useState('')
  const [calendarPage, setCalendarPage] = useState(0)
  const [calendarView] = useState('month')
  const [calendarCabinFilter, setCalendarCabinFilter] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [exportLoading, setExportLoading] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)

  useEffect(() => {
    loadAgendaReservations()
  }, [calendarPage, selectedMonth, selectedYear])

  useEffect(() => {
    // Sincronizar navegación con selector de mes
    const currentDate = new Date()
    const targetMonth = currentDate.getMonth() + calendarPage
    const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12)
    const normalizedMonth = ((targetMonth % 12) + 12) % 12
    
    setSelectedMonth(normalizedMonth)
    setSelectedYear(targetYear)
  }, [calendarPage])

  // Refresh automático al entrar por primera vez
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAgendaReservations()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const loadAgendaReservations = async () => {
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }
      
      const { adminService } = await import('../../services/adminService')
      
      // Usar mes/año seleccionado
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]
      

      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      )
      
      const response = await Promise.race([
        adminService.getReservationsByDateRange(token, startDate, endDate),
        timeoutPromise
      ])
      
      if (response.ok) {

        setReservations(response.reservations || [])
      } else {

        throw new Error(response.msg || 'Error al cargar reservaciones')
      }
    } catch (err) {
      console.error('Error loading agenda reservations:', err)

      
      if (err.message === 'Timeout') {
        setError('La consulta está tardando mucho. Intenta con un rango menor.')
      } else if (err.message === 'No hay token de autenticación') {
        setError('Sesión expirada. Recarga la página.')
      } else {
        setError('Error al cargar las reservaciones. Inténtalo de nuevo.')
      }
      
      setReservations([])
    } finally {
      setLoading(false)
    }
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

  const handleDateRangeChange = (type, value) => {
    if (type === 'start') {
      setDateRangeStart(value)
      if (value && dateRangeEnd) {
        validateDateRange(value, dateRangeEnd)
      } else {
        setDateRangeError('')
      }
    } else {
      setDateRangeEnd(value)
      if (dateRangeStart && value) {
        validateDateRange(dateRangeStart, value)
      } else {
        setDateRangeError('')
      }
    }
  }

  const validateDateRange = (start, end) => {
    if (!start || !end) {
      setDateRangeError('')
      return
    }
    
    const startDate = new Date(start)
    const endDate = new Date(end)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (startDate > endDate) {
      setDateRangeError('La fecha de inicio debe ser anterior a la fecha final')
      return
    }
    
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    
    if (startDate < oneYearAgo) {
      setDateRangeError('No se pueden consultar fechas de más de 1 año atrás')
      return
    }
    
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(today.getFullYear() + 1)
    
    if (endDate > oneYearFromNow) {
      setDateRangeError('No se pueden consultar fechas de más de 1 año en el futuro')
      return
    }
    
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 90) {
      setDateRangeError('El rango máximo es de 3 meses (90 días)')
      return
    }
    
    setDateRangeError('')
  }

  const handleExport = async () => {
    if (dateRangeError) return
    
    setExportLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }
      
      const startDate = dateRangeStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = dateRangeEnd || new Date().toISOString().split('T')[0]
      
      const { secureFetch } = await import('../../utils/apiInterceptor')
      const { buildApiUrl, API_CONFIG } = await import('../../services/apiConfig')
      const response = await secureFetch(buildApiUrl(API_CONFIG.ENDPOINTS.EXPORT_AGENDA, `?startDate=${startDate}&endDate=${endDate}`), {
        headers: { 'x-token': token }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        const csvContent = convertAgendaToCSV(data.data)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `agenda-${startDate}-${endDate}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (error) {
      console.error('Error exporting agenda:', error)
      alert('Error al exportar agenda. Inténtalo de nuevo.')
    } finally {
      setExportLoading(false)
    }
  }
  
  const convertAgendaToCSV = (data) => {
    const { reservations } = data
    
    let csv = 'AGENDA DE RESERVACIONES\n'
    csv += 'ID,Huésped,Teléfono,Cabaña,Check-in,Check-out,Huéspedes,Estado,Estado Pago,Total,Pagado,Desayuno\n'
    
    if (reservations.length > 0) {
      csv += reservations.map(res => [
        res.id,
        res.guest_name || res.user?.name || '',
        res.guest_phone || res.user?.phone || '',
        res.cabin?.name || '',
        res.check_in,
        res.check_out,
        res.guests,
        res.status,
        res.payment_status,
        res.total_price,
        res.amount_paid || 0,
        res.includes_breakfast ? 'Sí' : 'No'
      ].join(',')).join('\n')
    }
    
    return csv
  }

  const filteredReservations = useMemo(() => {
    if (!searchTerm.trim()) return reservations
    
    const term = searchTerm.toLowerCase()
    return reservations.filter(res => {
      const guestName = (res.guest_name || res.user?.name || '').toLowerCase()
      const guestPhone = (res.guest_phone || res.user?.phone || '').toLowerCase()
      const cabinName = (res.cabin?.name || '').toLowerCase()
      
      return guestName.includes(term) || 
             guestPhone.includes(term) || 
             cabinName.includes(term)
    })
  }, [reservations, searchTerm])

  return (
    <>
      <div className="agenda-section agenda-loaded">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando agenda...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button 
              className="btn-retry"
              onClick={loadAgendaReservations}
            >
              Reintentar
            </button>
          </div>
        )}
        
        <div className="section-header">
          <h3>Agenda de Ocupación</h3>
          <div className="payment-legend">
            <span className="legend-item">
              <span className="payment-dot payment-pending"></span>
              Sin pagar
            </span>
            <span className="legend-item">
              <span className="payment-dot payment-partial"></span>
              Pago parcial
            </span>
            <span className="legend-item">
              <span className="payment-dot payment-paid"></span>
              Pagado completo
            </span>
          </div>
          <div className="mobile-hint" style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', display: 'none'}}>
            📱 Toca una reservación para ver detalles • Toca un día libre para crear reservación
          </div>
        </div>
      
        <div className="calendar-controls">
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

            <div className="search-cabin-row">
              <div className="filter-group">
                <label>Buscar:</label>
                <div className="search-input">
                  <Search size={16} />
                  <input 
                    type="text"
                    placeholder="Nombre o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>Cabaña:</label>
                <select value={calendarCabinFilter} onChange={(e) => setCalendarCabinFilter(e.target.value)}>
                  <option value="all">Todas las cabañas</option>
                  {[...new Set(reservations.map(r => r.cabin?.name).filter(Boolean))].map(cabinName => (
                    <option key={cabinName} value={cabinName}>{cabinName}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="month-filter">
              <div className="form-row">
                <div className="form-group">
                  <label>Mes:</label>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => {
                      const month = parseInt(e.target.value)
                      setSelectedMonth(month)
                      const today = new Date()
                      const monthDiff = (selectedYear - today.getFullYear()) * 12 + (month - today.getMonth())
                      setCalendarPage(monthDiff)
                    }}
                  >
                    {Array.from({length: 12}, (_, i) => {
                      const monthName = new Date(2024, i, 1).toLocaleDateString('es-ES', { month: 'long' })
                      return <option key={i} value={i}>{monthName}</option>
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Año:</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => {
                      const year = parseInt(e.target.value)
                      setSelectedYear(year)
                      const today = new Date()
                      const monthDiff = (year - today.getFullYear()) * 12 + (selectedMonth - today.getMonth())
                      setCalendarPage(monthDiff)
                    }}
                  >
                    {Array.from({length: 5}, (_, i) => {
                      const year = new Date().getFullYear() - 1 + i
                      return <option key={year} value={year}>{year}</option>
                    })}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="filter-group">
              <label>&nbsp;</label>
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setCalendarCabinFilter('all')
                  setSearchTerm('')
                  setCalendarPage(0)
                  setSelectedMonth(new Date().getMonth())
                  setSelectedYear(new Date().getFullYear())
                }}
                title="Limpiar todos los filtros"
              >
                <X size={14} /> Limpiar
              </button>
            </div>
            </div>
          </div>
          
          <div className="export-section">
            <button 
              className="btn-export"
              onClick={handleExport}
              disabled={exportLoading}
              title="Exportar agenda a CSV"
            >
              <Download size={14} />
              {exportLoading ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
          
          <div className="calendar-navigation">
            <button 
              className="nav-btn"
              onClick={() => setCalendarPage(prev => prev - 1)}
              title="Mes anterior"
            >
              ← Anterior
            </button>
            <span className="current-period">
              {new Date(new Date().getFullYear(), new Date().getMonth() + calendarPage, 1)
                .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              className="nav-btn"
              onClick={() => setCalendarPage(prev => prev + 1)}
              title="Siguiente mes"
            >
              Siguiente →
            </button>
          </div>
          

        </div>
        
        {!loading && (
          <CalendarView 
            reservations={filteredReservations} 
            page={calendarPage}
            cabinFilter={calendarCabinFilter}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onReservationClick={openReservationModal}
            onNewReservation={openNewReservationModal}
          />
        )}
      </div>

      {/* Modales */}
      {showReservationModal && selectedCalendarReservation && (
        <ReservationDetailsModal 
          reservation={selectedCalendarReservation}
          onClose={closeReservationModal}
          onStatusUpdate={onStatusUpdate}
          onWhatsAppContact={handleWhatsAppContact}
          setReservations={setReservations}
        />
      )}

      {showNewReservationModal && (
        <NewReservationModal 
          onClose={closeNewReservationModal}
          onSave={() => {
            closeNewReservationModal()
            loadAgendaReservations()
          }}
          preselectedCabin={preselectedCabin}
          preselectedDate={preselectedDate}
          preselectedCheckOut={preselectedCheckOut}
        />
      )}
    </>
  )
}
// Componente CalendarView
const CalendarView = ({ reservations = [], page = 0, cabinFilter = 'all', selectedMonth, selectedYear, onReservationClick, onNewReservation }) => {
  const today = new Date()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [selectedCabin, setSelectedCabin] = useState('')
  
  // Usar mes/año seleccionado o navegación
  const targetMonth = selectedMonth !== undefined ? selectedMonth : today.getMonth() + page
  const targetYear = selectedYear !== undefined ? selectedYear : today.getFullYear() + Math.floor(targetMonth / 12)
  const normalizedMonth = ((targetMonth % 12) + 12) % 12
  
  const startDate = new Date(targetYear, normalizedMonth, 1)
  const endDate = new Date(targetYear, normalizedMonth + 1, 0)
  
  const dates = []
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }
  
  const { filteredCabins } = useMemo(() => {
    const all = [...new Set((reservations || []).map(r => r.cabin?.name).filter(Boolean))]
    const filtered = cabinFilter === 'all' ? all : all.filter(name => name === cabinFilter)

    return { filteredCabins: filtered }
  }, [reservations, cabinFilter])
  
  const cabins = filteredCabins
  
  const reservationMap = useMemo(() => {
    const map = new Map()
    ;(reservations || []).forEach(r => {
      if (r.status === 'cancelled') return
      
      const checkIn = new Date(r.check_in)
      const checkOut = new Date(r.check_out)
      
      for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
        const key = `${r.cabin?.name}-${d.toISOString().split('T')[0]}`
        map.set(key, r)
      }
    })
    return map
  }, [reservations])
  
  const getReservationForCabinAndDate = useCallback((cabinName, date) => {
    const dateStr = date.toISOString().split('T')[0]
    return reservationMap.get(`${cabinName}-${dateStr}`)
  }, [reservationMap])
  
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
  
  // Touch events para móvil
  const handleTouchStart = (cabinName, dateStr) => {
    handleStart(cabinName, dateStr)
  }
  
  const handleTouchMove = (e) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const cell = element?.closest('.calendar-cell')
    
    if (cell) {
      const cabinName = cell.dataset.cabin
      const dateStr = cell.dataset.date
      if (cabinName && dateStr) {
        handleMove(cabinName, dateStr)
      }
    }
  }
  
  const handleTouchEnd = () => {
    handleEnd()
  }

  const isInDragRange = (cabinName, dateStr) => {
    if (!isDragging || cabinName !== selectedCabin || !dragStart || !dragEnd) return false
    const start = new Date(Math.min(new Date(dragStart), new Date(dragEnd)))
    const end = new Date(Math.max(new Date(dragStart), new Date(dragEnd)))
    const current = new Date(dateStr)
    return current >= start && current <= end
  }
  
  // Forzar recálculo de CSS Grid al montar el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      const gridElement = document.querySelector('.calendar-grid')
      if (gridElement) {
        gridElement.style.display = 'none'
        gridElement.offsetHeight // Forzar reflow
        gridElement.style.display = 'grid'
        gridElement.style.setProperty('--date-columns', dates.length)
        gridElement.classList.add('grid-ready')
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [dates.length])
  
  // Touch events no pasivos
  useEffect(() => {
    const cells = document.querySelectorAll('.calendar-cell')
    const handleTouchMoveNonPassive = (e) => {
      if (isDragging) {
        e.preventDefault()
        handleTouchMove(e)
      }
    }
    
    cells.forEach(cell => {
      cell.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false })
    })
    
    return () => {
      cells.forEach(cell => {
        cell.removeEventListener('touchmove', handleTouchMoveNonPassive)
      })
    }
  }, [isDragging, handleTouchMove])
  
  return (
    <div className="calendar-view">
      <div className="calendar-grid" style={{'--date-columns': dates.length}}>
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
                  data-cabin={cabinName}
                  data-date={dateStr}
                  onClick={() => reservation && onReservationClick && onReservationClick(reservation)}
                  onMouseDown={() => !reservation && handleStart(cabinName, dateStr)}
                  onMouseEnter={() => handleMove(cabinName, dateStr)}
                  onMouseUp={handleEnd}
                  onTouchStart={() => !reservation && handleTouchStart(cabinName, dateStr)}

                  onTouchEnd={handleTouchEnd}
                  style={{ 
                    cursor: reservation ? 'pointer' : (isDragging ? 'grabbing' : 'grab'),
                    backgroundColor: reservation ? getStatusColor(reservation.status) : undefined,
                    userSelect: 'none',
                    touchAction: 'none'
                  }}
                >
                  {reservation ? (
                    <div 
                      className="reservation-info"
                      title={`${reservation.guest_name || reservation.user?.name || 'Huésped'}
${reservation.guests} huésped${reservation.guests > 1 ? 'es' : ''}
${reservation.check_in} - ${reservation.check_out}
${reservation.includes_breakfast ? 'Con desayunador' : 'Sin desayunador'}
$${reservation.total_price} (${reservation.payment_status === 'pending' ? 'Sin pagar' : reservation.payment_status === 'paid' ? 'Pagado' : 'Pago parcial'})
${reservation.guest_phone || reservation.user?.phone || 'Sin teléfono'}`}
                    >
                      <div className="guest-name">
                        {reservation.check_in === dateStr && (
                          <span className={`payment-dot payment-${reservation.payment_status}`}></span>
                        )}
                        {(() => {
                          const checkIn = new Date(reservation.check_in)
                          const checkOut = new Date(reservation.check_out)
                          const totalDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
                          const middleDay = Math.floor(totalDays / 2)
                          const currentDay = Math.ceil((new Date(dateStr) - checkIn) / (1000 * 60 * 60 * 24))
                          return currentDay === middleDay ? (reservation.guest_name || reservation.user?.name || 'Huésped') : ''
                        })()}
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

// Modal de Detalles de Reservación
const ReservationDetailsModal = ({ reservation, onClose, onStatusUpdate, onWhatsAppContact, setReservations }) => {
  if (!reservation) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Detalles de Reservación</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">
        <div className="reservation-sections">
          <div className="section">
            <h4>Reservación</h4>
            <div className="info-row">
              <span className="label">Cabaña</span>
              <span className="value">{reservation.cabin?.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Estado</span>
              <span className={`status ${reservation.status}`}>
                {reservation.status === 'confirmed' ? 'Confirmada' :
                 reservation.status === 'pending' ? 'Pendiente' :
                 reservation.status === 'cancelled' ? 'Cancelada' :
                 reservation.status === 'completed' ? 'Completada' : reservation.status}
              </span>
            </div>
          </div>
          
          <div className="section">
            <h4>Huésped</h4>
            <div className="info-row">
              <span className="label">Nombre</span>
              <span className="value">{reservation.guest_name || reservation.user?.name}</span>
            </div>
            {(reservation.guest_phone || reservation.user?.phone) && (
              <div className="info-row">
                <span className="label">Teléfono</span>
                <span className="value">{reservation.guest_phone || reservation.user?.phone}</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Huéspedes</span>
              <span className="value">{reservation.guests}</span>
            </div>
          </div>
          
          <div className="section">
            <h4>Fechas</h4>
            <div className="info-row">
              <span className="label">Entrada</span>
              <span className="value">{reservation.check_in}</span>
            </div>
            <div className="info-row">
              <span className="label">Salida</span>
              <span className="value">{reservation.check_out}</span>
            </div>
          </div>
          
          <div className="section">
            <h4>Servicios</h4>
            <div className="info-row">
              <span className="label">Desayunador</span>
              <span className="value">{reservation.includes_breakfast ? 'Incluido' : 'No incluido'}</span>
            </div>
            {reservation.special_requests && (
              <div className="info-row">
                <span className="label">Solicitudes especiales</span>
                <span className="value">{reservation.special_requests}</span>
              </div>
            )}
          </div>
          
          <div className="section">
            <h4>Pago</h4>
            <div className="info-row">
              <span className="label">Total</span>
              <span className="value price">${reservation.total_price}</span>
            </div>
            <div className="info-row">
              <span className="label">Pagado</span>
              <span className="value price">${reservation.amount_paid || 0}</span>
            </div>
            <div className="info-row">
              <span className="label">Estado</span>
              <span className={`payment-status ${reservation.payment_status}`}>
                {reservation.payment_status === 'pending' ? 'Sin Pagar' :
                 reservation.payment_status === 'paid' ? 'Pagado Completo' : 'Pago Parcial'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <div className="action-group-left">
            <button className="btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
          <div className="action-group-center">
            {reservation.status === 'pending' && (
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
                      onStatusUpdate(reservation.id, 'confirmed')
                      setReservations(prev => prev.map(res => 
                        res.id === reservation.id ? { ...res, status: 'confirmed' } : res
                      ))
                      onClose()
                    }
                  })
                }}
              >
                <CheckCircle size={16} /> Confirmar
              </button>
            )}
            {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
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
                      onStatusUpdate(reservation.id, 'cancelled')
                      setReservations(prev => prev.map(res => 
                        res.id === reservation.id ? { ...res, status: 'cancelled' } : res
                      ))
                      onClose()
                    }
                  })
                }}
              >
                <X size={16} /> Cancelar Reservación
              </button>
            )}
          </div>
          <div className="action-group-right">
            {(reservation.guest_phone || reservation.user?.phone) && (
              <button 
                className="btn-whatsapp" 
                onClick={() => onWhatsAppContact(reservation)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.251"/>
                </svg>
                Contactar
              </button>
            )}
            <PaymentEditButton 
              reservation={reservation}
              setReservations={setReservations}
              onPaymentUpdate={(updatedReservation) => {
                // Actualizar la reservación en el modal de detalles
                Object.assign(reservation, updatedReservation)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

// Modal de Nueva Reservación
const NewReservationModal = ({ onClose, onSave, preselectedCabin, preselectedDate, preselectedCheckOut }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Nueva Reservación</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">
        <ReservationForm 
          onClose={onClose} 
          onSave={onSave}
          preselectedCabin={preselectedCabin}
          preselectedDate={preselectedDate}
          preselectedCheckOut={preselectedCheckOut}
        />
      </div>
    </div>
  </div>
  )
}

// Formulario de Reservación
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
        const { cabinsAPI } = await import('../../services/api')
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

  const validateForm = () => {
    const errors = []
    
    if (!formData.cabin_id) errors.push('Selecciona una cabaña')
    if (!formData.guest_name.trim()) errors.push('Ingresa el nombre del huésped')
    if (!formData.guest_phone.trim()) errors.push('Ingresa el teléfono')
    if (!formData.check_in) errors.push('Selecciona fecha de check-in')
    if (!formData.check_out) errors.push('Selecciona fecha de check-out')
    if (!formData.guests || formData.guests < 1) errors.push('Ingresa número de huéspedes válido')
    
    if (formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (checkIn < today) errors.push('La fecha de check-in no puede ser pasada')
      if (checkOut <= checkIn) errors.push('La fecha de check-out debe ser posterior al check-in')
      
      const diffTime = checkOut - checkIn
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      if (diffDays > 30) errors.push('La estadía no puede ser mayor a 30 días')
    }
    
    if (formData.guest_phone && !/^[0-9]{10,}$/.test(formData.guest_phone.replace(/[^0-9]/g, ''))) {
      errors.push('Ingresa un teléfono válido (mínimo 10 dígitos)')
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      Swal.fire({
        title: 'Errores en el formulario',
        html: validationErrors.map(error => `• ${error}`).join('<br>'),
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }
      
      const { reservationsAPI } = await import('../../services/api')
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
      
      const response = await Promise.race([
        reservationsAPI.createWalkIn({
          ...formData,
          guests: parseInt(formData.guests)
        }, token),
        timeoutPromise
      ])
      
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
      
      let errorMessage = 'Error al crear la reservación'
      if (err.message === 'Timeout') {
        errorMessage = 'La operación está tardando mucho. Inténtalo de nuevo.'
      } else if (err.message === 'No hay token de autenticación') {
        errorMessage = 'Sesión expirada. Recarga la página.'
      }
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
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
        <button type="button" className="btn-secondary" onClick={onClose}>
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

// Componente para editar pago
const PaymentEditButton = ({ reservation, setReservations, onPaymentUpdate }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(reservation.amount_paid || 0)
  const [customTotal, setCustomTotal] = useState(reservation.total_price || 0)
  const [paymentLoading, setPaymentLoading] = useState(false)

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

  const validatePayment = () => {
    const errors = []
    const total = parseFloat(customTotal)
    const paid = parseFloat(paymentAmount)
    
    if (isNaN(total) || total < 0) errors.push('El total debe ser un número válido mayor o igual a 0')
    if (isNaN(paid) || paid < 0) errors.push('El monto pagado debe ser un número válido mayor o igual a 0')
    if (paid > total) errors.push('El monto pagado no puede ser mayor al total')
    
    return errors
  }

  const handlePaymentSave = async () => {
    const validationErrors = validatePayment()
    if (validationErrors.length > 0) {
      Swal.fire({
        title: 'Errores en el pago',
        html: validationErrors.map(error => `• ${error}`).join('<br>'),
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
      return
    }
    
    setPaymentLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }
      
      const { reservationsAPI } = await import('../../services/api')
      
      const updateData = { 
        amount_paid: parseFloat(paymentAmount),
        total_price: parseFloat(customTotal)
      }
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      )
      
      const response = await Promise.race([
        reservationsAPI.update(reservation.id, updateData, token),
        timeoutPromise
      ])
      
      if (response.ok) {
        const updatedReservation = {
          ...reservation,
          amount_paid: parseFloat(paymentAmount),
          payment_status: response.reservation.payment_status,
          total_price: parseFloat(customTotal)
        }
        
        setReservations(prev => prev.map(res => 
          res.id === reservation.id ? updatedReservation : res
        ))
        
        if (onPaymentUpdate) {
          onPaymentUpdate(updatedReservation)
        }
        
        setShowPaymentModal(false)
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Pago actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000
        })
      } else {
        throw new Error(response.msg || 'Error al actualizar el pago')
      }
    } catch (err) {
      console.error('Error updating payment:', err)
      
      let errorMessage = 'Error al actualizar el pago'
      if (err.message === 'Timeout') {
        errorMessage = 'La operación está tardando mucho. Inténtalo de nuevo.'
      } else if (err.message === 'No hay token de autenticación') {
        errorMessage = 'Sesión expirada. Recarga la página.'
      }
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <>
      <button 
        className="btn-primary" 
        onClick={() => setShowPaymentModal(true)}
      >
        Editar Pago
      </button>

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gestionar Pago</h3>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-info">
                <p><strong>Reservación:</strong> {reservation.cabin?.name}</p>
                <p><strong>Huésped:</strong> {reservation.guest_name || reservation.user?.name}</p>
                <p><strong>Estado actual:</strong> 
                  <span className={`payment-status ${reservation.payment_status}`}>
                    {reservation.payment_status === 'pending' ? 'Pendiente' :
                     reservation.payment_status === 'paid' ? 'Pagado' : 'Parcial'}
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
                <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancelar
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handlePaymentSave}
                  disabled={paymentLoading}
                >
                  {paymentLoading && <div className="button-spinner"></div>}
                  {paymentLoading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export { CalendarView, ReservationDetailsModal, NewReservationModal, ReservationForm, PaymentEditButton }
export default Agenda