import { secureFetch } from '../utils/apiInterceptor.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const adminService = {
  getReservationsByDateRange: async (token, startDate, endDate) => {
    const response = await secureFetch(`${API_URL}/reservations/range?start_date=${startDate}&end_date=${endDate}`, {
      headers: { 'x-token': token }
    })
    return response.json()
  },

  getReservationsWithFilters: async (token, filters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.paymentStatus && filters.paymentStatus !== 'all') params.append('payment_status', filters.paymentStatus)
    if (filters.bookingType && filters.bookingType !== 'all') params.append('booking_type', filters.bookingType)
    
    if (filters.dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      params.append('date', today)
    } else if (filters.dateFilter === 'week') {
      params.append('date_range', 'week')
    } else if (filters.dateFilter === 'month') {
      params.append('date_range', 'month')
    }
    
    if (filters.customDate) {
      params.append('date', filters.customDate)
    }
    
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.trim())
    }
    
    const response = await secureFetch(`${API_URL}/reservations?${params.toString()}`, {
      headers: { 'x-token': token }
    })
    
    return response.json()
  }
}