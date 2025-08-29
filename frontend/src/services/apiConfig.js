// Configuración centralizada de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    // Auth
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_RENEW: '/auth/renew',
    
    // Admin
    ADMIN_STATS: '/admin/stats',
    ADMIN_RECENT_BOOKINGS: '/admin/recent-bookings',
    
    // Reservations
    RESERVATIONS: '/reservations',
    RESERVATIONS_RANGE: '/reservations/range',
    RESERVATIONS_WALK_IN: '/reservations/walk-in',
    
    // Cabins
    CABINS: '/cabins',
    
    // Reviews
    REVIEWS: '/reviews',
    REVIEWS_TESTIMONIALS: '/reviews/testimonials',
    
    // Upload
    UPLOAD_IMAGE: '/upload/image',
    UPLOAD_IMAGES: '/upload/images',
    
    // Export
    EXPORT_FINANCIAL: '/export/financial',
    EXPORT_AGENDA: '/export/agenda'
  }
}

// Helper para construir URLs completas
export const buildApiUrl = (endpoint, params = '') => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  return params ? `${url}${params}` : url
}