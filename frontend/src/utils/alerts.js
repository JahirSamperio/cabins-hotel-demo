import Swal from 'sweetalert2'

// Configuraciones base para diferentes tipos de alertas
const alertConfigs = {
  success: {
    icon: 'success',
    confirmButtonColor: '#2c5530'
  },
  error: {
    icon: 'error',
    confirmButtonColor: '#c62828'
  },
  warning: {
    icon: 'warning',
    confirmButtonColor: '#f57c00'
  },
  info: {
    icon: 'info',
    confirmButtonColor: '#2c5530'
  }
}

// Función principal para mostrar alertas
export const showAlert = (type, title, text, confirmButtonText = 'Entendido') => {
  return Swal.fire({
    title,
    text,
    confirmButtonText,
    customClass: {
      container: 'swal-high-z-index'
    },
    ...alertConfigs[type]
  })
}

// Alertas específicas para reservaciones
export const reservationAlerts = {
  success: () => showAlert(
    'success',
    '¡Reservación Exitosa!',
    'Tu reservación ha sido creada correctamente y está pendiente de confirmación'
  ),
  
  notAvailable: () => showAlert(
    'error',
    'Cabaña No Disponible',
    'La cabaña seleccionada no está disponible para las fechas elegidas. Por favor selecciona otras fechas o cabaña.'
  ),
  
  capacityExceeded: () => showAlert(
    'error',
    'Capacidad Insuficiente',
    'La cabaña seleccionada no tiene capacidad suficiente para el número de huéspedes'
  ),
  
  invalidDates: () => showAlert(
    'error',
    'Fechas Inválidas',
    'Las fechas seleccionadas no son válidas. Verifica que sean futuras y correctas.'
  ),
  
  connectionError: () => showAlert(
    'error',
    'Error de Conexión',
    'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    'Reintentar'
  )
}

// Alertas de validación
export const validationAlerts = {
  cabinRequired: () => showAlert(
    'warning',
    'Cabaña Requerida',
    'Por favor selecciona una cabaña'
  ),
  
  datesRequired: () => showAlert(
    'warning',
    'Fechas Requeridas',
    'Por favor selecciona las fechas de entrada y salida'
  ),
  
  invalidDateRange: () => showAlert(
    'warning',
    'Fechas Inválidas',
    'La fecha de salida debe ser posterior a la fecha de entrada'
  ),
  
  capacityExceeded: (cabinName, maxCapacity) => showAlert(
    'warning',
    'Capacidad Excedida',
    `La cabaña ${cabinName} tiene capacidad máxima de ${maxCapacity} personas`
  )
}

// Función para manejar errores del backend de manera inteligente
export const handleBackendError = (errorMsg) => {
  const msg = errorMsg.toLowerCase()
  
  if (msg.includes('disponible') || msg.includes('está disponible')) {
    return reservationAlerts.notAvailable()
  } else if (msg.includes('capacidad')) {
    return reservationAlerts.capacityExceeded()
  } else if (msg.includes('fecha')) {
    return reservationAlerts.invalidDates()
  } else {
    return showAlert(
      'error',
      'Error en la Reservación',
      errorMsg || 'Ocurrió un error al procesar tu reservación. Intenta nuevamente.'
    )
  }
}