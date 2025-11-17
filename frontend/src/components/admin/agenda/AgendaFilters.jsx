import { Search, X } from 'lucide-react'

const AgendaFilters = ({ 
  filtersCollapsed, 
  setFiltersCollapsed,
  searchTerm, 
  setSearchTerm,
  calendarCabinFilter, 
  setCalendarCabinFilter,
  selectedMonth, 
  setSelectedMonth,
  selectedYear, 
  setSelectedYear,
  setCalendarPage,
  reservations,
  onClearFilters
}) => {
  return (
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
        <h4 onClick={() => setFiltersCollapsed(!filtersCollapsed)} style={{cursor: 'pointer', margin: 0}}>
          Filtros
        </h4>
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
            className="btn-clear"
            onClick={onClearFilters}
            title="Limpiar todos los filtros"
          >
            <X size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgendaFilters