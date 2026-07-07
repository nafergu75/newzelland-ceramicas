import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'))
  }, [])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🏺 Newzelland Cerámicas</h1>
      <p>Tienda de cerámica premium importada</p>
      <p style={{ color: '#999', fontSize: '14px' }}>
        Catálogos de diseño, precios mayoristas, envío nacional
      </p>
      <nav style={{ marginTop: '20px', gap: '10px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!isAuth ? (
          <>
            <Link to="/login"><button>Iniciar Sesión</button></Link>
            <Link to="/register"><button>Registrarse</button></Link>
          </>
        ) : (
          <>
            <Link to="/cart"><button>🛒 Carrito</button></Link>
            <Link to="/dashboard"><button>Mi Dashboard</button></Link>
            <Link to="/admin"><button>📊 Admin</button></Link>
          </>
        )}
        <Link to="/catalog"><button>📦 Catálogo</button></Link>
      </nav>
      <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: '600px', margin: '40px auto' }}>
        <h2>Por qué Newzelland?</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✓ Cerámica premium importada de España</li>
          <li>✓ Más de 50 diseños disponibles</li>
          <li>✓ Precios competitivos por m²</li>
          <li>✓ Entrega en toda España en 2-3 días</li>
          <li>✓ Catálogos descargables por colección</li>
          <li>✓ Asesoramiento gratuito por WhatsApp</li>
        </ul>
      </div>
    </div>
  )
}
