import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { captureAttribution } from './utils/attribution'
import Header from './components/Header'
import CartToast from './components/CartToast'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import CollectionsPage from './pages/CollectionsPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ContactPage from './pages/ContactPage'
import QuoteRequestPage from './pages/QuoteRequestPage'
import PartnerRegisterPage from './pages/PartnerRegisterPage'
import FAQPage from './pages/FAQPage'
import DownloadsPage from './pages/DownloadsPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import LegalNotice from './pages/LegalNotice'
import CookiePolicy from './pages/CookiePolicy'
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
import InvoiceReader from './pages/admin/sections/InvoiceReader'
import CeramicoButton from './components/CeramicoButton'
import CeramicoWidget from './components/CeramicoWidget'

/**
 * Las rutas protegidas se montan SIEMPRE y deciden en render-time con el
 * estado reactivo de autenticación. (Antes se montaban condicionalmente con
 * un isAuthenticated calculado una sola vez al arrancar: tras hacer login
 * sin recargar, /dashboard no existía y salía pantalla en blanco.)
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  // Sin esperar isLoading, una recarga completa con token válido pero
  // AuthContext aún inicializando (llamada async a /api/auth/me en curso)
  // expulsaba a /login de forma incorrecta — el mismo patrón que ya se
  // corrigió en AdminRoute.
  if (isLoading) return null
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// Además de exigir sesión, exige role === 'admin'. Un cliente normal
// logueado que entre a /admin se redirige a su cuenta, no a /login
// (ya tiene sesión válida, solo no tiene permiso).
function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/mi-cuenta" replace />
  }
  return <>{children}</>
}

export default function App() {
  const [ceramicoOpen, setCeramicoOpen] = useState(false)
  const location = useLocation()
  const currentPage = location.pathname
  const currentSeriesSlug = location.pathname.startsWith('/collections/')
    ? location.pathname.split('/').pop()
    : undefined

  useEffect(() => {
    captureAttribution()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCeramicoOpen(true)
    }, 30000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        {/* Header global: visible en TODAS las páginas */}
        <Header />
          <CartToast />
          {import.meta.env.VITE_CERAMICO_ENABLED === 'true' && (
            <>
              <CeramicoButton onClick={() => setCeramicoOpen(true)} isOpen={ceramicoOpen} />
              <CeramicoWidget
                isOpen={ceramicoOpen}
                onClose={() => setCeramicoOpen(false)}
                currentSeriesSlug={currentSeriesSlug}
                currentPage={currentPage}
              />
            </>
          )}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionsPage />} />
            <Route path="/proyectos" element={<ProjectsPage />} />
            <Route path="/proyectos/:slug" element={<ProjectDetailPage />} />
            <Route path="/projects" element={<Navigate to="/proyectos" replace />} />
            <Route path="/projects/:slug" element={<Navigate to="/proyectos/:slug" replace />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contacto" element={<Navigate to="/contact" replace />} />
            <Route path="/presupuesto" element={<QuoteRequestPage />} />
            <Route path="/quote-request" element={<Navigate to="/presupuesto" replace />} />
            <Route path="/registro-profesionales" element={<PartnerRegisterPage />} />
            <Route path="/partner-register" element={<Navigate to="/registro-profesionales" replace />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />

            {/* Páginas legales */}
            <Route path="/aviso-legal" element={<LegalNotice />} />
            <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />
            <Route path="/politica-de-cookies" element={<CookiePolicy />} />
            {/* Ruta legacy para privacidad */}
            <Route path="/privacidad" element={<Navigate to="/politica-de-privacidad" replace />} />

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
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Ruta solo-desarrollo para probar el lector OCR sin login */}
            {import.meta.env.DEV && (
              <Route path="/dev/lector" element={<InvoiceReader />} />
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
