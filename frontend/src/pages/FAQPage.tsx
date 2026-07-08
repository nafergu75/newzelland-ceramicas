import { useState } from 'react'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import { faqItems } from '../data/faq'

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null)

  const categories = ['general', 'productos', 'pedidos', 'entrega', 'garantia']
  const categoryLabels: Record<string, string> = {
    general: 'Preguntas Generales',
    productos: 'Sobre Productos',
    pedidos: 'Pedidos',
    entrega: 'Entrega',
    garantia: 'Garantía',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Preguntas Frecuentes"
          subtitle="Encuentra respuestas a tus dudas"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            {categories.map((category) => {
              const categoryFAQs = faqItems.filter(item => item.category === category)
              if (categoryFAQs.length === 0) return null

              return (
                <div key={category} style={{ marginBottom: 'var(--spacing-3xl)' }}>
                  <h2 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)' }}>
                    {categoryLabels[category]}
                  </h2>

                  {categoryFAQs.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        marginBottom: 'var(--spacing-md)',
                        border: '1px solid var(--color-gray-300)',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => setOpenId(openId === item.id ? null : item.id)}
                        style={{
                          width: '100%',
                          padding: 'var(--spacing-lg)',
                          background: openId === item.id
                            ? 'var(--color-gray-100)'
                            : 'var(--color-white)',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-primary-dark)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all var(--transition-base)',
                        }}
                      >
                        {item.question}
                        <span style={{
                          transform: openId === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform var(--transition-base)',
                        }}>
                          ▼
                        </span>
                      </button>

                      {openId === item.id && (
                        <div style={{
                          padding: 'var(--spacing-lg)',
                          borderTop: '1px solid var(--color-gray-200)',
                          backgroundColor: 'var(--color-gray-50)',
                          color: 'var(--color-gray-600)',
                          lineHeight: '1.8',
                        }}>
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
