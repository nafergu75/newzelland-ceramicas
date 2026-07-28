import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/validation'
import { markJustRegistered } from '../utils/onboarding'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, login } = useAuth()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const reason = searchParams.get('reason')
  const isCatalogReason = reason === 'catalog'
  const loginHref = `/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}${reason ? `${redirectTo ? '&' : '?'}reason=${reason}` : ''}`

  const [formData, setFormData] = useState({
    nombre: '',
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
  const [autoLoginFailed, setAutoLoginFailed] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

  // Si venía a descargar un catálogo, en cuanto ya está logueado (justo
  // después del registro) le llevamos directo a por qué vino.
  useEffect(() => {
    if (submitted && !autoLoginFailed && isCatalogReason) {
      const timeout = setTimeout(() => navigate(redirectTo || '/downloads'), 1800)
      return () => clearTimeout(timeout)
    }
  }, [submitted, autoLoginFailed, isCatalogReason, redirectTo, navigate])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'Escribe al menos tu nombre y un apellido'
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, introduce un correo válido'
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
      markJustRegistered(formData.nombre.trim())

      // El registro no da sesión por sí solo; iniciamos sesión con las
      // mismas credenciales para que "Ir a catálogos" funcione de verdad
      // (y, si venía de una descarga, se dispare sin pedirle login otra vez).
      try {
        await login(formData.email, formData.password)
      } catch {
        setAutoLoginFailed(true)
      }

      setSubmitted(true)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al registrar. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          {autoLoginFailed ? (
            <>
              <h2>Cuenta creada correctamente</h2>
              <p style={{ marginTop: '16px', color: '#666' }}>
                Ya puedes iniciar sesión para descargar los catálogos de todas nuestras colecciones.
              </p>
              <Link
                to={loginHref}
                style={{
                  display: 'inline-block',
                  marginTop: '28px',
                  padding: '12px 28px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <h2>Cuenta creada correctamente</h2>
              <p style={{ marginTop: '16px', color: '#666' }}>
                Ya puedes descargar los catálogos de todas nuestras colecciones.
              </p>
              {isCatalogReason && (
                <p style={{ color: '#999', fontSize: '14px', marginTop: '12px' }}>
                  Te llevamos a por tu catálogo en un momento…
                </p>
              )}
              <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/downloads"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  Ir a catálogos
                </Link>
                <Link
                  to="/collections"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#1a1a1a',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  Explorar colecciones
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>
          {isCatalogReason ? 'Regístrate para descargar el catálogo' : 'Crea tu cuenta'}
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '16px' }}>
          {isCatalogReason
            ? 'El registro es rápido, gratuito y seguro. En menos de un minuto tendrás acceso a todos nuestros catálogos técnicos y de colección.'
            : 'Accede a todos los catálogos técnicos y de colección, y recibe actualizaciones sobre nuestras series y novedades.'}
        </p>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {errors.submit && (
            <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
              {errors.submit}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Nombre completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan García"
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

          <details style={{ marginBottom: '20px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#999', fontWeight: '600' }}>
              Teléfono y empresa (opcional, útil si eres profesional)
            </summary>
            <div style={{ marginTop: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+34 600 123 456"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Empresa / estudio
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  placeholder="Ej: García & Asociados S.L."
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
            </div>
          </details>

          <p style={{ fontSize: '13px', color: '#999', marginBottom: '16px', lineHeight: '1.5' }}>
            Al registrarte aceptas nuestra política de privacidad. Tratamos tus datos de forma segura y solo para gestionar tus descargas y comunicaciones relacionadas con nuestros productos.
          </p>

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
                Acepto la <Link to="/privacidad" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}>Política de Privacidad</Link> *
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
            ¿Ya tienes cuenta? <Link to={loginHref} style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}>Inicia sesión aquí</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
