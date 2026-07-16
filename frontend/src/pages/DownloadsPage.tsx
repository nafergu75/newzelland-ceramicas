import { useMemo, useState } from 'react'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import { series } from '../data/catalog'

export default function DownloadsPage() {
  const [search, setSearch] = useState('')
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)

  // Extraer familias únicas de todas las series
  const families = useMemo(() => {
    const allFamilies = new Set<string>()
    series.forEach((s) => s.tipo.forEach((t) => allFamilies.add(t)))
    return Array.from(allFamilies).sort()
  }, [])

  const filteredSeries = useMemo(() => {
    let filtered = series

    if (selectedFamily) {
      filtered = filtered.filter((s) => s.tipo.includes(selectedFamily))
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter((s) => s.nombre.toLowerCase().includes(q))
    }

    return filtered
  }, [search, selectedFamily])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Fichas Técnicas"
          subtitle="Especificaciones de todas nuestras colecciones"
        />

        {/* Full width section with filters at top */}
        <section style={{ padding: 'var(--space-24) 0' }}>
          <div className="container">
            {/* Narrative intro */}
            <div style={{ marginBottom: 'var(--space-16)' }}>
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
                marginBottom: 'var(--space-4)',
                maxWidth: '700px'
              }}>
                Cada serie de Newzeland cuenta con fichas técnicas completas: absorción de agua, resistencia a la rotura, acabados disponibles y dimensiones exactas. Todo lo que necesitas para especificar con precisión.
              </p>
              <a href="/#/contact" style={{ textDecoration: 'none' }}>
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
            </div>

            {/* Search and filters row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-12)',
              marginBottom: 'var(--space-24)'
            }}>
              {/* Search field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--stone)',
                  marginBottom: 'var(--space-2)',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Buscar
                </label>
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

              {/* Family filter */}
              <div>
                <p style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--stone)',
                  marginBottom: 'var(--space-2)',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Filtrar por familia
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedFamily(null)}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      border: !selectedFamily ? 'none' : '1px solid var(--line)',
                      background: !selectedFamily ? 'var(--accent)' : 'transparent',
                      color: !selectedFamily ? 'var(--on-accent)' : 'var(--ink)',
                      fontSize: 'var(--font-size-sm)',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      fontWeight: !selectedFamily ? '600' : '400',
                      transition: 'all var(--transition-base)'
                    }}
                  >
                    Todas
                  </button>
                  {families.map((family) => (
                    <button
                      key={family}
                      onClick={() => setSelectedFamily(family)}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        border: selectedFamily === family ? 'none' : '1px solid var(--line)',
                        background: selectedFamily === family ? 'var(--accent)' : 'transparent',
                        color: selectedFamily === family ? 'var(--on-accent)' : 'var(--ink)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        fontWeight: selectedFamily === family ? '600' : '400',
                        transition: 'all var(--transition-base)'
                      }}
                    >
                      {family.charAt(0).toUpperCase() + family.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid horizontal de series */}
            {filteredSeries.length === 0 ? (
              <p style={{ color: 'var(--stone)', fontSize: 'var(--font-size-base)' }}>
                No encontramos resultados
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-12)',
                gridAutoRows: 'min-content'
              }}>
                {filteredSeries.map((s) => (
                  <div key={s.id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-card)',
                    overflow: 'hidden',
                    border: '1px solid var(--line)'
                  }}>
                    {/* Imagen */}
                    <div style={{
                      aspectRatio: '1',
                      overflow: 'hidden',
                      background: 'var(--sand)'
                    }}>
                      <img
                        src={s.imagen}
                        alt={s.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ padding: 'var(--space-6)' }}>
                      <h3 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.2rem',
                        marginBottom: 'var(--space-2)',
                        color: 'var(--ink)',
                        fontWeight: '600'
                      }}>
                        {s.nombre}
                      </h3>
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <p style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--stone)',
                          lineHeight: '1.5'
                        }}>
                          <strong>{s.material}</strong>
                        </p>
                        <p style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--stone)',
                          lineHeight: '1.4',
                          marginTop: 'var(--space-1)'
                        }}>
                          {s.formatos.join(', ')}
                        </p>
                      </div>

                      {/* CTA links */}
                      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        {s.fichas.tecnica && (
                          <a href={s.fichas.tecnica} target="_blank" rel="noopener noreferrer" style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontWeight: '500',
                            borderBottom: '1px solid var(--accent)',
                            paddingBottom: '1px',
                            cursor: 'pointer'
                          }}>
                            Ficha técnica
                          </a>
                        )}
                        {s.fichas.catalogo && (
                          <a href={s.fichas.catalogo} target="_blank" rel="noopener noreferrer" style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontWeight: '500',
                            borderBottom: '1px solid var(--accent)',
                            paddingBottom: '1px',
                            cursor: 'pointer'
                          }}>
                            Catálogo
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
      </main>

      <Footer />
    </div>
  )
}
