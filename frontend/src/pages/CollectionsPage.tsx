import { useParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import SeriesCard from '../components/SeriesCard'
import { series, getSerieById } from '../data/catalog'

export default function CollectionsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [search, setSearch] = useState('')

  const serie = slug ? getSerieById(slug) : undefined

  const filteredSeries = useMemo(() => {
    if (!search.trim()) return series
    const q = search.trim().toLowerCase()
    return series.filter(
      (s) => s.nombre.toLowerCase().includes(q) || s.material.toLowerCase().includes(q)
    )
  }, [search])

  // --- Vista detalle de una serie ---
  if (slug) {
    if (!serie) {
      return (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h1>Serie no encontrada</h1>
          <Link to="/collections">← Volver a Colecciones</Link>
        </div>
      )
    }

    const whatsappText = encodeURIComponent(
      `Hola, me interesa la serie ${serie.nombre} (${serie.formatos.join(', ')}). ¿Podéis darme precio?`
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1 }}>
          <HeroSection
            title={serie.nombre}
            subtitle={serie.descripcion}
            backgroundImage={serie.imagen}
          />

          <section style={{ padding: 'var(--spacing-3xl) 0' }}>
            <div className="container">
              <Link to="/collections" style={{ color: 'var(--color-primary)' }}>
                ← Volver a Colecciones
              </Link>

              <div
                className="grid grid-cols-1 grid-cols-2"
                style={{ marginTop: 'var(--spacing-xl)', alignItems: 'start' }}
              >
                <img
                  src={serie.imagen}
                  alt={serie.nombre}
                  loading="lazy"
                  style={{ width: '100%', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
                />

                <div>
                  <h2>Especificaciones</h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--spacing-md)',
                      marginBottom: 'var(--spacing-xl)',
                    }}
                  >
                    <div>
                      <strong>Material</strong>
                      <p>{serie.material}</p>
                    </div>
                    <div>
                      <strong>Formatos</strong>
                      <p>{serie.formatos.join(', ')}</p>
                    </div>
                    <div>
                      <strong>Acabados</strong>
                      <p>{serie.acabados.join(', ')}</p>
                    </div>
                    <div>
                      <strong>Tipo</strong>
                      <p>{serie.tipo.join(', ')}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Colores disponibles</strong>
                      <p>{serie.colores.join(', ')}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <a
                      href={`https://wa.me/34123456789?text=${whatsappText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button style={{ backgroundColor: 'var(--color-secondary)' }}>
                        💬 Consultar precio por WhatsApp
                      </button>
                    </a>
                    {serie.fichas.tecnica && (
                      <a href={serie.fichas.tecnica} target="_blank" rel="noopener noreferrer">
                        <button className="secondary">Ficha técnica (PDF)</button>
                      </a>
                    )}
                    {serie.fichas.catalogo && (
                      <a href={serie.fichas.catalogo} target="_blank" rel="noopener noreferrer">
                        <button className="secondary">Catálogo (PDF)</button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    )
  }

  // --- Vista listado de todas las series ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Nuestras Colecciones"
          subtitle={`Explora nuestras ${series.length} series de cerámica y porcelánico`}
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <input
              type="text"
              placeholder="Buscar por nombre o material (ej: Calacata, Porcelánico...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '400px', marginBottom: 'var(--spacing-xl)' }}
            />

            <div className="grid grid-cols-1 grid-cols-3">
              {filteredSeries.map((s) => (
                <SeriesCard key={s.id} serie={s} />
              ))}
            </div>

            {filteredSeries.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                No hay resultados para "{search}".
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
