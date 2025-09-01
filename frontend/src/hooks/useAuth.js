import { useAppContext } from '../context/AppContext'

export const useAuthStore = () => {
  const { state, dispatch } = useAppContext()
  
  const login = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    dispatch({ type: 'LOGIN', payload: user })
  }
  
  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }
  
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    login,
    logout
  }
}

export const useAdminStore = () => {
  const { state, dispatch } = useAppContext()
  
  const setActiveTab = (tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
  }
  
  const setReservations = (reservations) => {
    dispatch({ type: 'SET_RESERVATIONS', payload: reservations })
  }
  
  return {
    activeTab: state.activeTab,
    reservations: state.reservations,
    setActiveTab,
    setReservations
  }
}