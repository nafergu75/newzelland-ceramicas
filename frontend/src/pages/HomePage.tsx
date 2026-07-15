import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import Footer from '../components/Footer'
import SeriesCard from '../components/SeriesCard'
import { series, getSerieById } from '../data/catalog'
import '../styles/components.css'

/** Series con foto potente para el mosaico de portada */
const MOSAIC_IDS = ['calacata', 'morella', 'atlas']
/** Series populares para la fila horizontal */
const POPULAR_IDS = ['diamond', 'berna', 'provence', 'crema-marfil', 'travertino-caliza-brillo', 'tokyo']

export default function HomePage() {
  const mosaicSeries = MOSAIC_IDS.map(getSerieById).filter(Boolean) as NonNullable<ReturnType<typeof getSerieById>>[]
  const popularSeries = POPULAR_IDS.map(getSerieById).filter(Boolean) as NonNullable<ReturnType<typeof getSerieById>>[]
  const heroSerie = getSerieById('calacata') ?? series[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        {/* 1 · Hero split asimétrico */}
        <section className="home-hero">
          <div className="home-hero-copy animate-fade-in-up">
            <h1>
              Cerámica mediterránea para espacios con carácter
            </h1>
            <p>
              Porcelánico y gres desde Onda, Castellón. {series.length} series para vivienda, proyecto y obra.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Link to="/collections" className="btn-primary btn-large">
                Ver colecciones
                <ArrowRight size={18} weight="regular" />
              </Link>
            </div>
          </div>
          <div className="home-hero-media">
            <img src={heroSerie.imagen} alt={`Serie ${heroSerie.nombre} en ambiente`} />
          </div>
        </section>

        {/* 2 · Mosaico asimétrico de colecciones destacadas */}
        <section className="section">
          <div className="container">
            <h2 style={{ marginBottom: 'var(--space-8)' }}>Colecciones destacadas</h2>
            <div className="feature-mosaic">
              {mosaicSeries.map((s) => (
                <Link key={s.id} to={`/collections/${s.id}`} className="mosaic-item">
                  <img src={s.imagen} alt={`Serie ${s.nombre}`} loading="lazy" />
                  <div className="mosaic-caption">
                    <h3>{s.nombre}</h3>
                    <span>{s.material.split(',')[0]} · {s.formatos.join(', ')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 3 · Banda editorial: materialidad y origen */}
        <section className="editorial-band">
          <div className="editorial-inner">
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
              <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Ver catálogo completo
                <ArrowRight size={16} weight="regular" />
              </Link>
            </div>
            <div className="snap-row">
              {popularSeries.map((s) => (
                <SeriesCard key={s.id} serie={s} />
              ))}
            </div>
          </div>
        </section>

        {/* 5 · Banda profesional */}
        <section className="pro-band">
          <div className="pro-band-inner">
            <div>
              <h2>¿Interiorista o arquitecto?</h2>
              <p>Precios de proyecto, muestras y fichas técnicas para tu estudio.</p>
            </div>
            <Link to="/contact" className="btn-primary btn-large">
              Solicitar presupuesto
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
