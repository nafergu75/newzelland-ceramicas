import { useEffect, useState } from 'react'
import { userAPI } from '../services/api'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getOrders(10, 0),
        ])
        setUser(profileRes.data)
        setOrders(ordersRes.data.orders || [])
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Mi Dashboard</h1>

      {user && (
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2>Perfil</h2>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>NIF:</strong> {user.nif || 'No registrado'}</p>
          <p><strong>Teléfono:</strong> {user.phone || 'No registrado'}</p>
          <p><strong>Provincia:</strong> {user.province}</p>
        </div>
      )}

      <div>
        <h2>Mis Pedidos</h2>
        {orders.length === 0 ? (
          <p>No hay pedidos aún. <a href="/catalog">Ver catálogo</a></p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Pedido</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Fecha</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Estado</th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{order.id.substring(0, 8)}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      backgroundColor: order.status === 'delivered' ? '#90EE90' : '#FFE4B5',
                      fontSize: '12px',
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                    €{(order.total || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
