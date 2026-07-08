import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (response.ok) {
        const data = await response.json()
        // Actualiza el estado global: Header y rutas protegidas
        // reaccionan sin necesidad de recargar la página
        login(data.token)
        navigate('/mi-cuenta')
      } else {
        setError('Email o contraseña incorrectos')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('No se pudo conectar con el servidor')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
        {error && <p style={{ color: '#c62828', fontSize: '14px' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px', width: '100%', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
          Entrar
        </button>
      </form>
      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  )
}
