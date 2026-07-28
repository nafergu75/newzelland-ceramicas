'use client'

import React, { useState } from 'react'
import { procesarFactura } from '../../../services/invoiceOcrService'
import { FacturaExtraida } from '../../../types/invoice'

interface ArchivoFactura {
  id: string
  file: File
  estado: 'idle' | 'leyendo' | 'ok' | 'error'
  mensaje: string
  progreso: number
  factura: FacturaExtraida | null
}

export default function InvoiceExpenseReader() {
  const [archivos, setArchivos] = useState<ArchivoFactura[]>([])

  const agregarArchivos = async (files: FileList | null) => {
    if (!files) return
    const nuevos: ArchivoFactura[] = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      estado: 'idle' as const,
      mensaje: '',
      progreso: 0,
      factura: null,
    }))
    setArchivos((prev) => [...prev, ...nuevos])
    for (const arch of nuevos) {
      procesarUnArch(arch.id)
    }
  }

  const procesarUnArch = async (id: string) => {
    setArchivos((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, estado: 'leyendo' as const, progreso: 0 } : a
      )
    )

    const arch = archivos.find((a) => a.id === id)
    if (!arch) return

    try {
      const factura = await procesarFactura(
        arch.file,
        (_msg: string, prog: number) => {
          setArchivos((prev) =>
            prev.map((a) => (a.id === id ? { ...a, progreso: prog } : a))
          )
        },
        'gasto'
      )

      setArchivos((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                estado: 'ok' as const,
                factura,
                progreso: 1,
                mensaje: factura.requiereRevision ? '⚠ Requiere revisión' : '✓ Listo',
              }
            : a
        )
      )
    } catch (e) {
      setArchivos((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                estado: 'error' as const,
                mensaje: e instanceof Error ? e.message : 'Error desconocido',
              }
            : a
        )
      )
    }
  }

  const editarCampo = (
    id: string,
    cambios: Partial<FacturaExtraida>
  ) => {
    setArchivos((prev) =>
      prev.map((a) =>
        a.id === id && a.factura
          ? { ...a, factura: { ...a.factura, ...cambios } }
          : a
      )
    )
  }

  const contabilizar = async (id: string) => {
    const arch = archivos.find((a) => a.id === id)
    if (!arch?.factura) return

    try {
      const res = await fetch('/api/admin/facturas/contabilizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arch.factura),
      })
      if (!res.ok) throw new Error(`Error: ${res.status}`)
      alert('✓ Factura contabilizada correctamente')
      setArchivos((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      alert(`Error al contabilizar: ${e instanceof Error ? e.message : 'desconocido'}`)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lector de Gastos (Facturas Recibidas)</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Arrastra aquí PDF, imágenes o documentos de facturas de proveedores.
      </p>

      {/* Drag & drop */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          agregarArchivos(e.dataTransfer.files)
        }}
        style={{
          border: '2px dashed #bbb',
          borderRadius: '8px',
          padding: '30px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#fafafa',
          marginBottom: '20px',
        }}
      >
        <input
          type="file"
          multiple
          onChange={(e) => agregarArchivos(e.target.files)}
          style={{ display: 'none' }}
          id="fileInput"
        />
        <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
            📎 Arrastra archivos aquí o haz clic
          </p>
        </label>
      </div>

      {/* Lista de archivos */}
      {archivos.map((archivo) => (
        <div
          key={archivo.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              {archivo.file.name}
            </span>
            <span
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor:
                  archivo.estado === 'ok'
                    ? '#e8f5e9'
                    : archivo.estado === 'error'
                      ? '#ffebee'
                      : '#f5f5f5',
                color:
                  archivo.estado === 'ok'
                    ? '#2e7d32'
                    : archivo.estado === 'error'
                      ? '#c62828'
                      : '#666',
              }}
            >
              {archivo.estado === 'leyendo' && `Leyendo (${Math.round(archivo.progreso * 100)}%)`}
              {archivo.estado === 'ok' && '✓ Listo'}
              {archivo.estado === 'error' && '✗ Error'}
              {archivo.estado === 'idle' && 'Pendiente'}
            </span>
          </div>

          {/* Barra de progreso */}
          {archivo.estado === 'leyendo' && (
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#eee',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: `${archivo.progreso * 100}%`,
                  height: '100%',
                  backgroundColor: '#4caf50',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          )}

          {/* Errores */}
          {archivo.estado === 'error' && (
            <p style={{ marginTop: '10px', color: '#c62828', fontSize: '13px' }}>
              {archivo.mensaje}
            </p>
          )}

          {/* Resultado editable */}
          {archivo.estado === 'ok' && archivo.factura && (
            <div style={{ marginTop: '16px' }}>
              {archivo.factura.observaciones.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#fff8e1',
                    border: '1px solid #ffe082',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    fontSize: '13px',
                    color: '#795548',
                  }}
                >
                  {archivo.factura.observaciones.map((o: string, i: number) => (
                    <div key={i}>• {o}</div>
                  ))}
                </div>
              )}

              {/* Etiqueta de dirección */}
              <div
                style={{
                  backgroundColor: '#f3e5f5',
                  border: '1px solid #ce93d8',
                  borderRadius: '4px',
                  padding: '8px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: '#6a1b9a',
                }}
              >
                📥 Gasto | {archivo.factura.tipoDocumento}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                    Nº factura
                  </label>
                  <input
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    value={archivo.factura.numeroFactura ?? ''}
                    onChange={(e) =>
                      editarCampo(archivo.id, { numeroFactura: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                    Fecha
                  </label>
                  <input
                    type="date"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    value={archivo.factura.fecha ?? ''}
                    onChange={(e) => editarCampo(archivo.id, { fecha: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                    Proveedor
                  </label>
                  <input
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    value={archivo.factura.entidad.nombre ?? ''}
                    onChange={(e) =>
                      editarCampo(archivo.id, {
                        entidad: { ...archivo.factura!.entidad, nombre: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                    NIF/CIF
                  </label>
                  <input
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    value={archivo.factura.entidad.nif ?? ''}
                    onChange={(e) =>
                      editarCampo(archivo.id, {
                        entidad: { ...archivo.factura!.entidad, nif: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                    Total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    value={archivo.factura.totalFactura ?? ''}
                    onChange={(e) =>
                      editarCampo(archivo.id, { totalFactura: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                    Confianza
                  </label>
                  <div
                    style={{
                      padding: '8px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color:
                        archivo.factura.confianza === 'alta'
                          ? '#2e7d32'
                          : archivo.factura.confianza === 'media'
                            ? '#f57c00'
                            : '#c62828',
                    }}
                  >
                    {archivo.factura.confianza}
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => contabilizar(archivo.id)}
                  disabled={archivo.factura.requiereRevision}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: archivo.factura.requiereRevision ? '#ccc' : '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: archivo.factura.requiereRevision ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  ✓ Contabilizar
                </button>
                <button
                  onClick={() => setArchivos((prev) => prev.filter((a) => a.id !== archivo.id))}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  ✕ Descartar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
