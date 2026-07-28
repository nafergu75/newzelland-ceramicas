import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

interface Seccion {
  titulo: string
  contenido: string[]
}

const secciones: Seccion[] = [
  {
    titulo: '1. ¿Qué datos recogemos?',
    contenido: [
      'Cuando creas una cuenta: nombre, email, contraseña (cifrada) y, si los facilitas, teléfono y empresa.',
      'Cuando descargas un catálogo: qué catálogo, desde qué tipo de dispositivo aproximado (móvil, tablet u ordenador), navegador y sistema operativo, país aproximado a partir de tu conexión, y el origen de la visita (por ejemplo, una campaña de redes sociales) si llegaste a través de un enlace de marketing.',
      'Tu dirección IP se guarda de forma parcialmente anonimizada (truncada), nunca completa.',
    ],
  },
  {
    titulo: '2. ¿Para qué usamos tus datos?',
    contenido: [
      'Gestionar tu cuenta y darte acceso a los catálogos técnicos y de colección.',
      'Llevar un registro de qué se ha descargado, para estadísticas internas y para poder atenderte mejor si nos escribes por un catálogo concreto.',
      'Si lo has aceptado expresamente, enviarte novedades y comunicaciones comerciales sobre nuestros productos.',
    ],
  },
  {
    titulo: '3. Base legal',
    contenido: [
      'El tratamiento de tus datos para gestionar la cuenta y las descargas se basa en la relación contractual que se establece al registrarte (necesitamos esos datos para prestarte el servicio que pides).',
      'El envío de comunicaciones comerciales se basa en tu consentimiento expreso (la casilla de newsletter en el registro), que puedes retirar cuando quieras.',
      'El registro estadístico de descargas (dispositivo, país aproximado, campaña de origen) se basa en nuestro interés legítimo en entender el uso del catálogo, tratado siempre de forma proporcionada y con la IP anonimizada.',
    ],
  },
  {
    titulo: '4. ¿Compartimos tus datos con terceros?',
    contenido: [
      'No vendemos ni cedemos tus datos a terceros con fines comerciales ajenos a Newzeland Cerámicas.',
      'Usamos proveedores técnicos estrictamente necesarios para operar la web (hosting, base de datos, almacenamiento de ficheros) que actúan como encargados del tratamiento bajo nuestras instrucciones.',
      'Para el envío de comunicaciones (email de bienvenida, confirmaciones y, si lo has aceptado, novedades comerciales) usamos una plataforma de email marketing (Brevo) a la que se sincronizan tu nombre, email y los datos estrictamente necesarios para segmentar y personalizar esos envíos. Brevo actúa igualmente como encargado del tratamiento bajo nuestras instrucciones.',
      'Solo compartiríamos datos con autoridades públicas si existiera una obligación legal de hacerlo.',
    ],
  },
  {
    titulo: '5. Seguridad y conservación',
    contenido: [
      'Los catálogos se sirven mediante enlaces temporales y seguros con caducidad de segundos, generados en el momento de cada descarga — nunca se expone la ubicación real del fichero.',
      'Las contraseñas se almacenan cifradas, nunca en texto plano.',
      'Conservamos los datos de tu cuenta mientras esté activa, y los datos de descargas el tiempo necesario para fines estadísticos, después de lo cual pueden eliminarse o anonimizarse por completo.',
    ],
  },
  {
    titulo: '6. Tus derechos',
    contenido: [
      'Puedes solicitarnos en cualquier momento el acceso a tus datos, su rectificación si son incorrectos, su supresión, la limitación de su tratamiento, la oposición al mismo, o la portabilidad de tus datos a otro proveedor.',
      'Para darte de baja de nuestras comunicaciones por email, usa el enlace de baja que incluye cada correo, gestionado directamente por nuestra plataforma de envío.',
      'Para ejercer cualquiera de estos derechos, escríbenos a los datos de contacto indicados más abajo.',
    ],
  },
  {
    titulo: '7. Contacto',
    contenido: [
      'Newzeland CENTER SL — Onda, Castellón.',
      'Para cualquier duda sobre esta política o sobre el tratamiento de tus datos, escríbenos a info@newzelland.es.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Política de privacidad"
          subtitle="Cómo tratamos tus datos en Newzeland Cerámicas"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <p style={{ color: '#666', lineHeight: '1.7', marginBottom: 'var(--spacing-2xl)' }}>
              En Newzeland Cerámicas tratamos tus datos personales de forma responsable y proporcionada,
              solo para lo necesario: gestionar tu cuenta, darte acceso a nuestros catálogos y,
              si lo autorizas, mantenerte informado de nuestras novedades.
            </p>

            {secciones.map((seccion) => (
              <div key={seccion.titulo} style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#1a1a1a' }}>
                  {seccion.titulo}
                </h2>
                {seccion.contenido.map((parrafo, i) => (
                  <p key={i} style={{ color: '#555', lineHeight: '1.7', marginBottom: '8px', fontSize: '14px' }}>
                    {parrafo}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
