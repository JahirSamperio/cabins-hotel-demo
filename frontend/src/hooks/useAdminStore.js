import { useSelector, useDispatch } from 'react-redux'
import { adminActions } from '../store'

export const useAdminStore = () => {
  const dispatch = useDispatch()
  const { stats, reservations, cabins, reviews, loading, activeTab } = useSelector(state => state.admin)
  const { token } = useSelector(state => state.auth)

  const loadStats = async () => {
    dispatch(adminActions.setLoading(true))
    try {
      const { buildApiUrl, API_CONFIG } = await import('../services/apiConfig')
      
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_STATS), {
        headers: { 'x-token': token }
      })
      
      if (response.ok) {
        const data = await response.json()
        dispatch(adminActions.setStats(data.stats || {}))
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      dispatch(adminActions.setLoading(false))
    }
  }

  const loadReservations = async () => {
    dispatch(adminActions.setLoading(true))
    try {
      const { adminService } = await import('../services/adminService')
      
      const response = await adminService.getReservations(token)
      if (response.ok) {
        dispatch(adminActions.setReservations(response.reservations || []))
      }
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      dispatch(adminActions.setLoading(false))
    }
  }

  const loadCabins = async () => {
    dispatch(adminActions.setLoading(true))
    try {
      const { cabinsAPI } = await import('../services/api')
      
      const response = await cabinsAPI.getAll()
      if (response.ok) {
        dispatch(adminActions.setCabins(response.cabins || []))
      }
    } catch (error) {
      console.error('Error loading cabins:', error)
    } finally {
      dispatch(adminActions.setLoading(false))
    }
  }

  const setActiveTab = (tab) => {
    dispatch(adminActions.setActiveTab(tab))
  }

  return {
    stats,
    reservations,
    cabins,
    reviews,
    loading,
    activeTab,
    loadStats,
    loadReservations,
    loadCabins,
    setActiveTab,
    setReservations: (data) => dispatch(adminActions.setReservations(data)),
    setCabins: (data) => dispatch(adminActions.setCabins(data)),
    setReviews: (data) => dispatch(adminActions.setReviews(data))
  }
}