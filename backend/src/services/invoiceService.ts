// Servicio de contabilización de facturas OCR
// Maneja la persistencia de asientos contables en PostgreSQL

import { query } from '../db/connection'
import { FacturaExtraida, AsientoContable } from '../types/invoice'

/**
 * Crear asiento contable desde factura extraída por OCR.
 * Aplica reglas contables según dirección (ingreso/gasto).
 */
export function crearAsiento(factura: FacturaExtraida): AsientoContable {
  const { direccion, bases, totalFactura, entidad, fecha, numeroFactura, tipoDocumento, confianza, observaciones } = factura

  // Seleccionar cuenta principal según dirección
  let cuentaPrincipal: string
  if (direccion === 'ingreso') {
    // Ventas: elegir entre 700 (bienes) o 705 (servicios) según tipo
    cuentaPrincipal = tipoDocumento === 'recibo' ? '705' : '700'
  } else {
    // Compras: elegir entre 600 (bienes), 621 (servicios ext), 622 (otros)
    cuentaPrincipal = '600' // Default; en producción analizar descripción
  }

  // Crear líneas del asiento
  const lineas = bases.map((b) => ({
    cuenta: cuentaPrincipal,
    base: b.base,
    tipoIVA: b.tipoIVA,
    cuota: b.cuota,
    confianza: b.confianza,
  }))

  // Retención (IRPF u otra): línea propia con su cuenta específica.
  //  - Ingreso: 473 (HP retenciones y pagos a cuenta, nos la retiene el cliente)
  //  - Gasto:   4751 (HP acreedora por retenciones practicadas al proveedor)
  // En esta línea `base` guarda el IMPORTE retenido y `tipoIVA` el % de retención.
  if (factura.retencion && factura.retencion.importe > 0) {
    lineas.push({
      cuenta: direccion === 'ingreso' ? '473' : '4751',
      base: factura.retencion.importe,
      tipoIVA: factura.retencion.tipo ?? 0,
      cuota: 0,
      confianza: 0.9,
    })
  }

  // Crear asiento
  const asiento: AsientoContable = {
    id: `${direccion === 'ingreso' ? 'VENT' : 'COMP'}-${Date.now()}`,
    fecha: fecha!,
    descripcion: `${tipoDocumento} ${numeroFactura || 'sin número'}`,
    entidad: entidad.nombre,
    nif: entidad.nif,
    lineas,
    total: totalFactura!,
    moneda: 'EUR',
    direccion,
    confianza,
    observaciones,
  }

  return asiento
}

/**
 * Persistir asiento en PostgreSQL.
 * Inserta:
 * 1. Encabezado en asientos_contables
 * 2. Líneas en asiento_lineas
 * 3. Observaciones en asiento_observaciones
 */
export async function guardarAsiento(
  asiento: AsientoContable,
  usuarioId?: string
): Promise<{ id: string; ok: boolean }> {
  // Validar estructura
  if (!asiento.id || !asiento.fecha || !asiento.lineas.length || asiento.total <= 0) {
    throw new Error('Asiento inválido')
  }

  try {
    // 1. Insertar asiento principal
    const asientoResult = await query(
      `INSERT INTO asientos_contables
        (id, fecha, descripcion, entidad, nif, total, moneda, direccion, confianza, usuario_id, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        asiento.id,
        asiento.fecha,
        asiento.descripcion,
        asiento.entidad,
        asiento.nif,
        asiento.total,
        asiento.moneda,
        asiento.direccion,
        asiento.confianza,
        usuarioId || null,
        asiento.observaciones.join('\n'),
      ]
    )

    const asientoId = asientoResult.rows[0].id

    // 2. Insertar líneas
    for (const linea of asiento.lineas) {
      await query(
        `INSERT INTO asiento_lineas
          (asiento_id, cuenta, base, tipo_iva, cuota, confianza)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [asientoId, linea.cuenta, linea.base, linea.tipoIVA, linea.cuota, linea.confianza || 0.85]
      )
    }

    // 3. Insertar observaciones individuales (para búsqueda/filtrado)
    for (const obs of asiento.observaciones) {
      await query(`INSERT INTO asiento_observaciones (asiento_id, observacion) VALUES ($1, $2)`, [
        asientoId,
        obs,
      ])
    }

    console.log(`[invoiceService] Asiento guardado: ${asientoId}`)
    return { id: asientoId, ok: true }
  } catch (error) {
    console.error(`[invoiceService] Error al guardar asiento:`, error)
    throw new Error(`No se pudo guardar el asiento: ${error instanceof Error ? error.message : 'desconocido'}`)
  }
}

/**
 * Validar que la factura puede contabilizarse automáticamente.
 */
export function puedeContabilizarse(factura: FacturaExtraida): boolean {
  if (factura.requiereRevision) return false
  if (factura.confianza === 'baja') return false
  if (!factura.fecha || !factura.totalFactura || !factura.bases.length) return false
  return true
}

/**
 * Obtener asientos contables (con filtros opcionales)
 */
export async function obtenerAsientos(filtros?: {
  direccion?: 'ingreso' | 'gasto'
  estado?: string
  desde?: string
  hasta?: string
  nif?: string
}): Promise<AsientoContable[]> {
  let sql = 'SELECT * FROM asientos_contables WHERE 1=1'
  const params: any[] = []

  if (filtros?.direccion) {
    sql += ` AND direccion = $${params.length + 1}`
    params.push(filtros.direccion)
  }
  if (filtros?.estado) {
    sql += ` AND estado = $${params.length + 1}`
    params.push(filtros.estado)
  }
  if (filtros?.desde) {
    sql += ` AND fecha >= $${params.length + 1}`
    params.push(filtros.desde)
  }
  if (filtros?.hasta) {
    sql += ` AND fecha <= $${params.length + 1}`
    params.push(filtros.hasta)
  }
  if (filtros?.nif) {
    sql += ` AND nif = $${params.length + 1}`
    params.push(filtros.nif)
  }

  sql += ' ORDER BY fecha DESC LIMIT 100'

  const result = await query(sql, params)
  return result.rows
}

/**
 * Obtener detalle de un asiento con sus líneas
 */
export async function obtenerAsientoDetalle(asientoId: string): Promise<any> {
  const asientoResult = await query('SELECT * FROM asientos_contables WHERE id = $1', [asientoId])
  if (asientoResult.rows.length === 0) {
    throw new Error('Asiento no encontrado')
  }

  const lineasResult = await query('SELECT * FROM asiento_lineas WHERE asiento_id = $1', [asientoId])
  const obsResult = await query('SELECT * FROM asiento_observaciones WHERE asiento_id = $1', [asientoId])

  return {
    ...asientoResult.rows[0],
    lineas: lineasResult.rows,
    observaciones: obsResult.rows.map((r) => r.observacion),
  }
}
