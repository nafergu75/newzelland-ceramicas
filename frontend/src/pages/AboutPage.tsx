import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

export default function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Sobre Newzelland"
          subtitle="Más de 15 años distribuyendo cerámica premium en España"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2>Nuestra Historia</h2>
              <p>
                Newzelland nace en 2010 con la visión de revolucionar la distribución de cerámica
                premium en España. Comenzamos como una pequeña empresa familiar dedicada a importar
                cerámica de calidad desde los mejores fabricantes españoles.
              </p>

              <p>
                A lo largo de los años, hemos construido relaciones sólidas con fabricantes de
                renombre internacional, permitiéndonos ofrecer a nuestros clientes los mejores
                diseños y calidades del mercado a precios competitivos.
              </p>

              <h2 style={{ marginTop: 'var(--spacing-2xl)' }}>Nuestra Misión</h2>
              <p>
                Ser el distribuidor de cerámica premium más confiable de España, proporcionando
                a arquitectos, diseñadores, constructores y propietarios acceso a los mejores
                productos cerámicos con un servicio excepcional.
              </p>

              <h2 style={{ marginTop: 'var(--spacing-2xl)' }}>Nuestros Valores</h2>
              <ul style={{ marginBottom: 'var(--spacing-lg)' }}>
                <li><strong>Calidad:</strong> Solo distribuidores de marcas de excelencia</li>
                <li><strong>Confiabilidad:</strong> Entrega a tiempo, siempre</li>
                <li><strong>Transparencia:</strong> Precios justos, sin sorpresas</li>
                <li><strong>Innovación:</strong> Constantemente buscamos nuevas colecciones</li>
                <li><strong>Servicio:</strong> Asesoramiento personal para cada cliente</li>
              </ul>

              <h2>¿Por Qué Elegirnos?</h2>
              <div className="grid grid-cols-1 grid-cols-2">
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <h3>50+ Diseños Exclusivos</h3>
                  <p>
                    Acceso a las colecciones más innovadoras y tendencias actuales en cerámica.
                  </p>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <h3>Precios Mayoristas</h3>
                  <p>
                    Descuentos especiales por volumen. Cálculo transparente de costos.
                  </p>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <h3>Entrega Garantizada</h3>
                  <p>
                    Logística eficiente en toda España. Seguimiento en tiempo real.
                  </p>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <h3>Asesoramiento Gratuito</h3>
                  <p>
                    Expertos disponibles via WhatsApp, email o teléfono para guiarte.
                  </p>
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
