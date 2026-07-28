import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateEmail } from '../utils/validation'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/mi-cuenta'
  const reason = searchParams.get('reason')
  const isCatalogReason = reason === 'catalog'
  const registerHref = `/registrarse?redirect=${encodeURIComponent(redirectTo)}${reason ? `&reason=${reason}` : ''}`

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    recuerdame: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Tras un login que venía a por un catálogo, se enseña un mensaje breve
  // antes de saltar a la página de descargas (donde la descarga pendiente
  // se dispara sola vía useCatalogDownload).
  useEffect(() => {
    if (loginSuccess && isCatalogReason) {
      const timeout = setTimeout(() => navigate(redirectTo), 1600)
      return () => clearTimeout(timeout)
    }
  }, [loginSuccess, isCatalogReason, redirectTo, navigate])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, introduce un correo válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

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
      await login(formData.email, formData.password)
      if (isCatalogReason) {
        setLoginSuccess(true)
      } else {
        navigate(redirectTo)
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al iniciar sesión. Verifica tus credenciales.' })
    } finally {
      setLoading(false)
    }
  }

  if (loginSuccess) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '40px 20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Ya puedes descargar tu catálogo</h2>
          <p style={{ marginTop: '16px', color: '#666' }}>
            La descarga se iniciará en unos segundos. Si no se descarga automáticamente, puedes volver a la sección de catálogos.
          </p>
          <Link
            to={redirectTo}
            style={{
              display: 'inline-block',
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Ir a catálogos ahora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '40px 20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>
          {isCatalogReason ? 'Accede para descargar el catálogo' : 'Accede a tu cuenta'}
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: isCatalogReason ? '12px' : '40px', fontSize: '16px' }}>
          {isCatalogReason
            ? 'El registro es rápido y gratuito. Al crear tu cuenta podrás descargar los catálogos técnicos y de colección, y acceder a actualizaciones y novedades de nuestras series.'
            : 'Gestiona tus descargas, explora nuestras colecciones y accede a material exclusivo para profesionales y particulares.'}
        </p>
        {isCatalogReason && (
          <p style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginBottom: '28px' }}>
            Si aún no tienes cuenta, puedes crearla en menos de un minuto.
          </p>
        )}

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Contraseña *</label>
              <Link to="/olvide-contrasena" style={{ color: '#1976d2', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>
                ¿La olvidaste?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
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
          </div>

          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="recuerdame"
                checked={formData.recuerdame}
                onChange={handleChange}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Recuerda mi contraseña en este navegador</span>
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
              marginBottom: isCatalogReason ? '12px' : '16px',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {isCatalogReason && (
            <Link
              to={registerHref}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                backgroundColor: 'white',
                color: '#1a1a1a',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
            >
              Crear cuenta
            </Link>
          )}

          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
            ¿No tienes cuenta? <Link to={registerHref} style={{ color: '#1976d2', textDecoration: 'none', fontWeight: '600' }}>Regístrate aquí</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
