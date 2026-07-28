// Pipeline de preprocesado de imágenes para OCR de facturas.
// Aplica técnicas estándar de procesamiento de imagen para mejorar la precisión
// de Tesseract.js en facturas escaneadas o fotografiadas:
// - Upsampling a ~300 DPI
// - Conversión a escala de grises
// - Binarización (umbral)
// - Denoising (eliminar píxeles aislados)
// - Deskew (corrección de inclinación)

// ---------------------------------------------------------------------------
// Upsampling: si la imagen es menor de 1600px de ancho, se amplía manteniendo
// resolución de ~300 DPI equivalentes (Tesseract necesita ≥250 DPI).
// ---------------------------------------------------------------------------

export async function upsampleImage(file: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const MIN_ANCHO = 1600
      const factor = Math.max(1, MIN_ANCHO / img.naturalWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * factor)
      canvas.height = Math.round(img.naturalHeight * factor)
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo cargar la imagen'))
    }
    img.src = url
  })
}

// ---------------------------------------------------------------------------
// Conversión a escala de grises (weighted RGB → grayscale)
// ---------------------------------------------------------------------------

export function toGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Luminancia: Y = 0.299*R + 0.587*G + 0.114*B
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    data[i] = data[i + 1] = data[i + 2] = gray
  }
  ctx.putImageData(imgData, 0, 0)
  return canvas
}

// ---------------------------------------------------------------------------
// Binarización (convertir a blanco y negro).
// Usa otsu thresholding: encuentra automáticamente el umbral óptimo que
// separa el "papel" del "texto/trazo".
// ---------------------------------------------------------------------------

export function otsuThreshold(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data
  const gray: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    gray.push(data[i]) // canal rojo (son iguales en escala de grises)
  }

  // Histograma
  const hist = Array(256).fill(0)
  for (const g of gray) hist[g]++

  // Otsu: encontrar el umbral que minimiza la varianza intraclase
  let suma = 0
  for (let i = 0; i < 256; i++) suma += i * hist[i]
  const N = gray.length
  let w0 = 0,
    sum0 = 0,
    maxVar = 0,
    threshold = 0
  for (let t = 0; t < 256; t++) {
    w0 += hist[t]
    if (w0 === 0) continue
    const w1 = N - w0
    if (w1 === 0) break
    sum0 += t * hist[t]
    const mu0 = sum0 / w0
    const mu1 = (suma - sum0) / w1
    const betweenVar = w0 * w1 * Math.pow(mu0 - mu1, 2)
    if (betweenVar > maxVar) {
      maxVar = betweenVar
      threshold = t
    }
  }

  // Aplicar umbral: píxel < threshold → negro, sino → blanco
  for (let i = 0; i < data.length; i += 4) {
    const bit = gray[i / 4] < threshold ? 0 : 255
    data[i] = data[i + 1] = data[i + 2] = bit
  }
  ctx.putImageData(imgData, 0, 0)
  return canvas
}

// ---------------------------------------------------------------------------
// Denoising: eliminar píxeles sueltos / manchas pequeñas (morphological ops).
// Opening = erosión + dilatación (elimina ruido blanco sobre fondo negro).
// Closing = dilatación + erosión (llena huecos dentro de texto).
// ---------------------------------------------------------------------------

function morphErode(data: Uint8ClampedArray, width: number, height: number): void {
  const temp = new Uint8ClampedArray(data)
  const radius = 1
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let minVal = 255
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          minVal = Math.min(minVal, temp[idx])
        }
      }
      const idx = (y * width + x) * 4
      data[idx] = data[idx + 1] = data[idx + 2] = minVal
    }
  }
}

function morphDilate(data: Uint8ClampedArray, width: number, height: number): void {
  const temp = new Uint8ClampedArray(data)
  const radius = 1
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let maxVal = 0
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          maxVal = Math.max(maxVal, temp[idx])
        }
      }
      const idx = (y * width + x) * 4
      data[idx] = data[idx + 1] = data[idx + 2] = maxVal
    }
  }
}

export function denoise(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data
  // Opening: erosión + dilatación (elimina ruido blanco)
  morphErode(data, canvas.width, canvas.height)
  morphDilate(data, canvas.width, canvas.height)
  // Closing: dilatación + erosión (llena pequeños huecos en texto)
  morphDilate(data, canvas.width, canvas.height)
  morphErode(data, canvas.width, canvas.height)
  ctx.putImageData(imgData, 0, 0)
  return canvas
}

// ---------------------------------------------------------------------------
// Deskew: detección y corrección de inclinación.
// Usa Hough transform simplificado (busca ángulos dominantes).
// ---------------------------------------------------------------------------

export function deskew(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data

  // Buscar píxeles negros (texto) e intentar detectar inclinación por Hough
  const blacks: { x: number; y: number }[] = []
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 128) {
      // píxel oscuro
      const idx = i / 4
      blacks.push({ x: idx % canvas.width, y: Math.floor(idx / canvas.width) })
    }
  }

  if (blacks.length < 10) return canvas // muy poco texto para detectar

  // Hough simplificado: probar ángulos y ver cuál agrupa más píxeles en líneas
  let bestAngle = 0,
    bestScore = 0
  for (let angleDeg = -10; angleDeg <= 10; angleDeg += 0.5) {
    const angleRad = (angleDeg * Math.PI) / 180
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)
    const lines = new Map<number, number>()

    for (const p of blacks) {
      // Transformación de Hough: encontrar líneas
      const rho = Math.round(p.x * cos + p.y * sin)
      lines.set(rho, (lines.get(rho) ?? 0) + 1)
    }

    const score = Math.max(...Array.from(lines.values()))
    if (score > bestScore) {
      bestScore = score
      bestAngle = angleDeg
    }
  }

  // Si el ángulo es muy pequeño, no lo corrijas
  if (Math.abs(bestAngle) < 0.5) return canvas

  // Rotar el canvas
  const angleRad = (bestAngle * Math.PI) / 180
  const newCanvas = document.createElement('canvas')
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  const newWidth =
    Math.abs(canvas.width * cos) + Math.abs(canvas.height * sin)
  const newHeight =
    Math.abs(canvas.width * sin) + Math.abs(canvas.height * cos)
  newCanvas.width = Math.ceil(newWidth)
  newCanvas.height = Math.ceil(newHeight)

  const newCtx = newCanvas.getContext('2d')!
  newCtx.fillStyle = '#fff'
  newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height)
  newCtx.translate(newCanvas.width / 2, newCanvas.height / 2)
  newCtx.rotate(angleRad)
  newCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)
  return newCanvas
}

// ---------------------------------------------------------------------------
// Pipeline completo: upsampling → escala de grises → binarización →
// denoising → deskew.
// ---------------------------------------------------------------------------

export async function preprocessImage(file: Blob): Promise<HTMLCanvasElement> {
  let canvas = await upsampleImage(file)
  canvas = toGrayscale(canvas)
  canvas = otsuThreshold(canvas)
  canvas = denoise(canvas)
  canvas = deskew(canvas)
  return canvas
}
