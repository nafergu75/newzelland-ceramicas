import { useAuth } from '../../../context/AuthContext'
import { SignOut, User, ShoppingBag, Package, ChatDots, Gear } from '@phosphor-icons/react'

interface AccountSidebarProps {
  activeSection: string
  onNavigate: (section: any) => void
}

export default function AccountSidebar({ activeSection, onNavigate }: AccountSidebarProps) {
  const { logout } = useAuth()

  const menuItems = [
    { id: 'resumen', label: 'Resumen', icon: ShoppingBag },
    { id: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag },
    { id: 'envios', label: 'Envíos', icon: Package },
    { id: 'soporte', label: 'Soporte', icon: ChatDots },
    { id: 'perfil', label: 'Mi Perfil', icon: Gear },
  ]

  const handleLogout = () => {
    if (window.confirm('¿Deseas cerrar sesión?')) {
      logout()
      window.location.href = '/'
    }
  }

  return (
    <div
      style={{
        width: '250px',
        backgroundColor: 'white',
        borderRight: '1px solid #eee',
        padding: '20px',
        position: 'sticky',
        top: '0',
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isActive = activeSection === item.id || (item.id === 'resumen' && activeSection.includes('pedido'))

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '8px',
                backgroundColor: isActive ? '#e8f5e9' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#2e7d32' : '#666',
                transition: 'all 0.2s',
              }}
            >
              <IconComponent size={20} weight={isActive ? 'fill' : 'regular'} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#ffebee',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#c62828',
          transition: 'all 0.2s',
        }}
      >
        <SignOut size={20} />
        Cerrar sesión
      </button>
    </div>
  )
}
