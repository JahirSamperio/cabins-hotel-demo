import SEOHead from '../components/ui/SEOHead'

const AdminDashboard = () => {
  return (
    <>
      <SEOHead 
        title="Panel Admin - Cabañas Huasca"
        description="Panel administrativo"
        canonical="https://cabanashuasca.com/admin"
      />
      <div className="admin-dashboard">
        <h1>Panel Administrativo</h1>
        <p>Dashboard del administrador...</p>
      </div>
    </>
  )
}

export default AdminDashboard