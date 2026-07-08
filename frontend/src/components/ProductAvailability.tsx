interface ProductAvailabilityProps {
  product: {
    stock: number;
    isActive: boolean;
    replenishable: boolean;
    requiresConsultation: boolean;
  };
  onAddToCart: () => void;
  onNotifyMe: () => void;
  onConsult: () => void;
}

/**
 * Componente que muestra el estado de disponibilidad del producto
 * y el botón/mensaje correspondiente
 *
 * Estados posibles:
 * 1. En stock → Botón "Añadir al carrito"
 * 2. Sin stock pero replenible → "Avisarme cuando esté disponible"
 * 3. Requiere consulta → "Consultar disponibilidad"
 * 4. No disponible → "Producto no disponible"
 */
export default function ProductAvailability({
  product,
  onAddToCart,
  onNotifyMe,
  onConsult,
}: ProductAvailabilityProps) {
  // Estado 1: Producto en stock y activo
  if (product.isActive && product.stock > 0 && !product.requiresConsultation) {
    return (
      <div>
        <button
          onClick={onAddToCart}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            width: '100%',
          }}
        >
          🛒 Añadir al carrito
        </button>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          {product.stock} unidades disponibles
        </p>
      </div>
    );
  }

  // Estado 2: Sin stock pero replenible
  if (product.isActive && product.stock === 0 && product.replenishable && !product.requiresConsultation) {
    return (
      <div>
        <p style={{
          padding: '12px',
          backgroundColor: '#FFF3CD',
          borderRadius: '4px',
          color: '#856404',
          marginBottom: '12px',
          fontSize: '14px',
        }}>
          ⏳ Actualmente sin stock
        </p>
        <button
          onClick={onNotifyMe}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            width: '100%',
          }}
        >
          🔔 Avisarme cuando esté disponible
        </button>
      </div>
    );
  }

  // Estado 3: Requiere consulta (artículos a medida, bajo pedido, etc.)
  if (product.requiresConsultation) {
    return (
      <div>
        <p style={{
          padding: '12px',
          backgroundColor: '#E8F5E9',
          borderRadius: '4px',
          color: '#2E7D32',
          marginBottom: '12px',
          fontSize: '14px',
        }}>
          📋 Este artículo requiere consultar disponibilidad
        </p>
        <button
          onClick={onConsult}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            width: '100%',
          }}
        >
          📞 Consultar disponibilidad
        </button>
      </div>
    );
  }

  // Estado 4: No disponible (inactivo o stock 0 sin reponer)
  return (
    <div>
      <button
        disabled
        style={{
          padding: '10px 20px',
          backgroundColor: '#CCCCCC',
          color: '#666',
          border: 'none',
          borderRadius: '4px',
          cursor: 'not-allowed',
          fontSize: '14px',
          fontWeight: '600',
          width: '100%',
        }}
      >
        ❌ Producto no disponible
      </button>
    </div>
  );
}
