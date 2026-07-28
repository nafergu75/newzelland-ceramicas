import { useEffect, useState } from 'react'
import { adminService, CrmStats } from '../../../services/adminService'
import { Users, EnvelopeSimple, DownloadSimple, Handshake, Export } from '@phosphor-icons/react'

const ORIGEN_LABELS: Record<string, string> = {
  registro_web: 'Registros web',
  descarga_catalogo: 'Descargas de catálogo',
  lead_contacto: 'Leads de contacto',
  lead_presupuesto: 'Leads de presupuesto',
  partner_pendiente: 'Partners pendientes',
  partner_aprobado: 'Partners aprobados',
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<CrmStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const cargarStats = async () => {
      try {
        setLoading(true)
        const data = await adminService.getCrmStats()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargarStats()
  }, [])

  const handleExport = async () => {
    try {
      setExporting(true)
      await adminService.exportarContactosCrmCsv()
    } catch (err) {
      console.error('Error exportando contactos CRM:', err)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <p>Cargando estadísticas de CRM...</p>
  if (error) return <p style={{ color: '#c62828' }}>Error: {error}</p>
  if (!stats) return null

  return (
    <div>
      {!stats.crmHabilitado && (
        <div style={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ffb74d',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#e65100'
        }}>
          La integración con el CRM está desactivada (<code>CRM_ENABLED=false</code>). Los contactos y emails
          automáticos no se están sincronizando con Brevo — los datos de abajo reflejan solo la base de datos propia.
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <KPICard label="Total de contactos" value={stats.totalContactos.toString()} icon={<Users size={32} />} color="#2196f3" />
        <KPICard label="Registros nuevos este mes" value={stats.nuevosEsteMes.toString()} icon={<EnvelopeSimple size={32} />} color="#4caf50" />
        <KPICard label="Descargas de catálogo" value={(stats.porOrigen.descarga_catalogo ?? 0).toString()} icon={<DownloadSimple size={32} />} color="#ff9800" />
        <KPICard label="Partners aprobados" value={(stats.porOrigen.partner_aprobado ?? 0).toString()} icon={<Handshake size={32} />} color="#9c27b0" />
      </div>

      {/* Desglose por origen */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Contactos por origen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {Object.entries(ORIGEN_LABELS).map(([key, label]) => (
            <div key={key} style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px 0' }}>{label}</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{stats.porOrigen[key] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campañas top */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Campañas principales (UTM)</h3>
        {stats.topCampanias.length === 0 ? (
          <p style={{ color: '#999', fontSize: '14px' }}>Todavía no hay contactos con campaña UTM registrada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px', color: '#666' }}>Campaña</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '13px', color: '#666' }}>Contactos</th>
              </tr>
            </thead>
            <tbody>
              {stats.topCampanias.map((c) => (
                <tr key={c.utm_campaign} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '8px', fontSize: '14px' }}>{c.utm_campaign}</td>
                  <td style={{ padding: '8px', fontSize: '14px', textAlign: 'right' }}>{c.contactos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          backgroundColor: '#1a1a1a',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: exporting ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          opacity: exporting ? 0.6 : 1,
        }}
      >
        <Export size={18} />
        {exporting ? 'Exportando...' : 'Exportar contactos (CSV)'}
      </button>
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
