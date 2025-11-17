import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Plus, Search, Filter } from 'lucide-react'
import { availabilityAdminAPI } from '../../services/availabilityService'
import Swal from 'sweetalert2'
import './AvailabilityManagement.css'

const AvailabilityManagement = () => {
  const [cabins, setCabins] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedCabin, setSelectedCabin] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  const [error, setError] = useState('')

  // Cargar cabañas
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

  // Cargar disponibilidad
  const loadAvailability = async () => {
    const days = (new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)
    if (days < 0 || days > 90) {
      setError('Rango de fechas inválido (máximo 90 días)')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await availabilityAdminAPI.getByRange(
        dateRange.start, 
        dateRange.end, 
        selectedCabin || null, 
        token,
        pagination.page,
        pagination.limit
      )
      
      if (response && response.ok) {
        setAvailability(response.availability || [])
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages
          }))
        }
      } else {
        setAvailability([])
        setError('Error al cargar disponibilidad')
      }
    } catch (err) {
      console.error('Error loading availability:', err)
      setAvailability([])
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCabins()
  }, [])



  // Carga inicial
  useEffect(() => {
    loadCabins()
    loadAvailability()
  }, [])

  // Cuando cambian los filtros, resetear a página 1
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [dateRange.start, dateRange.end, selectedCabin])

  // Cuando cambia la página o los filtros (después del reset), cargar datos
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAvailability()
    }, 200)
    return () => clearTimeout(timer)
  }, [dateRange.start, dateRange.end, selectedCabin, pagination.page])

  const handleDeleteAvailability = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esto restaurará la disponibilidad por defecto para esta fecha',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2c5530',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    
    if (!result.isConfirmed) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await availabilityAdminAPI.delete(id, token)
      
      if (response.ok) {
        loadAvailability()
        Swal.fire({
          title: '¡Eliminado!',
          text: 'Registro eliminado correctamente',
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000
        })
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el registro',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    }
  }

  return (
    <div className="availability-management">
      <div className="section-header">
        <div className="header-info">
          <h3 className="admin-section-title">Gestión de Disponibilidad</h3>
          <p className="section-description">Administra la disponibilidad de cabañas para mantenimiento y precios especiales</p>
        </div>
        <div className="section-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Bloquear Fechas
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="admin-filters-section">
        <div className="admin-filters-grid">
          <div className="admin-filter-group">
            <label className="admin-filter-label">Cabaña</label>
            <select 
              className="admin-filter-select" 
              value={selectedCabin} 
              onChange={(e) => setSelectedCabin(e.target.value)}
            >
              <option value="">Todas las cabañas</option>
              {cabins.map(cabin => (
                <option key={cabin.id} value={cabin.id}>{cabin.name}</option>
              ))}
            </select>
          </div>
          
          <div className="admin-filter-group">
            <label className="admin-filter-label">Fecha inicio</label>
            <input 
              type="date" 
              className="admin-filter-input"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          
          <div className="admin-filter-group">
            <label className="admin-filter-label">Fecha fin</label>
            <input 
              type="date" 
              className="admin-filter-input"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Lista de disponibilidad */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando disponibilidad...</p>
        </div>
      ) : (
        <div className="availability-list">
          {availability.length > 0 ? (
            availability.map(item => (
              <AvailabilityItem 
                key={item.id} 
                item={item} 
                onDelete={() => handleDeleteAvailability(item.id)}
              />
            ))
          ) : (
            <div className="no-data">
              <Calendar size={48} />
              <h4>No hay registros de disponibilidad</h4>
              <p>Las fechas sin registros específicos usan la disponibilidad por defecto</p>
            </div>
          )}
        </div>
      )}



      {/* Info de paginación */}
      {pagination.total > 0 && (
        <div className="pagination-info">
          Mostrando {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
            disabled={pagination.page === 1}
          >
            ← Anterior
          </button>
          
          {[...Array(pagination.totalPages)].map((_, index) => {
            const page = index + 1
            if (page === 1 || page === pagination.totalPages || (page >= pagination.page - 1 && page <= pagination.page + 1)) {
              return (
                <button
                  key={page}
                  className={`pagination-btn ${pagination.page === page ? 'active' : ''}`}
                  onClick={() => setPagination(prev => ({...prev, page}))}
                >
                  {page}
                </button>
              )
            } else if (page === pagination.page - 2 || page === pagination.page + 2) {
              return <span key={page} className="pagination-dots">...</span>
            }
            return null
          })}
          
          <button 
            className="pagination-btn"
            onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
            disabled={pagination.page === pagination.totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal para crear/editar disponibilidad */}
      {showModal && (
        <AvailabilityModal 
          cabins={cabins}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            loadAvailability()
          }}
        />
      )}
    </div>
  )
}

