// Estructuralmente compatible con `Serie` (frontend/src/data/catalog.ts) en
// los campos que consumen SeriesCard/AddToCartBox (id, nombre, imagen,
// material, formatos) — el backend alía slug->id e imagen_portada->imagen
// en GET /api/collections precisamente para esto, sin adaptador aquí.
export interface Collection {
  id: string
  nombre: string
  descripcion: string
  imagen: string
  material: string
  tipo: string[]
  formatos: string[]
  acabados: string[]
  colores: string[]
  precio_consultable: boolean
  acabado_corte: string
  espesor: number
  estilo: string
  especificaciones_verificadas: boolean
}

export interface AdminCollection extends Collection {
  dbId: number
  slug: string
  createdAt: string
  updatedAt: string
}
