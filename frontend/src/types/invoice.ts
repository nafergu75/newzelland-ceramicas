// Estructura normalizada de una factura extraída por OCR.
// Schema compatible con AEAT (facturas españolas).

export interface LineaIva {
  tipoIVA: number // 21, 10, 4...
  base: number
  cuota: number
  confianza: number // 0-1, basada en coincidencia de patrón y validación
}

export interface EntidadComercial {
  nombre: string | null
  nif: string | null
  confianza: number // 0-1
}

export interface FacturaExtraida {
  tipoDocumento: 'factura' | 'factura-simplificada' | 'recibo'
  direccion: 'ingreso' | 'gasto' // ingreso = factura emitida (venta), gasto = factura recibida (compra)

  numeroFactura: string | null
  fecha: string | null // ISO yyyy-mm-dd

  // Para ingresos: cliente que compra
  // Para gastos: proveedor que vende
  entidad: EntidadComercial

  bases: LineaIva[]
  /** Retención (IRPF u otra) si la factura la lleva: se contabiliza aparte (473/4751). */
  retencion?: { tipo: number | null; importe: number } | null
  totalFactura: number | null
  moneda: 'EUR'

  // Control de calidad
  confianza: 'alta' | 'media' | 'baja' // confianza global del documento
  requiereRevision: boolean // true si algún campo crítico tiene confianza baja o no cuadra
  observaciones: string[] // avisos y validaciones fallidas

  // Metadatos
  textoExtraido: string
}

export type EstadoProceso =
  | { fase: 'idle' }
  | { fase: 'leyendo'; mensaje: string; progreso: number } // progreso 0-1
  | { fase: 'ok'; factura: FacturaExtraida }
  | { fase: 'error'; mensaje: string }

// Estado que se guarda si el usuario no contabiliza inmediatamente
// (para permitir correcciones manuales)
export interface FacturaEnRevision extends FacturaExtraida {
  camposCorregidos: Set<keyof FacturaExtraida>
}