// Componente para item de disponibilidad
const AvailabilityItem = ({ item, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`availability-item ${!item.is_available ? 'blocked' : (item.price_override ? 'special-price' : '')}`}>
      <div className="availability-info">
        <div className="availability-header">
          <h4>{item.cabin?.name || 'Cabaña'}</h4>
          <span className={`status-badge ${item.is_available ? 'special-price' : 'blocked'}`}>
            {item.is_available ? (
              <>
                <CheckCircle size={14} />
                Precio Especial
              </>
            ) : (
              <>
                <XCircle size={14} />
                Bloqueada
              </>
            )}
          </span>
        </div>
        <div className="availability-details">
          <span><Calendar size={14} /> {formatDate(item.date)}</span>
          {item.price_override && (
            <span><span className="price-override">${item.price_override}/noche</span></span>
          )}
        </div>
      </div>
      <div className="availability-actions">
        <button className="delete-btn" onClick={onDelete} title="Eliminar">
          <XCircle size={16} />
        </button>
      </div>
    </div>
  )
}

// Modal para crear disponibilidad
const AvailabilityModal = ({ cabins, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cabin_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    is_available: false,
    price_override: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const submitData = {
        cabin_id: formData.cabin_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_available: formData.is_available,
        price_override: formData.price_override ? parseFloat(formData.price_override) : null,
        reason: formData.reason
      }

      const response = await availabilityAdminAPI.setBulkAvailability(submitData, token)
      
      if (response.ok) {
        await Swal.fire({
          title: '¡Éxito!',
          text: response.msg,
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000
        })
        onSave()
      } else {
        Swal.fire({
          title: 'Error',
          text: response.msg || 'Error al guardar disponibilidad',
          icon: 'error',
          confirmButtonColor: '#2c5530'
        })
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al guardar',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Gestionar Disponibilidad</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="availability-form">
            <div className="form-group">
              <label>Cabaña</label>
              <select 
                value={formData.cabin_id}
                onChange={(e) => setFormData({...formData, cabin_id: e.target.value})}
                required
              >
                <option value="">Seleccionar cabaña</option>
                {cabins.map(cabin => (
                  <option key={cabin.id} value={cabin.id}>{cabin.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha inicio</label>
                <input 
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha fin</label>
                <input 
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select 
                value={formData.is_available}
                onChange={(e) => setFormData({...formData, is_available: e.target.value === 'true'})}
              >
                <option value={false}>Bloquear (No disponible)</option>
                <option value={true}>Habilitar (Disponible)</option>
              </select>
            </div>

            {formData.is_available && (
              <div className="form-group">
                <label>Precio especial (opcional)</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Dejar vacío para usar precio normal"
                  value={formData.price_override}
                  onChange={(e) => setFormData({...formData, price_override: e.target.value})}
                />
              </div>
            )}

            <div className="form-group">
              <label>Motivo (opcional)</label>
              <textarea 
                placeholder="Ej: Mantenimiento, reparaciones, etc."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading && <div className="button-spinner"></div>}
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityManagement