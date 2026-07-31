import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

interface Seccion {
  titulo: string
  contenido: (string | { titulo: string; items: string[] })[]
}

const secciones: Seccion[] = [
  {
    titulo: '¿Qué son las cookies?',
    contenido: [
      'Las cookies son archivos pequeños de texto que se descargan en el terminal del usuario (ordenador, tablet, smartphone, etc.) cuando se accede a determinadas páginas web.',
      'Las cookies se utilizan para mejorar la navegación del usuario, permiten recordar preferencias, realizar analíticas sobre el tráfico de la web y, en algunos casos, mostrar publicidad relevante.',
      'Mediante la aceptación de esta Política de Cookies, prestas tu consentimiento para que Newzeland Center S.L. utilice las cookies descritas a continuación en la forma indicada.',
    ],
  },
  {
    titulo: 'Tipos de cookies que utilizamos',
    contenido: [
      {
        titulo: 'Según la entidad que las gestione:',
        items: [
          'Cookies propias: son aquellas gestionadas por Newzeland Center S.L.',
          'Cookies de terceros: son aquellas gestionadas por terceros contratados por Newzeland Center S.L.',
        ],
      },
      {
        titulo: 'Según su finalidad:',
        items: [
          'Cookies técnicas: permiten al usuario navegar a través de la página web y utilizar las diferentes opciones o servicios que existen en ella, como identificar la sesión, permitir el acceso a áreas restringidas, etc.',
          'Cookies de análisis: permiten analizar el comportamiento de los usuarios en la navegación por la web, con la finalidad de medir la actividad de los usuarios y elaborar perfiles de navegación, a fin de introducir mejoras basadas en el análisis de los datos de uso que hacen los visitantes del sitio web',
          'Cookies de publicidad: permiten la gestión, de la forma más eficaz posible, de los espacios publicitarios que, en su caso, el editor haya incluido en una página web, app o plataforma desde la cual presta el servicio solicitado en base a criterios como contenido editado o frecuencia en la que se muestran los anuncios',
          'Cookies de redes sociales: permiten el funcionamiento de las redes sociales integradas en la web',
        ],
      },
    ],
  },
  {
    titulo: 'Cookies utilizadas en esta web',
    contenido: [
      {
        titulo: 'Relación de cookies específicas:',
        items: [
          'Google Analytics (propias): Herramienta de análisis de Google que recopila información sobre el comportamiento del usuario. Se utiliza para optimizar la experiencia del usuario y mejorar el funcionamiento de la web',
          'Facebook Pixel (terceros): Herramienta de seguimiento de Facebook para medir la efectividad de la publicidad',
          'Cookies de sesión (propias): Cookies técnicas necesarias para el funcionamiento del sitio web y la experiencia del usuario',
          'Cookies de preferencias (propias): Permiten recordar las preferencias del usuario (idioma, tema, etc.)',
        ],
      },
    ],
  },
  {
    titulo: 'Consentimiento y gestión de cookies',
    contenido: [
      'Al acceder a esta web, se mostrará un aviso informativo sobre el uso de cookies. El usuario puede aceptar todas las cookies o gestionar sus preferencias seleccionando cuáles desea permitir.',
      'El usuario puede cambiar la configuración de cookies en cualquier momento a través de la opción "Preferencias de cookies" disponible en el pie de página de la web.',
    ],
  },
  {
    titulo: 'Cookies técnicas (exentas de consentimiento)',
    contenido: [
      'De conformidad con la normativa vigente, no requieren consentimiento previo las cookies técnicas que son estrictamente necesarias para:',
      {
        titulo: 'Uso sin consentimiento:',
        items: [
          'Mantener la sesión del usuario',
          'Permitir funcionalidades esenciales del sitio web',
          'Recordar preferencias de accesibilidad',
        ],
      },
      'Estas cookies se utilizarán independientemente de la decisión del usuario sobre otras cookies.',
    ],
  },
  {
    titulo: 'Cómo desactivar cookies en tu navegador',
    contenido: [
      'Si prefieres no aceptar cookies, puedes configurar tu navegador para rechazarlas. Ten en cuenta que esto podría afectar a la funcionalidad de la web.',
      {
        titulo: 'Instrucciones para desactivar cookies en los navegadores más comunes:',
        items: [
          'Chrome: Configuración → Privacidad y seguridad → Cookies y otros datos de sitios → Bloquear todas las cookies',
          'Firefox: Opciones → Privacidad y seguridad → Cookies y datos del sitio → Bloquear cookies',
          'Safari: Preferencias → Privacidad → Cookies y datos de sitios web → Bloquear cookies',
          'Edge: Configuración → Privacidad, búsqueda y servicios → Cookies y otros datos de sitios → Bloquear todas las cookies',
        ],
      },
    ],
  },
  {
    titulo: 'Información de terceros',
    contenido: [
      'Para obtener más información sobre las cookies utilizadas por terceros, consulta:',
      {
        titulo: 'Enlaces de información de terceros:',
        items: [
          'Google Analytics: https://support.google.com/analytics/answer/6004245',
          'Facebook: https://www.facebook.com/policies/cookies/',
        ],
      },
    ],
  },
  {
    titulo: 'Modificación de esta política',
    contenido: [
      'Newzeland Center S.L. se reserva el derecho de modificar esta Política de Cookies en cualquier momento con el fin de adaptarla a cambios legislativos o novedades tecnológicas.',
      'Las modificaciones serán publicadas en el propio sitio web y entrarán en vigor desde el momento de su publicación.',
    ],
  },
]

