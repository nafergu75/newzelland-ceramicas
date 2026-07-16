import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'

export default function ConfirmEmailPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Token inválido o no proporcionado')
        return
      }

      try {
        await authService.verifyEmail(token)
        setStatus('success')
        setMessage('¡Tu correo ha sido verificado correctamente!')
        setTimeout(() => navigate('/login'), 3000)
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Error al verificar el correo. El enlace podría haber expirado.')
      }
    }

    verifyEmail()
  }, [token, navigate])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '60px 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px' }}>
        {status === 'loading' && (
          <>
            <div style={{ marginBottom: '20px', fontSize: '48px' }}>⏳</div>
            <h2>Verificando tu correo...</h2>
            <p style={{ color: '#666', marginTop: '15px', fontSize: '16px' }}>
              Espera un momento mientras verificamos tu dirección de correo
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ marginBottom: '20px', fontSize: '48px' }}>✓</div>
            <h2>¡Correo verificado!</h2>
            <p style={{ color: '#4caf50', marginTop: '15px', fontSize: '16px', fontWeight: '600' }}>
              {message}
            </p>
            <p style={{ color: '#999', marginTop: '30px', fontSize: '14px' }}>
              Redirigiendo a login en 3 segundos...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ marginBottom: '20px', fontSize: '48px' }}>✕</div>
            <h2>Error en la verificación</h2>
            <p style={{ color: '#c62828', marginTop: '15px', fontSize: '16px' }}>
              {message}
            </p>
            <div style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                to="/registrarse"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'inline-block',
                }}
              >
                Registrarse de nuevo
              </Link>
              <Link
                to="/login"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'inline-block',
                  border: '1px solid #ddd',
                }}
              >
                Volver al login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
