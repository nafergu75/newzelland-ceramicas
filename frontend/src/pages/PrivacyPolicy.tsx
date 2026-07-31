import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

interface Seccion {
  titulo: string
  contenido: (string | { titulo: string; items: string[] })[]
}

const secciones: Seccion[] = [
  {
    titulo: '¿Quién es el responsable de esta web?',
    contenido: [
      'Identidad del Responsable: Newzeland Center S.L.',
      'Nombre comercial: New Zzeland Ceramicas',
      'NIF/CIF: [PENDIENTE DE COMPLETAR]',
      'Dirección: Onda – Castellón – España',
      'Correo electrónico: [EMAIL DE CONTACTO]',
      'Teléfono: [TELÉFONO DE CONTACTO]',
    ],
  },
  {
    titulo: '¿Qué datos personales se recogen en esta web?',
    contenido: [
      'Para las finalidades establecidas en esta Política de Privacidad, Newzeland Center S.L. recaba y trata los Datos Personales que se detallan a continuación, que dependerán de los diferentes productos o servicios que solicite en esta web:',
      {
        titulo: 'Tipos de datos recogidos:',
        items: [
          'Datos identificativos: nombre, apellidos',
          'Datos de contacto: correo electrónico, número de teléfono móvil, dirección postal',
          'Datos de navegación: dirección IP, tipo e identificación del dispositivo, tipo de navegador, dominio a través del cual accede al Sitio Web, datos de navegación, actividad en el Sitio Web',
          'Datos comerciales: preferencias de producto, historial de consultas, código postal',
        ],
      },
    ],
  },
  {
    titulo: '¿Con qué base legal se tratan esos datos?',
    contenido: [
      'Tratamos tus datos personales con las siguientes bases legales:',
      {
        titulo: 'Bases legales de tratamiento:',
        items: [
          'La ejecución de un contrato con Newzeland Center S.L., para la contratación de servicios, publicar anuncios y gestionar los servicios solicitados',
          'El consentimiento del usuario en relación al contacto, la suscripción a contenidos y el envío de comunicaciones comerciales, vía mail, cookies o sistemas de mensajería',
          'El interés legítimo del responsable del tratamiento para proteger a los usuarios de la web de Newzeland Center S.L. de abusos y fraudes en el uso de nuestros servicios',
        ],
      },
    ],
  },
  {
    titulo: '¿Con qué finalidades trataremos tus datos?',
    contenido: [
      'En esta web existen diferentes formularios. En cada uno de ellos, la información que se recoja se utilizará de la siguiente manera:',
      {
        titulo: 'Finalidades específicas por formulario:',
        items: [
          'Formulario de contacto: Se utilizará la dirección de correo electrónico o número de teléfono para responder a las consultas y enviar la información que el usuario requiera a través de la web',
          'Chat Cerámico: Las consultas realizadas a través del chat asistente se utilizarán para responder a las preguntas sobre catálogo, precios y transporte, mejorar el servicio de atención al cliente, y análisis estadístico anónimo de las consultas más frecuentes',
          'Suscripción a newsletter: Si el usuario se suscribe al boletín de noticias, se utilizará el correo electrónico para enviar comunicaciones comerciales sobre nuevos productos, ofertas y novedades del sector',
          'Gestión de pedidos y presupuestos: Los datos proporcionados para solicitar presupuestos o realizar pedidos se utilizarán para calcular precios y costes de transporte, gestionar la relación comercial, y enviar documentación relacionada con el pedido',
        ],
      },
    ],
  },
  {
    titulo: 'Tiempo de conservación de los datos personales',
    contenido: [
      'El periodo de conservación de los datos personales variará en función del servicio que el Cliente contrate. En cualquier caso, será el mínimo necesario, pudiendo mantenerse hasta 4–10 años según la normativa aplicable (Ley sobre Infracciones y Sanciones, Ley General Tributaria, Código Civil, Código de Comercio, Ley de Prevención del Blanqueo de Capitales).',
      'Datos de potenciales clientes: los datos se conservarán durante la vigencia de la relación comercial establecida y, una vez concluida, dos años, a menos que el usuario solicite antes su supresión.',
    ],
  },
  {
    titulo: '¿Cuáles son tus derechos en lo que concierne al uso de tus datos?',
    contenido: [
      'Cualquier persona tiene derecho a obtener confirmación sobre si en Newzeland Center S.L. estamos tratando datos personales que le conciernen o no.',
      {
        titulo: 'Las personas interesadas tienen derecho a:',
        items: [
          'Solicitar el acceso a los datos personales relativos al interesado',
          'Solicitar su rectificación o supresión',
          'Solicitar su cancelación',
          'Solicitar la limitación de su tratamiento',
          'Oponerse al tratamiento',
          'Solicitar la portabilidad de los datos',
        ],
      },
      'Si ha otorgado su consentimiento para alguna finalidad concreta, tiene derecho a retirar el consentimiento otorgado en cualquier momento, sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo a su retirada.',
      'En caso de que sienta vulnerados sus derechos en lo concerniente a la protección de sus datos personales, especialmente cuando no haya obtenido satisfacción en el ejercicio de sus derechos, puede presentar una reclamación ante la Autoridad de Control en materia de Protección de Datos competente a través de su sitio web: https://www.aepd.es/es',
      'Para ejercitar estos derechos, puede escribir a [EMAIL DE CONTACTO]',
    ],
  },
  {
    titulo: '¿A qué destinatarios se comunicarán tus datos?',
    contenido: [
      'Muchas herramientas utilizadas en esta web para gestionar datos son contratadas por terceros. Para prestar servicios estrictamente necesarios para el desarrollo de la actividad, Newzeland Center S.L. comparte datos con los siguientes prestadores bajo sus correspondientes condiciones de privacidad:',
      {
        titulo: 'Proveedores de datos:',
        items: [
          'Proveedores de servicios externos (servicios de procesamiento de pago, procesamiento de pedidos, análisis, gestión campañas de marketing, gestión de sitios web, y distribución de correo electrónico)',
          'Proveedor de hosting: Vercel Inc. (para el alojamiento y funcionamiento de la web)',
          'Proveedor del chat Cerámico: Anthropic PBC (para el funcionamiento del asistente virtual)',
        ],
      },
    ],
  },
  {
    titulo: 'Secreto y seguridad de los datos',
    contenido: [
      'Newzeland Center S.L. se compromete al uso y tratamiento de los datos personales del usuario, respetando su confidencialidad, de acuerdo con la finalidad de aquellos; así como a dar cumplimiento a su obligación de guardarlos y adaptar todas las medidas para evitar la alteración, pérdida, tratamiento o acceso no autorizado.',
      'Esta web incluye un certificado SSL. Se trata de un protocolo de seguridad que hace que tus datos viajen de manera íntegra y segura; es decir, la transmisión de los datos entre un servidor y el usuario web, y en retroalimentación es totalmente cifrada o encriptada.',
      'Newzeland Center S.L. no puede garantizar la absoluta inexpugnabilidad de la red Internet, ni, por tanto, la violación de los datos mediante accesos fraudulentos a ellos por parte de terceros.',
    ],
  },
]

