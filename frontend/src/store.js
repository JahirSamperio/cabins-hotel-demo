// Store Redux siguiendo patrón EGEL
import { configureStore, createSlice } from '@reduxjs/toolkit'

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  },
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    }
  }
})

// Admin Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: {},
    reservations: [],
    cabins: [],
    reviews: [],
    loading: false,
    activeTab: 'dashboard'
  },
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload
    },
    setReservations: (state, action) => {
      state.reservations = action.payload
    },
    setCabins: (state, action) => {
      state.cabins = action.payload
    },
    setReviews: (state, action) => {
      state.reviews = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    }
  }
})

// Public Slice
const publicSlice = createSlice({
  name: 'public',
  initialState: {
    cabins: [],
    availability: {},
    reviews: [],
    loading: false
  },
  reducers: {
    setCabins: (state, action) => {
      state.cabins = action.payload
    },
    setAvailability: (state, action) => {
      state.availability = action.payload
    },
    setReviews: (state, action) => {
      state.reviews = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    admin: adminSlice.reducer,
    public: publicSlice.reducer,
  },
})

export const authActions = authSlice.actions
export const adminActions = adminSlice.actions
export const publicActions = publicSlice.actions