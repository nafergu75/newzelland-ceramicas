import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import '../styles/components.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const { cartCount } = useCart()

  const isActive = (path: string) => location.pathname === path
  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon">🏺</span>
          <span className="logo-text">Newzelland</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
            Inicio
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={closeMenu}>
            Sobre Nosotros
          </Link>
          <Link to="/collections" className={`nav-link ${isActive('/collections') ? 'active' : ''}`} onClick={closeMenu}>
            Colecciones
          </Link>
          <Link to="/catalog" className={`nav-link ${isActive('/catalog') ? 'active' : ''}`} onClick={closeMenu}>
            Catálogo
          </Link>
          <Link to="/downloads" className={`nav-link ${isActive('/downloads') ? 'active' : ''}`} onClick={closeMenu}>
            Descargas
          </Link>
          <Link to="/faq" className={`nav-link ${isActive('/faq') ? 'active' : ''}`} onClick={closeMenu}>
            FAQ
          </Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={closeMenu}>
            Contacto
          </Link>
          <a href="packing.html" className="nav-link" onClick={closeMenu}>
            Packing
          </a>
          <a href="comerciales.html" className="nav-link" onClick={closeMenu}>
            Trabaja con nosotros
          </a>

          {/* Carrito: visible siempre (el carrito vive en el navegador) */}
          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`} onClick={closeMenu}>
            🛒 Carrito{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>

          {/*
            Mi cuenta: SIEMPRE visible.
            - Logueado    → /mi-cuenta (resumen de pedidos + perfil)
            - No logueado → /login (con enlace a registro)
          */}
          <Link
            to={isAuthenticated ? '/mi-cuenta' : '/login'}
            className="nav-link auth"
            onClick={closeMenu}
          >
            👤 Mi cuenta
          </Link>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
