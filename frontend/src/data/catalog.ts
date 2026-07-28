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
  // Solo indica si existe el fichero; la URL real vive en el backend
  // (api/data/catalog-fichas.json) para que nunca se exponga al cliente.
  fichas: {
    tecnica: boolean
    catalogo: boolean
  }
}

export const series: Serie[] = raw.series as Serie[]

export function getSerieById(id: string): Serie | undefined {
  return series.find((s) => s.id === id)
}
