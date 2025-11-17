import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users, Filter, SortAsc, SortDesc } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Cabanas from '../components/features/Cabanas'
import SEOHead from '../components/ui/SEOHead'
import { cabinsAPI } from '../services/api'
import './CabanasPage.css'

const CabanasPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cabanas, setCabanas] = useState([])
  const [filteredCabanas, setFilteredCabanas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    capacity: searchParams.get('capacity') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'name'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadCabanas = async () => {
      try {
        setLoading(true)
        const response = await cabinsAPI.getAll()
        
        if (response.ok && response.cabins) {
          const activeCabins = response.cabins.filter(cabin => cabin.is_active)
          setCabanas(activeCabins)
          setFilteredCabanas(activeCabins)
        }
      } catch (err) {
        console.error('Error loading cabins:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCabanas()
  }, [])

  useEffect(() => {
    let filtered = [...cabanas]

    // Filtrar por capacidad
    if (filters.capacity) {
      filtered = filtered.filter(cabin => cabin.capacity >= parseInt(filters.capacity))
    }

    // Filtrar por precio máximo
    if (filters.maxPrice) {
      filtered = filtered.filter(cabin => cabin.price_per_night <= parseInt(filters.maxPrice))
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price_per_night - b.price_per_night
        case 'price-desc':
          return b.price_per_night - a.price_per_night
        case 'capacity-asc':
          return a.capacity - b.capacity
        case 'capacity-desc':
          return b.capacity - a.capacity
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredCabanas(filtered)

    // Actualizar URL
    const params = new URLSearchParams()
    if (filters.capacity) params.set('capacity', filters.capacity)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.sortBy !== 'name') params.set('sortBy', filters.sortBy)
    setSearchParams(params)
  }, [filters, cabanas, setSearchParams])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      capacity: '',
      maxPrice: '',
      sortBy: 'name'
    })
  }

  const maxPrice = Math.max(...cabanas.map(c => c.price_per_night), 0)

  return (
    <>
      <SEOHead 
        title="Todas las Cabañas - Huasca de Ocampo | Reserva tu Cabaña"
        description="Explora todas nuestras cabañas en Huasca de Ocampo. Diferentes tamaños y precios para tu estadía perfecta en el pueblo mágico."
        canonical="https://cabanashuasca.com/cabanas"
      />
      
      <Header />
      
      <main className="cabanas-page">
        <div className="page-hero">
          <div className="container">
            <h1>Nuestras Cabañas</h1>
            <p>Encuentra la cabaña perfecta para tu estadía en Huasca de Ocampo</p>
          </div>
        </div>

        <div className="container">
          <div className="cabanas-controls">
            <div className="results-info">
              <span>{filteredCabanas.length} cabaña{filteredCabanas.length !== 1 ? 's' : ''} encontrada{filteredCabanas.length !== 1 ? 's' : ''}</span>
            </div>

            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filtros
            </button>
          </div>

          <div className={`filters-panel ${showFilters ? 'show' : ''}`}>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Capacidad mínima</label>
                <select 
                  value={filters.capacity}
                  onChange={(e) => handleFilterChange('capacity', e.target.value)}
                >
                  <option value="">Cualquiera</option>
                  <option value="2">2+ personas</option>
                  <option value="4">4+ personas</option>
                  <option value="6">6+ personas</option>
                  <option value="8">8+ personas</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Precio máximo por noche</label>
                <input
                  type="range"
                  min="500"
                  max={maxPrice}
                  step="100"
                  value={filters.maxPrice || maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
                <span className="price-display">
                  ${filters.maxPrice ? parseInt(filters.maxPrice).toLocaleString() : maxPrice.toLocaleString()}
                </span>
              </div>

              <div className="filter-group">
                <label>Ordenar por</label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="name">Nombre</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="capacity-asc">Capacidad: menor a mayor</option>
                  <option value="capacity-desc">Capacidad: mayor a menor</option>
                </select>
              </div>

              <div className="filter-actions">
                <button onClick={clearFilters} className="btn btn-secondary">
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando cabañas...</p>
            </div>
          ) : (
            <div className="cabanas-results">
              {filteredCabanas.length > 0 ? (
                <Cabanas cabanas={filteredCabanas} showAll={true} />
              ) : (
                <div className="no-results">
                  <h3>No se encontraron cabañas</h3>
                  <p>Intenta ajustar los filtros para ver más opciones.</p>
                  <button onClick={clearFilters} className="btn btn-primary">
                    Ver todas las cabañas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  )
}

export default CabanasPage