import { Link } from 'react-router-dom'
import { Serie } from '../data/catalog'
import '../styles/components.css'

interface SeriesCardProps {
  serie: Serie
}

export default function SeriesCard({ serie }: SeriesCardProps) {
  return (
    <Link to={`/collections/${serie.id}`} className="product-card animate-fade-in-up" style={{ textDecoration: 'none' }}>
      <div className="product-image">
        <img
          src={serie.imagen}
          alt={serie.nombre}
          loading="lazy"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="collection-badge">{serie.material.split(',')[0]}</div>
      </div>

      <div className="product-info">
        <h3>{serie.nombre}</h3>
        <p className="product-format">{serie.formatos.join(' · ')}</p>
        <p className="product-description">{serie.descripcion}</p>

        <div className="product-footer">
          <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>Precio a consultar</span>
        </div>
      </div>
    </Link>
  )
}
