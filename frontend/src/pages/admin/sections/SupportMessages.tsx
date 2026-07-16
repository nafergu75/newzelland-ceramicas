interface SupportMessagesProps {
  onSelectTicket: (id: string) => void
}

export default function SupportMessages({ onSelectTicket }: SupportMessagesProps) {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>Centro de Soporte</h2>
      <p style={{ color: '#999' }}>Sección en desarrollo</p>
      <p>Funcionalidades que estarán disponibles:</p>
      <ul>
        <li>Bandeja de tickets sin responder</li>
        <li>Filtros por estado y categoría</li>
        <li>Vista de conversación</li>
        <li>Responder a clientes</li>
        <li>Marcar como resuelto</li>
      </ul>
    </div>
  )
}
