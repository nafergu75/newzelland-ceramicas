import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  return (
    <Router>
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

        {/* Protected Routes */}
        {isAuthenticated && (
          <>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </>
        )}
      </Routes>
    </Router>
  )
}
