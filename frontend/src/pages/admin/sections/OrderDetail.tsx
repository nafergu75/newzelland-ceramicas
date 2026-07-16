interface OrderDetailProps {
  pedidoId: string
  onBack: () => void
}

export default function OrderDetail({ pedidoId, onBack }: OrderDetailProps) {
  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
        ← Volver
      </button>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>Detalle de Pedido</h2>
        <p style={{ color: '#999' }}>Pedido ID: {pedidoId}</p>
        <p style={{ color: '#999' }}>Sección en desarrollo</p>
      </div>
    </div>
  )
}
