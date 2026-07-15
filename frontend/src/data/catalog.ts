import raw from './catalogo.json'

export interface Serie {
  id: string
  nombre: string
  descripcion: string
  imagen: string
  formatos: string[]
  acabados: string[]
  tipo: string[]
  material: string
  colores: string[]
  precio_consultable: boolean
  fichas: {
    tecnica?: string
    catalogo?: string
  }
}

export const series: Serie[] = raw.series as Serie[]

export function getSerieById(id: string): Serie | undefined {
  return series.find((s) => s.id === id)
}
