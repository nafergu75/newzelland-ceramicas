import { useState, useMemo } from 'react'
import { getAllSeriesNames, groupPackingBySeriesName, packingData } from '../data/packing'
import { series as catalogSeries } from '../data/catalog'
import '../styles/components.css'

export default function PackingPage() {
  const [selectedFamily, setSelectedFamily] = useState<string>('all')
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [selectedSerie, setSelectedSerie] = useState<string>('all')

  const seriesNames = useMemo(() => getAllSeriesNames(), [])
  const packingBySeriesName = useMemo(() => groupPackingBySeriesName(), [])

  // Extraer familias (materiales) únicas del catálogo
  const families = useMemo(() => {
    const allMaterials = new Set<string>()
    catalogSeries.forEach((s) => {
      const materials = s.material.split(', ')
      materials.forEach((m) => allMaterials.add(m.trim()))
    })
    return Array.from(allMaterials).sort()
  }, [])

  // Mapear serie a familia
  const serieToFamily = useMemo(() => {
    const map = new Map<string, Set<string>>()
    catalogSeries.forEach((s) => {
      const materials = s.material.split(', ').map((m) => m.trim())
      map.set(s.nombre, new Set(materials))
    })
    return map
  }, [])

  // Obtener formatos únicos
  const allFormats = useMemo(() => {
    const formats = new Set<string>()
    packingData.forEach((spec) => formats.add(spec.formato))
    return Array.from(formats).sort()
  }, [])

  // Filtrar datos según selecciones
  const filteredSeries = useMemo(() => {
    if (selectedFamily === 'all' && selectedSerie === 'all') {
      return seriesNames
    }
    return seriesNames.filter((sName) => {
      if (selectedSerie !== 'all' && sName !== selectedSerie) return false
      if (selectedFamily !== 'all') {
        const families = serieToFamily.get(sName)
        if (!families || !families.has(selectedFamily)) return false
      }
      return true
    })
  }, [selectedFamily, selectedSerie, seriesNames, serieToFamily])

  const filteredSpecs = useMemo(() => {
    return packingData.filter((spec) => {
      if (selectedFormat !== 'all' && spec.formato !== selectedFormat) return false
      if (!filteredSeries.includes(spec.serie)) return false
      return true
    })
  }, [selectedFormat, filteredSeries])

  const groupedSpecs = useMemo(() => {
    const grouped = new Map<string, typeof packingData>()
    filteredSpecs.forEach((spec) => {
      if (!grouped.has(spec.serie)) {
        grouped.set(spec.serie, [])
      }
      grouped.get(spec.serie)!.push(spec)
    })
    return grouped
  }, [filteredSpecs])

  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero / Header */}
      <section
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          borderBottom: '1px solid var(--color-gray-200)',
          backgroundColor: 'var(--color-gray-50)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '20px', fontSize: 'var(--font-size-3xl)' }}>Guía de Embalaje</h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-gray-600)',
              marginBottom: '15px',
              maxWidth: '700px',
              margin: '0 auto 15px',
              lineHeight: '1.6',
            }}
          >
            Especificaciones técnicas de packing para cada formato: piezas por caja, metros cuadrados,
            peso y configuración de palets. Todos los datos verificados y listos para consulta.
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
            {packingData.length} formatos disponibles · datos certificados
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section style={{ padding: '40px 20px', backgroundColor: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '24px', fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>Filtrar resultados</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Filtro por Familia */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)' }}>
                Familia (Material)
              </label>
              <select
                value={selectedFamily}
                onChange={(e) => {
                  setSelectedFamily(e.target.value)
                  setSelectedSerie('all')
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: 'var(--font-size-sm)',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Todas las familias</option>
                {families.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Serie */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)' }}>
                Serie
              </label>
              <select
                value={selectedSerie}
                onChange={(e) => setSelectedSerie(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: 'var(--font-size-sm)',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Todas las series</option>
                {filteredSeries.map((serie) => (
                  <option key={serie} value={serie}>
                    {serie}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Formato */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)' }}>
                Formato
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: 'var(--font-size-sm)',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Todos los formatos</option>
                {allFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div style={{ marginTop: '16px', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>
            {filteredSpecs.length} formato{filteredSpecs.length !== 1 ? 's' : ''} encontrado{filteredSpecs.length !== 1 ? 's' : ''} · {groupedSpecs.size} serie{groupedSpecs.size !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Tablas de Packing */}
      <section style={{ padding: '60px 20px', flex: 1, backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {groupedSpecs.size === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', fontSize: 'var(--font-size-lg)', paddingTop: '60px' }}>
              No hay formatos que coincidan con los filtros seleccionados.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
              {Array.from(groupedSpecs.keys())
                .sort()
                .map((seriesName) => {
                  const specs = groupedSpecs.get(seriesName) || []
                  return (
                    <div key={seriesName}>
                      <h2
                        style={{
                          fontSize: 'var(--font-size-2xl)',
                          marginBottom: '30px',
                          paddingBottom: '12px',
                          borderBottom: '2px solid var(--color-gray-200)',
                        }}
                      >
                        {seriesName}
                      </h2>

                      <div
                        style={{
                          overflowX: 'auto',
                          borderRadius: '8px',
                          border: '1px solid var(--color-gray-200)',
                        }}
                      >
                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: 'white',
                          }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: 'var(--color-gray-50)', borderBottom: '2px solid var(--color-gray-200)' }}>
                              <th style={{ padding: '16px', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Formato
                              </th>
                              <th style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Piezas/Caja
                              </th>
                              <th style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                m²/Caja
                              </th>
                              <th style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Peso/Caja
                              </th>
                              <th style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Cajas/Palet
                              </th>
                              <th style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                m²/Palet
                              </th>
                              <th style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Peso/Palet
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {specs.map((spec, idx) => (
                              <tr
                                key={spec.id}
                                style={{
                                  backgroundColor: idx % 2 === 0 ? 'white' : 'var(--color-gray-50)',
                                  borderBottom: '1px solid var(--color-gray-200)',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : 'var(--color-gray-50)'
                                }}
                              >
                                <td style={{ padding: '16px', fontSize: 'var(--font-size-base)', fontWeight: '600', color: 'var(--color-gray-900)' }}>
                                  {spec.formato}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-base)', color: 'var(--color-gray-700)' }}>
                                  {spec.piezas_por_caja}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-base)', color: 'var(--color-gray-700)' }}>
                                  {spec.metros_por_caja}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-base)', color: 'var(--color-gray-700)' }}>
                                  {spec.peso_por_caja_kg} kg
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-base)', color: 'var(--color-gray-700)' }}>
                                  {spec.cajas_por_palet}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-base)', color: 'var(--color-gray-700)', fontWeight: '600' }}>
                                  {spec.metros_por_palet}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: 'var(--font-size-base)', color: 'var(--color-gray-700)', fontWeight: '600' }}>
                                  {spec.peso_por_palet_kg} kg
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {/* Nota técnica al pie */}
          <div
            style={{
              marginTop: '80px',
              paddingTop: '40px',
              borderTop: '2px solid var(--color-gray-200)',
              backgroundColor: 'var(--color-gray-50)',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginBottom: '12px', fontSize: 'var(--font-size-lg)' }}>Información técnica</h3>
            <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
              Estos datos de embalaje se actualizan regularmente según los estándares de logística de Newzelland Cerámicas.
              Los pesos pueden variar ligeramente según el acabado y el material.
              Para consultas específicas o solicitudes de palets personalizados, contacta con nuestro equipo.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
