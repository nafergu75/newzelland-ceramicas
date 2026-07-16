import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { validateEmail } from '../utils/validation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!validateEmail(email)) {
      newErrors.email = 'Por favor, introduce un correo válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await authService.forgotPassword({ email })
      setSubmitted(true)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al enviar el email. Inténtalo de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '60px 20px', textAlign: 'center' }}>
        <h2>¿Revisamos el correo?</h2>
        <p style={{ marginTop: '20px', color: '#666', maxWidth: '500px', margin: '20px auto', fontSize: '16px' }}>
          Hemos enviado un enlace de recuperación de contraseña a <strong>{email}</strong>
        </p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '15px' }}>
          Si no ves el email, revisa tu carpeta de spam
        </p>
        <div style={{ marginTop: '40px' }}>
          <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600', fontSize: '16px' }}>
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '40px 20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>Recuperar contraseña</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '16px' }}>
          Introduce tu correo para recibir un enlace de recuperación
        </p>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {errors.submit && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
              {errors.submit}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.email ? '1px solid #c62828' : '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
            {errors.email && <p style={{ color: '#c62828', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
            <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
              Te enviaremos un enlace para restablecer tu contraseña en los próximos minutos
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#9e9e9e' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Enviando...' : '✓ Enviar enlace'}
          </button>

          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
            ¿Recordaste tu contraseña? <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}>Inicia sesión aquí</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
