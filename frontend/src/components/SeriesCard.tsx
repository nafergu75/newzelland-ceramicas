import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Serie } from '../data/catalog'
import '../styles/components.css'

interface SeriesCardProps {
  serie: Serie
}

export default function SeriesCard({ serie }: SeriesCardProps) {
  return (
    <Link to={`/collections/${serie.id}`} className="product-card" style={{ textDecoration: 'none' }}>
      <div className="product-image">
        <img
          src={serie.imagen}
          alt={`Serie ${serie.nombre}, ambiente`}
          loading="lazy"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <span className="collection-badge">{serie.material.split(',')[0]}</span>
      </div>

      <div className="product-info">
        <h3>{serie.nombre}</h3>
        <p className="product-format">{serie.formatos.join(' · ')}</p>

        <div className="product-footer">
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--stone)' }}>
            Precio a consultar
          </span>
          <span className="cta-text">
            Ver detalles
            <ArrowRight size={14} weight="regular" />
          </span>
        </div>
      </div>
    </Link>
  )
}
