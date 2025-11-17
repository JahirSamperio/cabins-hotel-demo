// Monitor de rendimiento para el panel de administrador
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      componentRenders: new Map(),
      apiCalls: new Map(),
      memoryUsage: [],
      loadTimes: new Map()
    }
    this.startTime = performance.now()
  }

  // Medir renders de componentes
  trackRender(componentName) {
    const current = this.metrics.componentRenders.get(componentName) || 0
    this.metrics.componentRenders.set(componentName, current + 1)
  }

  // Medir llamadas API
  trackApiCall(endpoint, duration) {
    if (!this.metrics.apiCalls.has(endpoint)) {
      this.metrics.apiCalls.set(endpoint, [])
    }
    this.metrics.apiCalls.get(endpoint).push(duration)
  }

  // Medir uso de memoria
  trackMemory() {
    if (performance.memory) {
      this.metrics.memoryUsage.push({
        timestamp: performance.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      })
    }
  }

  // Medir tiempo de carga de componentes
  trackLoadTime(componentName, startTime) {
    const duration = performance.now() - startTime
    this.metrics.loadTimes.set(componentName, duration)
  }

  // Generar reporte
  getReport() {
    const totalTime = performance.now() - this.startTime

    // Calcular promedios de API
    const apiAverages = new Map()
    for (const [endpoint, times] of this.metrics.apiCalls) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      apiAverages.set(endpoint, {
        average: Math.round(avg),
        calls: times.length,
        total: Math.round(times.reduce((a, b) => a + b, 0))
      })
    }

    // Memoria actual
    const currentMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]

    return {
      sessionDuration: Math.round(totalTime),
      componentRenders: Object.fromEntries(this.metrics.componentRenders),
      apiPerformance: Object.fromEntries(apiAverages),
      loadTimes: Object.fromEntries(this.metrics.loadTimes),
      memoryUsage: currentMemory ? {
        used: Math.round(currentMemory.used / 1024 / 1024), // MB
        total: Math.round(currentMemory.total / 1024 / 1024), // MB
        percentage: Math.round((currentMemory.used / currentMemory.total) * 100)
      } : null,
      recommendations: this.generateRecommendations()
    }
  }

  generateRecommendations() {
    const recommendations = []
    
    // Revisar renders excesivos
    for (const [component, renders] of this.metrics.componentRenders) {
      if (renders > 10) {
        recommendations.push(`⚠️ ${component}: ${renders} renders (considerar React.memo)`)
      }
    }

    // Revisar APIs lentas
    for (const [endpoint, stats] of this.metrics.apiCalls) {
      if (stats.average > 2000) {
        recommendations.push(`🐌 ${endpoint}: ${stats.average}ms promedio (optimizar backend)`)
      }
    }

    // Revisar tiempos de carga
    for (const [component, time] of this.metrics.loadTimes) {
      if (time > 1000) {
        recommendations.push(`⏱️ ${component}: ${Math.round(time)}ms carga (considerar lazy loading)`)
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Rendimiento óptimo - No se detectaron problemas')
    }

    return recommendations
  }

  // Mostrar reporte en consola
  logReport() {
    const report = this.getReport()
    
    console.group('📊 REPORTE DE RENDIMIENTO - PANEL ADMIN')
    console.log(`⏱️ Sesión: ${report.sessionDuration}ms`)
    
    console.group('🔄 Renders por Componente')
    Object.entries(report.componentRenders).forEach(([comp, count]) => {
      const status = count > 10 ? '⚠️' : count > 5 ? '⚡' : '✅'
      console.log(`${status} ${comp}: ${count} renders`)
    })
    console.groupEnd()

    console.group('🌐 Rendimiento API')
    Object.entries(report.apiPerformance).forEach(([endpoint, stats]) => {
      const status = stats.average > 2000 ? '🐌' : stats.average > 1000 ? '⚡' : '✅'
      console.log(`${status} ${endpoint}: ${stats.average}ms promedio (${stats.calls} llamadas)`)
    })
    console.groupEnd()

    if (report.memoryUsage) {
      console.log(`💾 Memoria: ${report.memoryUsage.used}MB (${report.memoryUsage.percentage}%)`)
    }

    console.group('💡 Recomendaciones')
    report.recommendations.forEach(rec => console.log(rec))
    console.groupEnd()

    console.groupEnd()
    
    return report
  }
}

// Instancia global
export const performanceMonitor = new PerformanceMonitor()

// Hook para medir renders
export const useRenderTracker = (componentName) => {
  performanceMonitor.trackRender(componentName)
}

// Wrapper para APIs
export const trackApiCall = async (endpoint, apiCall) => {
  const start = performance.now()
  try {
    const result = await apiCall()
    const duration = performance.now() - start
    performanceMonitor.trackApiCall(endpoint, duration)
    return result
  } catch (error) {
    const duration = performance.now() - start
    performanceMonitor.trackApiCall(endpoint, duration)
    throw error
  }
}

// Auto-tracking de memoria cada 5 segundos
setInterval(() => {
  performanceMonitor.trackMemory()
}, 5000)

// Comando global para ver reporte
window.getPerformanceReport = () => performanceMonitor.logReport()