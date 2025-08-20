import { useState } from 'react'
import { Star, ThumbsUp, MessageCircle, Filter } from 'lucide-react'
import { useLazyLoad } from '../../hooks/useLazyLoad'
import './Reviews.css'

const Reviews = () => {
  const { ref, inView } = useLazyLoad()
  const [filter, setFilter] = useState('all')

  const reviews = [
    {
      id: 1,
      name: 'Laura Pérez',
      rating: 5,
      date: '15 Dic 2023',
      title: 'Experiencia perfecta',
      text: 'Todo estuvo increíble, desde la limpieza hasta la atención. La cabaña tenía una vista espectacular.',
      helpful: 12,
      category: 'familiar'
    },
    {
      id: 2,
      name: 'Miguel Torres',
      rating: 5,
      date: '8 Dic 2023',
      title: 'Muy recomendable',
      text: 'Perfecto para desconectarse. La alberca estaba perfecta y la cocina muy bien equipada.',
      helpful: 8,
      category: 'pareja'
    },
    {
      id: 3,
      name: 'Carmen Jiménez',
      rating: 4,
      date: '2 Dic 2023',
      title: 'Buena experiencia',
      text: 'Muy buen lugar, solo el WiFi podría ser un poco más rápido. Por lo demás, excelente.',
      helpful: 5,
      category: 'trabajo'
    },
    {
      id: 4,
      name: 'José Ramírez',
      rating: 5,
      date: '28 Nov 2023',
      title: 'Increíble fin de semana',
      text: 'Las instalaciones están impecables y la ubicación es perfecta para conocer Huasca.',
      helpful: 15,
      category: 'familiar'
    }
  ]

  const ratingStats = [
    { stars: 5, count: 120, percentage: 80 },
    { stars: 4, count: 25, percentage: 17 },
    { stars: 3, count: 3, percentage: 2 },
    { stars: 2, count: 1, percentage: 1 },
    { stars: 1, count: 1, percentage: 0 }
  ]

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => review.category === filter)

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? '#d4af37' : 'none'}
        color={i < rating ? '#d4af37' : '#ddd'}
      />
    ))
  }

  const averageRating = 4.8
  const totalReviews = 150

  return (
    <section className="reviews section" ref={ref}>
      <div className="container">
        <div className="section-header text-center">
          <h2>Reseñas de Huéspedes</h2>
          <p>Opiniones reales de nuestros visitantes</p>
        </div>
        
        {inView && (
          <div className="reviews-content">
            <div className="reviews-summary">
              <div className="rating-overview">
                <div className="overall-rating">
                  <span className="rating-number">{averageRating}</span>
                  <div className="rating-stars">
                    {renderStars(Math.floor(averageRating))}
                  </div>
                  <span className="total-reviews">{totalReviews} reseñas</span>
                </div>
                
                <div className="rating-breakdown">
                  {ratingStats.map((stat) => (
                    <div key={stat.stars} className="rating-bar">
                      <span className="stars-label">{stat.stars}</span>
                      <Star size={12} fill="#d4af37" color="#d4af37" />
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="count">({stat.count})</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="reviews-filters">
                <h4>Filtrar por:</h4>
                <div className="filter-buttons">
                  <button 
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                  >
                    Todas
                  </button>
                  <button 
                    className={filter === 'familiar' ? 'active' : ''}
                    onClick={() => setFilter('familiar')}
                  >
                    Familiar
                  </button>
                  <button 
                    className={filter === 'pareja' ? 'active' : ''}
                    onClick={() => setFilter('pareja')}
                  >
                    Pareja
                  </button>
                  <button 
                    className={filter === 'trabajo' ? 'active' : ''}
                    onClick={() => setFilter('trabajo')}
                  >
                    Trabajo
                  </button>
                </div>
              </div>
            </div>
            
            <div className="reviews-list">
              {filteredReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4>{review.name}</h4>
                        <span className="review-date">{review.date}</span>
                      </div>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  <div className="review-content">
                    <h5>{review.title}</h5>
                    <p>{review.text}</p>
                  </div>
                  
                  <div className="review-actions">
                    <button className="helpful-btn">
                      <ThumbsUp size={14} />
                      Útil ({review.helpful})
                    </button>
                    <button className="reply-btn">
                      <MessageCircle size={14} />
                      Responder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Reviews