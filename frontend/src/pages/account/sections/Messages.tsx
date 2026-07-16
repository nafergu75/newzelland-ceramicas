import { useEffect, useState } from 'react'
import { accountService } from '../../../services/accountService'
import { Ticket } from '../../../types/account'
import { Plus } from '@phosphor-icons/react'

interface MessagesProps {
  onSelectTicket: (id: string) => void
}

type EstadoFiltro = 'todos' | 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado'

export default function Messages({ onSelectTicket }: MessagesProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todos')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nuevoTicket, setNuevoTicket] = useState({ asunto: '', descripcion: '', categoria: 'otro' })

  useEffect(() => {
    const cargarTickets = async () => {
      try {
        setLoading(true)
        const filtros = filtroEstado === 'todos' ? undefined : { estado: filtroEstado }
        const data = await accountService.getTickets(filtros)
        setTickets(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarTickets()
  }, [filtroEstado])

  const handleCrearTicket = async () => {
    if (!nuevoTicket.asunto.trim() || !nuevoTicket.descripcion.trim()) {
      alert('Por favor completa todos los campos')
      return
    }

    try {
      await accountService.crearTicket(nuevoTicket.asunto, nuevoTicket.descripcion, nuevoTicket.categoria)
      setNuevoTicket({ asunto: '', descripcion: '', categoria: 'otro' })
      setMostrarFormulario(false)
      // Recargar tickets
      const data = await accountService.getTickets()
      setTickets(data)
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return '#ff9800'
      case 'en_progreso':
        return '#2196f3'
      case 'resuelto':
        return '#4caf50'
      case 'cerrado':
        return '#999'
      default:
        return '#666'
    }
  }

  return (
    <div>
      {/* Botón Nuevo Ticket */}
      <button
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        <Plus size={20} />
        Nuevo Ticket
      </button>

      {/* Formulario Nuevo Ticket */}
      {mostrarFormulario && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Crear Nuevo Ticket</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <input
              type="text"
              placeholder="Asunto"
              value={nuevoTicket.asunto}
              onChange={(e) => setNuevoTicket({ ...nuevoTicket, asunto: e.target.value })}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <textarea
              placeholder="Descripción"
              value={nuevoTicket.descripcion}
              onChange={(e) => setNuevoTicket({ ...nuevoTicket, descripcion: e.target.value })}
              rows={4}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
            <select
              value={nuevoTicket.categoria}
              onChange={(e) => setNuevoTicket({ ...nuevoTicket, categoria: e.target.value })}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            >
              <option value="pedido">Acerca de un pedido</option>
              <option value="envio">Problema de envío</option>
              <option value="producto">Producto defectuoso</option>
              <option value="factura">Facturación</option>
              <option value="otro">Otro</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCrearTicket}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Crear Ticket
              </button>
              <button
                onClick={() => setMostrarFormulario(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtro */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
          }}
        >
          <option value="todos">Todos los tickets</option>
          <option value="abierto">Abiertos</option>
          <option value="en_progreso">En Progreso</option>
          <option value="resuelto">Resueltos</option>
          <option value="cerrado">Cerrados</option>
        </select>
      </div>

      {/* Listado */}
      {loading ? (
        <p>Cargando tickets...</p>
      ) : error ? (
        <p style={{ color: '#c62828' }}>Error: {error}</p>
      ) : tickets.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#666' }}>No hay tickets</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr auto',
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
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Asunto</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{ticket.asunto}</p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Categoría</p>
                <p style={{ fontSize: '14px', color: '#1a1a1a', textTransform: 'capitalize' }}>
                  {ticket.categoria}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Estado</p>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: getEstadoColor(ticket.estado),
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    textTransform: 'capitalize',
                  }}
                >
                  {ticket.estado.replace('_', ' ')}
                </p>
              </div>

              {ticket.respuestasNoLeidas > 0 && (
                <div
                  style={{
                    backgroundColor: '#ff9800',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {ticket.respuestasNoLeidas} sin leer
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
