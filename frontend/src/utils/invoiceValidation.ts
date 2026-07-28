// Validaciones y scoring de confianza para campos de factura.
// Cada validación devuelve { ok: boolean, confianza: 0-1, aviso?: string }

import { nifValido } from './invoiceParser'

export interface ValidationResult {
  ok: boolean
  confianza: number // 0-1
  aviso?: string
}

// ---------------------------------------------------------------------------
// Validación de fecha
// ---------------------------------------------------------------------------

export function validarFecha(fecha: string | null): ValidationResult {
  if (!fecha) return { ok: false, confianza: 0, aviso: 'No se detectó fecha' }

  const m = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return { ok: false, confianza: 0, aviso: 'Formato de fecha inválido' }

  const [, year, month, day] = m.map(Number)
  const ahora = new Date()
  const fecha_obj = new Date(year, month - 1, day)

  // Validaciones básicas
  if (month < 1 || month > 12)
    return { ok: false, confianza: 0, aviso: 'Mes fuera de rango' }
  if (day < 1 || day > 31)
    return { ok: false, confianza: 0, aviso: 'Día fuera de rango' }
  if (year < 2000 || year > ahora.getFullYear() + 1)
    return { ok: false, confianza: 0.3, aviso: `Año ${year} parece incorrecto` }

  return { ok: true, confianza: 1 }
}

// ---------------------------------------------------------------------------
// Validación de NIF/CIF
// ---------------------------------------------------------------------------

export function validarNif(nif: string | null): ValidationResult {
  if (!nif) return { ok: false, confianza: 0, aviso: 'No se detectó NIF/CIF' }

  const limpioNif = nif.replace(/-/g, '').toUpperCase()

  // Debe tener formato básico
  if (!/^[A-Z0-9]{8,9}$/.test(limpioNif))
    return { ok: false, confianza: 0.2, aviso: 'Formato de NIF/CIF incorrecto' }

  // Validar letra de control
  const esValido = nifValido(limpioNif)
  if (!esValido)
    return { ok: false, confianza: 0.4, aviso: 'Letra de control de NIF inválida' }

  return { ok: true, confianza: 1 }
}

// ---------------------------------------------------------------------------
// Validación de número de factura
// ---------------------------------------------------------------------------

export function validarNumeroFactura(numero: string | null): ValidationResult {
  if (!numero)
    return { ok: false, confianza: 0.5, aviso: 'No se detectó número de factura' }

  const limpio = numero.replace(/[^\w\-/]/g, '').trim()
  if (limpio.length < 3 || limpio.length > 40)
    return { ok: false, confianza: 0.4, aviso: 'Número de factura sospechoso' }

  // Debe tener dígitos
  if (!/\d/.test(limpio))
    return { ok: false, confianza: 0.3, aviso: 'Número de factura sin dígitos' }

  return { ok: true, confianza: 0.9 }
}

// ---------------------------------------------------------------------------
// Validación de importe (base, cuota, total)
// ---------------------------------------------------------------------------

export function validarImporte(
  importe: number | null,
  minimo: number = 0.01,
  maximo: number = 999999.99
): ValidationResult {
  if (importe === null || importe === undefined)
    return { ok: false, confianza: 0, aviso: 'Importe no detectado' }

  if (importe < minimo || importe > maximo)
    return { ok: false, confianza: 0.2, aviso: `Importe fuera de rango (${minimo}-${maximo})` }

  // Verificar que no tiene demasiados decimales (las facturas tienen 2)
  const decimales = (importe.toString().split('.')[1] ?? '').length
  if (decimales > 3)
    return { ok: false, confianza: 0.5, aviso: 'Demasiados decimales en importe' }

  return { ok: true, confianza: 1 }
}

// ---------------------------------------------------------------------------
// Validación cruzada: total ≈ suma(bases + IVA)
// ---------------------------------------------------------------------------

