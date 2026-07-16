import { useAuth } from '../../../context/AuthContext'
import { SignOut, ChartLine, Users, ShoppingCart, FileText, ChatDots, FileArrowDown } from '@phosphor-icons/react'

interface AdminSidebarProps {
  activeSection: string
  onNavigate: (section: any) => void
}

export default function AdminSidebar({ activeSection, onNavigate }: AdminSidebarProps) {
  const { logout } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartLine },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'facturas', label: 'Facturas', icon: FileText },
    { id: 'soporte', label: 'Soporte', icon: ChatDots },
    { id: 'reportes', label: 'Reportes', icon: FileArrowDown },
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
        width: '280px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '20px',
        position: 'sticky',
        top: '0',
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 5px 0' }}>Admin</h2>
        <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Panel de Control</p>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isActive = activeSection === item.id || activeSection.includes(item.id.split('-')[0])

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '8px',
                backgroundColor: isActive ? '#2196f3' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? 'white' : '#bbb',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2a2a2a'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#bbb'
                }
              }}
            >
              <IconComponent size={20} weight={isActive ? 'fill' : 'regular'} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#c62828',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          transition: 'all 0.2s',
        }}
      >
        <SignOut size={20} />
        Cerrar sesión
      </button>
    </div>
  )
}