export default function PrivacyPolicy() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Política de Privacidad"
          subtitle="Cómo tratamos tus datos en Newzeland Cerámicas"
        />

        {/* Introducción */}
        <section style={{ padding: 'var(--spacing-2xl) 0', backgroundColor: 'var(--sand)' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <p style={{ color: 'var(--stone)', lineHeight: '1.7', marginBottom: 0, fontSize: '0.95rem' }}>
              Esta política expresa cómo se tratará y protegerá la información personal de todas las personas que se relacionan con Newzeland Center S.L. a través de este sitio web. Por favor, debes leer todos los apartados del Aviso Legal, de la política de cookies y de la presente política de privacidad antes de utilizar esta web.
            </p>
          </div>
        </section>

        {/* Contenido principal */}
        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <p style={{
              color: 'var(--ink)',
              fontSize: '0.9rem',
              marginBottom: 'var(--space-8)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--sand)',
              borderRadius: 'var(--radius-card)',
            }}>
              <strong>Cumplimiento legal:</strong> De conformidad con lo dispuesto en Reglamento UE 2016/679, del Parlamento Europeo y del Consejo del 27 de abril de 2016 (RGPD) y la Ley Orgánica 3/2018, del 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales, Newzeland Center S.L. te informa de que, mediante la aceptación de esta Política de Privacidad, prestas tu consentimiento expreso, informado, libre e inequívoco para que los Datos que proporcionas, y sobre los que se aplican las medidas de seguridad, técnicas y organizativas previstas en la normativa vigente, sean tratados por Newzeland Center S.L., como responsable del tratamiento.
            </p>

            {secciones.map((seccion) => (
              <div key={seccion.titulo} style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--ink)', fontWeight: 'var(--font-weight-semibold)' }}>
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
                <strong>Última actualización:</strong> Julio 2026. Si tienes cualquier duda sobre esta política o deseas ejercer alguno de tus derechos, puedes contactar con Newzeland Center S.L. a través de los datos de contacto indicados en esta política.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
