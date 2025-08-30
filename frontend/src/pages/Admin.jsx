import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useAdminStore } from '../hooks'
import { AdminLayout } from '../AdminLayout'
import Agenda from '../components/admin/Agenda'
import Reservations from '../components/admin/Reservations'
import Cabins from '../components/admin/Cabins'
import Reviews from '../components/admin/Reviews'
import Dashboard from '../components/admin/Dashboard'
import FinancialDashboard from '../components/admin/FinancialDashboard'

const Admin = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { activeTab, reservations, setReservations } = useAdminStore()



  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    if (!user?.is_admin) {
      navigate('/dashboard')
      return
    }
  }, [navigate, isAuthenticated, user])



  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const { reservationsAPI } = await import('../services/api')
      const token = localStorage.getItem('token')
      
      const response = await reservationsAPI.update(reservationId, { status: newStatus }, token)
      if (response.ok) {
        const updatedReservations = reservations.map(res => 
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
        setReservations(updatedReservations)
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'reservations':
        return <Reservations />
      case 'agenda':
        return <Agenda onStatusUpdate={handleStatusUpdate} />
      case 'cabins':
        return <Cabins />
      case 'reviews':
        return <Reviews />
      case 'financial':
        return <FinancialDashboard />
      default:
        return <Dashboard />
    }
  }

  if (!user) return null

  return (
    <AdminLayout>
      {renderActiveTab()}
    </AdminLayout>
  )
}
export default Admin