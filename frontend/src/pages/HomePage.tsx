import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import SeriesCard from '../components/SeriesCard'
import { series } from '../data/catalog'
import '../styles/components.css'

export default function HomePage() {
  const featuredSeries = series.slice(0, 6)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <HeroSection
          title="Cerámica Premium Importada"
          subtitle={`Descubre nuestras ${series.length}+ diseños de alta calidad para proyectos residenciales y comerciales`}
          backgroundImage={series[0]?.imagen}
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

        {/* Featured Series */}
        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              Nuestras Series
            </h2>
            <div className="grid grid-cols-1 grid-cols-3">
              {featuredSeries.map((s) => (
                <SeriesCard key={s.id} serie={s} />
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
