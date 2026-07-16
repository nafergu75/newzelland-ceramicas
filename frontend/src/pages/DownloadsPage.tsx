import { useMemo, useState } from 'react'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import { series } from '../data/catalog'

export default function DownloadsPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pavimentos' | 'revestimientos' | 'piezas'>('all')

  const filteredSeries = useMemo(() => {
    let filtered = series
    if (!search.trim()) {
      filtered = series
    } else {
      const q = search.trim().toLowerCase()
      filtered = series.filter((s) => s.nombre.toLowerCase().includes(q))
    }
    return filtered
  }, [search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Recursos Técnicos"
          subtitle="Fichas detalladas y especificaciones de nuestras colecciones"
        />

        {/* Intro editorial */}
        <section style={{ padding: 'var(--space-24) 0 var(--space-16)' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--stone)',
              lineHeight: '1.8',
              marginBottom: 'var(--space-12)'
            }}>
              Aquí encontrarás la información técnica completa de cada serie: especificaciones de formato, espesor, absorción, resistencia y acabados disponibles. Para arquitectos e interioristas que necesitan precisión.
            </p>
          </div>
        </section>

        {/* Search + Filter section */}
        <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: 'var(--space-16) 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'end' }}>
              {/* Search */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--stone)', marginBottom: 'var(--space-2)' }}>
                  Buscar serie
                </label>
                <input
                  type="text"
                  placeholder="Ej: Calacata, Morella..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-input)',
                    fontSize: 'var(--font-size-base)',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              {/* Filter buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {['all', 'pavimentos', 'revestimientos', 'piezas'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f as any)}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      border: activeFilter === f ? 'none' : '1px solid var(--line)',
                      background: activeFilter === f ? 'var(--accent)' : 'transparent',
                      color: activeFilter === f ? 'var(--on-accent)' : 'var(--ink)',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 'var(--font-size-sm)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      fontWeight: activeFilter === f ? '500' : '400'
                    }}
                  >
                    {f === 'all' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Grid de series - Asimétrico */}
        <section style={{ padding: 'var(--space-24) 0' }}>
          <div className="container">
            {filteredSeries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-16) 0', color: 'var(--stone)' }}>
                <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>
                  No encontramos series con "{search}"
                </p>
                <button
                  onClick={() => setSearch('')}
                  style={{
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  Ver todas las series
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--space-8)',
                gridAutoRows: 'auto'
              }}>
                {filteredSeries.map((s, idx) => (
                  <div
                    key={s.id}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-card)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow var(--transition-base), transform var(--transition-base)',
                      gridColumn: idx === 0 ? 'span 1' : 'span 1'
                    }}
                    className="hover-lift"
                  >
                    {/* Card content */}
                    <div style={{ padding: 'var(--space-8)' }}>
                      <h3 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.4rem',
                        marginBottom: 'var(--space-2)',
                        color: 'var(--ink)'
                      }}>
                        {s.nombre}
                      </h3>
                      <div style={{ marginBottom: 'var(--space-6)' }}>
                        <p style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--stone)',
                          marginBottom: 'var(--space-1)',
                          lineHeight: '1.5'
                        }}>
                          <strong>{s.material}</strong>
                        </p>
                        <p style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--stone)',
                          lineHeight: '1.5'
                        }}>
                          Formatos: {s.formatos.join(', ')}
                        </p>
                      </div>

                      {/* Download links */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {s.fichas.tecnica && (
                          <a href={s.fichas.tecnica} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button style={{
                              width: '100%',
                              padding: 'var(--space-3) var(--space-4)',
                              background: 'var(--accent)',
                              color: 'var(--on-accent)',
                              border: 'none',
                              borderRadius: 'var(--radius-input)',
                              cursor: 'pointer',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: '500',
                              transition: 'background var(--transition-base)'
                            }}>
                              Descargar ficha técnica
                            </button>
                          </a>
                        )}
                        {s.fichas.catalogo && (
                          <a href={s.fichas.catalogo} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button style={{
                              width: '100%',
                              padding: 'var(--space-3) var(--space-4)',
                              background: 'transparent',
                              color: 'var(--accent)',
                              border: '1px solid var(--accent)',
                              borderRadius: 'var(--radius-input)',
                              cursor: 'pointer',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: '500',
                              transition: 'all var(--transition-base)'
                            }}>
                              Ver catálogo
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Professional resources CTA section */}
        <section style={{
          background: 'var(--sand)',
          padding: 'var(--space-24) 0',
          marginTop: 'var(--space-24)',
          borderTop: '1px solid var(--line)'
        }}>
          <div className="container" style={{ maxWidth: '720px', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              marginBottom: 'var(--space-6)',
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)'
            }}>
              Catálogos y Muestras Personalizadas
            </h2>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--stone)',
              lineHeight: '1.8',
              marginBottom: 'var(--space-8)'
            }}>
              Si eres arquitecto, interiorista o profesional del sector, podemos preparar material especializado adaptado a tu proyecto.
            </p>
            <a href="/contact" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: 'var(--space-4) var(--space-8)',
                background: 'var(--accent)',
                color: 'var(--on-accent)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--font-size-base)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background var(--transition-base)'
              }}>
                Contactar equipo profesional
              </button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
