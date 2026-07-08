interface ShippingBreakdownProps {
  baseShipping: number;
  distanceSurcharge: number;
  totalShipping: number;
}

/**
 * Componente para mostrar el desglose de envío
 * Evita duplicidades y mantiene consistencia con el backend
 *
 * Lo que se muestra al usuario:
 * - Envío base: X€
 * - Recargo por distancia: Y€
 * - Total envío: Z€
 *
 * La fórmula "3€ por m²" es INTERNA, nunca se muestra
 */
export default function ShippingBreakdown({
  baseShipping,
  distanceSurcharge,
  totalShipping,
}: ShippingBreakdownProps) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
      marginTop: '20px',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Desglose de Envío</h3>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingBottom: '8px',
        borderBottom: '1px solid #eee',
      }}>
        <span>Envío base:</span>
        <span style={{ fontWeight: '500' }}>€{baseShipping.toFixed(2)}</span>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #eee',
      }}>
        <span>Recargo por distancia:</span>
        <span style={{ fontWeight: '500' }}>€{distanceSurcharge.toFixed(2)}</span>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '8px',
        marginTop: '8px',
        fontSize: '16px',
        fontWeight: '600',
      }}>
        <span>Total envío:</span>
        <span>€{totalShipping.toFixed(2)}</span>
      </div>

      {/* Nota: la fórmula es interna, no se muestra */}
      <p style={{
        fontSize: '12px',
        color: '#999',
        marginTop: '12px',
        marginBottom: 0,
      }}>
        El recargo por distancia se calcula según el volumen de tu pedido.
      </p>
    </div>
  );
}
