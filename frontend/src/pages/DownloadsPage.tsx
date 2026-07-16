import { useMemo, useState } from 'react'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import { series } from '../data/catalog'

export default function DownloadsPage() {
  const [search, setSearch] = useState('')

  const filteredSeries = useMemo(() => {
    if (!search.trim()) return series
    const q = search.trim().toLowerCase()
    return series.filter((s) => s.nombre.toLowerCase().includes(q))
  }, [search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Fichas Técnicas"
          subtitle="Especificaciones de todas nuestras colecciones"
        />

        {/* Split layout: Para Profesionales + Colecciones */}
        <section style={{ padding: 'var(--space-24) 0' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 'var(--space-24)', alignItems: 'start' }}>
            {/* Left: Professional narrative */}
            <aside style={{ paddingTop: 'var(--space-8)' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                lineHeight: '1.2',
                marginBottom: 'var(--space-6)',
                color: 'var(--ink)'
              }}>
                Para arquitectos e interioristas
              </h2>
              <p style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--stone)',
                lineHeight: '1.8',
                marginBottom: 'var(--space-8)'
              }}>
                Cada serie de Newzeland cuenta con fichas técnicas completas: absorción de agua, resistencia a la rotura, acabados disponibles y dimensiones exactas. Todo lo que necesitas para especificar con precisión.
              </p>
              <div style={{
                borderLeft: '3px solid var(--accent)',
                paddingLeft: 'var(--space-6)',
                marginBottom: 'var(--space-12)'
              }}>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--stone)',
                  fontStyle: 'italic',
                  lineHeight: '1.7'
                }}>
                  "Trabajamos directamente con profesionales del sector. Si necesitas muestras físicas, catálogos personalizados o asesoramiento técnico, contacta con nosotros."
                </p>
              </div>
              <a href="/contact" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--accent)',
                  color: 'var(--on-accent)',
                  border: 'none',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}>
                  Solicitar asesoramiento
                </button>
              </a>
            </aside>

            {/* Right: Search + Grid */}
            <div>
              {/* Search field */}
              <div style={{ marginBottom: 'var(--space-16)' }}>
                <input
                  type="text"
                  placeholder="Buscar colección..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-4) var(--space-6)',
                    border: '1px solid var(--line)',
                    borderRadius: 0,
                    fontSize: 'var(--font-size-base)',
                    fontFamily: 'var(--font-sans)',
                    background: 'var(--surface)'
                  }}
                />
              </div>

              {/* Grid */}
              {filteredSeries.length === 0 ? (
                <p style={{ color: 'var(--stone)', fontSize: 'var(--font-size-base)' }}>
                  No encontramos "{search}"
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-8)',
                  gridAutoRows: 'min-content'
                }}>
                  {filteredSeries.map((s) => (
                    <div key={s.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--space-8)' }}>
                      <h3 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.35rem',
                        marginBottom: 'var(--space-2)',
                        color: 'var(--ink)',
                        fontWeight: '600'
                      }}>
                        {s.nombre}
                      </h3>
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <p style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--stone)',
                          lineHeight: '1.5'
                        }}>
                          {s.material}
                        </p>
                        <p style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--stone)',
                          marginTop: 'var(--space-1)'
                        }}>
                          {s.formatos.join(' · ')}
                        </p>
                      </div>

                      {/* CTA links - minimal design */}
                      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        {s.fichas.tecnica && (
                          <a href={s.fichas.tecnica} target="_blank" rel="noopener noreferrer" style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontWeight: '500',
                            borderBottom: '1px solid var(--accent)',
                            paddingBottom: '2px',
                            cursor: 'pointer',
                            transition: 'opacity var(--transition-base)'
                          }}>
                            Ficha técnica
                          </a>
                        )}
                        {s.fichas.catalogo && (
                          <a href={s.fichas.catalogo} target="_blank" rel="noopener noreferrer" style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontWeight: '500',
                            borderBottom: '1px solid var(--accent)',
                            paddingBottom: '2px',
                            cursor: 'pointer',
                            transition: 'opacity var(--transition-base)'
                          }}>
                            Catálogo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stories section */}
        <section style={{
          background: 'var(--sand)',
          padding: 'var(--space-24) 0',
          marginTop: 'var(--space-24)'
        }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              marginBottom: 'var(--space-8)',
              color: 'var(--ink)'
            }}>
              Por qué Newzeland
            </h2>
            <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
              <div>
                <p style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--ink)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-3)'
                }}>
                  Procedencia controlada
                </p>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--stone)',
                  lineHeight: '1.7'
                }}>
                  Trabajamos directamente con fábricas de Onda y Castellón, donde la cerámica se perfecciona desde hace más de un siglo. Conocemos cada proceso, cada horno, cada acabado.
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--ink)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-3)'
                }}>
                  Asesoramiento real
                </p>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--stone)',
                  lineHeight: '1.7'
                }}>
                  No somos solo distribuidores. Trabajamos con arquitectos e interioristas para elegir la pieza correcta para cada proyecto. Enviamos muestras, especificamos con precisión, resolvemos dudas técnicas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
