import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import Footer from '../components/Footer'
import HeroCarousel from '../components/HeroCarousel'
import SeriesCard from '../components/SeriesCard'
import MosaicTile from '../components/MosaicTile'
import { useReveal } from '../hooks/useReveal'
import { series, getSerieById } from '../data/catalog'
import '../styles/components.css'

/** Series con foto potente para el mosaico de portada */
const MOSAIC_IDS = ['calacata', 'morella', 'atlas', 'bali-c3', 'brandon', 'crema-marfil']
/** Series populares para la fila horizontal */
const POPULAR_IDS = ['diamond', 'berna', 'provence', 'carrara', 'travertino-caliza-brillo', 'tokyo']

export default function HomePage() {
  const mosaicSeries = MOSAIC_IDS.map(getSerieById).filter(Boolean) as NonNullable<ReturnType<typeof getSerieById>>[]
  const popularSeries = POPULAR_IDS.map(getSerieById).filter(Boolean) as NonNullable<ReturnType<typeof getSerieById>>[]
  const editorial = useReveal<HTMLDivElement>()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        {/* 1 · Hero banner: carrusel de ambientes cerámicos.
            Slides y timing se editan en components/HeroCarousel.tsx
            (HERO_SLIDES y AUTOPLAY_MS). */}
        <h1 className="sr-only">
          Newzeland Cerámicas: porcelánico y gres desde Onda, Castellón
        </h1>
        <HeroCarousel />

        {/* 2 · Mosaico asimétrico de colecciones destacadas */}
        <section className="section-tight">
          <div className="container">
            <h2 style={{ marginBottom: 'var(--space-8)' }}>Colecciones destacadas</h2>
            <div className="feature-mosaic">
              {mosaicSeries.map((s, i) => (
                <MosaicTile key={s.id} serie={s} delay={i * 90} />
              ))}
            </div>
          </div>
        </section>

        {/* 3 · Banda editorial: materialidad y origen */}
        <section className="editorial-band">
          <div ref={editorial.ref} className={`editorial-inner reveal ${editorial.visible ? 'is-visible' : ''}`}>
            <img
              src={getSerieById('morella')?.imagen ?? series[1].imagen}
              alt="Detalle de acabado cerámico"
              loading="lazy"
            />
            <div>
              <h2>Del corazón cerámico de España</h2>
              <p>
                Trabajamos con fábricas de Onda y Castellón, donde la cerámica se perfecciona
                desde hace más de un siglo. Cada serie se elige por su materialidad, su acabado
                y su comportamiento en obra.
              </p>
              <p>
                Mate, brillo o relieve. Pavimento o revestimiento. Si dudas entre dos series,
                te enviamos muestras.
              </p>
              <Link to="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                Conoce la marca
                <ArrowRight size={16} weight="regular" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 · Series populares: fila scroll-snap */}
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
              <h2 style={{ marginBottom: 0 }}>Las más pedidas</h2>
              <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Ver colecciones
                <ArrowRight size={16} weight="regular" />
              </Link>
            </div>
            <div className="snap-row">
              {popularSeries.map((s, i) => (
                <SeriesCard key={s.id} serie={s} delay={i * 70} />
              ))}
            </div>
          </div>
        </section>

        {/* 5 · Banda profesional */}
        <section className="pro-band section-tight">
          <div className="pro-band-inner">
            <div>
              <h2>¿Interiorista o arquitecto?</h2>
              <p>Precios de proyecto, muestras y fichas técnicas para tu estudio.</p>
            </div>
            <div className="pro-band-actions">
              <Link to="/contact" className="btn-primary btn-large">
                Solicitar presupuesto
              </Link>
              <Link to="/downloads" className="pro-band-secondary">
                Descargar fichas técnicas
                <ArrowRight size={14} weight="regular" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
