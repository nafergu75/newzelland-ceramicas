'use client'

import React, { useState, useRef } from 'react'
import { procesarFactura } from '../../../services/invoiceOcrService'
import { procesarFacturaIA } from '../../../services/invoiceIaService'
import { FacturaExtraida } from '../../../types/invoice'
import api from '../../../services/api'

interface ArchivoEnProceso {
  id: string
  nombre: string
  estado: 'idle' | 'procesando' | 'ok' | 'error' | 'guardando' | 'guardado'
  mensaje: string
  progreso: number
  factura?: FacturaExtraida
  editando?: boolean
  datosEditados?: Partial<FacturaExtraida>
}

export default function InvoiceReader() {
  const [archivos, setArchivos] = useState<ArchivoEnProceso[]>([])
  const [arrastrando, setArrastrando] = useState(false)
  const [modoIA, setModoIA] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const actualizar = (id: string, cambios: Partial<ArchivoEnProceso>) => {
    setArchivos((prev) => prev.map((a) => (a.id === id ? { ...a, ...cambios } : a)))
  }

  const borrar = (id: string) => {
    setArchivos((prev) => prev.filter((a) => a.id !== id))
  }

  const editarCampo = (id: string, campo: keyof FacturaExtraida, valor: unknown) => {
    actualizar(id, {
      datosEditados: {
        ...(archivos.find((a) => a.id === id)?.datosEditados || {}),
        [campo]: valor,
      },
    })
  }

  const guardarFactura = async (id: string) => {
    const archivo = archivos.find((a) => a.id === id)
    if (!archivo?.factura) return

    const datosFinales = {
      ...archivo.factura,
      ...(archivo.datosEditados || {}),
    }

    actualizar(id, { estado: 'guardando', mensaje: 'Guardando en base de datos…', progreso: 0.5 })

    const fueEditada = archivo.datosEditados && Object.keys(archivo.datosEditados).length > 0

    try {
      const resp = await api.post('/admin/facturas/contabilizar', {
        ...datosFinales,
        direccion: datosFinales.direccion || 'gasto',
        // Al pulsar Guardar/Contabilizar el usuario ya ha revisado los datos:
        // esa ES la revisión manual que pedía el OCR
        requiereRevision: false,
        observaciones: [
          ...(datosFinales.observaciones || []),
          fueEditada ? 'Datos corregidos manualmente por el usuario' : 'Confirmado manualmente por el usuario',
        ],
      })

      actualizar(id, {
        estado: 'guardado',
        mensaje: `✓ Guardado con ID: ${resp.data.id}`,
        progreso: 1,
        editando: false,
      })
    } catch (err: unknown) {
      // Volver a 'ok' para que el usuario pueda corregir y reintentar
      const detalle =
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data
      actualizar(id, {
        estado: 'ok',
        mensaje: `✗ No se pudo guardar: ${detalle?.message || detalle?.error || (err instanceof Error ? err.message : 'error desconocido')}`,
        progreso: 1,
      })
    }
  }

  const procesarArchivos = (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setArchivos((prev) => [
        ...prev,
        { id, nombre: file.name, estado: 'procesando' as const, mensaje: 'En cola…', progreso: 0 },
      ])

      const procesar = modoIA
        ? procesarFacturaIA(file, (mensaje: string, progreso: number) => actualizar(id, { mensaje, progreso }))
        : procesarFactura(
            file,
            (mensaje: string, progreso: number) => actualizar(id, { mensaje, progreso }),
            'gasto'
          )

      procesar
        .then((factura) => {
          actualizar(id, { estado: 'ok', mensaje: '✓ Listo', progreso: 1, factura })
        })
        .catch((err: unknown) => {
          const detalle =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            (err instanceof Error ? err.message : 'Error al procesar')
          actualizar(id, { estado: 'error' as const, mensaje: detalle, progreso: 0 })
        })
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastrando(false)
    procesarArchivos(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastrando(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastrando(false)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔍 Lector OCR de Facturas</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        {modoIA
          ? 'Modo IA: la factura se envía al extractor contable central (Claude), que clasifica venta/gasto, desglosa IVA y detecta retenciones.'
          : 'Modo local: arrastra PDF, JPG, PNG o DOCX. Se procesan en tu navegador sin enviar a servidores externos.'}
      </p>

      {/* Selector de modo de lectura */}
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          padding: '8px 14px',
          borderRadius: '20px',
          border: `1px solid ${modoIA ? '#7b1fa2' : '#bbb'}`,
          backgroundColor: modoIA ? '#f3e5f5' : '#fafafa',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: modoIA ? '#7b1fa2' : '#555',
          userSelect: 'none',
        }}
      >
        <input
          type="checkbox"
          checked={modoIA}
          onChange={(e) => setModoIA(e.target.checked)}
          style={{ accentColor: '#7b1fa2' }}
        />
        ✨ Modo IA (extractor central Conta API)
      </label>

      {/* Zona drag & drop */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${arrastrando ? '#2196f3' : '#bbb'}`,
          backgroundColor: arrastrando ? '#e3f2fd' : '#fafafa',
          borderRadius: '10px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: '24px',
        }}
      >
        <p style={{ margin: '10px 0 4px', fontWeight: 600, color: '#333', fontSize: '16px' }}>
          📎 Arrastra aquí tus facturas o haz clic
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
          PDF · JPG · PNG · DOCX
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => procesarArchivos(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Lista de archivos procesados */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {archivos.map((archivo) => (
          <div
            key={archivo.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: '#fff',
            }}
          >
            {/* Encabezado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500', flex: 1 }}>{archivo.nombre}</span>
              <span
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor:
                    archivo.estado === 'ok' ? '#e8f5e9' : archivo.estado === 'error' ? '#ffebee' : '#f5f5f5',
                  color:
                    archivo.estado === 'ok' ? '#2e7d32' : archivo.estado === 'error' ? '#c62828' : '#666',
                  marginRight: '8px',
                }}
              >
                {archivo.estado === 'procesando' && `Leyendo (${Math.round(archivo.progreso * 100)}%)`}
                {archivo.estado === 'ok' && '✓ Listo'}
                {archivo.estado === 'error' && '✗ Error'}
                {archivo.estado === 'idle' && 'Pendiente'}
              </span>
              <button
                onClick={() => borrar(archivo.id)}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  backgroundColor: '#ffcdd2',
                  color: '#c62828',
                  border: '1px solid #ef5350',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef5350'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffcdd2'
                  e.currentTarget.style.color = '#c62828'
                }}
              >
                ✕ Borrar
              </button>
            </div>

            {/* Barra de progreso */}
            {archivo.estado === 'procesando' && (
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

            {/* Mensaje */}
            <p style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}>{archivo.mensaje}</p>

            {/* Datos extraídos y editables */}
            {archivo.factura && (
              <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ fontWeight: '600' }}>📋 Datos extraídos</span>
                  {archivo.estado === 'ok' && !archivo.editando && (
                    <button
                      onClick={() => actualizar(archivo.id, { editando: true })}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        backgroundColor: '#2196f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      ✏ Editar
                    </button>
                  )}
                </div>

                {/* Campo: Nº Factura */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                    <strong>Nº Factura:</strong>
                  </label>
                  {archivo.editando ? (
                    <input
                      type="text"
                      value={
                        archivo.datosEditados?.numeroFactura ?? archivo.factura.numeroFactura ?? ''
                      }
                      onChange={(e) => editarCampo(archivo.id, 'numeroFactura', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #bbb',
                        borderRadius: '3px',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <span>{archivo.factura.numeroFactura || '(no detectado)'}</span>
                  )}
                </div>

                {/* Campo: Fecha */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                    <strong>Fecha:</strong>
                  </label>
                  {archivo.editando ? (
                    <input
                      type="date"
                      value={archivo.datosEditados?.fecha ?? archivo.factura.fecha ?? ''}
                      onChange={(e) => editarCampo(archivo.id, 'fecha', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #bbb',
                        borderRadius: '3px',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <span>{archivo.factura.fecha || '(no detectada)'}</span>
                  )}
                </div>

                {/* Campo: Entidad */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                    <strong>Proveedor:</strong>
                  </label>
                  {archivo.editando ? (
                    <input
                      type="text"
                      value={
                        archivo.datosEditados?.entidad?.nombre ??
                        archivo.factura.entidad.nombre ??
                        ''
                      }
                      onChange={(e) =>
                        editarCampo(archivo.id, 'entidad', {
                          nombre: e.target.value,
                          nif: archivo.factura!.entidad.nif,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #bbb',
                        borderRadius: '3px',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <span>{archivo.factura.entidad.nombre || '(no detectada)'}</span>
                  )}
                </div>

                {/* Campo: NIF */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                    <strong>NIF/CIF:</strong>
                  </label>
                  {archivo.editando ? (
                    <input
                      type="text"
                      value={
                        archivo.datosEditados?.entidad?.nif ??
                        archivo.factura.entidad.nif ??
                        ''
                      }
                      onChange={(e) =>
                        editarCampo(archivo.id, 'entidad', {
                          nombre: archivo.factura!.entidad.nombre,
                          nif: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #bbb',
                        borderRadius: '3px',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <span>{archivo.factura.entidad.nif || '(sin NIF)'}</span>
                  )}
                </div>

                {/* Desglose de IVA */}
                {archivo.factura.bases && archivo.factura.bases.length > 0 && (
                  <div style={{ margin: '8px 0', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>📊 Desglose IVA:</strong>
                    {archivo.factura.bases.map((base, idx) => (
                      <div key={idx} style={{ marginLeft: '12px', fontSize: '12px', marginBottom: '4px' }}>
                        {archivo.editando ? (
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                            <input
                              type="number"
                              placeholder="Base"
                              value={base.base}
                              onChange={(e) => {
                                const newBases = [
                                  ...((archivo.datosEditados?.bases as typeof base[]) ||
                                    archivo.factura!.bases),
                                ]
                                newBases[idx] = { ...base, base: parseFloat(e.target.value) }
                                editarCampo(archivo.id, 'bases', newBases)
                              }}
                              style={{
                                flex: 1,
                                padding: '4px 6px',
                                fontSize: '11px',
                                border: '1px solid #bbb',
                                borderRadius: '3px',
                              }}
                            />
                            <input
                              type="number"
                              placeholder="IVA"
                              value={base.cuota}
                              onChange={(e) => {
                                const newBases = [
                                  ...((archivo.datosEditados?.bases as typeof base[]) ||
                                    archivo.factura!.bases),
                                ]
                                newBases[idx] = { ...base, cuota: parseFloat(e.target.value) }
                                editarCampo(archivo.id, 'bases', newBases)
                              }}
                              style={{
                                flex: 1,
                                padding: '4px 6px',
                                fontSize: '11px',
                                border: '1px solid #bbb',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                        ) : (
                          <p style={{ margin: '2px 0' }}>
                            Base {base.tipoIVA}%: {base.base.toFixed(2)} € | IVA: {base.cuota.toFixed(2)} €
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Retención (IRPF u otra) detectada */}
                {archivo.factura.retencion && (
                  <div
                    style={{
                      margin: '8px 0',
                      padding: '8px',
                      backgroundColor: '#ede7f6',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#4527a0',
                    }}
                  >
                    <strong>🧾 Retención{archivo.factura.retencion.tipo !== null ? ` ${archivo.factura.retencion.tipo}%` : ''}:</strong>{' '}
                    {archivo.factura.retencion.importe.toFixed(2)} € — se contabiliza en cuenta{' '}
                    {archivo.factura.direccion === 'ingreso' ? '473 (HP ret. soportadas)' : '4751 (HP ret. practicadas)'}
                  </div>
                )}

                {/* Campo: Total */}
                <div style={{ marginBottom: '8px', marginTop: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                    <strong>Total:</strong>
                  </label>
                  {archivo.editando ? (
                    <input
                      type="number"
                      step="0.01"
                      value={
                        archivo.datosEditados?.totalFactura ?? archivo.factura.totalFactura ?? 0
                      }
                      onChange={(e) =>
                        editarCampo(archivo.id, 'totalFactura', parseFloat(e.target.value))
                      }
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #bbb',
                        borderRadius: '3px',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <span>
                      {archivo.factura.totalFactura
                        ? `${archivo.factura.totalFactura.toFixed(2)} €`
                        : '(no detectado)'}
                    </span>
                  )}
                </div>

                {/* Confianza y Observaciones */}
                <p style={{ margin: '8px 0 4px 0' }}>
                  <strong>Confianza:</strong>{' '}
                  <span
                    style={{
                      color:
                        archivo.factura.confianza === 'alta'
                          ? '#2e7d32'
                          : archivo.factura.confianza === 'media'
                            ? '#f57f17'
                            : '#c62828',
                    }}
                  >
                    {archivo.factura.confianza}
                  </span>
                </p>
                {archivo.factura.observaciones.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff8e1', borderRadius: '4px' }}>
                    <strong style={{ color: '#795548' }}>⚠ Observaciones:</strong>
                    {archivo.factura.observaciones.map((obs, i) => (
                      <p key={i} style={{ margin: '4px 0', color: '#795548', fontSize: '12px' }}>
                        • {obs}
                      </p>
                    ))}
                  </div>
                )}

                {/* Botones de acción */}
                {archivo.estado === 'ok' && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    {archivo.editando ? (
                      <>
                        <button
                          onClick={() => actualizar(archivo.id, { editando: false, datosEditados: {} })}
                          style={{
                            flex: 1,
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#999',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => guardarFactura(archivo.id)}
                          style={{
                            flex: 1,
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          💾 Guardar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => guardarFactura(archivo.id)}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          fontSize: '12px',
                          backgroundColor: '#4caf50',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        💾 Contabilizar
                      </button>
                    )}
                  </div>
                )}

                {archivo.estado === 'guardando' && (
                  <div
                    style={{
                      marginTop: '12px',
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#eee',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${archivo.progreso * 100}%`,
                        height: '100%',
                        backgroundColor: '#2196f3',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                )}

                {archivo.estado === 'guardado' && (
                  <p style={{ marginTop: '12px', color: '#2e7d32', fontSize: '12px' }}>
                    ✓ {archivo.mensaje}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {archivos.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999', fontSize: '14px', marginTop: '40px' }}>
          Arrastra archivos aquí para comenzar
        </div>
      )}
    </div>
  )
}
