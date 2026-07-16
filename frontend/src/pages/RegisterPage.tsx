import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validateTelefono, validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/validation'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    empresa: '',
    email: '',
    telefono: '',
    password: '',
    passwordConfirm: '',
    terminos: false,
    privacidad: false,
    newsletter: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios'
    } else if (formData.apellidos.trim().length < 3) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 3 caracteres'
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, introduce un correo válido'
    }

    if (!validateTelefono(formData.telefono)) {
      newErrors.telefono = 'Formato no válido. Usa: +34 600 123 456'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Las contraseñas no coinciden'
    }

    if (!formData.terminos) {
      newErrors.terminos = 'Debes aceptar los términos y condiciones'
    }

    if (!formData.privacidad) {
      newErrors.privacidad = 'Debes aceptar la política de privacidad'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    if (name === 'password') {
      const validation = validatePassword(value)
      setPasswordStrength(validation.strength)
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await register(formData)
      setSubmitted(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al registrar. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <h2>¡Cuasi-casi... Revisa tu correo!</h2>
        <p style={{ marginTop: '20px', color: '#666', maxWidth: '500px', margin: '20px auto' }}>
          Hemos enviado un enlace de confirmación a <strong>{formData.email}</strong>
        </p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '40px' }}>
          Redireccionando a login en unos momentos...
        </p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>Crear cuenta</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '16px' }}>
          Regístrate para comenzar a comprar
        </p>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {errors.submit && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
              {errors.submit}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.nombre ? '1px solid #c62828' : '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
              {errors.nombre && <p style={{ color: '#c62828', fontSize: '12px', marginTop: '4px' }}>{errors.nombre}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="García López"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.apellidos ? '1px solid #c62828' : '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
              {errors.apellidos && <p style={{ color: '#c62828', fontSize: '12px', marginTop: '4px' }}>{errors.apellidos}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Empresa (Opcional)
            </label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              placeholder="Ej: García & Asociados S.L."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
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
              Usaremos este correo para enviarte confirmaciones y facturas
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+34 600 123 456"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.telefono ? '1px solid #c62828' : '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontSize: '14px',
              }}
            />
            {errors.telefono && <p style={{ color: '#c62828', fontSize: '12px', marginTop: '4px' }}>{errors.telefono}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Contraseña *
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

          <div style={{ marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="terminos"
                checked={formData.terminos}
                onChange={handleChange}
                style={{ marginRight: '8px', marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>
                He leído y acepto los <a href="/terminos" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}>Términos y Condiciones</a> *
              </span>
            </label>
            {errors.terminos && <p style={{ color: '#c62828', fontSize: '12px', marginLeft: '24px' }}>{errors.terminos}</p>}

            <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="privacidad"
                checked={formData.privacidad}
                onChange={handleChange}
                style={{ marginRight: '8px', marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>
                Acepto la <a href="/privacidad" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}>Política de Privacidad</a> *
              </span>
            </label>
            {errors.privacidad && <p style={{ color: '#c62828', fontSize: '12px', marginLeft: '24px' }}>{errors.privacidad}</p>}

            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                style={{ marginRight: '8px', marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Deseo recibir información sobre productos y promociones</span>
            </label>
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
            {loading ? 'Registrando...' : '✓ Crear cuenta'}
          </button>

          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}>Inicia sesión aquí</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
