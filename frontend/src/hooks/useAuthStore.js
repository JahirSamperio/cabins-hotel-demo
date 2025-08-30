import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { authActions } from '../store'

export const useAuthStore = () => {
  const dispatch = useDispatch()
  const { user, token, isAuthenticated, isLoading } = useSelector(state => state.auth)

  const checkAuthToken = async () => {
    dispatch(authActions.setLoading(true))
    try {
      const storedToken = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (storedToken && userData) {
        const parsedUser = JSON.parse(userData)
        dispatch(authActions.loginSuccess({ user: parsedUser, token: storedToken }))
      }
    } catch (error) {
      console.error('Error checking auth token:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      dispatch(authActions.setLoading(false))
    }
  }

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
    dispatch(authActions.loginSuccess({ user: userData, token: userToken }))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(authActions.logout())
  }

  useEffect(() => {
    if (!isAuthenticated && !user) {
      checkAuthToken()
    }
  }, [])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthToken
  }
}