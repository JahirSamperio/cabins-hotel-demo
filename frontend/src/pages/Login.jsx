import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react'
import './Login.css'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { authAPI } = await import('../services/api')
      const response = await authAPI.login(formData)
      
      if (response.ok) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        navigate(response.user.is_admin ? '/admin' : '/dashboard')
      } else {
        setError(response.msg || 'Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src="/logo-pinos.png" alt="Cabañas Huasca" className="login-logo" />
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta de Cabañas Huasca</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <User size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            <LogIn size={20} />
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <div className="register-link">
            <p>¿No tienes cuenta? <button className="link-btn" onClick={() => navigate('/register')}>Regístrate aquí</button></p>
          </div>
          
          <div className="login-demo">
            <p>Cuentas de prueba:</p>
            <div className="demo-accounts">
              <span>Admin: admin@cabanas.com</span>
              <span>Usuario: user@cabanas.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login