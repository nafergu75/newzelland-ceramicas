import { useMemo } from 'react'
import { getAllSeriesNames, groupPackingBySeriesName, packingData } from '../data/packing'
import '../styles/components.css'

export default function PackingPage() {
  const seriesNames = useMemo(() => getAllSeriesNames(), [])
  const packingBySeriesName = useMemo(() => groupPackingBySeriesName(), [])

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

      {/* Tablas de Packing por Serie */}
      <section style={{ padding: '60px 20px', flex: 1, backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {seriesNames.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>
              No hay datos de packing disponibles.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
              {seriesNames.map((seriesName) => {
                const specs = packingBySeriesName.get(seriesName) || []
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

                    {/* Tabla responsiva */}
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
                            <th
                              style={{
                                padding: '16px',
                                textAlign: 'left',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: '600',
                                color: 'var(--color-gray-700)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
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
