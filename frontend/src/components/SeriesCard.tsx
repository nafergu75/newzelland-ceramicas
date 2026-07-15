import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Serie } from '../data/catalog'
import { useReveal } from '../hooks/useReveal'
import AddToCartBox from './AddToCartBox'
import '../styles/components.css'

interface SeriesCardProps {
  serie: Serie
  delay?: number
}

export default function SeriesCard({ serie, delay = 0 }: SeriesCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`product-card reveal ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Link to={`/collections/${serie.id}`} className="product-card-link">
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
        </div>
      </Link>

      <div className="product-footer">
        <AddToCartBox serie={serie} compact />
        <Link to={`/collections/${serie.id}`} className="cta-text" style={{ textDecoration: 'none' }}>
          Ver detalles
          <ArrowRight size={14} weight="regular" />
        </Link>
      </div>
    </div>
  )
}
