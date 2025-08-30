import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { HotelApp } from './HotelApp.jsx'
import { trackWebVitals, addResourceHints } from './utils/performance'

// Initialize performance tracking
if (import.meta.env.PROD) {
  trackWebVitals()
}
addResourceHints()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HotelApp />
  </StrictMode>,
)