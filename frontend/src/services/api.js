const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Agregar token si existe
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Cabins methods
  async getCabins() {
    return this.request('/cabins')
  }

  async getCabin(id) {
    return this.request(`/cabins/${id}`)
  }

  // Availability methods
  async checkAvailability(data) {
    return this.request('/availability/check', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Reservations methods
  async createReservation(reservationData) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    })
  }

  async getUserReservations() {
    return this.request('/reservations/user')
  }

  // Reviews methods
  async getReviews() {
    return this.request('/reviews')
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    })
  }
}

export default new ApiService()