export default function CookiePolicy() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Política de Cookies"
          subtitle="Información sobre el uso de cookies en newzelland-ceramicas.vercel.app"
        />

        {/* Tabla de contenidos */}
        <section style={{ padding: 'var(--spacing-2xl) 0', backgroundColor: 'var(--sand)' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-6)', color: 'var(--ink)' }}>
              Tabla de contenidos
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
              {secciones.map((seccion) => (
                <li key={seccion.titulo}>
                  <a
                    href={`#${seccion.titulo.replace(/\s+/g, '-').toLowerCase()}`}
                    style={{
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'
                    }}
                  >
                    {seccion.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contenido principal */}
        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            {secciones.map((seccion) => (
              <div
                key={seccion.titulo}
                id={seccion.titulo.replace(/\s+/g, '-').toLowerCase()}
                style={{ marginBottom: 'var(--spacing-2xl)' }}
              >
                <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--ink)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {seccion.titulo}
                </h2>
                <div style={{ marginTop: 'var(--space-4)' }}>
                  {seccion.contenido.map((item, i) => {
                    if (typeof item === 'string') {
                      return (
                        <p
                          key={i}
                          style={{
                            color: 'var(--stone)',
                            lineHeight: '1.7',
                            marginBottom: '10px',
                            fontSize: '0.95rem',
                          }}
                        >
                          {item}
                        </p>
                      )
                    } else {
                      return (
                        <div key={i} style={{ marginBottom: '10px' }}>
                          <p style={{ color: 'var(--ink)', fontWeight: 'var(--font-weight-semibold)', fontSize: '0.95rem', marginBottom: '8px' }}>
                            {item.titulo}
                          </p>
                          <ul style={{ marginLeft: 'var(--space-6)', color: 'var(--stone)', lineHeight: '1.7', fontSize: '0.95rem' }}>
                            {item.items.map((listItem, j) => (
                              <li key={j} style={{ marginBottom: '6px' }}>
                                {listItem}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    }
                  })}
                </div>
              </div>
            ))}

            {/* Nota final */}
            <div
              style={{
                marginTop: 'var(--spacing-3xl)',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--sand)',
                borderRadius: 'var(--radius-card)',
                borderLeft: '4px solid var(--accent)',
              }}
            >
              <p style={{ color: 'var(--ink)', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
                <strong>Última actualización:</strong> Julio 2026. Si tienes preguntas sobre esta política de cookies, puedes contactar con Newzeland Center S.L. en los datos de contacto disponibles en el sitio web.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
