import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ShoppingBag, User, List, SignOut } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import '../styles/components.css'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio' },
  { to: '/collections', label: 'Colecciones' },
  { to: '/downloads', label: 'Descargas' },
  { to: '/packing', label: 'Packing' },
  { to: '/about', label: 'Sobre nosotros' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contacto' },
  { to: '/trabaja-con-nosotros', label: 'Trabaja con nosotros' },
]

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
          <img
            src={`${import.meta.env.BASE_URL}logo-newzeland-mark.svg`}
            alt="Newzeland Cerámicas"
            className="logo-icon"
          />
          <span className="logo-text">Newzeland</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <List size={24} weight="regular" />
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}

          {/* Carrito: visible siempre (vive en el navegador) */}
          <Link
            to="/cart"
            className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
            onClick={closeMenu}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span className="cart-icon-wrap">
              <ShoppingBag size={18} weight="regular" />
              {cartCount > 0 && (
                <span key={cartCount} className="cart-badge">
                  {cartCount}
                </span>
              )}
            </span>
            Carrito
          </Link>

          {/*
            Mi cuenta: SIEMPRE visible.
            - Logueado    → /mi-cuenta
            - No logueado → /login
          */}
          <Link
            to={isAuthenticated ? '/mi-cuenta' : '/login'}
            className="nav-link auth"
            onClick={closeMenu}
          >
            <User size={18} weight="regular" />
            Mi cuenta
          </Link>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <SignOut size={18} weight="regular" />
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
