import { useEffect, useState } from 'react'
import { accountService } from '../../../services/accountService'
import { ConversacionTicket } from '../../../types/account'
import { ArrowLeft } from '@phosphor-icons/react'

interface MessageDetailProps {
  ticketId: string
  onBack: () => void
}

export default function MessageDetail({ ticketId, onBack }: MessageDetailProps) {
  const [conversacion, setConversacion] = useState<ConversacionTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const cargarConversacion = async () => {
      try {
        setLoading(true)
        const data = await accountService.getConversacionTicket(ticketId)
        setConversacion(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarConversacion()
  }, [ticketId])

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return

    try {
      setEnviando(true)
      await accountService.responderTicket(ticketId, nuevoMensaje)
      setNuevoMensaje('')
      // Recargar conversación
      const data = await accountService.getConversacionTicket(ticketId)
      setConversacion(data)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <p>Cargando conversación...</p>
  if (error) return <p style={{ color: '#c62828' }}>Error: {error}</p>
  if (!conversacion) return null

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
        Volver a mis tickets
      </button>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
          {conversacion.ticket.asunto}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Número</p>
            <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{conversacion.ticket.numero}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Estado</p>
            <p style={{ fontSize: '14px', color: '#1a1a1a', textTransform: 'capitalize' }}>
              {conversacion.ticket.estado}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Última Respuesta</p>
            <p style={{ fontSize: '14px', color: '#1a1a1a' }}>
              {new Date(conversacion.ticket.ultimaRespuesta).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>

      {/* Conversación */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Conversación</h3>
        <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
          {conversacion.mensajes.map((msg) => (
            <div
              key={msg.id}
              style={{
                backgroundColor: msg.remitente === 'cliente' ? '#e3f2fd' : '#f5f5f5',
                padding: '12px',
                borderRadius: '6px',
                marginLeft: msg.remitente === 'cliente' ? 'auto' : '0',
                marginRight: msg.remitente === 'cliente' ? '0' : 'auto',
                maxWidth: '70%',
              }}
            >
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                {msg.remitente === 'cliente' ? 'Tú' : 'Soporte'} •{' '}
                {new Date(msg.fecha).toLocaleDateString('es-ES')}
              </p>
              <p style={{ fontSize: '14px', color: '#1a1a1a', margin: 0 }}>{msg.contenido}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario Respuesta */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Tu Respuesta</h3>
        <textarea
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe tu respuesta aquí..."
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            marginBottom: '12px',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleEnviarMensaje}
          disabled={enviando || !nuevoMensaje.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: enviando ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: enviando ? 'not-allowed' : 'pointer',
          }}
        >
          {enviando ? 'Enviando...' : 'Enviar Respuesta'}
        </button>
      </div>
    </div>
  )
}
