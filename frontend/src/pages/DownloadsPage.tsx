import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

export default function DownloadsPage() {
  const catalogs = [
    { id: 'atlas', name: 'Atlas', description: 'Colección elegante con tonos naturales' },
    { id: 'calacatta', name: 'Calacatta', description: 'Inspirada en mármol de Carrara' },
    { id: 'terra', name: 'Terra', description: 'Colección rústica con tonos cálidos' },
    { id: 'nordica', name: 'Nórdica', description: 'Diseño escandinavo minimalista' },
    { id: 'botanica', name: 'Botánica', description: 'Patrones inspirados en la naturaleza' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Descargas"
          subtitle="Catálogos PDF de nuestras colecciones"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              Catálogos de Colecciones
            </h2>

            <div className="grid grid-cols-1 grid-cols-2">
              {catalogs.map((catalog) => (
                <div
                  key={catalog.id}
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
                    <h3>{catalog.name}</h3>
                    <p style={{ color: 'var(--color-gray-600)' }}>
                      {catalog.description}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <button
                      onClick={() => {
                        alert(`Descargando catálogo ${catalog.name}...`)
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        background: 'var(--color-accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      📥 Descargar PDF
                    </button>
                  </div>

                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-gray-500)',
                    textAlign: 'center',
                  }}>
                    PDF • 5-8 MB • Especificaciones técnicas incluidas
                  </div>
                </div>
              ))}
            </div>

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
