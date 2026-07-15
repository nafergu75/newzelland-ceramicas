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
          title="Descargas"
          subtitle={`Fichas técnicas y catálogos PDF de nuestras ${series.length} series`}
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <input
              type="text"
              placeholder="Buscar serie (ej: Calacata, Morella...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '400px', marginBottom: 'var(--spacing-xl)' }}
            />

            <div className="grid grid-cols-1 grid-cols-2">
              {filteredSeries.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: 'var(--color-white)',
                    padding: 'var(--spacing-xl)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-lg)',
                  }}
                  className="hover-lift"
                >
                  <div>
                    <h3>{s.nombre}</h3>
                    <p style={{ color: 'var(--color-gray-600)' }}>
                      {s.material} · {s.formatos.join(', ')}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                    {s.fichas.tecnica && (
                      <a
                        href={s.fichas.tecnica}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1 }}
                      >
                        <button style={{ width: '100%' }}>📄 Ficha técnica</button>
                      </a>
                    )}
                    {s.fichas.catalogo && (
                      <a
                        href={s.fichas.catalogo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1 }}
                      >
                        <button className="secondary" style={{ width: '100%' }}>📥 Catálogo</button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredSeries.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                No hay resultados para "{search}".
              </p>
            )}

            {/* Additional Resources */}
            <div style={{ marginTop: 'var(--spacing-3xl)', textAlign: 'center' }}>
              <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
                ¿Necesitas Material Personalizado?
              </h2>
              <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-gray-600)' }}>
                Contacta con nuestro equipo para presupuestos, muestras o catálogos personalizados
              </p>
              <button
                onClick={() => window.location.href = '/contact'}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                Solicitar Material Personalizado
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
