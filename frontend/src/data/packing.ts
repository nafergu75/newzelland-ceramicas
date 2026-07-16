/**
 * Especificaciones técnicas de embalaje y logística por formato de cerámica.
 * Datos generados automáticamente a partir de tarifa-productos.json + estimaciones estándar.
 */

export interface PackingSpec {
  id: string
  serie: string
  formato: string
  piezas_por_caja: number
  metros_por_caja: number
  peso_por_caja_kg: number
  cajas_por_palet: number
  metros_por_palet: number
  peso_por_palet_kg: number
}

/**
 * Calcula número de piezas basado en el formato (cm x cm)
 * Asume densidad ~2400 kg/m³ y grosor 8-10mm típico
 */
function calcularPiezasYPeso(formato: string, metrosPorCaja: number): { piezas: number; peso: number } {
  const formatoNorm = formato.replace(/x|,/g, 'x').toLowerCase()
  const partes = formatoNorm.split('x').map((s) => {
    const n = parseFloat(s.replace(',', '.'))
    return isNaN(n) ? 0 : n
  })

  if (partes.length !== 2) return { piezas: 0, peso: 20 }

  const [lado1, lado2] = partes
  if (lado1 <= 0 || lado2 <= 0) return { piezas: 0, peso: 20 }

  const areaUnidad = (lado1 * lado2) / 10000 // m²
  const piezas = Math.round(metrosPorCaja / areaUnidad)
  const peso = Math.round(metrosPorCaja * 2400 * 0.009 * 10) / 10 // grosor 9mm, densidad 2400 kg/m³

  return { piezas: Math.max(1, piezas), peso: Math.max(20, peso) }
}

/**
 * Calcula cajas por palet y peso total optimizado
 */
function calcularPalet(pesoPorCaja: number): { cajas: number; pesoTotal: number } {
  const pesoMaxPalet = 1800 // kg máximo por palet
  const cajas = Math.floor(pesoMaxPalet / pesoPorCaja)
  const pesoTotal = Math.round(cajas * pesoPorCaja)
  return { cajas: Math.max(20, cajas), pesoTotal }
}

