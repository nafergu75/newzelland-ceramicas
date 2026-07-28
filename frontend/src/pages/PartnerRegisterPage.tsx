import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import PartnerRegisterForm from '../components/PartnerRegisterForm'

export default function PartnerRegisterPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Programa de Profesionales"
          subtitle="Si eres interiorista, arquitecto, instalador o trabajas en el sector, regístrate para acceder a condiciones especiales y soporte prioritario"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
              <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
                <h2>Registro de Profesionales</h2>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', marginTop: '1rem', color: '#666' }}>
                  Únete a nuestra red de profesionales y disfruta de beneficios exclusivos:
                </p>
                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                  <li>Acceso a catálogos exclusivos y fichas técnicas avanzadas</li>
                  <li>Precios especiales y condiciones comerciales diferenciadas</li>
                  <li>Soporte técnico prioritario y consultoría de proyectos</li>
                  <li>Formación sobre nuestros productos y materiales</li>
                  <li>Participación en eventos y presentaciones de nuevas colecciones</li>
                </ul>
              </div>

              <PartnerRegisterForm />

              <div style={{ marginTop: 'var(--spacing-3xl)', padding: 'var(--spacing-2xl)', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <h3 style={{ marginTop: 0 }}>Preguntas Frecuentes</h3>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#666' }}>
                  <p><strong>¿Cuál es el proceso de aprobación?</strong> Revisamos tu solicitud y nos ponemos en contacto en 2-3 días hábiles.</p>
                  <p style={{ marginTop: '1rem' }}><strong>¿Hay algún costo?</strong> No, es completamente gratuito para profesionales cualificados.</p>
                  <p style={{ marginTop: '1rem' }}><strong>¿Necesito algún documento?</strong> Podemos solicitar referencias profesionales según el caso.</p>
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
