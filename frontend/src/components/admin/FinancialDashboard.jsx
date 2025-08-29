import { useState, useEffect } from 'react'
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar,
  Users, CreditCard, AlertTriangle, CheckCircle,
  Clock, BarChart3, PieChart, MessageCircle, Download
} from 'lucide-react'
import '../../pages/Admin.css'
import './FinancialDashboard.css'

const FinancialDashboard = () => {
  const [summary, setSummary] = useState({})
  const [chartData, setChartData] = useState([])
  const [pendingPayments, setPendingPayments] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [cabinStats, setCabinStats] = useState([])
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [pendingPagination, setPendingPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  })
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [dateError, setDateError] = useState('')
  const [period, setPeriod] = useState('daily')
  const [filterBy, setFilterBy] = useState('created_at')

  const loadFinancialData = async () => {
    if (dateError) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }
      
      const { buildApiUrl, API_CONFIG } = await import('../../services/apiConfig')
      const { startDate, endDate } = dateRange

      // Cargar datos en paralelo con timeout
      const fetchWithTimeout = (url, options, timeout = 10000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ])
      }

      const [summaryRes, chartRes, pendingRes, methodsRes, cabinRes] = await Promise.all([
        fetchWithTimeout(buildApiUrl('/financial/summary', `?startDate=${startDate}&endDate=${endDate}&filterBy=${filterBy}`), {
          headers: { 'x-token': token }
        }),
        fetchWithTimeout(buildApiUrl('/financial/revenue-chart', `?startDate=${startDate}&endDate=${endDate}&period=${period}&filterBy=${filterBy}`), {
          headers: { 'x-token': token }
        }),
        fetchWithTimeout(buildApiUrl('/financial/pending-payments', `?limit=${pendingPagination.limit}&offset=${(pendingPagination.currentPage - 1) * pendingPagination.limit}`), {
          headers: { 'x-token': token }
        }),
        fetchWithTimeout(buildApiUrl('/financial/payment-methods', `?startDate=${startDate}&endDate=${endDate}&filterBy=${filterBy}`), {
          headers: { 'x-token': token }
        }),
        fetchWithTimeout(buildApiUrl('/financial/cabin-stats', `?startDate=${startDate}&endDate=${endDate}&filterBy=${filterBy}`), {
          headers: { 'x-token': token }
        })
      ])

      // Procesar respuestas con manejo de errores individual
      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setSummary(data.summary || {})
      } else {
        console.warn('Error cargando resumen financiero')
        setSummary({})
      }

      if (chartRes.ok) {
        const data = await chartRes.json()
        setChartData(data.chartData || [])
      } else {
        console.warn('Error cargando datos del gráfico')
        setChartData([])
      }

      if (pendingRes.ok) {
        const data = await pendingRes.json()
        setPendingPayments(data.pendingPayments || [])
        setPendingPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / prev.limit)
        }))
      } else {
        console.warn('Error cargando pagos pendientes')
        setPendingPayments([])
      }

      if (methodsRes.ok) {
        const data = await methodsRes.json()
        setPaymentMethods(data.paymentMethods || [])
      } else {
        console.warn('Error cargando métodos de pago')
        setPaymentMethods([])
      }

      if (cabinRes.ok) {
        const data = await cabinRes.json()
        setCabinStats(data.cabinStats || [])
      } else {
        console.warn('Error cargando estadísticas de cabañas')
        setCabinStats([])
      }

    } catch (error) {
      console.error('Error loading financial data:', error)
      
      // Resetear estados en caso de error
      setSummary({})
      setChartData([])
      setPendingPayments([])
      setPaymentMethods([])
      setCabinStats([])
      
      if (error.message === 'Timeout') {
        alert('La consulta está tardando mucho. Intenta con un rango de fechas menor.')
      } else if (error.message === 'No hay token de autenticación') {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.')
        // Redirigir al login si es necesario
      } else {
        alert('Error al cargar los datos financieros. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0)
  }

  const getPaymentStatusColor = (paid, total) => {
    const percentage = (paid / total) * 100
    if (percentage === 0) return 'status-unpaid'
    if (percentage < 100) return 'status-partial'
    return 'status-paid'
  }

  const handleWhatsAppContact = (phone, name, pendingAmount) => {
    const cleanPhone = phone?.replace(/[^0-9]/g, '') || ''
    if (!cleanPhone) return
    
    const message = `Hola ${name}, tienes un pago pendiente de ${formatCurrency(pendingAmount)} en Hotel Cabañas. ¿Podrías ayudarnos a completar el pago?`
    const whatsappUrl = `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const validateDateRange = (start, end) => {
    if (!start || !end) return ''
    
    const startDate = new Date(start)
    const endDate = new Date(end)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Permitir hasta hoy
    
    if (startDate > endDate) {
      return 'La fecha de inicio debe ser anterior a la fecha final'
    }
    
    if (endDate > today) {
      return 'La fecha final no puede ser futura'
    }
    
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 365) {
      return 'El rango máximo es de 1 año'
    }
    
    return ''
  }
  
  const handleDateChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value }
    setDateRange(newRange)
    
    // Solo validar si ambas fechas están completas
    if (newRange.startDate && newRange.endDate) {
      const error = validateDateRange(newRange.startDate, newRange.endDate)
      setDateError(error)
    } else {
      setDateError('')
    }
  }

  const handleExport = async () => {
    if (dateError) return
    
    setExportLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { buildApiUrl, API_CONFIG } = await import('../../services/apiConfig')
      const { startDate, endDate } = dateRange
      
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EXPORT_FINANCIAL, `?startDate=${startDate}&endDate=${endDate}&filterBy=${filterBy}`), {
        headers: { 'x-token': token }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Crear y descargar archivo Excel
        const csvContent = convertToCSV(data.data)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `reporte-financiero-${startDate}-${endDate}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error al exportar datos. Inténtalo de nuevo.')
    } finally {
      setExportLoading(false)
    }
  }
  
  const convertToCSV = (data) => {
    const { summary, reservations } = data
    
    let csv = 'RESUMEN FINANCIERO\n'
    csv += Object.entries(summary).map(([key, value]) => `${key},${value}`).join('\n')
    csv += '\n\nDETALLE DE RESERVACIONES\n'
    
    if (reservations.length > 0) {
      const headers = Object.keys(reservations[0]).join(',')
      csv += headers + '\n'
      csv += reservations.map(row => Object.values(row).join(',')).join('\n')
    }
    
    return csv
  }

  useEffect(() => {
    loadFinancialData()
  }, [dateRange, period, filterBy, pendingPagination.currentPage])

  const handlePageChange = (newPage) => {
    setPendingPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  if (loading) {
    return (
      <div className="financial-section">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando datos financieros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="financial-section">
      <div className="financial-header">
        <h3>Dashboard Financiero</h3>
        <div className="financial-controls">
          <div className="date-range">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
            <span>a</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
          {dateError && (
            <div className="date-error">
              {dateError}
            </div>
          )}
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
            className="period-select"
          >
            <option value="created_at">Por Fecha de Reserva</option>
            <option value="check_in">Por Fecha de Estancia</option>
          </select>
          <button 
            onClick={handleExport}
            className="export-btn"
            disabled={loading || exportLoading || !!dateError}
          >
            <Download size={16} />
            {exportLoading ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="financial-stats">
        <div className="stat-card revenue-total">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(summary?.total_revenue || 0)}</h3>
            <p>Ingresos Totales</p>
            <span className="stat-detail">{summary?.total_reservations || 0} reservaciones</span>
          </div>
        </div>

        <div className="stat-card paid-amount">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(summary?.total_paid || 0)}</h3>
            <p>Total Pagado</p>
            <span className="stat-detail">{summary?.paid_count || 0} pagos completos</span>
          </div>
        </div>

        <div className="stat-card pending-amount">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(summary?.total_pending || 0)}</h3>
            <p>Pendiente de Pago</p>
            <span className="stat-detail">{summary?.partial_count || 0} pagos parciales</span>
          </div>
        </div>

        <div className="stat-card collection-rate">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{summary?.collection_rate || 0}%</h3>
            <p>Tasa de Cobro</p>
            <span className="stat-detail">Efectividad de cobranza</span>
          </div>
        </div>
      </div>

      {/* Gráfico Simple de Ingresos */}
      <div className="chart-section">
        <div className="chart-header">
          <h4>Ingresos por Período</h4>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="chart-period-select"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>
        <div className="chart-container">
          {chartData && chartData.length > 0 ? (
            <>
              <div className="y-axis">
                {(() => {
                  const maxRevenue = Math.max(...chartData.map(d => parseFloat(d.revenue) || 0))
                  const steps = 5
                  const stepValue = maxRevenue / steps
                  return Array.from({ length: steps + 1 }, (_, i) => (
                    <div key={i} className="y-axis-label">
                      {formatCurrency(i * stepValue)}
                    </div>
                  ))
                })()} 
              </div>
              <div className="chart-area">
                <div className="simple-chart">
                  {chartData.map((item, index) => {
                    const maxRevenue = Math.max(...chartData.map(d => parseFloat(d.revenue) || 0))
                    const revenue = parseFloat(item.revenue) || 0
                    const height = maxRevenue > 0 ? Math.max((revenue / maxRevenue) * 100, 5) : 5
                    
                    return (
                      <div key={index} className="chart-bar">
                        <div 
                          className="bar-fill"
                          style={{ height: `${height}%` }}
                          title={`${item.period}: ${formatCurrency(revenue)} (${item.reservations || 0} reservas)`}
                          onClick={() => alert(`${item.period}\n${formatCurrency(revenue)}\n${item.reservations || 0} reservas`)}
                        ></div>
                      </div>
                    )
                  })}
                </div>
                <div className="x-axis">
                  {chartData.map((item, index) => (
                    <div key={index} className="x-axis-label">
                      <span className="bar-label">{item.period}</span>
                      <span className="bar-count">{item.reservations || 0} reservas</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="no-data">
              <p>No hay datos para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Rendimiento por Cabaña */}
      <div className="cabin-stats-section">
        <h4>Rendimiento por Cabaña</h4>
        <div className="cabin-chart">
          {cabinStats && cabinStats.length > 0 ? (
            <div className="cabin-chart-container">
              <div className="cabin-y-axis">
                {(() => {
                  const maxRevenue = Math.max(...cabinStats.map(c => parseFloat(c.revenue) || 0))
                  const steps = 5
                  const stepValue = maxRevenue / steps
                  return Array.from({ length: steps + 1 }, (_, i) => (
                    <div key={i} className="cabin-y-axis-label">
                      {formatCurrency(i * stepValue)}
                    </div>
                  ))
                })()} 
              </div>
              <div className="cabin-chart-area">
                <div className="cabin-bars-chart">
                  {cabinStats.map((cabin, index) => {
                    const revenue = parseFloat(cabin.revenue) || 0
                    const reservations = parseInt(cabin.reservations) || 0
                    const maxRevenue = Math.max(...cabinStats.map(c => parseFloat(c.revenue) || 0))
                    const barHeight = maxRevenue > 0 ? Math.max((revenue / maxRevenue) * 100, 5) : 5
                    const isTopPerformer = revenue === maxRevenue && revenue > 0
                    
                    return (
                      <div key={index} className="cabin-chart-bar">
                        <div 
                          className="cabin-bar-fill"
                          style={{ 
                            height: `${barHeight}%`,
                            backgroundColor: `hsl(${120 + (index * 40) % 200}, 60%, ${isTopPerformer ? '45%' : '55%'})`
                          }}
                          title={`${cabin.cabin?.name}: ${formatCurrency(revenue)} (${reservations} reservas)`}
                          onClick={() => alert(`${cabin.cabin?.name}\n${formatCurrency(revenue)}\n${reservations} reservas`)}
                        >
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="cabin-x-axis">
                  {cabinStats.map((cabin, index) => (
                    <div key={index} className="cabin-x-label">
                      <span className="cabin-name-label">{cabin.cabin?.name}</span>
                      <span className="cabin-amount-label">{formatCurrency(parseFloat(cabin.revenue) || 0)}</span>
                      <span className="cabin-count-label">{parseInt(cabin.reservations) || 0} reservas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No hay datos de cabañas para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagos Pendientes */}
      <div className="pending-section">
        <div className="pending-header">
          <h4>Pagos Pendientes</h4>
          <span className="pending-count">Total: {pendingPagination.total}</span>
        </div>
        <div className="pending-table">
          {pendingPayments.map(payment => (
            <div key={payment.id} className="pending-item">
              <div className="payment-info">
                <span className="guest-name">
                  {payment.user && !payment.user.is_guest 
                    ? payment.user.name 
                    : payment.guest_name}
                </span>
                <span className="payment-email">
                  {payment.user && !payment.user.is_guest 
                    ? payment.user.phone 
                    : payment.guest_phone}
                </span>
                <span className="payment-date">Check-in: {payment.check_in}</span>
              </div>
              <div className="payment-amounts">
                <div className="amount-row">
                  <span>Total: {formatCurrency(payment.total_price)}</span>
                </div>
                <div className="amount-row">
                  <span>Pagado: {formatCurrency(payment.amount_paid)}</span>
                </div>
                <div className={`amount-row pending ${getPaymentStatusColor(payment.amount_paid, payment.total_price)}`}>
                  <span>Pendiente: {formatCurrency(payment.pending_amount)}</span>
                </div>
                <button 
                  className="whatsapp-btn"
                  onClick={() => handleWhatsAppContact(
                    payment.user && !payment.user.is_guest ? payment.user.phone : payment.guest_phone,
                    payment.user && !payment.user.is_guest ? payment.user.name : payment.guest_name,
                    payment.pending_amount
                  )}
                  title="Contactar por WhatsApp"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
        {pendingPagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(pendingPagination.currentPage - 1)}
              disabled={pendingPagination.currentPage === 1}
              className="pagination-btn"
            >
              Anterior
            </button>
            <span className="pagination-info">
              Página {pendingPagination.currentPage} de {pendingPagination.totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(pendingPagination.currentPage + 1)}
              disabled={pendingPagination.currentPage === pendingPagination.totalPages}
              className="pagination-btn"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Métodos de Pago */}
      <div className="methods-section">
        <h4>Métodos de Pago</h4>
        <div className="methods-grid">
          {paymentMethods.map((method, index) => (
            <div key={index} className="method-card">
              <div className="method-info">
                <CreditCard size={20} />
                <span className="method-name">{method.payment_method || 'No especificado'}</span>
              </div>
              <div className="method-stats">
                <span className="method-amount">{formatCurrency(method.total_amount)}</span>
                <span className="method-count">{method.count} transacciones</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FinancialDashboard