import { useEffect, useState } from 'react'
import { accountService } from '../../../services/accountService'
import { Envio } from '../../../types/account'

export default function ShippingStatus() {
  const [envios, setEnvios] = useState<Envio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarEnvios = async () => {
      try {
        setLoading(true)
        const data = await accountService.getEnvios()
        setEnvios(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarEnvios()
  }, [])

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'preparacion':
        return '#ff9800'
      case 'en_transito':
        return '#2196f3'
      case 'entregado':
        return '#4caf50'
      case 'incidencia':
        return '#c62828'
      default:
        return '#666'
    }
  }

  if (loading) return <p>Cargando envíos...</p>
  if (error) return <p style={{ color: '#c62828' }}>Error: {error}</p>

  return (
    <div>
      {envios.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#666' }}>No hay envíos activos en este momento</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {envios.map((envio) => (
            <div key={envio.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Pedido</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{envio.numeroPedido}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Transportista</p>
                  <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{envio.transportista}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Estado</p>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: getEstadoColor(envio.estado),
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      textTransform: 'capitalize',
                    }}
                  >
                    {envio.estado.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}
              >
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Código de Seguimiento</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{envio.codigoSeguimiento}</p>
              </div>

              {envio.enlaceTracking && (
                <a
                  href={envio.enlaceTracking}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  Rastrear Envío
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
