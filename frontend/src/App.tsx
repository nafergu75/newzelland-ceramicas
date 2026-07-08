import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import CollectionsPage from './pages/CollectionsPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import DownloadsPage from './pages/DownloadsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import CatalogPage from './pages/CatalogPage'
import CartPage from './pages/CartPage'

/**
 * Las rutas protegidas se montan SIEMPRE y deciden en render-time con el
 * estado reactivo de autenticación. (Antes se montaban condicionalmente con
 * un isAuthenticated calculado una sola vez al arrancar: tras hacer login
 * sin recargar, /dashboard no existía y salía pantalla en blanco.)
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Header global: visible en TODAS las páginas */}
          <Header />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/registro" element={<Navigate to="/register" replace />} />

            {/* El carrito es público (vive en el navegador); el checkout exige login */}
            <Route path="/cart" element={<CartPage />} />

            {/* Protected Routes */}
            <Route
              path="/mi-cuenta"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/mi-cuenta" replace />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}