export function validarConsistenciaFinanciera(
  total: number,
  bases: Array<{ base: number; cuota: number }>
): ValidationResult {
  const sumaCalculada = bases.reduce((s, l) => s + l.base + l.cuota, 0)
  const diferencia = Math.abs(total - sumaCalculada)
  const tolerancia = Math.max(0.05, total * 0.005) // 0.05 € o 0.5%, lo que sea mayor

  if (diferencia > tolerancia) {
    return {
      ok: false,
      confianza: 0.3,
      aviso: `Total (${total.toFixed(2)} €) no cuadra con bases+IVA (${sumaCalculada.toFixed(2)} €). Diferencia: ${diferencia.toFixed(2)} €`,
    }
  }

  return { ok: true, confianza: 1 }
}

// ---------------------------------------------------------------------------
// Validación de nombre de proveedor/cliente
// ---------------------------------------------------------------------------

export function validarNombre(nombre: string | null, confianzaExtractora: number = 0): ValidationResult {
  if (!nombre)
    return { ok: false, confianza: 0, aviso: 'No se detectó nombre de empresa' }

  if (nombre.length < 3)
    return { ok: false, confianza: 0.2, aviso: 'Nombre muy corto' }

  if (nombre.length > 200)
    return { ok: false, confianza: 0.3, aviso: 'Nombre muy largo' }

  // Debe tener principalmente letras (no puede ser "123" o un teléfono)
  const letras = (nombre.match(/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/g) ?? []).length
  if (letras < nombre.length * 0.4)
    return { ok: false, confianza: 0.4, aviso: 'Nombre sospechoso (pocos caracteres)' }

  // Penalizar nombres genéricos o muy cortos (posibles falsos positivos)
  const esGenerico = /^[a-z ]{1,15}$/i.test(nombre)
  const esCorto = nombre.length < 6

  // La confianza final es la mínima entre la confianza del extractor y nuestra validación
  let confianzaFinal = 0.9
  if (esGenerico || esCorto) confianzaFinal = 0.7

  confianzaFinal = Math.min(confianzaFinal, confianzaExtractora)

  return {
    ok: confianzaFinal > 0.5,
    confianza: Math.max(0, confianzaFinal),
    aviso: confianzaFinal < 0.75 ? 'Nombre de empresa con confianza media/baja' : undefined
  }
}

// ---------------------------------------------------------------------------
// Validación global: retorna true si la factura puede contabilizarse
// automáticamente sin revisión.
// ---------------------------------------------------------------------------

export function puedeContabilizarseAutomaticamente(validaciones: Record<string, ValidationResult>): {
  ok: boolean
  requiereRevision: boolean
  confianzaGlobal: 'alta' | 'media' | 'baja'
} {
  const campos_criticos = [
    'numeroFactura',
    'fecha',
    'nif',
    'total',
    'consistencia',
    'nombre', // EL NOMBRE ES CRÍTICO PARA LA CONTABILIZACIÓN
  ]

  let camposFallidos = 0
  let confianzaPromedio = 0
  let nombreOk = true

  for (const campo of campos_criticos) {
    const val = validaciones[campo]
    if (!val.ok) {
      camposFallidos++
      if (campo === 'nombre') nombreOk = false
    }
    confianzaPromedio += val.confianza
  }

  confianzaPromedio /= campos_criticos.length

  // CRÍTICO: Si el nombre falla validación o tiene confianza < 0.75, SIEMPRE requiere revisión
  const nombreTieneBajaConfianza = validaciones.nombre && validaciones.nombre.confianza < 0.75
  const requiereRevisionPorNombre = !nombreOk || nombreTieneBajaConfianza

  return {
    ok: camposFallidos === 0 && confianzaPromedio >= 0.85 && !requiereRevisionPorNombre,
    requiereRevision: camposFallidos > 0 || confianzaPromedio < 0.85 || requiereRevisionPorNombre,
    confianzaGlobal:
      confianzaPromedio >= 0.9 && !requiereRevisionPorNombre
        ? 'alta'
        : confianzaPromedio >= 0.75 && !nombreTieneBajaConfianza
          ? 'media'
          : 'baja',
  }
}
