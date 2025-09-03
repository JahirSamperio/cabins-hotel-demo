import { useState, useEffect } from 'react'
import { performanceMonitor } from '../utils/performanceMonitor'

const PerformancePanel = () => {
  const [report, setReport] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Actualizar reporte cada 3 segundos
    const interval = setInterval(() => {
      if (isVisible) {
        setReport(performanceMonitor.getReport())
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isVisible])

  const togglePanel = () => {
    setIsVisible(!isVisible)
    if (!isVisible) {
      setReport(performanceMonitor.getReport())
    }
  }

  if (!isVisible) {
    return (
      <button 
        onClick={togglePanel}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#2c5530',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 9999
        }}
      >
        📊
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      overflow: 'auto',
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#2c5530' }}>📊 Rendimiento</h3>
        <button onClick={togglePanel} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      {report && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <strong>⏱️ Sesión:</strong> {Math.round(report.sessionDuration / 1000)}s
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>🔄 Renders:</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {Object.entries(report.componentRenders).map(([comp, count]) => (
                <div key={comp} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  color: count > 10 ? '#e53e3e' : count > 5 ? '#d69e2e' : '#38a169'
                }}>
                  <span>{comp}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>🌐 APIs:</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {Object.entries(report.apiPerformance).map(([endpoint, stats]) => (
                <div key={endpoint} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  color: stats.average > 2000 ? '#e53e3e' : stats.average > 1000 ? '#d69e2e' : '#38a169'
                }}>
                  <span>{endpoint}:</span>
                  <span>{stats.average}ms</span>
                </div>
              ))}
            </div>
          </div>

          {report.memoryUsage && (
            <div style={{ marginBottom: '12px' }}>
              <strong>💾 Memoria:</strong> {report.memoryUsage.used}MB ({report.memoryUsage.percentage}%)
            </div>
          )}

          <div>
            <strong>💡 Recomendaciones:</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {report.recommendations.map((rec, i) => (
                <div key={i} style={{ marginBottom: '2px' }}>{rec}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformancePanel