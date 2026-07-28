import { FacturaExtraida, LineaIva } from '../types/invoice'
import { validarFecha, validarNif, validarNumeroFactura, validarImporte, validarConsistenciaFinanciera, validarNombre, puedeContabilizarseAutomaticamente } from './invoiceValidation'

// ---------------------------------------------------------------------------
// Helpers numéricos: las facturas españolas usan "1.234,56" pero el OCR
// puede devolver "1234.56" o incluso "1 234,56". Normalizamos todo a Number.
// ---------------------------------------------------------------------------

export function parseImporte(raw: string): number | null {
  let s = raw.replace(/[€\s]/g, '').replace(/EUR/i, '')
  if (!s) return null
  const hasComma = s.includes(',')
  const hasDot = s.includes('.')
  if (hasComma && hasDot) {
    // El último separador es el decimal
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.')
    } else {
      s = s.replace(/,/g, '')
    }
  } else if (hasComma) {
    // "1234,56" → coma decimal; "1,234" con 3 decimales es dudoso, asumimos decimal
    s = s.replace(/,/g, '.')
  } else if (hasDot) {
    // "1.234" → si hay exactamente 3 dígitos tras el punto, es separador de miles
    const m = s.match(/^\d{1,3}(\.\d{3})+$/)
    if (m) s = s.replace(/\./g, '')
  }
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}

const RE_NUM = /\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})|\d+(?:[.,]\d{1,2})?/g

function numerosEnLinea(linea: string): number[] {
  const out: number[] = []
  const matches = linea.match(RE_NUM) ?? []
  for (const m of matches) {
    // descartamos porcentajes sueltos tipo "21" si van pegados a %
    const n = parseImporte(m)
    if (n !== null) out.push(n)
  }
  return out
}

// ---------------------------------------------------------------------------
// NIF / CIF español
// ---------------------------------------------------------------------------

const RE_NIF = /\b(?:[A-HJNP-SUVW]-?\d{7}-?[0-9A-J]|\d{8}-?[A-Z]|[XYZ]-?\d{7}-?[A-Z])\b/g

const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE'

// Valida la letra/dígito de control de un DNI, NIE o CIF español.
export function nifValido(nif: string): boolean {
  const s = nif.replace(/-/g, '').toUpperCase()
  // DNI: 8 dígitos + letra
  let m = s.match(/^(\d{8})([A-Z])$/)
  if (m) return LETRAS_DNI[Number(m[1]) % 23] === m[2]
  // NIE: X/Y/Z + 7 dígitos + letra
  m = s.match(/^([XYZ])(\d{7})([A-Z])$/)
  if (m) {
    const num = Number({ X: '0', Y: '1', Z: '2' }[m[1] as 'X' | 'Y' | 'Z'] + m[2])
    return LETRAS_DNI[num % 23] === m[3]
  }
  // CIF: letra + 7 dígitos + control (dígito o letra según entidad)
  m = s.match(/^([A-HJNP-SUVW])(\d{7})([0-9A-J])$/)
  if (m) {
    const digitos = m[2]
    let suma = 0
    for (let i = 0; i < 7; i++) {
      const d = Number(digitos[i])
      if (i % 2 === 0) {
        const doble = d * 2
        suma += doble > 9 ? doble - 9 : doble
      } else {
        suma += d
      }
    }
    const control = (10 - (suma % 10)) % 10
    return m[3] === String(control) || m[3] === 'JABCDEFGHI'[control]
  }
  return false
}

// Empresas del propio grupo: en un gasto el proveedor nunca es una de ellas,
// y en un ingreso el cliente tampoco. Solo se usan como último recurso.
const RE_EMPRESA_PROPIA = /NEWZEL|IFEVAL/i
// B98492259 = NEWZELAND CENTER S.L. · B98630270 = IFEVAL INVERSIONES S.L.
const NIFS_PROPIOS = new Set(['B98492259', 'B98630270'])

