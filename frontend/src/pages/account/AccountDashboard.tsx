import { lazy, Suspense, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AccountSidebar from './components/AccountSidebar'

const AccountSummary = lazy(() => import('./sections/AccountSummary'))
const MyOrders = lazy(() => import('./sections/MyOrders'))
const OrderDetail = lazy(() => import('./sections/OrderDetail'))
const ShippingStatus = lazy(() => import('./sections/ShippingStatus'))
const Messages = lazy(() => import('./sections/Messages'))
const MessageDetail = lazy(() => import('./sections/MessageDetail'))
const MyProfile = lazy(() => import('./sections/MyProfile'))

type ActiveSection = 'resumen' | 'pedidos' | 'pedido-detalle' | 'envios' | 'soporte' | 'ticket-detalle' | 'perfil'

export default function AccountDashboard() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<ActiveSection>('resumen')
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

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
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex' }}>
      <AccountSidebar activeSection={activeSection} onNavigate={navigateTo} />

      <div style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '5px' }}>
              Mi Cuenta
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Bienvenido/a, <strong>{user?.nombre}</strong>
            </p>
          </div>

          <Suspense fallback={<p>Cargando...</p>}>
            {activeSection === 'resumen' && <AccountSummary />}
            {activeSection === 'pedidos' && <MyOrders onSelectPedido={handleSelectPedido} />}
            {activeSection === 'pedido-detalle' && selectedPedidoId && (
              <OrderDetail pedidoId={selectedPedidoId} onBack={handleBackFromPedido} />
            )}
            {activeSection === 'envios' && <ShippingStatus />}
            {activeSection === 'soporte' && <Messages onSelectTicket={handleSelectTicket} />}
            {activeSection === 'ticket-detalle' && selectedTicketId && (
              <MessageDetail ticketId={selectedTicketId} onBack={handleBackFromTicket} />
            )}
            {activeSection === 'perfil' && <MyProfile />}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
