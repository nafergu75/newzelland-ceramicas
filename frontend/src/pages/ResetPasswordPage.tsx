import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/validation'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'password') {
      const validation = validatePassword(value)
      setPasswordStrength(validation.strength)
    }

    setFormData({
      ...formData,
      [name]: value,
    })

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) return

    setLoading(true)
    try {
      await authService.resetPassword(token, {
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
      })
      setSubmitted(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al restablecer contraseña. El enlace podría haber expirado.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '60px 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: '20px', fontSize: '48px' }}>✓</div>
          <h2>¡Contraseña restablecida!</h2>
          <p style={{ marginTop: '20px', color: '#4caf50', fontSize: '16px', fontWeight: '600' }}>
            Tu contraseña se ha actualizado correctamente
          </p>
          <p style={{ color: '#999', marginTop: '30px', fontSize: '14px' }}>
            Redirigiendo a login en 3 segundos...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '40px 20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>Establecer nueva contraseña</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '16px' }}>
          Introduce tu nueva contraseña para acceder a tu cuenta
        </p>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {errors.submit && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
              {errors.submit}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Nueva Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 caracteres"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.password ? '1px solid #c62828' : '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
            {errors.password && <p style={{ color: '#c62828', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
            {formData.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                        height: '100%',
                        backgroundColor: getPasswordStrengthColor(passwordStrength),
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: getPasswordStrengthColor(passwordStrength), fontWeight: '600' }}>
                    {getPasswordStrengthLabel(passwordStrength)}
                  </span>
                </div>
              </div>
            )}
            <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
              Recomendamos: mayúsculas, minúsculas y números
            </p>
          </div>

          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.passwordConfirm ? '1px solid #c62828' : '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
            {errors.passwordConfirm && <p style={{ color: '#c62828', fontSize: '12px', marginTop: '4px' }}>{errors.passwordConfirm}</p>}
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
            {loading ? 'Actualizando...' : '✓ Actualizar contraseña'}
          </button>

          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
            ¿Recordaste tu contraseña? <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}>Inicia sesión aquí</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
