// Lector OCR de facturas 100% en el navegador. Sin servicios de pago:
//  - PDF.js (pdfjs-dist)  → texto nativo de PDFs y render a canvas
//  - Tesseract.js (WASM)  → OCR de imágenes con excelente precisión
//  - mammoth              → texto de documentos DOCX

import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createWorker } from 'tesseract.js'
import * as mammoth from 'mammoth'
import { FacturaExtraida } from '../types/invoice'
import { parsearFactura } from '../utils/invoiceParser'
import { preprocessImage } from './imagePreprocessing'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export type ProgresoCallback = (mensaje: string, progreso: number) => void

const MIN_CHARS_TEXTO_NATIVO = 50

// ---------------------------------------------------------------------------
// Worker de Tesseract reutilizable (singleton)
// ---------------------------------------------------------------------------

type TesseractWorker = Awaited<ReturnType<typeof createWorker>>

let workerPromise: Promise<TesseractWorker> | null = null
let progresoActivo: { fn: ProgresoCallback; etiqueta: string } = { fn: () => {}, etiqueta: '' }

function getTesseractWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = createWorker('spa', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          progresoActivo.fn(`Leyendo ${progresoActivo.etiqueta}…`, m.progress)
        } else if (m.status === 'loading language traineddata') {
          progresoActivo.fn('Descargando modelo de OCR en español…', m.progress)
        }
      },
    })
  }
  return workerPromise
}

async function reconocer(
  imagen: Blob | HTMLCanvasElement | string,
  onProgreso: ProgresoCallback,
  etiqueta: string
): Promise<{ text: string; confidence: number }> {
  progresoActivo = { fn: onProgreso, etiqueta }
  try {
    const worker = await getTesseractWorker()
    const { data } = await worker.recognize(imagen)
    return { text: data.text, confidence: data.confidence }
  } catch (e) {
    try {
      const w = await workerPromise
      await w?.terminate()
    } catch { /* ignorar */ }
    workerPromise = null
    throw e
  }
}

// ---------------------------------------------------------------------------
// Detección automática de orientación: muchas facturas llegan escaneadas de
// lado (90°/270°) o boca abajo. Se prueba el OCR sobre una miniatura en las 4
// orientaciones y se elige la de mayor confianza antes del OCR completo.
// ---------------------------------------------------------------------------

function rotarCanvas(src: HTMLCanvasElement, grados: 90 | 180 | 270): HTMLCanvasElement {
  const dst = document.createElement('canvas')
  if (grados === 180) {
    dst.width = src.width
    dst.height = src.height
  } else {
    dst.width = src.height
    dst.height = src.width
  }
  const ctx = dst.getContext('2d')!
  ctx.translate(dst.width / 2, dst.height / 2)
  ctx.rotate((grados * Math.PI) / 180)
  ctx.drawImage(src, -src.width / 2, -src.height / 2)
  return dst
}

function miniatura(src: HTMLCanvasElement, maxLado = 1200): HTMLCanvasElement {
  const factor = Math.min(1, maxLado / Math.max(src.width, src.height))
  const dst = document.createElement('canvas')
  dst.width = Math.round(src.width * factor)
  dst.height = Math.round(src.height * factor)
  const ctx = dst.getContext('2d')!
  ctx.drawImage(src, 0, 0, dst.width, dst.height)
  return dst
}

const CONFIANZA_ORIENTACION_OK = 55

async function ocrCanvasConOrientacion(
  canvas: HTMLCanvasElement,
  onProgreso: ProgresoCallback,
  etiqueta: string
): Promise<string> {
  const thumb = miniatura(canvas)

  onProgreso(`Detectando orientación de ${etiqueta}…`, 0.05)
  const r0 = await reconocer(thumb, () => {}, etiqueta)

  let mejorGrado: 0 | 90 | 180 | 270 = 0
  if (r0.confidence < CONFIANZA_ORIENTACION_OK) {
    let mejorConfianza = r0.confidence
    for (const grados of [90, 180, 270] as const) {
      onProgreso(`Probando ${etiqueta} girada ${grados}°…`, 0.1)
      const rg = await reconocer(rotarCanvas(thumb, grados), () => {}, etiqueta)
      if (rg.confidence > mejorConfianza) {
        mejorConfianza = rg.confidence
        mejorGrado = grados
      }
    }
  }

  const definitivo = mejorGrado === 0 ? canvas : rotarCanvas(canvas, mejorGrado)
  const { text } = await reconocer(definitivo, onProgreso, etiqueta)
  return text
}

