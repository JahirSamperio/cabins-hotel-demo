import { theme } from './theme'

export const AppTheme = ({ children }) => {
  return (
    <div className="app-theme" style={{ '--primary-color': theme.colors.primary }}>
      {children}
    </div>
  )
}