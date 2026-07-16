import { lazy, Suspense, useState } from 'react'
import AdminSidebar from './components/AdminSidebar'

const Dashboard = lazy(() => import('./sections/Dashboard'))
const Customers = lazy(() => import('./sections/Customers'))
const CustomerDetail = lazy(() => import('./sections/CustomerDetail'))
const Orders = lazy(() => import('./sections/Orders'))
const OrderDetail = lazy(() => import('./sections/OrderDetail'))
const Invoices = lazy(() => import('./sections/Invoices'))
const SupportMessages = lazy(() => import('./sections/SupportMessages'))
const MessageDetail = lazy(() => import('./sections/MessageDetail'))
const Reports = lazy(() => import('./sections/Reports'))

type ActiveSection = 'dashboard' | 'clientes' | 'cliente-detalle' | 'pedidos' | 'pedido-detalle' | 'facturas' | 'soporte' | 'ticket-detalle' | 'reportes'

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard')
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const handleSelectCliente = (id: string) => {
    setSelectedClienteId(id)
    setActiveSection('cliente-detalle')
  }

  const handleBackFromCliente = () => {
    setSelectedClienteId(null)
    setActiveSection('clientes')
  }

  const handleSelectPedido = (id: string) => {
    setSelectedPedidoId(id)
    setActiveSection('pedido-detalle')
  }

  const handleBackFromPedido = () => {
    setSelectedPedidoId(null)
    setActiveSection('pedidos')
  }

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id)
    setActiveSection('ticket-detalle')
  }

  const handleBackFromTicket = () => {
    setSelectedTicketId(null)
    setActiveSection('soporte')
  }

  const navigateTo = (section: ActiveSection) => {
    setActiveSection(section)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex' }}>
      <AdminSidebar activeSection={activeSection} onNavigate={navigateTo} />

      <div style={{ flex: 1, padding: '30px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '5px' }}>
              Panel de Administración
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Gestión integral de pedidos, clientes y reportes
            </p>
          </div>

          <Suspense fallback={<p style={{ textAlign: 'center', color: '#666' }}>Cargando...</p>}>
            {activeSection === 'dashboard' && <Dashboard />}
            {activeSection === 'clientes' && <Customers onSelectCliente={handleSelectCliente} />}
            {activeSection === 'cliente-detalle' && selectedClienteId && (
              <CustomerDetail clienteId={selectedClienteId} onBack={handleBackFromCliente} />
            )}
            {activeSection === 'pedidos' && <Orders onSelectPedido={handleSelectPedido} />}
            {activeSection === 'pedido-detalle' && selectedPedidoId && (
              <OrderDetail pedidoId={selectedPedidoId} onBack={handleBackFromPedido} />
            )}
            {activeSection === 'facturas' && <Invoices />}
            {activeSection === 'soporte' && <SupportMessages onSelectTicket={handleSelectTicket} />}
            {activeSection === 'ticket-detalle' && selectedTicketId && (
              <MessageDetail ticketId={selectedTicketId} onBack={handleBackFromTicket} />
            )}
            {activeSection === 'reportes' && <Reports />}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
