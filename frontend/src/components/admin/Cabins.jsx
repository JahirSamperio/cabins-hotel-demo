import { useState, useEffect, useMemo, useCallback } from 'react'
import { Users, DollarSign, Edit, Eye, Trash2, Plus, Building, X, Search, Filter } from 'lucide-react'
import Swal from 'sweetalert2'
import '../../pages/Admin.css'
import './Cabins.css'
import '../../styles/AdminDesignSystem.css'

const Cabins = () => {
  const [cabins, setCabins] = useState([])
  const [filteredCabins, setFilteredCabins] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)

  const loadCabins = async () => {
    setLoading(true)
    try {
      const { cabinsAPI } = await import('../../services/api')
      const response = await cabinsAPI.getAll()
      if (response.ok) {
        setCabins(response.cabins || [])
        setFilteredCabins(response.cabins || [])
      }
    } catch (err) {
      console.error('Error loading cabins:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter cabins
  useEffect(() => {
    let filtered = cabins

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cabin => 
        cabin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cabin.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      filtered = filtered.filter(cabin => {
        if (capacityFilter === '1-2') return cabin.capacity <= 2
        if (capacityFilter === '3-4') return cabin.capacity >= 3 && cabin.capacity <= 4
        if (capacityFilter === '5+') return cabin.capacity >= 5
        return true
      })
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(cabin => {
        if (priceFilter === 'low') return cabin.price_per_night < 1000
        if (priceFilter === 'medium') return cabin.price_per_night >= 1000 && cabin.price_per_night < 2000
        if (priceFilter === 'high') return cabin.price_per_night >= 2000
        return true
      })
    }

    setFilteredCabins(filtered)
    setCurrentPage(1)
  }, [cabins, searchTerm, capacityFilter, priceFilter])

  // Memoizar paginación
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredCabins.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedCabins = filteredCabins.slice(startIndex, startIndex + itemsPerPage)
    return { totalPages, paginatedCabins }
  }, [filteredCabins, currentPage, itemsPerPage])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setCapacityFilter('all')
    setPriceFilter('all')
    setCurrentPage(1)
  }, [])

  const handleDeleteItem = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2c5530',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    
    if (!result.isConfirmed) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const { cabinsAPI } = await import('../../services/api')
      const response = await cabinsAPI.delete(id, token)
      
      if (response.ok) {
        setCabins(prev => prev.filter(item => item.id !== id))
        Swal.fire({
          title: '¡Eliminado!',
          text: 'La cabaña ha sido eliminada correctamente',
          icon: 'success',
          confirmButtonColor: '#2c5530'
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: response.msg || 'No se pudo eliminar la cabaña',
          icon: 'error',
          confirmButtonColor: '#2c5530'
        })
      }
    } catch (err) {
      console.error('Error deleting cabin:', err)
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al eliminar la cabaña',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    }
  }

  const openModal = useCallback((type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setShowModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setModalType('')
    setSelectedItem(null)
  }, [])

  const handleSave = () => {
    closeModal()
    loadCabins()
  }

  useEffect(() => {
    loadCabins()
  }, [])

  return (
    <div className="cabins-section">
      <div className="section-header">
        <div className="header-info">
          <h3 className="admin-section-title">Gestión de Cabañas</h3>
          {!loading && cabins.length > 0 && (
            <span className="cabins-count">
              {filteredCabins.length} de {cabins.length} cabaña{cabins.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="section-actions">
          <button className="btn-primary" onClick={() => openModal('cabin')}>
            <Plus size={16} /> <span className="btn-text">Nueva Cabaña</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {!loading && cabins.length > 0 && (
        <div className="admin-filters-section">
          <div className="admin-filters-grid">
            <div className="admin-filter-group admin-search-group">
              <label className="admin-filter-label">Buscar cabañas</label>
              <div className="admin-search-group">
                <Search size={16} className="admin-search-icon" />
                <input 
                  type="text"
                  className="admin-filter-input admin-search-input"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="admin-filter-group">
              <label className="admin-filter-label">Capacidad</label>
              <select 
                className="admin-filter-select" 
                value={capacityFilter} 
                onChange={(e) => setCapacityFilter(e.target.value)}
              >
                <option value="all">Todas las capacidades</option>
                <option value="1-2">1-2 personas</option>
                <option value="3-4">3-4 personas</option>
                <option value="5+">5+ personas</option>
              </select>
            </div>
            
            <div className="admin-filter-group">
              <label className="admin-filter-label">Precio por noche</label>
              <select 
                className="admin-filter-select" 
                value={priceFilter} 
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">Todos los precios</option>
                <option value="low">Menos de $1,000</option>
                <option value="medium">$1,000 - $2,000</option>
                <option value="high">Más de $2,000</option>
              </select>
            </div>
            
            <div className="admin-filter-group">
              <label className="admin-filter-label">&nbsp;</label>
              <button className="btn-clear" onClick={clearFilters}>
                <X size={14} /> Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando cabañas...</p>
        </div>
      )}

      {!loading && filteredCabins.length > 0 ? (
        <>
          <div className="cabins-list">
            {paginationData.paginatedCabins.map(cabin => (
              <CabinListItem key={cabin.id} cabin={cabin} onEdit={() => openModal('cabin', cabin)} onView={() => openModal('view-cabin', cabin)} onDelete={() => handleDeleteItem(cabin.id)} />
            ))}
          </div>
          
          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <div className="admin-pagination">
              <button 
                className="admin-pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>
              
              {[...Array(paginationData.totalPages)].map((_, index) => {
                const page = index + 1
                if (page === 1 || page === paginationData.totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      className={`admin-pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="admin-pagination-dots">...</span>
                }
                return null
              })}
              
              <button 
                className="admin-pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationData.totalPages))}
                disabled={currentPage === paginationData.totalPages}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : !loading && filteredCabins.length === 0 && cabins.length > 0 ? (
        <div className="no-results">
          <Filter size={48} />
          <h4>No se encontraron cabañas</h4>
          <p>Intenta cambiar los filtros para ver más resultados</p>
          <button className="btn-secondary" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      ) : !loading && cabins.length === 0 ? (
        <div className="no-data">
          <Building size={48} />
          <h4>No hay cabañas registradas</h4>
          <p>Comienza agregando tu primera cabaña para empezar a recibir reservaciones</p>
          <button className="btn-primary" onClick={() => openModal('cabin')}>
            <Plus size={16} /> Crear Primera Cabaña
          </button>
        </div>
      ) : null}


      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'cabin' && (selectedItem ? 'Editar Cabaña' : 'Nueva Cabaña')}
                {modalType === 'view-cabin' && 'Detalles de Cabaña'}
              </h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {modalType === 'cabin' && (
                <CabinForm cabin={selectedItem} onClose={closeModal} onSave={handleSave} />
              )}
              {modalType === 'view-cabin' && selectedItem && (
                <CabinDetails cabin={selectedItem} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para formulario de cabañas
const CabinForm = ({ cabin, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: cabin?.name || '',
    description: cabin?.description || '',
    capacity: cabin?.capacity || '',
    price_per_night: cabin?.price_per_night || ''
  })
  const [imageUrls, setImageUrls] = useState('')
  const [amenitiesList, setAmenitiesList] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (cabin?.images && Array.isArray(cabin.images)) {
      setImageUrls(cabin.images.join('\n'))
    }
    if (cabin?.amenities && Array.isArray(cabin.amenities)) {
      setAmenitiesList(cabin.amenities.join('\n'))
    }
  }, [cabin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { cabinsAPI } = await import('../../services/api')
      
      const manualUrls = imageUrls.split('\n').filter(url => url.trim()).map(url => url.trim())
      const uploadedUrls = uploadedImages.map(img => img.imageUrl)
      const allImages = [...uploadedUrls, ...manualUrls]
      const amenitiesArray = amenitiesList.split('\n').filter(item => item.trim()).map(item => item.trim())
      
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price_per_night: parseFloat(formData.price_per_night),
        images: allImages,
        amenities: amenitiesArray
      }
      
      const response = cabin 
        ? await cabinsAPI.update(cabin.id, submitData, token)
        : await cabinsAPI.create(submitData, token)
      
      if (response.ok) {
        await Swal.fire({
          title: '¡Éxito!',
          text: cabin ? 'Cabaña actualizada correctamente' : 'Cabaña creada correctamente',
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000,
          showConfirmButton: false
        })
        onSave()
      } else {
        Swal.fire({
          title: 'Error',
          text: response.msg || 'Error al guardar la cabaña',
          icon: 'error',
          confirmButtonColor: '#2c5530'
        })
      }
    } catch (err) {
      console.error('Error saving cabin:', err)
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al guardar la cabaña',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return
    
    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const { uploadAPI } = await import('../../services/api')
      
      const response = await uploadAPI.uploadImages(selectedFiles, 'cabins', token)
      
      if (response.success) {
        setUploadedImages(prev => [...prev, ...response.data])
        setSelectedFiles([])
        const fileInput = document.querySelector('.file-input')
        if (fileInput) fileInput.value = ''
        Swal.fire({
          title: '¡Éxito!',
          text: `${response.data.length} imagen(es) subida(s) correctamente`,
          icon: 'success',
          confirmButtonColor: '#2c5530',
          timer: 2000
        })
      } else {
        Swal.fire({
          title: 'Error',
          text: response.message || 'Error al subir imágenes',
          icon: 'error',
          confirmButtonColor: '#2c5530'
        })
      }
    } catch (err) {
      console.error('Error uploading images:', err)
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al subir las imágenes',
        icon: 'error',
        confirmButtonColor: '#2c5530'
      })
    } finally {
      setUploading(false)
    }
  }

  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="cabin-form">
      <div className="form-group">
        <label>Nombre</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required 
        />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required 
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Capacidad</label>
          <input 
            type="number" 
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            required 
          />
        </div>
        <div className="form-group">
          <label>Precio por noche</label>
          <input 
            type="number" 
            step="0.01"
            value={formData.price_per_night}
            onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
            required 
          />
        </div>
      </div>
      <div className="form-group">
        <label>Amenidades (una por línea)</label>
        <textarea 
          value={amenitiesList}
          onChange={(e) => setAmenitiesList(e.target.value)}
          placeholder="Ejemplo:&#10;WiFi gratuito&#10;Cocina equipada&#10;Chimenea&#10;Jacuzzi"
          rows="4"
        />
      </div>
      <div className="form-group">
        <label>Subir Imágenes</label>
        <input 
          type="file" 
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <p>{selectedFiles.length} archivo(s) seleccionado(s)</p>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleUploadImages}
              disabled={uploading}
            >
              {uploading && <div className="button-spinner"></div>}
              {uploading ? 'Subiendo...' : 'Subir Imágenes'}
            </button>
          </div>
        )}
        {uploadedImages.length > 0 && (
          <div className="uploaded-images">
            <p>Imágenes subidas:</p>
            <div className="images-grid">
              {uploadedImages.map((img, index) => (
                <div key={index} className="uploaded-image">
                  <img src={img.imageUrl} alt={`Subida ${index + 1}`} />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => removeUploadedImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="form-group">
        <label>URLs Adicionales (una por línea)</label>
        <textarea 
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          placeholder="URLs adicionales si las tienes"
          rows="3"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <div className="button-spinner"></div>}
          {loading ? 'Guardando...' : (cabin ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  )
}

// Componente para detalles de cabaña
const CabinDetails = ({ cabin }) => {
  return (
    <div className="cabin-details">
      <h4>{cabin.name}</h4>
      <p><strong>Capacidad:</strong> {cabin.capacity} personas</p>
      <p><strong>Precio:</strong> ${cabin.price_per_night}/noche</p>
      <p><strong>Descripción:</strong> {cabin.description}</p>
      
      {cabin.amenities && Array.isArray(cabin.amenities) && cabin.amenities.length > 0 && (
        <div>
          <p><strong>Amenidades:</strong></p>
          <ul>
            {cabin.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}
      
      {cabin.images && Array.isArray(cabin.images) && cabin.images.length > 0 && (
        <div>
          <p><strong>Imágenes:</strong></p>
          <div className="images-preview">
            {cabin.images.slice(0, 3).map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`${cabin.name} ${index + 1}`}
                className="cabin-image-preview"
                onError={(e) => e.target.style.display = 'none'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente CabinListItem para vista de lista
const CabinListItem = ({ cabin, onEdit, onView, onDelete }) => {
  const isMobile = window.innerWidth <= 599
  
  return (
    <div className={`cabin-list-item ${isMobile ? 'mobile' : ''}`}>
      <div className="cabin-info">
        <h4>{cabin.name}</h4>
        <div className="cabin-details">
          <span><Users size={14} /> {cabin.capacity} personas</span>
          <span><DollarSign size={14} /> ${cabin.price_per_night}/noche</span>
        </div>
        <p>{cabin.description}</p>
      </div>
      <div className="cabin-actions">
        <button className="edit-btn" onClick={onEdit} title="Editar">
          <Edit size={16} />
        </button>
        <button className="view-btn" onClick={onView} title="Ver">
          <Eye size={16} />
        </button>
        <button className="delete-btn" onClick={onDelete} title="Eliminar">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

export default Cabins