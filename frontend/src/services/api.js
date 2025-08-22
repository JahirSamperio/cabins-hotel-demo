const API_URL = import.meta.env.VITE_API_URL

// Auth endpoints
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    return response.json()
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return response.json()
  }
}

// User endpoints
export const userAPI = {
  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/auth/renew`, {
      headers: { 'x-token': token }
    })
    return response.json()
  },

  getReservations: async (token) => {
    const response = await fetch(`${API_URL}/reservations`, {
      headers: { 'x-token': token }
    })
    return response.json()
  }
}

// Cabins endpoints
export const cabinsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/cabins`)
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/cabins/${id}`)
    return response.json()
  },

  create: async (cabinData, token) => {
    const response = await fetch(`${API_URL}/cabins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify(cabinData)
    })
    return response.json()
  },

  update: async (id, cabinData, token) => {
    const response = await fetch(`${API_URL}/cabins/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify(cabinData)
    })
    return response.json()
  },

  delete: async (id, token) => {
    const response = await fetch(`${API_URL}/cabins/${id}`, {
      method: 'DELETE',
      headers: { 'x-token': token }
    })
    return response.json()
  }
}

// Reservations endpoints
export const reservationsAPI = {
  getAll: async (token, page = 1, limit = 10) => {
    try {
      const response = await fetch(`${API_URL}/reservations?page=${page}&limit=${limit}`, {
        headers: { 'x-token': token }
      })
      const data = await response.json()
      if (!response.ok) {
        console.error('Error getAll reservations:', response.status, data)
      }
      return data
    } catch (error) {
      console.error('Network error getAll reservations:', error)
      return { ok: false, msg: 'Error de conexión' }
    }
  },

  getById: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/reservations/${id}`, {
        headers: { 'x-token': token }
      })
      const data = await response.json()
      if (!response.ok) {
        console.error('Error getById reservation:', response.status, data)
      }
      return data
    } catch (error) {
      console.error('Network error getById reservation:', error)
      return { ok: false, msg: 'Error de conexión' }
    }
  },

  create: async (reservationData, token) => {
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        },
        body: JSON.stringify(reservationData)
      })
      const data = await response.json()
      if (!response.ok) {
        console.error('Error create reservation:', response.status, data)
      }
      return data
    } catch (error) {
      console.error('Network error create reservation:', error)
      return { ok: false, msg: 'Error de conexión' }
    }
  },

  createWalkIn: async (reservationData, token) => {
    try {
      console.log('Creating walk-in reservation:', reservationData)
      const response = await fetch(`${API_URL}/reservations/walk-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        },
        body: JSON.stringify(reservationData)
      })
      const data = await response.json()
      if (!response.ok) {
        console.error('Error createWalkIn reservation:', response.status, data)
      }
      return data
    } catch (error) {
      console.error('Network error createWalkIn reservation:', error)
      return { ok: false, msg: 'Error de conexión' }
    }
  },

  update: async (id, updateData, token) => {
    try {
      const response = await fetch(`${API_URL}/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        },
        body: JSON.stringify(updateData)
      })
      const data = await response.json()
      if (!response.ok) {
        console.error('Error update reservation:', response.status, data)
      }
      return data
    } catch (error) {
      console.error('Network error update reservation:', error)
      return { ok: false, msg: 'Error de conexión' }
    }
  }
}

// Reviews endpoints
export const reviewsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/reviews`)
    return response.json()
  },

  create: async (reviewData, token) => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify(reviewData)
    })
    return response.json()
  },

  approve: async (id, approved, token) => {
    const response = await fetch(`${API_URL}/reviews/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify({ approved })
    })
    return response.json()
  },

  getTestimonials: async () => {
    const response = await fetch(`${API_URL}/reviews/testimonials`)
    return response.json()
  },

  createTestimonial: async (testimonialData, token) => {
    const response = await fetch(`${API_URL}/reviews/testimonials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify(testimonialData)
    })
    return response.json()
  }
}

// Upload endpoints
export const uploadAPI = {
  uploadImage: async (file, folder, token) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch(`${API_URL}/upload/image/${folder}`, {
      method: 'POST',
      headers: {
        'x-token': token
      },
      body: formData
    })
    return response.json()
  },

  uploadImages: async (files, folder, token) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    
    const response = await fetch(`${API_URL}/upload/images/${folder}`, {
      method: 'POST',
      headers: {
        'x-token': token
      },
      body: formData
    })
    return response.json()
  },

  deleteImage: async (key, token) => {
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify({ key })
    })
    return response.json()
  }
}

// Admin endpoints (usando endpoints existentes)
export const adminAPI = {
  getStats: async (token) => {
    // Usar endpoint de cabañas para obtener estadísticas básicas
    const cabinsResponse = await fetch(`${API_URL}/cabins`)
    const reservationsResponse = await fetch(`${API_URL}/reservations?page=1&limit=1000`, {
      headers: { 'x-token': token }
    })
    
    const cabinsData = await cabinsResponse.json()
    const reservationsData = await reservationsResponse.json()
    
    // Calcular estadísticas básicas
    const stats = {
      totalCabins: cabinsData.cabins?.length || 0,
      totalReservations: reservationsData.reservations?.length || 0,
      totalRevenue: reservationsData.reservations?.reduce((sum, res) => sum + (res.total_amount || 0), 0) || 0,
      occupancyRate: 75, // Valor por defecto
      availableCabins: cabinsData.cabins?.length || 0
    }
    
    return {
      ok: true,
      stats
    }
  },

  getRecentBookings: async (token) => {
    const response = await fetch(`${API_URL}/reservations`, {
      headers: { 'x-token': token }
    })
    const data = await response.json()
    
    return {
      ok: data.ok,
      reservations: data.reservations?.slice(0, 5) || [] // Últimas 5 reservaciones
    }
  }
}