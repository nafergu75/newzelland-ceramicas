import { useParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { ArrowLeft, FilePdf, WhatsappLogo } from '@phosphor-icons/react'
import Footer from '../components/Footer'
import SeriesCard from '../components/SeriesCard'
import AddToCartBox from '../components/AddToCartBox'
import { series, getSerieById } from '../data/catalog'

export default function CollectionsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [search, setSearch] = useState('')
  const [material, setMaterial] = useState('')

  const serie = slug ? getSerieById(slug) : undefined

  const materials = useMemo(
    () => [...new Set(series.map((s) => s.material.split(',')[0].trim()))].sort(),
    []
  )

  const filteredSeries = useMemo(() => {
    let result = series
    if (material) {
      result = result.filter((s) => s.material.split(',')[0].trim() === material)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (s) => s.nombre.toLowerCase().includes(q) || s.material.toLowerCase().includes(q)
      )
    }
    return result
  }, [search, material])

  // --- Vista detalle de una serie (ficha de producto) ---
  if (slug) {
    if (!serie) {
      return (
        <div style={{ padding: 'var(--space-24) var(--space-6)', textAlign: 'center' }}>
          <h1>Serie no encontrada</h1>
          <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Volver a Colecciones
          </Link>
        </div>
      )
    }

    const whatsappText = encodeURIComponent(
      `Hola, me interesa la serie ${serie.nombre} (${serie.formatos.join(', ')}). ¿Podéis prepararme un presupuesto?`
    )

    const related = series
      .filter((s) => s.id !== serie.id && s.material.split(',')[0] === serie.material.split(',')[0])
      .slice(0, 3)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1 }}>
          <div className="serie-detail">
            <div className="serie-detail-media animate-fade-in-up">
              <img src={serie.imagen} alt={`Serie ${serie.nombre} en ambiente`} />
            </div>

            <div className="serie-detail-info">
              <Link
                to="/collections"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}
              >
                <ArrowLeft size={14} /> Colecciones
              </Link>

              <h1>{serie.nombre}</h1>
              <p className="serie-meta">
                {serie.material} · {serie.tipo.join(' y ')}
              </p>
              <p>{serie.descripcion}</p>

              <div className="spec-groups">
                <div className="spec-group">
                  <h3>Formatos y acabados</h3>
                  <p>{serie.formatos.join(', ')} cm</p>
                  <p>{serie.acabados.join(', ')}</p>
                </div>
                <div className="spec-group">
                  <h3>Colores</h3>
                  <p>{serie.colores.join(', ')}</p>
                </div>
              </div>

              <AddToCartBox serie={serie} />

              <div className="serie-actions">
                <a
                  href={`https://wa.me/34123456789?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <WhatsappLogo size={18} weight="regular" />
                  Solicitar presupuesto
                </a>
                {serie.fichas.tecnica && (
                  <a href={serie.fichas.tecnica} target="_blank" rel="noopener noreferrer">
                    <button className="secondary">
                      <FilePdf size={18} weight="regular" />
                      Ficha técnica
                    </button>
                  </a>
                )}
                {serie.fichas.catalogo && (
                  <a href={serie.fichas.catalogo} target="_blank" rel="noopener noreferrer">
                    <button className="secondary">
                      <FilePdf size={18} weight="regular" />
                      Catálogo
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="container">
                <h2 style={{ marginBottom: 'var(--space-8)' }}>Series del mismo material</h2>
                <div className="grid grid-cols-3">
                  {related.map((s) => (
                    <SeriesCard key={s.id} serie={s} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    )
  }

  // --- Vista listado con búsqueda y filtro por material ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <section className="hero-section plain">
          <div className="hero-content">
            <h1>Colecciones</h1>
            <p>{series.length} series de cerámica y porcelánico. Filtra por material o busca por nombre.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
              <input
                type="text"
                placeholder="Buscar serie por nombre"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: '320px' }}
                aria-label="Buscar serie"
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className={material === '' ? undefined : 'secondary'}
                  onClick={() => setMaterial('')}
                  style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}
                >
                  Todos
                </button>
                {materials.map((m) => (
                  <button
                    key={m}
                    className={material === m ? undefined : 'secondary'}
                    onClick={() => setMaterial(material === m ? '' : m)}
                    style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3">
              {filteredSeries.map((s) => (
                <SeriesCard key={s.id} serie={s} />
              ))}
            </div>

            {filteredSeries.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <p>No hay resultados para tu búsqueda.</p>
                <button className="secondary" onClick={() => { setSearch(''); setMaterial('') }}>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
