import { useState } from 'react'

export default function TrabajaConNosotrosPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    zona: '',
    experiencia: '',
    presentacion: '',
    consent: false
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.telefono.trim() || !formData.zona.trim()) {
      setMessage('Por favor completa todos los campos requeridos.')
      return
    }

    if (!formData.consent) {
      setMessage('Debes aceptar la política de privacidad.')
      return
    }

    setLoading(true)
    try {
      // Simular envío (en producción usarías una API)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setMessage('¡Solicitud enviada! Nos pondremos en contacto pronto.')
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        zona: '',
        experiencia: '',
        presentacion: '',
        consent: false
      })
    } catch (error) {
      setMessage('No pudimos enviar tu solicitud. Intenta de nuevo o contacta por WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  const faqs = [
    {
      question: '¿Necesito experiencia previa en ventas?',
      answer: 'No es obligatorio, pero sí recomendable tener algo de trayectoria comercial. Lo más importante es que conozcas bien tu zona y tengas contactos en tiendas, restaurantes, proyectos o negocios que puedan estar interesados en cerámica de calidad.'
    },
    {
      question: '¿Cuál es el territorio de actuación?',
      answer: 'Somos flexibles. Puedes proponer la zona donde prefieras trabajar: tu provincia, región, o varias comarcas. Lo importante es que puedas atender a los clientes de forma cercana y ágil.'
    },
    {
      question: '¿Hay exclusividad territorial?',
      answer: 'Ese es un aspecto que comentaremos contigo en la negociación. Dependiendo de la zona y el volumen, podemos pactar exclusividad o no. Lo decidiremos juntos.'
    },
    {
      question: '¿Qué comisión se cobra?',
      answer: 'La comisión es variable y competitiva. Dependerá de tu volumen de ventas y la complejidad de la zona. Cuando contactemos, hablaremos de los detalles y te ofreceremos una estructura justa.'
    },
    {
      question: '¿Cómo se realiza el pago?',
      answer: 'Las comisiones se liquidan mensualmente, con detalle de ventas. Emitimos factura o recibo según tu régimen, y transferencia a tu cuenta bancaria.'
    },
    {
      question: '¿Me proporcionáis catálogos o muestras?',
      answer: 'Sí. Facilitamos catálogos digitales, fichas técnicas, muestras de productos (según casos), y respaldo técnico para cerrar ventas. Estamos contigo.'
    }
  ]

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero section */}
      <section style={{
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '1px solid var(--color-gray-300)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '15px' }}>Trabaja con nosotros como comercial</h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--color-gray-600)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Únete a nuestro equipo de colaboradores externos y crece vendiendo cerámica de calidad.
          </p>
        </div>
      </section>

      {/* Main content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        {/* Info section */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{ marginBottom: '40px', textAlign: 'center' }}>¿En qué consiste la colaboración?</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginBottom: '40px'
          }}>
            {[
              {
                title: 'Modelo independiente',
                desc: 'Trabajas como comercial independiente colaborando con Newzeland Cerámicas. Tú pones la iniciativa, nosotros los productos y el respaldo técnico. Sin vinculación laboral, total flexibilidad.'
              },
              {
                title: 'Comisión por ventas',
                desc: 'Cobra una comisión por cada venta realizada. El porcentaje dependerá de tu volumen y la zona, pero garantizamos márgenes competitivos para que tu esfuerzo sea rentable.'
              },
              {
                title: 'Tu zona de actuación',
                desc: 'Define la localidad o zona donde prefieras trabajar. Buscamos que conozcas bien tu territorio: tiendas de decoración, restauración, proyectos de obra, retail. Somos flexibles con la geografía.'
              }
            ].map((block, i) => (
              <div key={i} style={{
                padding: '30px',
                backgroundColor: 'var(--color-gray-100)',
                borderRadius: '8px'
              }}>
                <h3 style={{ marginBottom: '12px' }}>{block.title}</h3>
                <p style={{ color: 'var(--color-gray-600)', margin: 0 }}>{block.desc}</p>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '1.05rem',
            textAlign: 'center',
            color: 'var(--color-gray-600)',
            fontStyle: 'italic'
          }}>
            Si tienes experiencia comercial, ganas de trabajar en autonomía y conoces clientes interesados en cerámica de calidad, queremos conocerte.
          </p>
        </section>

        {/* Form section */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Envía tu solicitud de colaboración</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-gray-600)', marginBottom: '40px' }}>
            Completa el formulario y nos pondremos en contacto contigo en los próximos días.
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Nombre completo <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Correo electrónico <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Teléfono <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+34 600 000 000"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Localidad o zona de actuación <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                name="zona"
                value={formData.zona}
                onChange={handleChange}
                placeholder="ej: Valencia, Castellón, Comunidad Valenciana..."
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Experiencia comercial o sector actual (opcional)
              </label>
              <input
                type="text"
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                placeholder="ej: Sector construcción, ventas B2B, decoración..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Cuéntanos sobre ti (opcional)
              </label>
              <textarea
                name="presentacion"
                value={formData.presentacion}
                onChange={handleChange}
                placeholder="Presenta brevemente tu experiencia, por qué te interesa colaborar con nosotros, o cualquier detalle relevante..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-sans)',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.95rem', color: 'var(--color-gray-600)' }}>
                  He leído y acepto la política de privacidad y autorizo el tratamiento de mis datos personales para gestionar mi solicitud de colaboración comercial. <span style={{ color: 'var(--color-error)' }}>*</span>
                </span>
              </label>
            </div>

            {message && (
              <div style={{
                padding: '12px',
                marginBottom: '20px',
                borderRadius: '6px',
                backgroundColor: message.includes('Solicitud enviada') ? '#E8F5E9' : '#FFEBEE',
                color: message.includes('Solicitud enviada') ? '#2E7D5B' : '#C62828',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#999' : 'var(--color-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#9d7d4d')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--color-secondary)')}
            >
              {loading ? 'Enviando...' : 'Enviar solicitud de colaboración'}
            </button>
          </form>
        </section>

        {/* FAQ section */}
        <section>
          <h2 style={{ marginBottom: '40px', textAlign: 'center' }}>Preguntas frecuentes</h2>

          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {faqs.map((faq, i) => (
              <details
                key={i}
                style={{
                  marginBottom: '16px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  padding: '16px',
                  cursor: 'pointer'
                }}
                open={faqOpen[i]}
                onToggle={() => setFaqOpen(prev => ({ ...prev, [i]: !prev[i] }))}
              >
                <summary style={{
                  fontWeight: '600',
                  color: 'var(--color-primary)',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{faq.question}</span>
                  <span style={{ fontSize: '1.2rem' }}>{faqOpen[i] ? '−' : '+'}</span>
                </summary>
                <p style={{
                  marginTop: '12px',
                  color: 'var(--color-gray-600)',
                  lineHeight: '1.6'
                }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* WhatsApp button */}
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <p style={{ marginBottom: '20px', color: 'var(--color-gray-600)' }}>
            ¿Prefieres hablar primero?
          </p>
          <a
            href="https://wa.me/34123456789?text=Hola,%20me%20interesa%20colaborar%20como%20comercial"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-secondary)',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9d7d4d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
          >
            <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.6c1.2.5 2.5.8 3.8.8 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.2 0-2.4-.3-3.5-.8l-.6-.3-4.9 1 1-4.7-.3-.6C6.6 18.1 6 16.6 6 15 6 9.5 10.5 5 16 5s10 4.5 10 10-4.5 10-10 10zm5.5-7.5c-.3-.2-1.8-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6l.5-.6c.2-.2.2-.4.3-.6s0-.5 0-.6c-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1.1 1-1.1 2.5 1.1 2.9 1.3 3.1c.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.8.7.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4s-.3-.2-.6-.4z"/>
            </svg>
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
