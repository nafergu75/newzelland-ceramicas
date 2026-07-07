import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [visits, downloads, orders] = await Promise.all([
          adminAPI.getVisitStats(days),
          adminAPI.getDownloadStats(days),
          adminAPI.getOrderStats(days),
        ])
        setStats({
          visits: visits.data,
          downloads: downloads.data,
          orders: orders.data,
        })
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [days])

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📊 Panel de Administración</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Período:{' '}
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px' }}>
          <h3>Visitas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {stats?.visits?.byDate?.[0]?.visits || 0}
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>en últimas 24h</p>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
          <h3>Órdenes</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {stats?.orders?.total?.totalOrders || 0}
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>total histórico</p>
        </div>

        <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px' }}>
          <h3>Ingresos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            €{(stats?.orders?.total?.totalRevenue || 0).toFixed(2)}
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>entregados</p>
        </div>

        <div style={{ backgroundColor: '#f3e5f5', padding: '20px', borderRadius: '8px' }}>
          <h3>Usuarios</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {stats?.orders?.total?.totalUsers || 0}
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>registrados</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Órdenes por Día</h3>
          {stats?.orders?.byDate?.slice(0, 7).map((item: any) => (
            <div key={item.date} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <span>{item.date}</span>
              <span>{item.orders} órdenes - €{(item.revenue || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>Descargas de Catálogos</h3>
          {stats?.downloads?.byCatalog?.slice(0, 7).map((item: any) => (
            <div key={item.catalog_name} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <span>{item.catalog_name}</span>
              <span>{item.downloads}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
