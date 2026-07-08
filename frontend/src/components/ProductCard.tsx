import { Product } from '../data/products'
import '../styles/components.css'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onViewDetails?: (productId: string) => void
}

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails
}: ProductCardProps) {
  return (
    <div className="product-card animate-fade-in-up">
      <div className="product-image">
        <div
          className="image-placeholder"
          style={{ background: product.color || 'linear-gradient(135deg, #D4A574 0%, #8B7355 100%)' }}
        >
          <div className="collection-badge">{product.collection.toUpperCase()}</div>
        </div>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-format">{product.format}</p>
        <p className="product-description">{product.description}</p>

        <div className="product-specs">
          <div className="spec">
            <span className="label">m² por caja:</span>
            <span className="value">{product.m2_per_box}</span>
          </div>
          {product.finish && (
            <div className="spec">
              <span className="label">Acabado:</span>
              <span className="value">{product.finish}</span>
            </div>
          )}
        </div>

        <div className="product-footer">
          <div className="price">€{product.price.toFixed(2)}</div>
          <div className="product-actions">
            {onViewDetails && (
              <button
                className="btn-secondary"
                onClick={() => onViewDetails(product.id)}
              >
                Ver Detalles
              </button>
            )}
            {onAddToCart && (
              <button
                className="btn-primary"
                onClick={() => onAddToCart(product)}
              >
                Al Carrito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
