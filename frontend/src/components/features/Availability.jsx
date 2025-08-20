import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Availability.css'

const Availability = () => {
  const { ref, inView } = useLazyLoad()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState({ checkIn: null, checkOut: null })
  const [guests, setGuests] = useState(2)
  const [cabin, setCabin] = useState('')

  const occupiedDates = [
    '2024-12-25', '2024-12-26', '2024-12-31', '2025-01-01',
    '2025-01-15', '2025-01-16', '2025-02-14', '2025-02-15'
  ]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isDateOccupied = (year, month, day) => {
    const dateStr = formatDate(year, month, day)
    return occupiedDates.includes(dateStr)
  }

  const isDateSelected = (year, month, day) => {
    const dateStr = formatDate(year, month, day)
    return selectedDates.checkIn === dateStr || selectedDates.checkOut === dateStr
  }

  const isDateInRange = (year, month, day) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false
    const dateStr = formatDate(year, month, day)
    return dateStr > selectedDates.checkIn && dateStr < selectedDates.checkOut
  }

  const handleDateClick = (year, month, day) => {
    const dateStr = formatDate(year, month, day)
    const today = new Date().toISOString().split('T')[0]
    
    if (dateStr < today || isDateOccupied(year, month, day)) return

    if (!selectedDates.checkIn || (selectedDates.checkIn && selectedDates.checkOut)) {
      setSelectedDates({ checkIn: dateStr, checkOut: null })
    } else if (dateStr > selectedDates.checkIn) {
      setSelectedDates({ ...selectedDates, checkOut: dateStr })
    } else {
      setSelectedDates({ checkIn: dateStr, checkOut: null })
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const handleConsultar = () => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      const nights = Math.ceil((new Date(selectedDates.checkOut) - new Date(selectedDates.checkIn)) / (1000 * 60 * 60 * 24))
      alert(`Consulta: ${selectedDates.checkIn} a ${selectedDates.checkOut} (${nights} noches) para ${guests} huéspedes`)
    } else {
      alert('Por favor selecciona fechas de entrada y salida')
    }
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <section id="availability" className="availability section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Consulta Disponibilidad</h2>
          <p>Selecciona tus fechas y verifica la disponibilidad</p>
        </div>
        
        {inView && (
          <div className="availability-content">
            <div className="calendar-section">
              <div className="calendar-header">
                <button onClick={() => navigateMonth(-1)} className="nav-btn">
                  <ChevronLeft size={20} />
                </button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={() => navigateMonth(1)} className="nav-btn">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="calendar">
                <div className="calendar-days-header">
                  {dayNames.map(day => (
                    <div key={day} className="day-header">{day}</div>
                  ))}
                </div>
                
                <div className="calendar-days">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    if (!day) return <div key={index} className="empty-day"></div>
                    
                    const year = currentDate.getFullYear()
                    const month = currentDate.getMonth()
                    const isOccupied = isDateOccupied(year, month, day)
                    const isSelected = isDateSelected(year, month, day)
                    const isInRange = isDateInRange(year, month, day)
                    const isPast = formatDate(year, month, day) < new Date().toISOString().split('T')[0]
                    
                    return (
                      <div
                        key={day}
                        className={`calendar-day ${
                          isOccupied ? 'occupied' : 'available'
                        } ${
                          isSelected ? 'selected' : ''
                        } ${
                          isInRange ? 'in-range' : ''
                        } ${
                          isPast ? 'past' : ''
                        }`}
                        onClick={() => handleDateClick(year, month, day)}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="calendar-legend">
                <div className="legend-item">
                  <div className="legend-color available"></div>
                  <span>Disponible</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color occupied"></div>
                  <span>Ocupado</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color selected"></div>
                  <span>Seleccionado</span>
                </div>
              </div>
            </div>
            
            <div className="booking-form">
              <h3>Detalles de Reserva</h3>
              
              <div className="selected-dates">
                <div className="date-input">
                  <label>Fecha de entrada</label>
                  <input 
                    type="text" 
                    value={selectedDates.checkIn || 'Seleccionar fecha'} 
                    readOnly 
                  />
                </div>
                <div className="date-input">
                  <label>Fecha de salida</label>
                  <input 
                    type="text" 
                    value={selectedDates.checkOut || 'Seleccionar fecha'} 
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Número de huéspedes</label>
                <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} persona{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Tipo de cabaña (opcional)</label>
                <select value={cabin} onChange={(e) => setCabin(e.target.value)}>
                  <option value="">Cualquier cabaña</option>
                  <option value="familiar">Cabaña Familiar</option>
                  <option value="romantica">Cabaña Romántica</option>
                  <option value="premium">Cabaña Premium</option>
                </select>
              </div>
              
              {selectedDates.checkIn && selectedDates.checkOut && (
                <div className="booking-summary">
                  <h4>Resumen</h4>
                  <p><strong>Fechas:</strong> {selectedDates.checkIn} a {selectedDates.checkOut}</p>
                  <p><strong>Noches:</strong> {Math.ceil((new Date(selectedDates.checkOut) - new Date(selectedDates.checkIn)) / (1000 * 60 * 60 * 24))}</p>
                  <p><strong>Huéspedes:</strong> {guests}</p>
                </div>
              )}
              
              <button 
                className="btn-consultar" 
                onClick={handleConsultar}
                disabled={!selectedDates.checkIn || !selectedDates.checkOut}
              >
                Consultar Disponibilidad
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Availability