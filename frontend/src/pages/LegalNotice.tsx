import { useState } from 'react'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

interface Seccion {
  titulo: string
  contenido: (string | { titulo: string; items: string[] })[]
}

const secciones: Seccion[] = [
  {
    titulo: '1. DATOS IDENTIFICATIVOS',
    contenido: [
      'Nombre de dominio: newzelland-ceramicas.vercel.app',
      'Nombre comercial: New Zzeland Ceramicas',
      'Denominación social: Newzeland Center S.L.',
      'NIF/CIF: [PENDIENTE DE COMPLETAR]',
      'Domicilio social: Onda – Castellón – España',
      'Teléfono: [TELÉFONO DE CONTACTO]',
      'Correo electrónico: [EMAIL DE CONTACTO]',
    ],
  },
  {
    titulo: '2. USO DEL SITIO WEB',
    contenido: [
      'El acceso y uso del sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en el presente Aviso Legal.',
      'El usuario se compromete a hacer un uso adecuado del sitio web y de los contenidos y servicios que la empresa ofrece a través del mismo, conforme a la legislación vigente, la buena fe y el orden público.',
      'Queda prohibido el uso del sitio web con fines ilícitos o lesivos, o que de cualquier forma puedan causar perjuicio o impedir el normal funcionamiento del sitio web.',
      'La empresa se reserva el derecho de modificar, suspender, cancelar o restringir el contenido del sitio web, los vínculos o la información obtenida a través del mismo, sin necesidad de previo aviso.',
    ],
  },
  {
    titulo: '3. DERECHOS DE PROPIEDAD INTELECTUAL E INDUSTRIAL',
    contenido: [
      'La empresa, por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial del sitio web, así como de los elementos contenidos en el mismo (textos, imágenes, diseños, logotipos, gráficos, vídeos, software, estructura y diseño).',
      'Todos los derechos están reservados. En virtud de lo dispuesto en la legislación vigente en materia de propiedad intelectual e industrial, queda expresamente prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra forma de explotación, total o parcial, de los contenidos del sitio web sin la autorización expresa y por escrito de la empresa.',
      'Los contenidos ajenos que pudieran aparecer en el sitio web pertenecen a sus respectivos titulares, siendo estos responsables de cualquier posible controversia que pudiera suscitarse respecto a los mismos.',
    ],
  },
  {
    titulo: '4. POLÍTICA DE ENLACES',
    contenido: [
      'El sitio web puede contener enlaces a otros sitios web de terceros. La empresa no ejerce ningún control sobre dichos sitios ni sobre sus contenidos, por lo que no asume responsabilidad alguna por los mismos.',
      'La inclusión de enlaces externos no implica ningún tipo de asociación, fusión o participación con las entidades enlazadas.',
      'La empresa procederá a la retirada inmediata de cualquier enlace cuando tenga conocimiento de que el contenido enlazado infringe la legislación vigente, la moral o el orden público.',
    ],
  },
  {
    titulo: '5. LIMITACIÓN DE RESPONSABILIDAD',
    contenido: [
      'La empresa no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivar de:',
      {
        titulo: '',
        items: [
          'Errores u omisiones en los contenidos',
          'Falta de disponibilidad del sitio web',
          'Transmisión de virus o programas maliciosos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo',
        ],
      },
      'El usuario es responsable de disponer de herramientas adecuadas para la detección y desinfección de programas informáticos dañinos.',
    ],
  },
  {
    titulo: '6. SEGURIDAD DEL SITIO WEB',
    contenido: [
      'El sitio web utiliza medidas de seguridad técnicas y organizativas generalmente aceptadas en el sector, tales como sistemas de control de acceso, comunicaciones seguras o mecanismos criptográficos, con el fin de proteger la información y minimizar los riesgos de seguridad.',
      'No obstante, el usuario debe ser consciente de que las medidas de seguridad en Internet no son inexpugnables.',
    ],
  },
  {
    titulo: '7. DIRECCIONES IP',
    contenido: [
      'Los servidores del sitio web podrán detectar de manera automática la dirección IP y el nombre de dominio utilizados por el usuario.',
      'Esta información se utiliza exclusivamente con fines estadísticos y de mejora del servicio, conforme a la normativa vigente.',
    ],
  },
  {
    titulo: '8. LEY APLICABLE Y JURISDICCIÓN',
    contenido: [
      'La relación entre la empresa y el usuario se regirá por la normativa española vigente.',
      'Para la resolución de cualquier controversia que pudiera surgir, las partes se someten expresamente a los Juzgados y Tribunales del domicilio social de Newzeland Center S.L., salvo que la normativa aplicable disponga otra cosa.',
    ],
  },
  {
    titulo: '9. MODIFICACIÓN DEL AVISO LEGAL',
    contenido: [
      'La empresa se reserva el derecho de modificar el presente Aviso Legal en cualquier momento, con el fin de adaptarlo a novedades legislativas o cambios en la actividad del sitio web.',
      'Las modificaciones serán publicadas en el propio sitio web y entrarán en vigor desde el momento de su publicación.',
    ],
  },
]

export default function LegalNotice() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (titulo: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(titulo)) {
      newExpanded.delete(titulo)
    } else {
      newExpanded.add(titulo)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Aviso Legal"
          subtitle="Términos y condiciones de uso de newzelland-ceramicas.vercel.app"
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
                        <ul
                          key={i}
                          style={{
                            marginLeft: 'var(--space-6)',
                            marginBottom: '10px',
                            color: 'var(--stone)',
                            lineHeight: '1.7',
                            fontSize: '0.95rem',
                          }}
                        >
                          {item.items.map((listItem, j) => (
                            <li key={j} style={{ marginBottom: '6px' }}>
                              {listItem}
                            </li>
                          ))}
                        </ul>
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
                <strong>Última actualización:</strong> Julio 2026. Este Aviso Legal se rige por la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), y en cumplimiento de lo dispuesto en el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
