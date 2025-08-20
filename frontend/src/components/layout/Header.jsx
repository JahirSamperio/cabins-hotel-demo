import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, Home, Images, Building, Calendar, Camera, User, LogIn } from 'lucide-react'
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { href: '#inicio', icon: Home, text: 'Inicio' },
    { href: '#galeria', icon: Images, text: 'Galería' },
    { href: '#cabanas', icon: Building, text: 'Cabañas' },
    { href: '#availability', icon: Calendar, text: 'Disponibilidad' },
    { href: '#virtual-tour', icon: Camera, text: 'Tour 360' }
  ]

  return (
    <header className="header" role="banner">
      <nav className="nav" role="navigation" aria-label="Navegación principal">
        <div className="nav-brand">
          <div className="logo">
            <img src="/logo-pinos.png" alt="Cabañas Huasca" className="logo-icon" />
            <div className="brand-text">
              <h1>Cabañas Huasca</h1>
              <span className="tagline">Pueblo Mágico</span>
            </div>
          </div>
        </div>
        
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`} role="menubar">
          {navItems.map(({ href, icon: Icon, text }) => (
            <li key={href} role="none">
              <a 
                href={href} 
                onClick={closeMenu}
                role="menuitem"
                aria-label={`Ir a ${text}`}
              >
                <Icon size={16} aria-hidden="true" />
                {text}
              </a>
            </li>
          ))}
        </ul>
        
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <button 
                className="user-btn"
                onClick={() => {
                  navigate(user.is_admin ? '/admin' : '/dashboard')
                }}
                aria-label={`Panel de ${user.name}`}
              >
                <User size={16} aria-hidden="true" />
                {user.name}
              </button>
            </div>
          ) : (
            <>
              <button 
                className="login-btn"
                onClick={() => navigate('/login')}
                aria-label="Iniciar sesión"
              >
                <LogIn size={16} aria-hidden="true" />
                Iniciar Sesión
              </button>
              <a 
                href="#contacto" 
                className="btn-reserve"
                aria-label="Reservar cabaña ahora"
              >
                Reservar Ahora
              </a>
            </>
          )}
          <button 
            className="nav-toggle" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Header