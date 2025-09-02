import { useState, useMemo, useCallback, useEffect } from 'react'

const CalendarView = ({ reservations = [], page = 0, cabinFilter = 'all', selectedMonth, selectedYear, onReservationClick, onNewReservation }) => {
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

  const isInDragRange = (cabinName, dateStr) => {
    if (!isDragging || cabinName !== selectedCabin || !dragStart || !dragEnd) return false
    const start = new Date(Math.min(new Date(dragStart), new Date(dragEnd)))
    const end = new Date(Math.max(new Date(dragStart), new Date(dragEnd)))
    const current = new Date(dateStr)
    return current >= start && current <= end
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const gridElement = document.querySelector('.calendar-grid')
      if (gridElement) {
        gridElement.style.display = 'none'
        gridElement.offsetHeight
        gridElement.style.display = 'grid'
        gridElement.style.setProperty('--date-columns', dates.length)
        gridElement.classList.add('grid-ready')
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [dates.length])
  
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

export default CalendarView