// Performance utilities

// Debounce function for scroll events
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Preload critical images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = reject
    img.src = src
  })
}

// Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Track LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Track FID
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime)
      }
    }).observe({ entryTypes: ['first-input'] })

    // Track CLS
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          console.log('CLS:', clsValue)
        }
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

// Resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }
  ]

  hints.forEach(hint => {
    const link = document.createElement('link')
    link.rel = hint.rel
    link.href = hint.href
    document.head.appendChild(link)
  })
}