import { Link } from 'react-router-dom'
import { series } from '../data/catalog'
import '../styles/components.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <img
            src={`${import.meta.env.BASE_URL}logo-newzeland-mark.svg`}
            alt=""
            aria-hidden="true"
            style={{ height: '32px', marginBottom: 'var(--space-4)', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
          />
          <h3>Newzeland Cerámicas</h3>
          <p>
            Cerámica y porcelánico para vivienda, proyecto y obra.
            {' '}{series.length} series desde Onda, Castellón.
          </p>
        </div>

        <div className="footer-section">
          <h3>Navegación</h3>
          <ul>
            <li><Link to="/collections">Colecciones</Link></li>
            <li><Link to="/catalog">Catálogo</Link></li>
            <li><Link to="/downloads">Descargas</Link></li>
            <li><Link to="/packing">Packing</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Empresa</h3>
          <ul>
            <li><Link to="/about">Sobre nosotros</Link></li>
            <li><Link to="/trabaja-con-nosotros">Trabaja con nosotros</Link></li>
            <li><Link to="/faq">Preguntas frecuentes</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contacto</h3>
          <p>
            <a href="mailto:info@newzeland.es">info@newzeland.es</a>
          </p>
          <p>
            <a href="https://wa.me/34123456789" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </p>
          <p>Onda, Castellón</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Newzeland Cerámicas. Todos los derechos reservados.</p>
        <div className="footer-links">
          <Link to="/faq">Privacidad</Link>
          <Link to="/faq">Términos</Link>
        </div>
      </div>
    </footer>
  )
}
