import { useEffect, useState } from 'react'
import { accountService } from '../../../services/accountService'
import { AccountSummary as AccountSummaryType, Pedido } from '../../../types/account'
import { Warning } from '@phosphor-icons/react'

export default function AccountSummary() {
  const [summary, setSummary] = useState<AccountSummaryType | null>(null)
  const [ultimoPedido, setUltimoPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const sumData = await accountService.getAccountSummary()
        setSummary(sumData)

        if (sumData.totalPedidos > 0) {
          const pedidos = await accountService.getPedidos(1)
          if (pedidos.pedidos.length > 0) {
            setUltimoPedido(pedidos.pedidos[0])
          }
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  if (loading) {
    return <p style={{ textAlign: 'center', color: '#666' }}>Cargando datos...</p>
  }

  if (error) {
    return <p style={{ color: '#c62828' }}>Error: {error}</p>
  }

  if (!summary) {
    return null
  }

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <KPICard label="Total Facturado" value={`€${summary.totalFacturado.toFixed(2)}`} color="#4caf50" />
        <KPICard label="Número de Pedidos" value={summary.totalPedidos.toString()} color="#2196f3" />
        <KPICard label="Pedidos Este Año" value={summary.pedidosEsteAño.toString()} color="#ff9800" />
        <KPICard label="Miembro Desde" value={new Date(summary.miembroDesde).toLocaleDateString('es-ES')} color="#9c27b0" />
      </div>

      {/* Avisos */}
      {summary.enviosPendientes > 0 && (
        <div
          style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ffb74d',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '30px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <Warning size={20} color="#ff9800" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#f57c00', margin: '0 0 4px 0' }}>
              Tienes {summary.enviosPendientes} envío{summary.enviosPendientes !== 1 ? 's' : ''} pendiente{summary.enviosPendientes !== 1 ? 's' : ''}
            </p>
            <p style={{ fontSize: '12px', color: '#e65100', margin: 0 }}>
              Consulta el estado en la sección "Envíos"
            </p>
          </div>
        </div>
      )}

      {/* Score de Seguridad */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Score de Seguridad</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <SecurityItem label="Email verificado" verified={summary.emailVerificado} />
          <SecurityItem label="Contraseña robusta" verified={summary.contraseñaRobusta} />
        </div>
      </div>

      {/* Último Pedido */}
      {ultimoPedido && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Último Pedido</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Número de Pedido</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>{ultimoPedido.numero}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Total</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#4caf50' }}>€{ultimoPedido.total.toFixed(2)}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Fecha</p>
              <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{new Date(ultimoPedido.fecha).toLocaleDateString('es-ES')}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Estado</p>
              <p style={{ fontSize: '14px', color: '#1a1a1a', textTransform: 'capitalize' }}>{ultimoPedido.estado}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Ver Detalles
            </button>
            <button
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Descargar Factura
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function KPICard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: '700', color }}>{value}</p>
    </div>
  )
}

function SecurityItem({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: verified ? '#4caf50' : '#ffb74d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: '700',
        }}
      >
        {verified ? '✓' : '!'}
      </div>
      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{label}</p>
    </div>
  )
}
