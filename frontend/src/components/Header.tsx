import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../styles/components.css'

export default function Header() {
  const [isAuth, setIsAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'))
  }, [])

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🏺</span>
          <span className="logo-text">Newzelland</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Inicio
          </Link>
          <Link
            to="/about"
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
          >
            Sobre Nosotros
          </Link>
          <Link
            to="/collections"
            className={`nav-link ${isActive('/collections') ? 'active' : ''}`}
          >
            Colecciones
          </Link>
          <Link
            to="/catalog"
            className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}
          >
            Catálogo
          </Link>
          <Link
            to="/downloads"
            className={`nav-link ${isActive('/downloads') ? 'active' : ''}`}
          >
            Descargas
          </Link>
          <Link
            to="/faq"
            className={`nav-link ${isActive('/faq') ? 'active' : ''}`}
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
          >
            Contacto
          </Link>

          {!isAuth ? (
            <>
              <Link to="/login" className="nav-link auth">Iniciar Sesión</Link>
              <Link to="/register" className="nav-link auth">Registrarse</Link>
            </>
          ) : (
            <>
              <Link to="/cart" className="nav-link auth">🛒 Carrito</Link>
              <Link to="/dashboard" className="nav-link auth">Dashboard</Link>
              <Link to="/admin" className="nav-link auth">Admin</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
