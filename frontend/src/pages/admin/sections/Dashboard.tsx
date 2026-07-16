import { useEffect, useState } from 'react'
import { adminService } from '../../../services/adminService'
import { AdminStats } from '../../../types/admin'
import { TrendUp, Package, Users, Warning } from '@phosphor-icons/react'

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarStats = async () => {
      try {
        setLoading(true)
        const data = await adminService.getStats()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarStats()
  }, [])

  if (loading) return <p>Cargando estadísticas...</p>
  if (error) return <p style={{ color: '#c62828' }}>Error: {error}</p>
  if (!stats) return null

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <KPICard label="Ingresos Totales" value={`€${stats.totalIngresos.toFixed(2)}`} icon={<TrendUp size={32} />} color="#4caf50" />
        <KPICard label="Total Pedidos" value={stats.totalPedidos.toString()} icon={<Package size={32} />} color="#2196f3" />
        <KPICard label="Clientes Nuevos" value={stats.clientesNuevos.toString()} icon={<Users size={32} />} color="#ff9800" />
        <KPICard label="Ticket Promedio" value={`€${stats.ticketPromedio.toFixed(2)}`} icon={<TrendUp size={32} />} color="#9c27b0" />
      </div>

      {/* Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {stats.mensajesSinResponder > 0 && (
          <AlertCard
            title="Mensajes sin Responder"
            count={stats.mensajesSinResponder}
            color="#ff9800"
            icon={<Warning size={24} />}
          />
        )}
        {stats.pedidosPendientes > 0 && (
          <AlertCard
            title="Pedidos Pendientes"
            count={stats.pedidosPendientes}
            color="#f44336"
            icon={<Package size={24} />}
          />
        )}
        {stats.enviosActivos > 0 && (
          <AlertCard
            title="Envíos Activos"
            count={stats.enviosActivos}
            color="#2196f3"
            icon={<Package size={24} />}
          />
        )}
      </div>

      {/* Conversión */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Tasa de Conversión</h3>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#4caf50' }}>
          {(stats.tasaConversion * 100).toFixed(1)}%
        </div>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
          Visitors que completaron una compra
        </p>
      </div>
    </div>
  )
}

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>{label}</p>
        <p style={{ fontSize: '28px', fontWeight: '700', color: color }}>{value}</p>
      </div>
      <div style={{ color: color, opacity: 0.3 }}>{icon}</div>
    </div>
  )
}

function AlertCard({ title, count, color, icon }: { title: string; count: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: '14px', fontWeight: '600', color }}>{title}</span>
      </div>
      <p style={{ fontSize: '24px', fontWeight: '700', color, margin: 0 }}>{count}</p>
    </div>
  )
}
