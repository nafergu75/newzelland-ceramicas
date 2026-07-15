import SeriesCard from '../components/SeriesCard'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import { series } from '../data/catalog'

export default function CatalogPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Catálogo Completo"
          subtitle={`${series.length} series de cerámica y porcelánico de alta gama`}
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <div className="grid grid-cols-1 grid-cols-3">
              {series.map((s) => (
                <SeriesCard key={s.id} serie={s} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
