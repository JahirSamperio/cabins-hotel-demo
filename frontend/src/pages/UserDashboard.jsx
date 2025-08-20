import SEOHead from '../components/ui/SEOHead'

const UserDashboard = () => {
  return (
    <>
      <SEOHead 
        title="Mi Panel - Cabañas Huasca"
        description="Panel de usuario para gestionar reservas"
        canonical="https://cabanashuasca.com/dashboard"
      />
      <div className="user-dashboard">
        <h1>Panel de Usuario</h1>
        <p>Dashboard del usuario...</p>
      </div>
    </>
  )
}

export default UserDashboard