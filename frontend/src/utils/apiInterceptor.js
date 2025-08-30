// Interceptor para manejar tokens expirados
export const apiInterceptor = {
  async fetch(url, options = {}) {
    const token = localStorage.getItem('token')
    
    // Agregar token a headers si existe
    if (token && options.headers) {
      options.headers['x-token'] = token
    }
    
    try {
      const response = await fetch(url, options)
      
      // Si el token es inválido o expiró
      if (response.status === 401 || response.status === 403) {
        const data = await response.json().catch(() => ({}))
        
        if (data.msg === 'Token no válido' || data.msg === 'Token expirado' || !data.ok) {
          // Limpiar localStorage y redirigir
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          
          // Redirigir al login
          if (window.location.pathname.includes('/admin')) {
            window.location.href = '/login'
          }
          
          throw new Error('Sesión expirada')
        }
      }
      
      return response
    } catch (error) {
      // Si es error de red, mantener el error original
      if (error.message === 'Sesión expirada') {
        throw error
      }
      
      // Para otros errores de red, verificar si el token sigue siendo válido
      if (token) {
        try {
          const { buildApiUrl, API_CONFIG } = await import('../services/apiConfig.js')
          const validateResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH_RENEW), {
            headers: { 'x-token': token }
          })
          
          if (!validateResponse.ok) {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            
            if (window.location.pathname.includes('/admin')) {
              window.location.href = '/login'
            }
          }
        } catch (validateError) {
          // Error de red en validación, mantener estado actual
        }
      }
      
      throw error
    }
  }
}

// Función helper para usar en lugar de fetch
export const secureFetch = (url, options = {}) => {
  return apiInterceptor.fetch(url, options)
}