import { createContext, useContext, useReducer } from 'react'

const AppContext = createContext()

const initialState = {
  user: null,
  isAuthenticated: false,
  activeTab: 'dashboard',
  reservations: [],
  cabins: [],
  loading: false
}

const appReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true }
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_RESERVATIONS':
      return { ...state, reservations: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}