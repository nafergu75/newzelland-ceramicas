import raw from './tarifa-productos.json'

export interface TarifaProducto {
  id: string
  formato: string
  serie: string
  metros_por_caja: number
  precio_coste_m2: number
  precio_venta_m2: number
  precio_coste_caja: number
  precio_venta_caja: number
  margen_euros: number
  margen_porcentaje: number
}

const tarifa: TarifaProducto[] = (raw as { productos: TarifaProducto[] }).productos

/** Busca precio por caja para una serie + formato exactos (comparación case-insensitive). */
export function getTarifaProducto(serieNombre: string, formato: string): TarifaProducto | undefined {
  const serieNorm = serieNombre.trim().toUpperCase()
  const formatoNorm = formato.trim().toUpperCase()
  return tarifa.find(
    (p) => p.serie.trim().toUpperCase() === serieNorm && p.formato.trim().toUpperCase() === formatoNorm
  )
}

/** Todos los formatos de una serie que tienen precio por caja disponible, en el orden del catálogo. */
export function getFormatosConTarifa(serieNombre: string, formatos: string[]): TarifaProducto[] {
  return formatos
    .map((formato) => getTarifaProducto(serieNombre, formato))
    .filter((p): p is TarifaProducto => p !== undefined)
}

/**
 * Desglose de precios con IVA 21%.
 * Los precios en tarifa.json son BRUTOS (con IVA incluido).
 * Esta función calcula el neto: bruto / 1.21
 */
const round2 = (n: number) => Math.round(n * 100) / 100

export function desglosarPreciosConIVA(precioBruto: number) {
  const precioNeto = round2(precioBruto / 1.21)
  const iva = round2(precioBruto - precioNeto)
  return { precioNeto, iva, precioBruto }
}
