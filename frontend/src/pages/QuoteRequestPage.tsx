import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import QuoteRequestForm from '../components/QuoteRequestForm'

export default function QuoteRequestPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Solicitar Presupuesto"
          subtitle="Cuéntanos tu proyecto y te ayudaremos con la selección de materiales y un presupuesto personalizado"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
              <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
                <h2>Formulario de Solicitud</h2>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', marginTop: '1rem', color: '#666' }}>
                  Rellena este formulario con los detalles de tu proyecto. Incluye información sobre el tipo de espacio,
                  materiales de interés, dimensiones aproximadas y tu cronograma. Si dispones de planos o imágenes,
                  puedes compartir un enlace a Drive, Dropbox o WeTransfer.
                </p>
              </div>

              <QuoteRequestForm />

              <div style={{ marginTop: 'var(--spacing-3xl)', padding: 'var(--spacing-2xl)', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <h3 style={{ marginTop: 0 }}>¿Necesitas ayuda?</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: '1rem 0 0 0', color: '#666' }}>
                  Contacta directamente con nuestro equipo:
                  <br />
                  <a href="tel:+34961234567">+34 961 234 567</a> | <a href="mailto:info@newzelland.es">info@newzelland.es</a>
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
