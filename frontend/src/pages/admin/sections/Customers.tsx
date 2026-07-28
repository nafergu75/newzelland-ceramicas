import { useEffect, useState } from 'react'
import { adminService, AdminUserRow } from '../../../services/adminService'

interface CustomersProps {
  onSelectCliente: (id: string) => void
}

export default function Customers({ onSelectCliente }: CustomersProps) {
  const [usuarios, setUsuarios] = useState<AdminUserRow[]>([])
  const [total, setTotal] = useState(0)
  const [porPagina, setPorPagina] = useState(20)
  const [pagina, setPagina] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await adminService.getUsuariosRegistrados(pagina, search)
        if (cancelled) return
        setUsuarios(data.usuarios)
        setTotal(data.total)
        setPorPagina(data.porPagina)
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const timeout = setTimeout(cargar, search ? 300 : 0)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [pagina, search])

  const totalPaginas = Math.max(Math.ceil(total / porPagina), 1)

  const handleExport = async () => {
    setExporting(true)
    try {
      await adminService.exportarUsuariosCsv()
    } catch {
      setError('No se pudo exportar el CSV')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Usuarios registrados ({total})</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => {
              setPagina(1)
              setSearch(e.target.value)
            }}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', minWidth: '240px' }}
          />
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: exporting || total === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#c62828', fontSize: '14px' }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#666' }}>Cargando...</p>
      ) : usuarios.length === 0 ? (
        <p style={{ color: '#999' }}>No hay usuarios que coincidan con la búsqueda.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Nombre</th>
                <th style={{ padding: '10px 8px' }}>Email</th>
                <th style={{ padding: '10px 8px' }}>Empresa</th>
                <th style={{ padding: '10px 8px' }}>Rol</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>Descargas</th>
                <th style={{ padding: '10px 8px' }}>Alta</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => onSelectCliente(String(u.id))}
                  style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                >
                  <td style={{ padding: '10px 8px', fontWeight: '600' }}>{u.nombre}</td>
                  <td style={{ padding: '10px 8px', color: '#666' }}>{u.email}</td>
                  <td style={{ padding: '10px 8px', color: '#666' }}>{u.empresa || '—'}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: u.role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                      color: u.role === 'admin' ? '#0d47a1' : '#666',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{u.descargasCount}</td>
                  <td style={{ padding: '10px 8px', color: '#999' }}>{new Date(u.fechaAlta).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: '#999' }}>Página {pagina} de {totalPaginas}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                disabled={pagina <= 1}
                style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', cursor: pagina <= 1 ? 'not-allowed' : 'pointer' }}
              >
                Anterior
              </button>
              <button
                onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
                disabled={pagina >= totalPaginas}
                style={{ padding: '6px 14px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', cursor: pagina >= totalPaginas ? 'not-allowed' : 'pointer' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
