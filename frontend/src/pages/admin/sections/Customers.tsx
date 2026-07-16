interface CustomersProps {
  onSelectCliente: (id: string) => void
}

export default function Customers({ onSelectCliente }: CustomersProps) {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>Gestión de Clientes</h2>
      <p style={{ color: '#999' }}>Sección en desarrollo</p>
      <p>Funcionalidades que estarán disponibles:</p>
      <ul>
        <li>Listado paginado de clientes</li>
        <li>Filtros por estado y período</li>
        <li>Búsqueda por nombre/email</li>
        <li>Ficha de cliente con histórico</li>
        <li>Activar/Desactivar clientes</li>
      </ul>
    </div>
  )
}
