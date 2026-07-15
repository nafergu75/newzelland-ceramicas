import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import type { Serie } from '../data/catalog'

export default function MosaicTile({ serie, delay = 0 }: { serie: Serie; delay?: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>()

  return (
    <Link
      ref={ref}
      to={`/collections/${serie.id}`}
      className={`mosaic-item reveal ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <img src={serie.imagen} alt={`Serie ${serie.nombre}`} loading="lazy" />
      <div className="mosaic-caption">
        <h3>{serie.nombre}</h3>
        <span>{serie.material.split(',')[0]} · {serie.formatos.join(', ')}</span>
      </div>
    </Link>
  )
}