export function extraerNif(texto: string): string | null {
  const candidatos: string[] = []
  // Prioridad: NIF que aparezca cerca de la palabra clave NIF/CIF.
  // Se admite el prefijo de país "ES" (habitual en facturas intracomunitarias).
  const conClave = texto.matchAll(
    /(?:N\.?I\.?F\.?|C\.?I\.?F\.?)(?:\s*\/\s*N\.?I\.?F\.?)?\s*[:.\-]?\s*(?:ES)?((?:[A-HJNP-SUVW]-?\d{7}-?[0-9A-J]|\d{8}-?[A-Z]|[XYZ]-?\d{7}-?[A-Z]))/gi
  )
  for (const m of conClave) candidatos.push(m[1].replace(/-/g, '').toUpperCase())
  // NIF con prefijo ES en cualquier parte del texto
  for (const m of texto.toUpperCase().matchAll(/\bES([A-HJNP-SUVW]\d{7}[0-9A-J]|\d{8}[A-Z]|[XYZ]\d{7}[A-Z])\b/g)) {
    candidatos.push(m[1])
  }
  for (const m of texto.toUpperCase().match(RE_NIF) ?? []) {
    candidatos.push(m.replace(/-/g, ''))
  }
  if (candidatos.length === 0) return null
  // Preferimos NIF con letra de control correcta (descarta falsos positivos del
  // OCR, teléfonos y referencias) y que no sea de una empresa propia: la
  // contraparte de la factura es siempre la otra empresa.
  const validoAjeno = candidatos.find((c) => nifValido(c) && !NIFS_PROPIOS.has(c))
  const valido = candidatos.find((c) => nifValido(c))
  return validoAjeno ?? valido ?? candidatos[0]
}

// ---------------------------------------------------------------------------
// Fecha de emisión
// ---------------------------------------------------------------------------

const MESES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
}

function aIso(d: number, m: number, y: number): string | null {
  if (y < 100) y += y > 50 ? 1900 : 2000
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function extraerFecha(texto: string): string | null {
  // 1) Cerca de la palabra "fecha"
  const zona = texto.match(/fecha[^\n]{0,40}/i)?.[0] ?? ''
  for (const bloque of [zona, texto]) {
    const num = bloque.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/)
    if (num) {
      const iso = aIso(Number(num[1]), Number(num[2]), Number(num[3]))
      if (iso) return iso
    }
    const largo = bloque.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+(?:de\s+)?(\d{4})/i)
    if (largo) {
      const mes = MESES[largo[2].toLowerCase()]
      if (mes) {
        const iso = aIso(Number(largo[1]), mes, Number(largo[3]))
        if (iso) return iso
      }
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Número de factura
// ---------------------------------------------------------------------------

export function extraerNumeroFactura(texto: string, nif?: string | null): string | null {
  const patrones = [
    /n[ºo°.]?\s*(?:de\s*)?factura\s*[:#.\-]?\s*([A-Z0-9][\w\/\-.]{0,24})/i,
    /n[uú]m(?:ero)?\.?\s*(?:de\s*)?factura\s*[:#.\-]?\s*([A-Z0-9][\w\/\-.]{0,24})/i,
    /factura\s*(?:n[ºo°.]?|num\.?|número)\s*(?:de\s*)?(?:factura\s*)?[:#.\-]?\s*([A-Z0-9][\w\/\-.]{0,24})/i,
    /(?:factura|fra\.?)\s*[:#]\s*([A-Z0-9][\w\/\-.]{0,24})/i,
    /invoice\s*(?:no\.?|number)?\s*[:#]?\s*([A-Z0-9][\w\/\-.]{0,24})/i,
    /referencia\s*(?:de\s*)?factura\s*[:#.\-]?\s*([A-Z0-9][\w\/\-.]{0,24})/i,
    /\bfra\.?\s+([A-Z]?\d[\w\/\-.]{0,24})/i,
    // "FACTURA A-123" / "Factura 2026/044" sin separador explícito
    /factura\s+(?:simplificada\s+|rectificativa\s+)?([A-Z]{0,3}[-\/]?\d[\w\/\-.]{0,24})\b/i,
    // "FACTURA: FECHA:" con los valores en la línea siguiente (cabecera en columnas)
    /factura\s*:\s*(?:fecha\s*:?\s*)?\n\s*([A-Za-z]{0,4}[_\-\/]?\d[\w\/\-.]{2,24})/i,
  ]
  for (const re of patrones) {
    const m = texto.match(re)
    if (m) {
      const cand = m[1].replace(/[.,;:]+$/, '')
      // Debe contener al menos un dígito y no ser una palabra tipo "SIMPLIFICADA"
      if (/\d/.test(cand) && !/^(19|20)\d{2}$/.test(cand)) return cand
    }
  }

  // Fallback: en muchas facturas el número va en la misma línea que la fecha
  // ("9001019276 | 16.04.2026") sin la palabra "factura" cerca. Buscamos un
  // número largo (7-12 dígitos) en una línea que contenga una fecha, evitando
  // códigos postales (5 dígitos), EAN (13) y el propio NIF.
  const digitosNif = nif ? nif.replace(/\D/g, '') : ''
  for (const linea of texto.split('\n')) {
    if (!/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/.test(linea)) continue
    const sinFecha = linea.replace(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/g, ' ')
    const m = sinFecha.match(/\b(\d{7,12})\b/)
    if (m && m[1] !== digitosNif) return m[1]
  }
  return null
}

// ---------------------------------------------------------------------------
// Nombre del proveedor (heurístico; siempre editable en la UI)
// ---------------------------------------------------------------------------

const RE_SOCIEDAD = /\b(S\.?L\.?U?|S\.?A\.?U?|S\.?C\.?P?|C\.?B\.?|S\.?L\.?L\.?|COOP\.?)\s*$/i

// Descarta líneas que no pueden ser un nombre: teléfonos, emails, webs,
// direcciones o cadenas casi sin letras (falsos positivos habituales del OCR).
// Texto legal repetido en los márgenes de las facturas ("inscrita en el
// Registro Mercantil…", "precios según legislación vigente…") que el OCR suele
// leer antes que el nombre real de la empresa.
const RE_BOILERPLATE =
  /precios\s+aplicados|legislaci[oó]n|registro\s+mercantil|inscrit[ao]|rogamos|mercanc[ií]a|envases|condiciones\s+de|forma\s+de\s+pago|medio\s+de\s+pago|domicilio\s+|c[oó]d\.|cta\.?\s*banc|iban\b|vencimiento|entrega\s+de|\bcod\b|art[ií]culo|\bprecio\b|\bimporte\b|cantidad|transferencia|\bbanco\b|santander|bbva|caixabank|la\s+caixa|sabadell|bankinter|unicaja|abanca|cajamar|kutxabank/i

function esNombrePlausible(l: string): boolean {
  if (l.length < 5 || l.length > 70) return false
  if (/^\d{4,5}\s/.test(l)) return false // código postal + población
  if (/@|www\.|https?:|\.com|\.es\b/i.test(l)) return false
  if (/\+?\d[\d\s.\-]{7,}/.test(l)) return false // teléfono
  if (/^(?:C\/|C\\|Calle|Avda\.?|Avenida|Plaza|Pza\.?|Pol[íi]gono|Apdo\.?|CP\s)/i.test(l)) return false
  if (/tel[eé]?f?\.?|fax|correo/i.test(l)) return false
  if (/factura|fecha|n[ºo°]\s|p[áa]gina/i.test(l)) return false
  if (RE_BOILERPLATE.test(l)) return false
  const letras = (l.match(/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/g) ?? []).length
  return letras >= l.length * 0.5 && letras >= 5
}

export function extraerNombreProveedor(texto: string, nif: string | null): { nombre: string | null; confianza: number; metodo: string } {
  const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean)

  // La contraparte nunca es una empresa del propio grupo; si solo aparece una
  // propia se devuelve al final con confianza baja para que el usuario corrija.
  let candidatoPropio: { nombre: string; confianza: number; metodo: string } | null = null
  const resultado = (nombre: string, confianza: number, metodo: string) => {
    if (RE_EMPRESA_PROPIA.test(nombre)) {
      if (!candidatoPropio) candidatoPropio = { nombre, confianza: 0.5, metodo: metodo + '-empresa-propia' }
      return null
    }
    return { nombre, confianza, metodo }
  }

  // 1) PRIORIDAD MÁXIMA: Línea que contiene clave + nombre + NIF cercanos
  // Busca patrones como "Empresa: NOMBRE NIF: XXX"
  const conClavesYNif = texto.match(/(?:Empresa|Razón\s+Social|Proveedor|Remitente|Cedente|Emitente)\s*[:.]?\s*([^"\n]*?)(?:\s+(?:NIF|CIF|N\.?I\.?F\.?|C\.?I\.?F\.?))/i)
  if (conClavesYNif) {
    const nombre = conClavesYNif[1].trim()
    if (nombre && esNombrePlausible(nombre)) {
      const r = resultado(nombre, 0.98, 'palabra-clave-con-nif')
      if (r) return r
    }
  }

  // 2) ALTA PRIORIDAD: Línea con forma societaria (S.L., S.A., etc.)
  for (const l of lineas.slice(0, 25)) {
    if (RE_SOCIEDAD.test(l) && esNombrePlausible(l)) {
      const r = resultado(l, 0.95, 'forma-societaria')
      if (r) return r
    }
  }

  // 2b) Nombre en MAYÚSCULAS + forma societaria incrustado en una línea con más
  // texto (habitual cuando el OCR mezcla columnas): "…de DAMM GLOBAL BARCELONA, S.L.U…"
  const reInline = /\b([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9&'\-]*(?:\s+[A-ZÁÉÍÓÚÑ0-9&'\-]{2,}){0,5})[,\s]+(S[.,]\s?L[.,]?\s?(?:U[.,]?)?|SLU?|S[.,]\s?A[.,]?\s?(?:U[.,]?)?|SL{1,2}\b|COOP\.?)(?=\s|$|[^\w])/g
  for (const m of texto.matchAll(reInline)) {
    const cuerpo = m[1].trim()
    const sufijo = m[2].replace(/,/g, '.').replace(/\s/g, '').toUpperCase()
    if (cuerpo.length < 4 || !/[A-ZÁÉÍÓÚÑ]{3}/.test(cuerpo)) continue
    if (RE_BOILERPLATE.test(cuerpo) || /factura|proforma|cliente|total/i.test(cuerpo)) continue
    const nombre = `${cuerpo} ${sufijo}`
    const r = resultado(nombre, 0.9, 'forma-societaria-inline')
    if (r) return r
  }

  // 3) ALTA PRIORIDAD: Línea inmediatamente anterior al NIF (usual en facturas)
  if (nif) {
    const nifLimpio = nif.replace(/-/g, '').toUpperCase()
    const idx = lineas.findIndex((l) => l.replace(/-/g, '').toUpperCase().includes(nifLimpio))
    if (idx > 0) {
      const anterior = lineas[idx - 1]
      if (anterior && esNombrePlausible(anterior) && anterior.length >= 8) {
        const r = resultado(anterior, 0.92, 'linea-antes-nif')
        if (r) return r
      }
    }
    if (idx >= 0 && idx < lineas.length - 1) {
      const siguiente = lineas[idx + 1]
      if (siguiente && esNombrePlausible(siguiente) && siguiente.length >= 8) {
        const r = resultado(siguiente, 0.88, 'linea-despues-nif')
        if (r) return r
      }
    }
  }

  // 4) PRIORIDAD MEDIA: Palabra clave "Empresa", "Razón Social", etc. sin NIF
  const conClaves = texto.match(/(?:Empresa|Razón\s+Social|Proveedor|Remitente|Cedente|Emitente)\s*[:.]?\s*([^\n]*?)(?:\n|$)/i)
  if (conClaves) {
    const nombre = conClaves[1].trim().split(/[,;]/)[0].trim()
    if (nombre && esNombrePlausible(nombre)) {
      const r = resultado(nombre, 0.85, 'palabra-clave')
      if (r) return r
    }
  }

  // 5) Una empresa propia con forma societaria es mejor candidata que una
  // "primera línea plausible" cualquiera (facturas internas entre empresas del
  // grupo). Confianza baja para forzar revisión manual.
  if (candidatoPropio) return candidatoPropio

  // 6) PRIORIDAD BAJA: Primera línea "con pinta de nombre" en encabezado
  for (const l of lineas.slice(0, 10)) {
    if (esNombrePlausible(l) && !/\d{2}[\/\-]\d{2}/.test(l) && l.length >= 8) {
      const r = resultado(l, 0.7, 'primera-linea')
      if (r) return r
    }
  }

  return { nombre: null, confianza: 0, metodo: 'no-encontrado' }
}

// ---------------------------------------------------------------------------
// Bases imponibles, tipos de IVA y cuotas
// ---------------------------------------------------------------------------

const TIPOS_IVA_VALIDOS = [21, 10, 5, 4, 7.5, 2, 0]

function aproximado(a: number, b: number, tol = 0.03): boolean {
  return Math.abs(a - b) <= Math.max(tol, b * 0.015)
}

export function extraerLineasIva(texto: string): LineaIva[] {
  const lineas = texto.split('\n')
  const encontradas: LineaIva[] = []

  const pushSinDuplicar = (l: LineaIva, confianza = 0.85) => {
    const dup = encontradas.find(
      (e) => e.tipoIVA === l.tipoIVA && aproximado(e.base, l.base)
    )
    if (!dup) encontradas.push({ ...l, confianza })
  }

  // ========================================================================
  // ESTRATEGIA 1: Patrones específicos de facturas españolas
  // ========================================================================

  // Patrón 1a: "Base Imponible X" + "Tipo IVA XX" + "Cuota IVA Y"
  // Estructura común en facturas españolas (pueden estar en tabla o en líneas)
  const basePattern = /base\s+imponible\s*([\d.,]+)/i
  const tipoPattern = /tipo\s+iva\s*([\d.,]+)/i
  const cuotaPattern = /cuota\s+iva\s*([\d.,]+)/i

  const mBase = texto.match(basePattern)
  const mTipo = texto.match(tipoPattern)
  const mCuota = texto.match(cuotaPattern)

  if (mBase && mCuota && mTipo) {
    const base = parseImporte(mBase[1])
    const tipo = Number(mTipo[1].replace(',', '.'))
    const cuota = parseImporte(mCuota[1])

    if (base && base > 0 && cuota && cuota > 0 && TIPOS_IVA_VALIDOS.includes(tipo)) {
      encontradas.push({ tipoIVA: tipo, base, cuota, confianza: 0.95 })
      return encontradas
    }
  }

  // Patrón 1b: "Base Imponible X" + "IVA XX%" + "Cuota Y" (líneas juntas)
  const basePatternSimple = /base\s+imponible\s*([\d.,]+)/i
  const ivaPatternSimple = /iva\s+([\d.,]+)\s*%\s*([\d.,]+)/i
  const mBaseSimple = texto.match(basePatternSimple)
  const mIvaSimple = texto.match(ivaPatternSimple)

  if (mBaseSimple && mIvaSimple) {
    const base = parseImporte(mBaseSimple[1])
    const tipo = Number(mIvaSimple[1].replace(',', '.'))
    const cuota = parseImporte(mIvaSimple[2])

    if (base && base > 0 && cuota && cuota > 0 && TIPOS_IVA_VALIDOS.includes(tipo)) {
      encontradas.push({ tipoIVA: tipo, base, cuota, confianza: 0.95 })
      return encontradas
    }
  }

  // Patrón 1b: Tabla con "Base" y "IVA" en columnas (facturas más complejas)
  // Base Imponible | IVA 21% | Cuota
  // 1000.00        | 21%     | 210.00
  const tablePattern = /base[^0-9]*?([\d.,]+)[^0-9]+([\d.,]+)\s*%[^0-9]+([\d.,]+)/i
  const mTable = texto.match(tablePattern)
  if (mTable) {
    const base = parseImporte(mTable[1])
    const tipo = Number(mTable[2].replace(',', '.'))
    const cuota = parseImporte(mTable[3])

    if (base && base > 0 && cuota && cuota > 0 && TIPOS_IVA_VALIDOS.includes(tipo)) {
      encontradas.push({ tipoIVA: tipo, base, cuota, confianza: 0.9 })
      return encontradas
    }
  }

  // Patrón 1c: MATEMÁTICO - Si tenemos Base Imponible + Total → calcular IVA
  // Esta es la forma más confiable: si el OCR lee dos valores, podemos derivar el tercero
  const totalFacturaMatch = texto.match(/(?:total|importe\s+total)[^\d]*?([\d.,]+)\s*€/i)
  if (mBase && totalFacturaMatch) {
    const base = parseImporte(mBase[1])
    const total = parseImporte(totalFacturaMatch[1])

    if (base && base > 0 && total && total > base) {
      // IVA = Total - Base
      const cuota = Math.round((total - base) * 100) / 100
      // Derivar el tipo: cuota / base * 100
      const tipo = Math.round((cuota / base) * 100)

      if (TIPOS_IVA_VALIDOS.includes(tipo)) {
        encontradas.push({ tipoIVA: tipo, base, cuota, confianza: 0.92 })
        return encontradas
      }
    }
  }

  // ========================================================================
  // ESTRATEGIA 1.5: Trío coherente en una misma línea (base + cuota = total y
  // cuota/base = tipo de IVA válido). No necesita palabras clave ni símbolo %,
  // así que funciona con tablas de resumen que el OCR lee desordenadas, p. ej.:
  //   "8.496,00 | 1.784,16 | 10.280,16 EUR"
  // ========================================================================
  const trios: LineaIva[] = []
  for (const linea of lineas) {
    const nums = numerosEnLinea(linea).filter((n) => n >= 1)
    if (nums.length < 3) continue
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        for (let k = 0; k < nums.length; k++) {
          if (i === j || i === k || j === k) continue
          const base = nums[i]
          const cuota = nums[j]
          const total = nums[k]
          if (base <= cuota) continue
          if (!aproximado(base + cuota, total, 0.02)) continue
          const tipoDerivado = (cuota / base) * 100
          const tipo = TIPOS_IVA_VALIDOS.find((t) => t > 0 && Math.abs(tipoDerivado - t) <= 0.4)
          if (tipo === undefined) continue
          const dup = trios.find((e) => e.tipoIVA === tipo && aproximado(e.base, base))
          if (!dup) trios.push({ tipoIVA: tipo, base, cuota, confianza: 0.93 })
        }
      }
    }
  }
  if (trios.length > 0) {
    // Si hay varios tríos del mismo tipo (subtotales repetidos), nos quedamos
    // con el de mayor base por tipo de IVA
    const porTipo = new Map<number, LineaIva>()
    for (const t of trios) {
      const previo = porTipo.get(t.tipoIVA)
      if (!previo || t.base > previo.base) porTipo.set(t.tipoIVA, t)
    }
    return [...porTipo.values()]
  }

  // ========================================================================
  // ESTRATEGIA 2: Líneas con porcentaje (patrón genérico)
  // ========================================================================
  const basesSueltas: { tipo: number; valor: number }[] = []
  const cuotasSueltas: { tipo: number; valor: number }[] = []

  for (const linea of lineas) {
    const mTipo = linea.match(/(\d{1,2}(?:[.,]5)?)\s*%/)
    if (!mTipo) continue
    const tipo = Number(mTipo[1].replace(',', '.'))
    if (!TIPOS_IVA_VALIDOS.includes(tipo)) continue

    const sinTipo = linea.replace(mTipo[0], ' ')
    const nums = numerosEnLinea(sinTipo).filter((n) => n !== tipo)
    if (nums.length === 0) continue

    // Buscar par (base, cuota) coherente
    let par: LineaIva | null = null
    for (let i = 0; i < nums.length && !par; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue
        const base = nums[i]
        const cuota = nums[j]
        if (base > 0 && aproximado(cuota, (base * tipo) / 100)) {
          par = { tipoIVA: tipo, base, cuota, confianza: 0.95 }
          break
        }
      }
    }
    if (par) {
      pushSinDuplicar(par, 0.95)
      continue
    }

    // Sin par coherente solo aceptamos la línea si habla de IVA explícitamente:
    // un "4,5%" de graduación alcohólica o un "2%" de descuento junto a un
    // importe cualquiera NO es un desglose de IVA.
    if (!/iva|imponible|base|cuota/i.test(linea)) continue

    // Una sola cifra: clasifica por palabra clave
    if (nums.length === 1) {
      if (/cuota|iva/i.test(linea) && !/base/i.test(linea)) {
        cuotasSueltas.push({ tipo, valor: nums[0] })
      } else {
        basesSueltas.push({ tipo, valor: nums[0] })
      }
      continue
    }

    // Varias cifras: la mayor es probablemente la base
    const base = Math.max(...nums)
    if (base > 0) basesSueltas.push({ tipo, valor: base })
  }

  // Emparejar bases y cuotas sueltas
  for (const b of basesSueltas) {
    const idx = cuotasSueltas.findIndex(
      (c) => c.tipo === b.tipo && aproximado(c.valor, (b.valor * b.tipo) / 100)
    )
    const cuota =
      idx >= 0 ? cuotasSueltas.splice(idx, 1)[0].valor : Math.round(b.valor * b.tipo) / 100
    const conf = idx >= 0 ? 0.9 : 0.7
    pushSinDuplicar({ tipoIVA: b.tipo, base: b.valor, cuota, confianza: conf }, conf)
  }

  // Cuotas huérfanas
  for (const c of cuotasSueltas) {
    if (c.tipo > 0 && c.valor > 0) {
      const base = Math.round(((c.valor * 100) / c.tipo) * 100) / 100
      pushSinDuplicar({ tipoIVA: c.tipo, base, cuota: c.valor, confianza: 0.65 }, 0.65)
    }
  }

  return encontradas
}

// ---------------------------------------------------------------------------
// Total factura
// ---------------------------------------------------------------------------

export function extraerTotal(texto: string): number | null {
  // 1) Patrones específicos, de más a menos fiable
  const patrones = [
    /total\s+factura[^\d\n]{0,20}([\d.,]+)/i,
    /total\s+a\s+pagar[^\d\n]{0,20}([\d.,]+)/i,
    /importe\s+total[^\d\n]{0,20}([\d.,]+)/i,
    /total\s*\(?\s*(?:€|eur)\s*\)?[^\d\n]{0,10}([\d.,]+)/i,
    /^total\s+([\d.,]+)/im,  // "Total" al inicio de línea
  ]
  for (const re of patrones) {
    const m = texto.match(re)
    if (m) {
      const n = parseImporte(m[1])
      if (n !== null && n > 0) return n
    }
  }
  // 2) Genérico: de todas las líneas que contienen "total", nos quedamos con
  // el importe MAYOR (evita capturar "página 1 de 2" o el nº de unidades).
  let mejor: number | null = null
  for (const linea of texto.split('\n')) {
    if (!/\btotal\b/i.test(linea) || /subtotal/i.test(linea)) continue
    for (const n of numerosEnLinea(linea)) {
      if (n > 0 && (mejor === null || n > mejor)) mejor = n
    }
  }
  return mejor
}

// ---------------------------------------------------------------------------
// Parser principal: texto plano → FacturaExtraida con validaciones integradas
// ---------------------------------------------------------------------------

export function parsearFactura(
  texto: string,
  direccion: 'ingreso' | 'gasto' = 'gasto'
): FacturaExtraida {

  const nif = extraerNif(texto)
  const fecha = extraerFecha(texto)
  const numeroFactura = extraerNumeroFactura(texto, nif)
  const { nombre, confianza: confianzaNombre, metodo: metodoNombre } = extraerNombreProveedor(texto, nif)
  let bases = extraerLineasIva(texto)
  let totalFactura = extraerTotal(texto)

  // ⚠️ CRÍTICO: Si no hay desglose de IVA pero SÍ hay total, calcular automáticamente
  // asumiendo IVA 21% (estándar español). Mejor tener un desglose asumido que ninguno.
  // ⚠️ VALIDACIÓN: Si las bases extraídas son inválidas, descartar y recalcular
  // Considerar inválidas si:
  // - IVA con tipo < 4% y != 0 (tipos españoles: 21, 10, 5, 4, 0)
  // - Base + Cuota no coincide con total (diferencia > 5%)
  if (bases.length > 0 && totalFactura && totalFactura > 0) {
    // Con varios tipos de IVA cada línea no suma el total: lo que debe cuadrar
    // es la SUMA de todas las líneas
    const sumaTodas = bases.reduce((s, b) => s + b.base + b.cuota, 0)
    const cuadraGlobal = Math.abs(sumaTodas - totalFactura) / totalFactura < 0.05

    if (!cuadraGlobal) {
      const basesValidas = bases.filter((b) => {
        const esValidoTipo = b.tipoIVA === 0 || b.tipoIVA >= 4
        const sumaLinea = b.base + b.cuota
        const diferencia = Math.abs(sumaLinea - totalFactura!) / totalFactura!
        return esValidoTipo && diferencia < 0.05
      })
      if (basesValidas.length === 0) {
        // Todas las bases son inválidas, descartar y recalcular
        bases = []
      } else {
        bases = basesValidas
      }
    }
  }

  if (bases.length === 0 && totalFactura && totalFactura > 0) {
    const base = Math.round((totalFactura / 1.21) * 100) / 100
    const cuota = Math.round((totalFactura - base) * 100) / 100
    bases = [{ tipoIVA: 21, base, cuota, confianza: 0.6 }] // Confianza baja porque es asumido
  }

  if (bases.length === 0 && totalFactura !== null && totalFactura > 0) {
    const base = Math.round((totalFactura / 1.21) * 100) / 100
    bases.push({ tipoIVA: 21, base, cuota: Math.round((totalFactura - base) * 100) / 100, confianza: 0.5 })
  }

  const sumaCalculada = bases.reduce((s, l) => s + l.base + l.cuota, 0)

  if (totalFactura === null && bases.length > 0) {
    totalFactura = Math.round(sumaCalculada * 100) / 100
  }

  // Validar cada campo crítico
  const validaciones: Record<string, any> = {
    numeroFactura: validarNumeroFactura(numeroFactura),
    fecha: validarFecha(fecha),
    nif: validarNif(nif),
    nombre: validarNombre(nombre, confianzaNombre),
    total: validarImporte(totalFactura),
    consistencia: bases.length > 0 && totalFactura ? validarConsistenciaFinanciera(totalFactura, bases) : { ok: true, confianza: 1 },
  }

  // Recolectar observaciones
  const observaciones: string[] = []
  for (const [campo, validacion] of Object.entries(validaciones)) {
    if (!validacion.ok && validacion.aviso) {
      observaciones.push(validacion.aviso)
    }
  }

  // Si el nombre tiene baja confianza, agregar aviso específico
  if (confianzaNombre < 0.8 && nombre) {
    observaciones.push(`⚠️ Nombre de empresa detectado con baja confianza (${metodoNombre}). Verifica: "${nombre}"`)
  } else if (!nombre) {
    observaciones.push(`⚠️ No se pudo detectar el nombre/razón social de la empresa. Debes ingresarlo manualmente.`)
  }

  // ⚠️ CRÍTICO: Validación del desglose de IVA
  let requiereRevisionPorIva = false
  if (bases.length === 0) {
    observaciones.push(`🔴 CRÍTICO: No se detectó desglose de IVA. Debes verificar y completar manualmente las bases imponibles y cuotas.`)
    requiereRevisionPorIva = true
  } else {
    // Verificar confianza promedio del IVA
    const confianzaPromIva = bases.reduce((s, b) => s + b.confianza, 0) / bases.length
    if (confianzaPromIva < 0.65) {
      // Confianza muy baja: revisar
      observaciones.push(`⚠️ Desglose de IVA calculado automáticamente (confianza ${(confianzaPromIva * 100).toFixed(0)}%). Verifica que sea correcto.`)
      requiereRevisionPorIva = true
    } else if (confianzaPromIva < 0.75) {
      // Confianza media: avisar pero permitir
      observaciones.push(`⚠️ Desglose de IVA con confianza media (${(confianzaPromIva * 100).toFixed(0)}%). Revisa si es necesario.`)
    }
  }

  // Validación global: ¿puede contabilizarse automáticamente?
  const { requiereRevision, confianzaGlobal } = puedeContabilizarseAutomaticamente(validaciones)

  return {
    tipoDocumento: 'factura',
    direccion,
    numeroFactura,
    fecha,
    entidad: { nombre, nif, confianza: Math.max(validaciones.nif.confianza, confianzaNombre) },
    bases,
    totalFactura,
    moneda: 'EUR',
    confianza: confianzaGlobal,
    requiereRevision: requiereRevision || confianzaNombre < 0.75 || !nombre || requiereRevisionPorIva,
    observaciones,
    textoExtraido: texto,
  }
}
