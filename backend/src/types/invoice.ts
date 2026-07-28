// Tipos para el lector OCR de facturas - Backend
// Espejo del schema del frontend (frontend/src/types/invoice.ts)

export interface LineaIva {
  tipoIVA: number
  base: number
  cuota: number
  confianza: number
}

export interface EntidadComercial {
  nombre: string | null
  nif: string | null
  confianza: number
}

export interface FacturaExtraida {
  tipoDocumento: 'factura' | 'factura-simplificada' | 'recibo'
  direccion: 'ingreso' | 'gasto'

  numeroFactura: string | null
  fecha: string | null

  entidad: EntidadComercial

  bases: LineaIva[]
  /** Retención (IRPF u otra) si la factura la lleva: se contabiliza aparte (473/4751). */
  retencion?: { tipo: number | null; importe: number } | null
  totalFactura: number | null
  moneda: 'EUR'

  confianza: 'alta' | 'media' | 'baja'
  requiereRevision: boolean
  observaciones: string[]

  textoExtraido: string
}

export interface AsientoContable {
  id: string
  fecha: string
  descripcion: string
  entidad: string | null
  nif: string | null
  lineas: Array<{
    cuenta: string
    base: number
    tipoIVA: number
    cuota: number
    confianza?: number
  }>
  total: number
  moneda: 'EUR'
  direccion: 'ingreso' | 'gasto'
  confianza: 'alta' | 'media' | 'baja'
  observaciones: string[]
}
