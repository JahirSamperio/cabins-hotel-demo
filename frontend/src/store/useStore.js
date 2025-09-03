import { create } from 'zustand'

// Función para cargar estado inicial desde localStorage
const getInitialAuthState = () => {
  try {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    return {
      user: user ? JSON.parse(user) : null,
      token: token || null,
      isAuthenticated: !!(user && token),
      isLoading: false
    }
  } catch {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    }
  }
}

export const useAuthStore = create((set) => ({
  ...getInitialAuthState(),
  
  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true, isLoading: false })
    
    // Refresh automático si es admin
    if (user?.is_admin) {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  },
  
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },
  
  setLoading: (isLoading) => set({ isLoading })
}))

export const useAdminStore = create((set) => ({
  stats: {},
  reservations: [],
  cabins: [],
  reviews: [],
  loading: false,
  activeTab: 'dashboard',
  pendingFilter: false,
  
  setActiveTab: (activeTab) => set({ activeTab }),
  setReservations: (reservations) => set({ reservations }),
  setStats: (stats) => set({ stats }),
  setCabins: (cabins) => set({ cabins }),
  setReviews: (reviews) => set({ reviews }),
  setLoading: (loading) => set({ loading }),
  setPendingFilter: (pendingFilter) => set({ pendingFilter }),
  
  // Acción para ir a reservaciones pendientes
  goToPendingReservations: () => set({ activeTab: 'reservations', pendingFilter: true })
}))

export const usePublicStore = create((set) => ({
  cabins: [],
  availability: {},
  reviews: [],
  loading: false,
  
  setCabins: (cabins) => set({ cabins }),
  setAvailability: (availability) => set({ availability }),
  setReviews: (reviews) => set({ reviews }),
  setLoading: (loading) => set({ loading })
}))