import { useEffect, useState } from 'react'
import { accountService } from '../../../services/accountService'
import { Pedido } from '../../../types/account'
import { ArrowLeft } from '@phosphor-icons/react'

interface OrderDetailProps {
  pedidoId: string
  onBack: () => void
}

export default function OrderDetail({ pedidoId, onBack }: OrderDetailProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        setLoading(true)
        const data = await accountService.getPedidoDetalle(pedidoId)
        setPedido(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarPedido()
  }, [pedidoId])

  if (loading) return <p>Cargando detalles del pedido...</p>
  if (error) return <p style={{ color: '#c62828' }}>Error: {error}</p>
  if (!pedido) return null

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#1976d2',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '20px',
          padding: 0,
        }}
      >
        <ArrowLeft size={18} />
        Volver a mis pedidos
      </button>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
          Pedido {pedido.numero}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Fecha del Pedido</p>
            <p style={{ fontSize: '14px', color: '#1a1a1a' }}>
              {new Date(pedido.fecha).toLocaleDateString('es-ES')}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Estado</p>
            <p style={{ fontSize: '14px', color: '#1a1a1a', textTransform: 'capitalize' }}>{pedido.estado}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Total</p>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#4caf50' }}>€{pedido.total.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Dirección de Envío</p>
            <p style={{ fontSize: '14px', color: '#1a1a1a' }}>
              {pedido.direccion.calle}, {pedido.direccion.ciudad}
            </p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Productos</h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Producto</th>
              <th style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>Cantidad</th>
              <th style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>Precio Unitario</th>
              <th style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 8px' }}>
                  <strong>{item.nombre}</strong>
                  <br />
                  <span style={{ fontSize: '12px', color: '#999' }}>Código: {item.codigo}</span>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>{item.cantidad}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>€{item.precioUnitario.toFixed(2)}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600' }}>
                  €{item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
