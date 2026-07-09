export default function PackingPage() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <section style={{
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '1px solid var(--color-gray-300)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '20px' }}>Guía de embalaje</h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--color-gray-600)',
            marginBottom: '15px',
            maxWidth: '700px',
            margin: '0 auto 15px'
          }}>
            Cuántas piezas lleva cada caja, qué superficie cubre y cuánto pesa el palet completo.
            Especificaciones técnicas verificadas, ordenadas para consultarlas de un vistazo.
          </p>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--color-gray-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            📦 6 categorías · 45 formatos · especificaciones técnicas certificadas
          </p>
        </div>
      </section>

      <section style={{
        padding: '60px 20px',
        flex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'var(--color-gray-100)',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '1rem',
              color: 'var(--color-gray-600)',
              marginBottom: '30px'
            }}>
              La información de embalaje (piezas por caja, superficie, peso por palet)
              se consulta a través de WhatsApp con nuestro equipo de logística.
            </p>

            <a
              href="https://wa.me/34123456789?text=Hola,%20necesito%20información%20sobre%20embalaje%20y%20logística"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'var(--color-secondary)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9d7d4d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
            >
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.6c1.2.5 2.5.8 3.8.8 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.2 0-2.4-.3-3.5-.8l-.6-.3-4.9 1 1-4.7-.3-.6C6.6 18.1 6 16.6 6 15 6 9.5 10.5 5 16 5s10 4.5 10 10-4.5 10-10 10zm5.5-7.5c-.3-.2-1.8-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6l.5-.6c.2-.2.2-.4.3-.6s0-.5 0-.6c-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1.1 1-1.1 2.5 1.1 2.9 1.3 3.1c.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.8.7.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4s-.3-.2-.6-.4z"/>
              </svg>
              Contacta con logística
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
