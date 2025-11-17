import { useState, useEffect, useCallback } from 'react'
import { Star, CheckCircle, X } from 'lucide-react'
import '../../pages/Admin.css'
import '../../styles/AdminDesignSystem.css'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)

  const loadReviews = async () => {
    setLoading(true)
    try {
      const { reviewsAPI } = await import('../../services/api')
      const response = await reviewsAPI.getAll()
      if (response.ok) {
        // Filtrar solo reviews no aprobados para el panel admin
        const pendingReviews = response.reviews?.filter(review => !review.approved) || []
        setReviews(pendingReviews)
      }
    } catch (err) {
      console.error('Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewAction = useCallback(async (reviewId, action) => {
    try {
      const token = localStorage.getItem('token')
      const { reviewsAPI } = await import('../../services/api')
      
      const approved = action === 'approve'
      const response = await reviewsAPI.approve(reviewId, approved, token)
      
      if (response.ok) {
        // Remover de la lista de pendientes
        setReviews(prev => prev.filter(review => review.id !== reviewId))
      }
    } catch (err) {
      console.error('Error handling review:', err)
    }
  }, [])

  useEffect(() => {
    loadReviews()
  }, [])

  return (
    <div className="reviews-section">
      <div className="section-header">
        <h3 className="admin-section-title">Reviews Pendientes</h3>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando reviews...</p>
        </div>
      )}

      {!loading && reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-info">
                <h4>{review.user?.name || 'Usuario'}</h4>
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < review.rating ? '#ffc107' : 'none'} 
                      color="#ffc107" 
                    />
                  ))}
                </div>
                <p>{review.comment}</p>
                <small>Cabaña: {review.cabin?.name || 'N/A'}</small>
              </div>
              <div className="review-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleReviewAction(review.id, 'approve')}
                >
                  <CheckCircle size={14} /> Aprobar
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleReviewAction(review.id, 'reject')}
                >
                  <X size={14} /> Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="no-data">
          <Star size={48} />
          <h4>No hay reviews pendientes</h4>
          <p>Todas las reviews han sido procesadas o no hay reviews nuevas</p>
        </div>
      )}
    </div>
  )
}

export default Reviews