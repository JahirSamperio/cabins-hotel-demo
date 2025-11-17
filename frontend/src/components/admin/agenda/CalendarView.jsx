import { useState, useMemo, useCallback } from 'react'
import { Ban, DollarSign } from 'lucide-react'

const CalendarView = ({ reservations = [], availability = [], page = 0, cabinFilter = 'all', selectedMonth, selectedYear, onReservationClick, onNewReservation, onAvailabilityClick }) => {
  const today = new Date()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [selectedCabin, setSelectedCabin] = useState('')
  
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
    const reservationCabins = (reservations || []).map(r => r.cabin?.name).filter(Boolean)
    const availabilityCabins = (availability || []).map(a => a.cabin?.name).filter(Boolean)
    const all = [...new Set([...reservationCabins, ...availabilityCabins])]
    const filtered = cabinFilter === 'all' ? all : all.filter(name => name === cabinFilter)
    return { filteredCabins: filtered }
  }, [reservations, availability, cabinFilter])
  
  const quickReserveRow = 'Reservación Rápida'
  const cabins = [quickReserveRow, ...filteredCabins]
  
  const reservationMap = useMemo(() => {
    const map = new Map()
    ;(reservations || []).forEach(r => {
      if (r.status === 'cancelled') return
      
      const checkIn = new Date(r.check_in)
      const checkOut = new Date(r.check_out)
      
      for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
        const key = r.cabin?.name + '-' + d.toISOString().split('T')[0]
        map.set(key, r)
      }
    })
    return map
  }, [reservations])
  
  const availabilityMap = useMemo(() => {
    const map = new Map()
    ;(availability || []).forEach(a => {
      const key = a.cabin?.name + '-' + a.date
      map.set(key, a)
    })
    return map
  }, [availability])
  
  const getReservationForCabinAndDate = useCallback((cabinName, date) => {
    const dateStr = date.toISOString().split('T')[0]
    return reservationMap.get(cabinName + '-' + dateStr)
  }, [reservationMap])
  
  const getAvailabilityForCabinAndDate = useCallback((cabinName, date) => {
    const dateStr = date.toISOString().split('T')[0]
    return availabilityMap.get(cabinName + '-' + dateStr)
  }, [availabilityMap])
  
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
      
      const cabinName = selectedCabin === quickReserveRow ? '' : selectedCabin
      onNewReservation && onNewReservation(cabinName, checkIn, checkOut)
    }
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
    setSelectedCabin('')
  }

  const isInDragRange = (cabinName, dateStr) => {
    if (!isDragging || cabinName !== selectedCabin || !dragStart || !dragEnd) return false
    const start = new Date(Math.min(new Date(dragStart), new Date(dragEnd)))
    const end = new Date(Math.max(new Date(dragStart), new Date(dragEnd)))
    const current = new Date(dateStr)
    return current >= start && current <= end
  }

  const getResponsiveColumns = () => {
    if (typeof window === 'undefined') return '160px repeat(' + dates.length + ', minmax(80px, 1fr))'
    
    const width = window.innerWidth
    
    if (width <= 480) {
      return '80px repeat(' + dates.length + ', 35px)'
    } else if (width <= 767) {
      return '100px repeat(' + dates.length + ', 50px)'
    } else if (width <= 900) {
      return '100px repeat(' + dates.length + ', 50px)'
    } else if (width <= 1200) {
      return '120px repeat(' + dates.length + ', minmax(60px, 1fr))'
    } else if (width <= 1400) {
      return '140px repeat(' + dates.length + ', minmax(70px, 1fr))'
    } else {
      return '160px repeat(' + dates.length + ', minmax(80px, 1fr))'
    }
  }

  if (!dates.length) {
    return (
      <div className="calendar-view" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading">
          <div className="spinner"></div>
          <span>Cargando calendario...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-view">
      <div className="calendar-table-wrapper">
        <div 
          className="calendar-header-row"
          style={{
            display: 'grid',
            gridTemplateColumns: getResponsiveColumns(),
            gap: '1px',
            background: '#e0e0e0',
            marginBottom: '1px'
          }}
        >
          <div className="cabin-header">
            <span>Cabañas</span>
          </div>
          {dates.map(date => {
            const formatted = formatDate(date)
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
            return (
              <div key={'header-' + date.toISOString()} className={'date-header' + (isToday ? ' today-header' : '')}>
                <div className="date-day-name">{formatted.day}</div>
                <div className="date-number">{formatted.date}</div>
                <div className="date-month">{formatted.month}</div>
              </div>
            )
          })}
        </div>

        <div className="calendar-body">
          {cabins.map((cabinName, cabinIndex) => (
            <div 
              key={'cabin-' + cabinName}
              className="cabin-row"
              style={{
                display: 'grid',
                gridTemplateColumns: getResponsiveColumns(),
                gap: '1px',
                background: '#e0e0e0',
                marginBottom: cabinIndex < cabins.length - 1 ? '1px' : '0'
              }}
            >
              <div className={'calendar-cabin-name' + (cabinName === quickReserveRow ? ' quick-reserve-row' : '')}>
                {cabinName}
              </div>
              {dates.map(date => {
                const reservation = getReservationForCabinAndDate(cabinName, date)
                const availabilityRecord = getAvailabilityForCabinAndDate(cabinName, date)
                const dateStr = date.toISOString().split('T')[0]
                const isToday = dateStr === today.toISOString().split('T')[0]
                const isBlocked = availabilityRecord && !availabilityRecord.is_available
                const hasSpecialPrice = availabilityRecord && availabilityRecord.is_available && availabilityRecord.price_override
                
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
                
                const isQuickReserve = cabinName === quickReserveRow
                const cellReservation = isQuickReserve ? null : reservation
                
                const cellClasses = [
                  'calendar-cell',
                  cellReservation ? 'occupied' : (isBlocked ? 'blocked' : (hasSpecialPrice ? 'special-price' : 'available')),
                  isToday ? 'today' : '',
                  borderClass,
                  cellReservation ? 'status-' + cellReservation.status : '',
                  isInDragRange(cabinName, dateStr) ? 'drag-selected' : '',
                  isQuickReserve ? 'quick-reserve-cell' : ''
                ].filter(Boolean).join(' ')
                
                return (
                  <div 
                    key={cabinName + '-' + date.toISOString()} 
                    className={cellClasses}
                    data-cabin={cabinName}
                    data-date={dateStr}
                    onClick={() => {
                      if (cellReservation) {
                        onReservationClick && onReservationClick(cellReservation)
                      } else if ((isBlocked || hasSpecialPrice) && onAvailabilityClick) {
                        onAvailabilityClick(cabinName, dateStr, availabilityRecord)
                      }
                    }}
                    onMouseDown={() => {
                      if ((isQuickReserve || !cellReservation) && !isBlocked && !hasSpecialPrice) {
                        handleStart(cabinName, dateStr)
                      }
                    }}
                    onMouseEnter={() => handleMove(cabinName, dateStr)}
                    onMouseUp={handleEnd}
                    onTouchStart={(e) => {
                      if ((isQuickReserve || !cellReservation) && !isBlocked && !hasSpecialPrice) {
                        e.preventDefault()
                        handleStart(cabinName, dateStr)
                      }
                    }}
                    onTouchMove={(e) => {
                      if (isDragging) {
                        e.preventDefault()
                        const touch = e.touches[0]
                        const element = document.elementFromPoint(touch.clientX, touch.clientY)
                        if (element && element.dataset.cabin && element.dataset.date) {
                          handleMove(element.dataset.cabin, element.dataset.date)
                        }
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (isDragging) {
                        e.preventDefault()
                        handleEnd()
                      }
                    }}
                    style={{ 
                      cursor: cellReservation ? 'pointer' : ((isBlocked || hasSpecialPrice) ? 'pointer' : (isDragging ? 'grabbing' : 'grab')),
                      backgroundColor: cellReservation ? getStatusColor(cellReservation.status) : (isBlocked ? '#ffebee' : (hasSpecialPrice ? '#f0f9ff' : undefined)),
                      userSelect: 'none',
                      touchAction: 'none'
                    }}
                  >
                    {cellReservation ? (
                      <div 
                        className="reservation-info"
                        title={[
                          cellReservation.guest_name || cellReservation.user?.name || 'Huésped',
                          cellReservation.guests + ' huésped' + (cellReservation.guests > 1 ? 'es' : ''),
                          cellReservation.check_in + ' - ' + cellReservation.check_out,
                          cellReservation.includes_breakfast ? 'Con desayunador' : 'Sin desayunador',
                          '$' + cellReservation.total_price + ' (' + (cellReservation.payment_status === 'pending' ? 'Sin pagar' : cellReservation.payment_status === 'paid' ? 'Pagado' : 'Pago parcial') + ')',
                          cellReservation.guest_phone || cellReservation.user?.phone || 'Sin teléfono'
                        ].join('\n')}
                      >
                        <div className="guest-name">
                          {cellReservation.check_in === dateStr && (
                            <span className={'payment-dot payment-' + cellReservation.payment_status}></span>
                          )}
                          {(() => {
                            const checkIn = new Date(cellReservation.check_in)
                            const checkOut = new Date(cellReservation.check_out)
                            const totalDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
                            const middleDay = Math.floor(totalDays / 2)
                            const currentDay = Math.ceil((new Date(dateStr) - checkIn) / (1000 * 60 * 60 * 24))
                            return currentDay === middleDay ? (cellReservation.guest_name || cellReservation.user?.name || 'Huésped') : ''
                          })()}
                        </div>
                        <div className="reservation-dates">
                          {cellReservation.check_in === dateStr ? 'IN' : ''}
                          {cellReservation.check_out === dateStr ? 'OUT' : ''}
                        </div>
                      </div>
                    ) : isBlocked ? (
                      <div 
                        className="blocked-info"
                        title={'Fecha bloqueada para mantenimiento'}
                      >
                        <Ban size={14} style={{ color: '#d32f2f' }} />
                        <div style={{ fontSize: '10px', color: '#666' }}>Bloqueada</div>
                      </div>
                    ) : availabilityRecord && availabilityRecord.is_available && availabilityRecord.price_override ? (
                      <div 
                        className="special-price-info"
                        title={'Precio especial: $' + availabilityRecord.price_override + '/noche'}
                      >
                        <DollarSign size={14} style={{ color: '#059669' }} />
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 'bold' }}>${availabilityRecord.price_override}</div>
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
    </div>
  )
}

export default CalendarView