async function ocrImagen(
  imagen: Blob | HTMLCanvasElement | string,
  onProgreso: ProgresoCallback,
  etiqueta: string
): Promise<string> {
  if (imagen instanceof HTMLCanvasElement) {
    return ocrCanvasConOrientacion(imagen, onProgreso, etiqueta)
  }
  if (imagen instanceof Blob && imagen.type.startsWith('image/')) {
    onProgreso(`Mejorando la calidad de ${etiqueta}…`, 0.1)
    const canvas = await preprocessImage(imagen)
    return ocrCanvasConOrientacion(canvas, onProgreso, etiqueta)
  }
  const { text } = await reconocer(imagen, onProgreso, etiqueta)
  return text
}

// ---------------------------------------------------------------------------
// PDF: texto nativo con PDF.js y OCR con Tesseract para layouts complejos
// ---------------------------------------------------------------------------

async function extraerTextoPdf(file: File, onProgreso: ProgresoCallback): Promise<string> {
  onProgreso('Abriendo PDF…', 0)
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  let textoNativo = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const contenido = await page.getTextContent()

    const lineas: { y: number; parts: { x: number; str: string }[] }[] = []
    for (const item of contenido.items) {
      if (!('str' in item) || !item.str.trim()) continue
      const x = item.transform[4]
      const y = item.transform[5]
      const linea = lineas.find((l) => Math.abs(l.y - y) < 3)
      if (linea) linea.parts.push({ x, str: item.str })
      else lineas.push({ y, parts: [{ x, str: item.str }] })
    }
    lineas.sort((a, b) => b.y - a.y)
    const textoPagina = lineas
      .map((l) => l.parts.sort((a, b) => a.x - b.x).map((f) => f.str).join(' '))
      .join('\n')

    textoNativo += textoPagina + '\n'
    onProgreso(`Extrayendo texto (página ${p}/${pdf.numPages})…`, p / pdf.numPages)
  }

  // SIEMPRE usar Tesseract para PDFs: mejor precisión con layouts complejos
  let textoOcr = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const viewport = page.getViewport({ scale: 4 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No se pudo crear el canvas para renderizar el PDF')

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // intent 'print' evita depender de requestAnimationFrame (se cuelga en
    // navegadores embebidos o pestañas en segundo plano) y renderiza a máxima calidad
    await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise
    const texto = await ocrImagen(canvas, onProgreso, `página ${p}/${pdf.numPages}`)
    textoOcr += texto + '\n'
  }

  // Combinar ambos si hay contenido
  if (textoNativo.replace(/\s/g, '').length >= 20) {
    return textoNativo + '\n' + textoOcr
  }
  return textoOcr
}

// ---------------------------------------------------------------------------
// DOCX con mammoth
// ---------------------------------------------------------------------------

async function extraerTextoDocx(file: File, onProgreso: ProgresoCallback): Promise<string> {
  onProgreso('Leyendo documento Word…', 0.3)
  const arrayBuffer = await file.arrayBuffer()
  const resultado = await mammoth.extractRawText({ arrayBuffer })
  onProgreso('Documento Word leído', 1)
  return resultado.value
}

// ---------------------------------------------------------------------------
// Punto de entrada: File → FacturaExtraida
// ---------------------------------------------------------------------------

let cola: Promise<unknown> = Promise.resolve()

export function procesarFactura(
  file: File,
  onProgreso: ProgresoCallback = () => {},
  direccion: 'ingreso' | 'gasto' = 'gasto'
): Promise<FacturaExtraida> {
  const resultado = cola.then(() => {
    onProgreso('Procesando…', 0)
    return procesarFacturaInterna(file, direccion, onProgreso)
  })
  cola = resultado.catch(() => {})
  return resultado
}

async function procesarFacturaInterna(
  file: File,
  direccion: 'ingreso' | 'gasto',
  onProgreso: ProgresoCallback
): Promise<FacturaExtraida> {
  const nombre = file.name.toLowerCase()
  let texto: string

  try {
    if (nombre.endsWith('.pdf') || file.type === 'application/pdf') {
      texto = await extraerTextoPdf(file, onProgreso)
    } else if (nombre.endsWith('.docx')) {
      texto = await extraerTextoDocx(file, onProgreso)
    } else if (nombre.endsWith('.doc')) {
      throw new Error(
        'Los archivos .doc (Word 97-2003) no se pueden leer en el navegador. Guárdalo como .docx o PDF y vuelve a subirlo.'
      )
    } else if (
      nombre.endsWith('.jpg') || nombre.endsWith('.jpeg') || nombre.endsWith('.png') ||
      file.type.startsWith('image/')
    ) {
      onProgreso('Leyendo imagen…', 0)
      texto = await ocrImagen(file, onProgreso, nombre)
    } else {
      throw new Error(`Formato de archivo no soportado: ${file.type || nombre}`)
    }

    onProgreso('Analizando factura…', 0.9)
    const factura = parsearFactura(texto, direccion)
    onProgreso('Factura lista', 1)
    return factura
  } catch (err) {
    throw new Error(`Error al procesar ${nombre}: ${err instanceof Error ? err.message : String(err)}`)
  }
}