export const packingData: PackingSpec[] = [
  // Brandon - 60x120
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Brandon',
      serie: 'Brandon',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),

  // Garden - 30x60, 45x45
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Garden',
      serie: 'Garden',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Garden',
      serie: 'Garden',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),

  // New Calacatta - 100x100
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('100x100', 2.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '100x100-New-Calacatta',
      serie: 'New Calacatta',
      formato: '100×100',
      piezas_por_caja: piezas,
      metros_por_caja: 2.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 2.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),

  // Pietra Serena - 60x60
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Pietra-Serena',
      serie: 'Pietra Serena',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),

  // Travertino Caliza Brillo - 60x60
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Travertino-Caliza',
      serie: 'Travertino Caliza Brillo',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),

  // Todos los demás productos de tarifa-productos.json
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('100x100', 2.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '100x100-Calacatta-Gold',
      serie: 'Calacatta Gold',
      formato: '100×100',
      piezas_por_caja: piezas,
      metros_por_caja: 2.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 2.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('100x100', 2.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '100x100-Carrara',
      serie: 'Carrara',
      formato: '100×100',
      piezas_por_caja: piezas,
      metros_por_caja: 2.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 2.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('100x100', 2.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '100x100-Elvis',
      serie: 'Elvis',
      formato: '100×100',
      piezas_por_caja: piezas,
      metros_por_caja: 2.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 2.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('100x100', 2.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '100x100-Samario',
      serie: 'Samario',
      formato: '100×100',
      piezas_por_caja: piezas,
      metros_por_caja: 2.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 2.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('100x100', 2.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '100x100-Sanit-Dark',
      serie: 'Sanit Dark',
      formato: '100×100',
      piezas_por_caja: piezas,
      metros_por_caja: 2.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 2.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('10x10', 0.5)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '10x10-Blancos',
      serie: 'Blancos',
      formato: '10×10',
      piezas_por_caja: piezas,
      metros_por_caja: 0.5,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 0.5 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('10x20', 1.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '10x20-Blancos',
      serie: 'Blancos',
      formato: '10×20',
      piezas_por_caja: piezas,
      metros_por_caja: 1.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('10x20', 1.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '10x20-Metro',
      serie: 'Metro',
      formato: '10×20',
      piezas_por_caja: piezas,
      metros_por_caja: 1.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('15x15', 1.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '15x15-Blancos',
      serie: 'Blancos',
      formato: '15×15',
      piezas_por_caja: piezas,
      metros_por_caja: 1.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('19x57', 1.41)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '19x57-Forest',
      serie: 'Forest',
      formato: '19×57',
      piezas_por_caja: piezas,
      metros_por_caja: 1.41,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.41 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('19x57', 1.41)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '19x57-Fusta',
      serie: 'Fusta',
      formato: '19×57',
      piezas_por_caja: piezas,
      metros_por_caja: 1.41,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.41 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x120', 1.2)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x120-Legend',
      serie: 'Legend',
      formato: '20×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.2,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.2 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x20', 1.0)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x20-Blancos',
      serie: 'Blancos',
      formato: '20×20',
      piezas_por_caja: piezas,
      metros_por_caja: 1.0,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.0 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x60', 1.68)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x60-Foresta',
      serie: 'Foresta',
      formato: '20×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.68,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.68 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x60', 1.68)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x60-Pinada',
      serie: 'Pinada',
      formato: '20×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.68,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.68 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x60', 1.68)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x60-Blancos',
      serie: 'Blancos',
      formato: '20×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.68,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.68 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x60', 1.68)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x60-Brick',
      serie: 'Brick',
      formato: '20×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.68,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.68 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x60', 1.68)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x60-Carrara',
      serie: 'Carrara',
      formato: '20×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.68,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.68 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x60', 1.68)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x60-Haina',
      serie: 'Haina',
      formato: '20×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.68,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.68 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x60', 1.68)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x60-Irati',
      serie: 'Irati',
      formato: '20×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.68,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.68 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('20x60', 1.68)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '20x60-Masip',
      serie: 'Masip',
      formato: '20×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.68,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.68 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('22.5x90', 1.22)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '22.5x90-Atlas',
      serie: 'Atlas',
      formato: '22,5×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.22,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.22 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('22.5x90', 1.22)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '22.5x90-Curia-C3',
      serie: 'Curia C3',
      formato: '22,5×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.22,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.22 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('22.5x90', 1.22)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '22.5x90-Enate',
      serie: 'Enate',
      formato: '22,5×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.22,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.22 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('22.5x90', 1.22)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '22.5x90-Mogan',
      serie: 'Mogan',
      formato: '22,5×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.22,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.22 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('22.5x90', 1.22)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '22.5x90-Tea',
      serie: 'Tea',
      formato: '22,5×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.22,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.22 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('23x120', 1.38)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '23x120-Alpina',
      serie: 'Alpina',
      formato: '23×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.38,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.38 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('23x120', 1.38)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '23x120-Bigas',
      serie: 'Bigas',
      formato: '23×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.38,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.38 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('23x120', 1.38)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '23x120-Tablero',
      serie: 'Tablero',
      formato: '23×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.38,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.38 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('23x120', 1.38)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '23x120-Terry',
      serie: 'Terry',
      formato: '23×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.38,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.38 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('25x40', 1.5)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '25x40-Blancos',
      serie: 'Blancos',
      formato: '25×40',
      piezas_por_caja: piezas,
      metros_por_caja: 1.5,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.5 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('25x50', 1.5)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '25x50-Blancos',
      serie: 'Blancos',
      formato: '25×50',
      piezas_por_caja: piezas,
      metros_por_caja: 1.5,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.5 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('25x50', 1.5)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '25x50-Jaca',
      serie: 'Jaca',
      formato: '25×50',
      piezas_por_caja: piezas,
      metros_por_caja: 1.5,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.5 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('25x80', 1.2)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '25x80-Blancos',
      serie: 'Blancos',
      formato: '25×80',
      piezas_por_caja: piezas,
      metros_por_caja: 1.2,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.2 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('25x80', 1.2)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '25x80-Eden',
      serie: 'Eden',
      formato: '25×80',
      piezas_por_caja: piezas,
      metros_por_caja: 1.2,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.2 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('25x80', 1.2)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '25x80-Keops',
      serie: 'Keops',
      formato: '25×80',
      piezas_por_caja: piezas,
      metros_por_caja: 1.2,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.2 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('25x80', 1.2)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '25x80-Kronos',
      serie: 'Kronos',
      formato: '25×80',
      piezas_por_caja: piezas,
      metros_por_caja: 1.2,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.2 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Ardesia-C3',
      serie: 'Ardesia C3',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Bali',
      serie: 'Bali',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Kaster',
      serie: 'Kaster',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Keyburn-C3',
      serie: 'Keyburn C3',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Land-Kaster-C3',
      serie: 'Land Kaster C3',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Provence-C3',
      serie: 'Provence C3',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Torcal',
      serie: 'Torcal',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Tosca',
      serie: 'Tosca',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Urbión',
      serie: 'Urbión',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Blancos',
      serie: 'Blancos',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Carrara',
      serie: 'Carrara',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Concrete',
      serie: 'Concrete',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Kamen',
      serie: 'Kamen',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Kite',
      serie: 'Kite',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Koral',
      serie: 'Koral',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Legend',
      serie: 'Legend',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Life',
      serie: 'Life',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Murano',
      serie: 'Murano',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Napoli',
      serie: 'Napoli',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Polaris',
      serie: 'Polaris',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x60', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x60-Ritz',
      serie: 'Ritz',
      formato: '30×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x90', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x90-Blancos',
      serie: 'Blancos',
      formato: '30×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x90', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x90-Calacata',
      serie: 'Calacata',
      formato: '30×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x90', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x90-Shiman',
      serie: 'Shiman',
      formato: '30×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x90', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x90-Tadan',
      serie: 'Tadan',
      formato: '30×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x90', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x90-Verdi',
      serie: 'Verdi',
      formato: '30×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('30x90', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '30x90-Wahkan',
      serie: 'Wahkan',
      formato: '30×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Bosco',
      serie: 'Bosco',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Pobla-C3',
      serie: 'Pobla C3',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Stahl-C3',
      serie: 'Stahl C3',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Cotto-Provenzal',
      serie: 'Cotto Provenzal',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Hidráulicos',
      serie: 'Hidráulicos',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Inca',
      serie: 'Inca',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Mulhacén',
      serie: 'Mulhacén',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Pizarra',
      serie: 'Pizarra',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('33.3x33.3', 1.55)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '33.3x33.3-Silos-C3',
      serie: 'Silos C3',
      formato: '33,3×33,3',
      piezas_por_caja: piezas,
      metros_por_caja: 1.55,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.55 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('40x120', 2.4)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '40x120-Blancos',
      serie: 'Blancos',
      formato: '40×120',
      piezas_por_caja: piezas,
      metros_por_caja: 2.4,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 2.4 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Alhambra',
      serie: 'Alhambra',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Atrio',
      serie: 'Atrio',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Carrara',
      serie: 'Carrara',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Dahino',
      serie: 'Dahino',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Keops',
      serie: 'Keops',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Memory-C3',
      serie: 'Memory C3',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Mijas',
      serie: 'Mijas',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-One',
      serie: 'One',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Rock',
      serie: 'Rock',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Ronda',
      serie: 'Ronda',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Siracusa',
      serie: 'Siracusa',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('45x45', 1.82)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '45x45-Star',
      serie: 'Star',
      formato: '45×45',
      piezas_por_caja: piezas,
      metros_por_caja: 1.82,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.82 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Calacata',
      serie: 'Calacata',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Calacatta',
      serie: 'Calacatta',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Calacatta-Gold',
      serie: 'Calacatta Gold',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Carlotta-Silver',
      serie: 'Carlotta Silver',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Carrara',
      serie: 'Carrara',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Crema-Marfil',
      serie: 'Crema Marfil',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Land-Kaster-C3',
      serie: 'Land Kaster C3',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Polaris',
      serie: 'Polaris',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Samario',
      serie: 'Samario',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Technikal-C2',
      serie: 'Technikal C2',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x120', 1.44)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x120-Toledo',
      serie: 'Toledo',
      formato: '60×120',
      piezas_por_caja: piezas,
      metros_por_caja: 1.44,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.44 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Brando',
      serie: 'Brando',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Calacata',
      serie: 'Calacata',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Caliza-Brillo',
      serie: 'Caliza Brillo',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Canyon',
      serie: 'Canyon',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Kamen',
      serie: 'Kamen',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Kaster',
      serie: 'Kaster',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Kite',
      serie: 'Kite',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Koral',
      serie: 'Koral',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Land-Kaster-C3',
      serie: 'Land Kaster C3',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Legend',
      serie: 'Legend',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Napoli',
      serie: 'Napoli',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Pietra',
      serie: 'Pietra',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Polaris',
      serie: 'Polaris',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Ritz',
      serie: 'Ritz',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Tokyo',
      serie: 'Tokyo',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('60x60', 1.8)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '60x60-Travertino',
      serie: 'Travertino',
      formato: '60×60',
      piezas_por_caja: piezas,
      metros_por_caja: 1.8,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.8 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('75x75', 1.13)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '75x75-Koral',
      serie: 'Koral',
      formato: '75×75',
      piezas_por_caja: piezas,
      metros_por_caja: 1.13,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.13 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
  (() => {
    const { piezas, peso } = calcularPiezasYPeso('90x90', 1.62)
    const { cajas, pesoTotal } = calcularPalet(peso)
    return {
      id: '90x90-Magnum',
      serie: 'Magnum',
      formato: '90×90',
      piezas_por_caja: piezas,
      metros_por_caja: 1.62,
      peso_por_caja_kg: peso,
      cajas_por_palet: cajas,
      metros_por_palet: 1.62 * cajas,
      peso_por_palet_kg: pesoTotal,
    }
  })(),
]

export function getPackingSpec(serieNombre: string, formato: string): PackingSpec | undefined {
  const serieNorm = serieNombre.trim().toUpperCase()
  const formatoNorm = formato.trim().toUpperCase()
  return packingData.find(
    (p) => p.serie.trim().toUpperCase() === serieNorm && p.formato.trim().toUpperCase() === formatoNorm
  )
}

export function groupPackingBySeriesName(data: PackingSpec[] = packingData): Map<string, PackingSpec[]> {
  const grouped = new Map<string, PackingSpec[]>()
  data.forEach((spec) => {
    if (!grouped.has(spec.serie)) {
      grouped.set(spec.serie, [])
    }
    grouped.get(spec.serie)!.push(spec)
  })
  return grouped
}

export function getAllSeriesNames(data: PackingSpec[] = packingData): string[] {
  return [...new Set(data.map((p) => p.serie))].sort()
}
