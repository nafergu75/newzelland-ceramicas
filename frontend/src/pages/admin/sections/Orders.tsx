interface OrdersProps {
  onSelectPedido: (id: string) => void
}

export default function Orders({ onSelectPedido }: OrdersProps) {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>Gestión de Pedidos</h2>
      <p style={{ color: '#999' }}>Sección en desarrollo</p>
      <p>Funcionalidades que estarán disponibles:</p>
      <ul>
        <li>Listado paginado de pedidos</li>
        <li>Filtros avanzados (estado, período, cliente)</li>
        <li>Cambio de estado de pedido</li>
        <li>Reenvío de facturas</li>
        <li>Gestión de devoluciones</li>
      </ul>
    </div>
  )
}
