import { useSelector, useDispatch } from 'react-redux'
import { publicActions } from '../store'

export const usePublicStore = () => {
  const dispatch = useDispatch()
  const { cabins, availability, reviews, loading } = useSelector(state => state.public)

  const loadCabins = async () => {
    dispatch(publicActions.setLoading(true))
    try {
      const { cabinsAPI } = await import('../services/api')
      
      const response = await cabinsAPI.getAll()
      if (response.ok) {
        dispatch(publicActions.setCabins(response.cabins || []))
      }
    } catch (error) {
      console.error('Error loading cabins:', error)
    } finally {
      dispatch(publicActions.setLoading(false))
    }
  }

  const loadAvailability = async (checkIn, checkOut) => {
    dispatch(publicActions.setLoading(true))
    try {
      const { availabilityService } = await import('../services/availabilityService')
      
      const response = await availabilityService.checkAvailability(checkIn, checkOut)
      if (response.ok) {
        dispatch(publicActions.setAvailability(response.availability || {}))
      }
    } catch (error) {
      console.error('Error loading availability:', error)
    } finally {
      dispatch(publicActions.setLoading(false))
    }
  }

  const loadReviews = async () => {
    dispatch(publicActions.setLoading(true))
    try {
      const { reviewsAPI } = await import('../services/api')
      
      const response = await reviewsAPI.getTestimonials()
      if (response.ok) {
        dispatch(publicActions.setReviews(response.reviews || []))
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      dispatch(publicActions.setLoading(false))
    }
  }

  return {
    cabins,
    availability,
    reviews,
    loading,
    loadCabins,
    loadAvailability,
    loadReviews
  }
}