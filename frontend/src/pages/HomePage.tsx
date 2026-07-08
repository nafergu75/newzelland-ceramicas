import { Link } from 'react-router-dom'
import { useState } from 'react'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import ProductCard from '../components/ProductCard'
import Testimonials from '../components/Testimonials'
import { collections } from '../data/collections'
import { allProducts } from '../data/products'
import { useCart } from '../context/CartContext'
import '../styles/components.css'

export default function HomePage() {
  const [featuredProducts] = useState(allProducts.slice(0, 6))
  const { addItem } = useCart()

  const addToCart = (product: any) => {
    addItem(product)
    alert('Producto agregado al carrito')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <HeroSection
          title="Cerámica Premium Importada"
          subtitle="Descubre nuestras 50+ diseños de alta calidad para proyectos residenciales y comerciales"
          cta={{ text: 'Explorar Catálogo', link: '/catalog' }}
        />

        {/* Why Choose Us */}
        <section style={{ padding: 'var(--spacing-3xl) 0', backgroundColor: 'var(--color-gray-50)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              ¿Por qué Newzelland?
            </h2>
            <div className="grid grid-cols-1 grid-cols-3">
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🏆</div>
                <h3>Calidad Premium</h3>
                <p>Cerámica importada de las mejores fabricantes españolas con certificación internacional.</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⚡</div>
                <h3>Entrega Rápida</h3>
                <p>Entrega en toda España en 2-3 días hábiles. Somos rápidos, confiables y eficientes.</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>💰</div>
                <h3>Precios Competitivos</h3>
                <p>Precios al por mayor sin renunciar a la calidad. Descuentos por volumen disponibles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              Productos Destacados
            </h2>
            <div className="grid grid-cols-1 grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onViewDetails={() => console.log('Ver detalles:', product.id)}
                />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
              <Link to="/catalog">
                <button style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}>
                  Ver Catálogo Completo
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Collections */}
        <section style={{ padding: 'var(--spacing-3xl) 0', backgroundColor: 'var(--color-gray-50)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              Colecciones
            </h2>
            <div className="grid grid-cols-1 grid-cols-2">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.slug}`}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  <div
                    style={{
                      background: collection.image,
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-2xl)',
                      color: 'white',
                      textAlign: 'center',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all var(--transition-base)',
                      cursor: 'pointer',
                    }}
                    className="hover-lift"
                  >
                    <h3 style={{ color: 'white' }}>{collection.name}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: 'var(--spacing-md)' }}>
                      {collection.productCount} productos
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* CTA Section */}
        <section style={{
          padding: 'var(--spacing-3xl)',
          background: 'linear-gradient(135deg, #8B7355 0%, #C17851 100%)',
          color: 'white',
          textAlign: 'center',
        }}>
          <div className="container">
            <h2 style={{ color: 'white', marginBottom: 'var(--spacing-lg)' }}>
              ¿Necesitas Asesoramiento?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-lg)' }}>
              Nuestro equipo de expertos está disponible para ayudarte sin costo
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact">
                <button style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}>
                  Contactar por Email
                </button>
              </Link>
              <a href="https://wa.me/34XXXXXXXXX" target="_blank" rel="noopener noreferrer">
                <button style={{ padding: 'var(--spacing-md) var(--spacing-xl)', background: '#25D366' }}>
                  💬 Contactar por WhatsApp
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
