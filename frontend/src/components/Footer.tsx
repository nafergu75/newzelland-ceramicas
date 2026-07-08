import { Link } from 'react-router-dom'
import '../styles/components.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Sobre Newzelland</h3>
          <p>
            Distribuidor de cerámica premium importada, con más de 50 diseños
            de alta calidad para proyectos residenciales y comerciales.
          </p>
        </div>

        <div className="footer-section">
          <h3>Navegación</h3>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/about">Sobre Nosotros</Link></li>
            <li><Link to="/collections">Colecciones</Link></li>
            <li><Link to="/catalog">Catálogo</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Servicios</h3>
          <ul>
            <li><Link to="/downloads">Descargas PDF</Link></li>
            <li><Link to="/faq">Preguntas Frecuentes</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
            <li><a href="https://wa.me/34XXXXXXXXX" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contacto</h3>
          <p>
            Email: <a href="mailto:info@newzelland.es">info@newzelland.es</a><br/>
            WhatsApp: <a href="https://wa.me/34XXXXXXXXX">+34 XXX XXX XXX</a><br/>
            Teléfono: +34 XXX XXX XXX
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Newzelland Cerámicas. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="#privacy">Privacidad</a>
          <a href="#terms">Términos</a>
          <a href="#cookies">Cookies</a>
        </div>
      </div>
    </footer>
  )
}
