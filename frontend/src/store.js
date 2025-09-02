import { createStore, combineReducers } from 'redux'

// Auth Reducer
const authInitialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false
}

const authReducer = (state = authInitialState, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      }
    default:
      return state
  }
}

// Admin Reducer
const adminInitialState = {
  stats: {},
  reservations: [],
  cabins: [],
  reviews: [],
  loading: false,
  activeTab: 'dashboard'
}

const adminReducer = (state = adminInitialState, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_RESERVATIONS':
      return { ...state, reservations: action.payload }
    case 'SET_ADMIN_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

// Public Reducer
const publicInitialState = {
  cabins: [],
  availability: {},
  reviews: [],
  loading: false
}

const publicReducer = (state = publicInitialState, action) => {
  switch (action.type) {
    case 'SET_CABINS':
      return { ...state, cabins: action.payload }
    case 'SET_PUBLIC_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  public: publicReducer
})

export const store = createStore(rootReducer)

// Action Creators
export const authActions = {
  loginStart: () => ({ type: 'LOGIN_START' }),
  loginSuccess: (user, token) => ({ type: 'LOGIN_SUCCESS', payload: { user, token } }),
  logout: () => ({ type: 'LOGOUT' })
}

export const adminActions = {
  setActiveTab: (tab) => ({ type: 'SET_ACTIVE_TAB', payload: tab }),
  setReservations: (reservations) => ({ type: 'SET_RESERVATIONS', payload: reservations }),
  setLoading: (loading) => ({ type: 'SET_ADMIN_LOADING', payload: loading })
}

export const publicActions = {
  setCabins: (cabins) => ({ type: 'SET_CABINS', payload: cabins }),
  setLoading: (loading) => ({ type: 'SET_PUBLIC_LOADING', payload: loading })
}