// Modo IA del lector de facturas: envía el archivo (base64) al backend, que lo
// reenvía al extractor central de Conta API (Claude vision + lógica contable
// española unificada: clasificación venta/gasto, trimestre fiscal, carpeta
// sugerida, desglose de IVA, RETENCIONES y asientos sugeridos).
// El resultado se mapea a FacturaExtraida para reutilizar la misma UI y el
// mismo flujo de contabilización que el modo local (Tesseract).

import api from './api'
import { FacturaExtraida, LineaIva } from '../types/invoice'
import { ProgresoCallback } from './invoiceOcrService'

// Respuesta del extractor central (nuevo schema de Conta API)
interface InvoiceExtraction {
  document_type: 'invoice' | 'credit_note' | 'ticket'
  direction: 'income' | 'expense'
  confidence: number
  vendor: { name: string | null; tax_id: string | null; address: string | null; country: string }
  customer: { name: string | null; tax_id: string | null; address: string | null; country: string }
  invoice: {
    number: string | null
    series: string | null
    issue_date: string | null
    due_date: string | null
    original_number: string | null
  }
  amounts: {
    currency: string
    bases: Array<{ tax_rate: number; base_amount: number; tax_amount: number }>
    withholdings: Array<{ type: string; rate: number; amount: number }>
    subtotal: number
    tax_total: number
    withholding_total: number
    total_gross: number
    total_net: number
  }
  payment: { method: string | null; terms: string | null; iban: string | null }
  lines: Array<{ description: string | null; quantity: number; unit_price: number; line_total: number; tax_rate: number }>
  raw_text: string | null
  meta: { source_file_name: string | null; source_mime_type: string | null; pages: number }
  validation: {
    checks: {
      total_matches_bases_and_taxes: boolean
      tax_id_vendor_valid: boolean
      tax_id_customer_valid: boolean
      withholding_consistent: boolean
    }
    errors: string[]
  }
}

function archivoABase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const s = String(reader.result)
      resolve(s.slice(s.indexOf(',') + 1)) // quitar el prefijo data:...;base64,
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

function mapearAFactura(e: InvoiceExtraction): FacturaExtraida {
  // direction: 'income' (venta) → 'ingreso', 'expense' (gasto) → 'gasto'
  const direccion: 'ingreso' | 'gasto' = e.direction === 'income' ? 'ingreso' : 'gasto'
  const nombre = direccion === 'ingreso' ? e.customer.name : e.vendor.name
  const nif = direccion === 'ingreso' ? e.customer.tax_id : e.vendor.tax_id

  // Mapear bases de impuestos
  const bases: LineaIva[] = e.amounts.bases.map((b) => ({
    tipoIVA: b.tax_rate,
    base: b.base_amount,
    cuota: b.tax_amount,
    confianza: e.confidence,
  }))

  // Construir observaciones con validaciones y retenciones
  const observaciones: string[] = []

  // Validaciones fallidas
  if (!e.validation.checks.total_matches_bases_and_taxes) {
    observaciones.push('⚠️ Total no cuadra con bases e impuestos')
  }
  if (!e.validation.checks.tax_id_vendor_valid) {
    observaciones.push('⚠️ NIF/CIF del proveedor puede ser inválido')
  }
  if (!e.validation.checks.tax_id_customer_valid) {
    observaciones.push('⚠️ NIF/CIF del cliente puede ser inválido')
  }
  if (!e.validation.checks.withholding_consistent) {
    observaciones.push('⚠️ Retención inconsistente: tasa y cantidad no coinciden')
  }

  // Errores de validación
  if (e.validation.errors.length > 0) {
    observaciones.push(...e.validation.errors.map((err) => `✗ ${err}`))
  }

  // Retenciones detectadas
  if (e.amounts.withholdings.length > 0) {
    const retencion = e.amounts.withholdings[0]!
    observaciones.push(
      `Retención ${retencion.type} detectada: ${retencion.amount.toFixed(2)} € (${retencion.rate}%) - se contabiliza en ${direccion === 'ingreso' ? '473' : '4751'}`
    )
  }

  // Confianza global
  const confianzaMapeada: 'alta' | 'media' | 'baja' =
    e.confidence >= 0.9 ? 'alta' : e.confidence >= 0.7 ? 'media' : 'baja'

  // Requiere revisión si hay errores de validación o confianza baja
  const requiereRevision = e.validation.errors.length > 0 || !e.validation.checks.total_matches_bases_and_taxes || e.confidence < 0.8

  return {
    tipoDocumento: 'factura',
    direccion,
    numeroFactura: [e.invoice.series, e.invoice.number].filter(Boolean).join('-') || null,
    fecha: e.invoice.issue_date,
    entidad: { nombre, nif, confianza: e.confidence },
    bases,
    retencion: e.amounts.withholdings.length > 0
      ? { tipo: e.amounts.withholdings[0]!.rate, importe: e.amounts.withholdings[0]!.amount }
      : null,
    totalFactura: e.amounts.total_net || null,
    moneda: 'EUR',
    confianza: confianzaMapeada,
    requiereRevision,
    observaciones,
    textoExtraido: e.raw_text || '',
  }
}

export async function procesarFacturaIA(file: File, onProgreso: ProgresoCallback = () => {}): Promise<FacturaExtraida> {
  onProgreso('Preparando archivo…', 0.1)
  const archivoBase64 = await archivoABase64(file)

  onProgreso('Leyendo con IA (Claude)…', 0.4)
  const resp = await api.post('/admin/facturas/extraer-ia', {
    archivoBase64,
    nombre: file.name,
    mimeType: file.type || 'application/pdf',
  })

  onProgreso('Analizando resultado…', 0.9)
  // El backend devuelve ahora el nuevo schema de InvoiceExtraction directamente
  const extraccion: InvoiceExtraction | undefined = resp.data?.data || resp.data
  if (!extraccion) throw new Error('El extractor IA no devolvió datos')
  return mapearAFactura(extraccion)
}
