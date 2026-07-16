import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import CartToast from './components/CartToast'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import CollectionsPage from './pages/CollectionsPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import DownloadsPage from './pages/DownloadsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ConfirmEmailPage from './pages/ConfirmEmailPage'
import AccountDashboard from './pages/account/AccountDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import CartPage from './pages/CartPage'
import PackingPage from './pages/PackingPage'
import TrabajaConNosotrosPage from './pages/TrabajaConNosotrosPage'

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
        {/*
          basename = BASE_URL de Vite: '/' en Vercel (dominio raíz),
          '/newzelland-ceramicas/' en GitHub Pages (subdirectorio del repo).
          Sin esto, al servir desde un subdirectorio React Router no
          reconoce ninguna ruta y la app queda en blanco.
        */}
        <Router basename={import.meta.env.BASE_URL}>
          {/* Header global: visible en TODAS las páginas */}
          <Header />
          <CartToast />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            {/* Catálogo y Colecciones eran la misma vista duplicada; unificado en /collections */}
            <Route path="/catalog" element={<Navigate to="/collections" replace />} />
            <Route path="/packing" element={<PackingPage />} />
            <Route path="/trabaja-con-nosotros" element={<TrabajaConNosotrosPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registrarse" element={<RegisterPage />} />
            <Route path="/register" element={<Navigate to="/registrarse" replace />} />
            <Route path="/registro" element={<Navigate to="/registrarse" replace />} />
            <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password" element={<Navigate to="/olvide-contrasena" replace />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/confirm-email/:token" element={<ConfirmEmailPage />} />

            {/* El carrito es público (vive en el navegador); el checkout exige login */}
            <Route path="/cart" element={<CartPage />} />

            {/* Protected Routes */}
            <Route
              path="/mi-cuenta"
              element={
                <ProtectedRoute>
                  <AccountDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/mi-cuenta" replace />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
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
