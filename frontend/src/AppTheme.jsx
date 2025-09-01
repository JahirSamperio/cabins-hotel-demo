import { theme } from './theme'

export const AppTheme = ({ children }) => {
  if (!children) return null
  
  return (
    <div className="app-theme" style={{ '--primary-color': theme?.colors?.primary || '#2c5530' }}>
      {children}
    </div>
  )
}