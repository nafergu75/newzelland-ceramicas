import { useEffect, useState } from 'react'
import { adminService, CatalogDownloadRow } from '../../../services/adminService'
import { series } from '../../../data/catalog'

export default function CatalogDownloads() {
  const [descargas, setDescargas] = useState<CatalogDownloadRow[]>([])
  const [total, setTotal] = useState(0)
  const [porPagina, setPorPagina] = useState(20)
  const [pagina, setPagina] = useState(1)
  const [slug, setSlug] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deviceType, setDeviceType] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const filtros = {
    slug: slug || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    deviceType: deviceType || undefined,
    utmSource: utmSource || undefined,
    country: country || undefined,
  }

  useEffect(() => {
    let cancelled = false
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await adminService.getDescargasCatalogo({ page: pagina, ...filtros })
        if (cancelled) return
        setDescargas(data.descargas)
        setTotal(data.total)
        setPorPagina(data.porPagina)
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    cargar()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, slug, dateFrom, dateTo, deviceType, utmSource, country])

  const totalPaginas = Math.max(Math.ceil(total / porPagina), 1)

  const handleExport = async () => {
    setExporting(true)
    try {
      await adminService.exportarDescargasCatalogoCsv(filtros)
    } catch {
      setError('No se pudo exportar el CSV')
    } finally {
      setExporting(false)
    }
  }

  const inputStyle = { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Descargas de catálogo ({total})</h2>
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

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select
          value={slug}
          onChange={(e) => {
            setPagina(1)
            setSlug(e.target.value)
          }}
          style={{ ...inputStyle, minWidth: '200px' }}
        >
          <option value="">Todas las colecciones</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
        <div>
          <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '2px' }}>Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setPagina(1)
              setDateFrom(e.target.value)
            }}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '2px' }}>Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setPagina(1)
              setDateTo(e.target.value)
            }}
            style={inputStyle}
          />
        </div>
        <select
          value={deviceType}
          onChange={(e) => {
            setPagina(1)
            setDeviceType(e.target.value)
          }}
          style={inputStyle}
        >
          <option value="">Todos los dispositivos</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
          <option value="desktop">Desktop</option>
        </select>
        <input
          type="text"
          placeholder="UTM source (ej: google)"
          value={utmSource}
          onChange={(e) => {
            setPagina(1)
            setUtmSource(e.target.value)
          }}
          style={{ ...inputStyle, minWidth: '160px' }}
        />
        <input
          type="text"
          placeholder="País (ej: ES)"
          value={country}
          onChange={(e) => {
            setPagina(1)
            setCountry(e.target.value)
          }}
          style={{ ...inputStyle, minWidth: '120px' }}
        />
      </div>

      {error && <p style={{ color: '#c62828', fontSize: '14px' }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#666' }}>Cargando...</p>
      ) : descargas.length === 0 ? (
        <p style={{ color: '#999' }}>No hay descargas que coincidan con los filtros.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '1100px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px' }}>Usuario</th>
                  <th style={{ padding: '10px 8px' }}>Colección</th>
                  <th style={{ padding: '10px 8px' }}>Tipo</th>
                  <th style={{ padding: '10px 8px' }}>Dispositivo</th>
                  <th style={{ padding: '10px 8px' }}>Navegador</th>
                  <th style={{ padding: '10px 8px' }}>UTM (source / campaign)</th>
                  <th style={{ padding: '10px 8px' }}>País / Ciudad</th>
                  <th style={{ padding: '10px 8px' }}>Origen</th>
                  <th style={{ padding: '10px 8px' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {descargas.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f0f0f0' }} title={`Email: ${d.email}\nIP (anonimizada): ${d.ip || '—'}\nReferer: ${d.referer || '—'}`}>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>{d.nombre_completo || d.email}</td>
                    <td style={{ padding: '10px 8px' }}>{d.catalog_nombre || d.catalog_slug}</td>
                    <td style={{ padding: '10px 8px', textTransform: 'capitalize' }}>{d.tipo}</td>
                    <td style={{ padding: '10px 8px', textTransform: 'capitalize' }}>{d.device_type || '—'}</td>
                    <td style={{ padding: '10px 8px', color: '#666' }}>
                      {d.browser_name ? `${d.browser_name}${d.os_name ? ` · ${d.os_name}` : ''}` : '—'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#666' }}>
                      {d.utm_source ? `${d.utm_source}${d.utm_campaign ? ` / ${d.utm_campaign}` : ''}` : '—'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#999' }}>
                      {d.country ? `${d.country}${d.city ? ` · ${d.city}` : ''}` : '—'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#999' }}>{d.origen || '—'}</td>
                    <td style={{ padding: '10px 8px', color: '#999' }}>{new Date(d.created_at).toLocaleString('es-ES')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: '#bbb', marginTop: '8px' }}>Pasa el cursor sobre una fila para ver email, IP anonimizada y referer.</p>

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
