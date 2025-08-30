// Helpers siguiendo patrón EGEL
export const getEnvVariables = () => {
  return {
    VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Hotel Cabañas Huasca',
    VITE_NODE_ENV: import.meta.env.MODE || 'development'
  }
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-MX')
}