import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import ContactForm from '../components/ContactForm'

export default function ContactPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Ponte en Contacto"
          subtitle="Nuestro equipo está listo para ayudarte"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <div className="grid grid-cols-1 grid-cols-2" style={{ gap: 'var(--spacing-3xl)' }}>
              <div>
                <h2>Información de Contacto</h2>
                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <h3>Dirección</h3>
                  <p>
                    Calle Cerámica, 123<br/>
                    46001 Valencia, España
                  </p>
                </div>

                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <h3>Teléfono</h3>
                  <p>
                    <a href="tel:+34961234567">+34 961 234 567</a><br/>
                    Lunes a Viernes: 9:00 - 18:00
                  </p>
                </div>

                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <h3>Email</h3>
                  <p>
                    <a href="mailto:info@newzelland.es">info@newzelland.es</a><br/>
                    Respuesta en 24 horas
                  </p>
                </div>

                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <h3>WhatsApp</h3>
                  <p>
                    <a href="https://wa.me/34961234567" target="_blank" rel="noopener noreferrer">
                      +34 961 234 567
                    </a><br/>
                    Respuesta inmediata (9:00 - 20:00)
                  </p>
                </div>
              </div>

              <div>
                <h2>Envíanos un Mensaje</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
