import { useEffect, useState } from 'react'
import { accountService } from '../../../services/accountService'
import { Pedido } from '../../../types/account'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface MyOrdersProps {
  onSelectPedido: (id: string) => void
}

type EstadoFiltro = 'todos' | 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'

export default function MyOrders({ onSelectPedido }: MyOrdersProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true)
        const filtros = {
          estado: filtroEstado === 'todos' ? undefined : filtroEstado,
          numero: busqueda || undefined,
        }
        const resultado = await accountService.getPedidos(pagina, filtros)
        setPedidos(resultado.pedidos)
        setTotalPaginas(resultado.paginas)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarPedidos()
  }, [filtroEstado, busqueda, pagina])

  const estados: EstadoFiltro[] = ['todos', 'pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado']

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '#ff9800'
      case 'confirmado':
        return '#2196f3'
      case 'enviado':
        return '#9c27b0'
      case 'entregado':
        return '#4caf50'
      case 'cancelado':
        return '#c62828'
      default:
        return '#666'
    }
  }

  return (
    <div>
      {/* Filtros */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Búsqueda */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#666' }}>
              Buscar por número de pedido
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MagnifyingGlass size={18} style={{ position: 'absolute', left: '10px', color: '#999' }} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setPagina(1)
                }}
                placeholder="Ej: #2024-001"
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* Filtro Estado */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#666' }}>
              Filtrar por estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value as EstadoFiltro)
                setPagina(1)
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            >
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado === 'todos' ? 'Todos los estados' : estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listado */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Cargando pedidos...</p>
      ) : error ? (
        <p style={{ color: '#c62828' }}>Error: {error}</p>
      ) : pedidos.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>No hay pedidos que coincidan con los filtros</p>
          <p style={{ fontSize: '14px', color: '#999' }}>Intenta cambiar los filtros o realiza tu primer pedido</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                onClick={() => onSelectPedido(pedido.id)}
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 120px',
                  gap: '16px',
                  alignItems: 'center',
                  border: '1px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f9f9f9'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = '#ddd'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'white'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'
                }}
              >
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Número</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>{pedido.numero}</p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Fecha</p>
                  <p style={{ fontSize: '14px', color: '#1a1a1a' }}>
                    {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Total</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#4caf50' }}>€{pedido.total.toFixed(2)}</p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Estado</p>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: getEstadoColor(pedido.estado),
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      textTransform: 'capitalize',
                    }}
                  >
                    {pedido.estado}
                  </p>
                </div>

                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: p === pagina ? '#4caf50' : '#f5f5f5',
                    color: p === pagina ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: p === pagina ? '600' : '400',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
