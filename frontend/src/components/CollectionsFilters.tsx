import type { Collection } from '../types/collections'

export interface ActiveFilters {
  material: string[]
  tipo: string[]
  formatos: string[]
  acabados: string[]
  espesor: string[]
  estilo: string[]
  colores: string[]
}

export const EMPTY_FILTERS: ActiveFilters = {
  material: [],
  tipo: [],
  formatos: [],
  acabados: [],
  espesor: [],
  estilo: [],
  colores: [],
}

// Rangos fijos de espesor (mm) — ver spec, sección "Espesor: filtro por rango".
const RANGOS_ESPESOR: Array<{ label: string; min: number; max: number }> = [
  { label: '6-8 mm', min: 6, max: 8 },
  { label: '8-10 mm', min: 8, max: 10 },
  { label: '10-12 mm', min: 10, max: 12 },
  { label: '12-15 mm', min: 12, max: 15 },
  { label: '15-20 mm', min: 15, max: 20 },
]

export function espesorEnRango(espesor: number, rangoLabel: string): boolean {
  const rango = RANGOS_ESPESOR.find((r) => r.label === rangoLabel)
  if (!rango) return false
  return espesor >= rango.min && espesor <= rango.max
}

interface FilterOption {
  value: string
  count: number
}

// `material` a veces llega como string compuesto (ej. "Gres, Pasta Roja,
// Porcelánico") en vez de un único valor limpio — así está en el dato
// real. Se trocea igual que hacía el filtro antiguo (`.split(',')[0]`),
// pero contando TODAS las partes, no solo la primera, para que filtrar
// por "Gres" también encuentre esas series compuestas.
export function materialesDe(collection: Collection): string[] {
  return (collection.material || '').split(',').map((v) => v.trim()).filter(Boolean)
}

function contarValoresUnicos(collections: Collection[], campo: 'estilo' | 'acabado_corte'): FilterOption[] {
  const counts = new Map<string, number>()
  for (const c of collections) {
    const valor = c[campo]
    if (!valor) continue
    counts.set(valor, (counts.get(valor) || 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

function contarMateriales(collections: Collection[]): FilterOption[] {
  const counts = new Map<string, number>()
  for (const c of collections) {
    for (const valor of materialesDe(c)) {
      counts.set(valor, (counts.get(valor) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

function contarValoresArray(collections: Collection[], campo: 'tipo' | 'formatos' | 'acabados' | 'colores'): FilterOption[] {
  const counts = new Map<string, number>()
  for (const c of collections) {
    for (const valor of c[campo] || []) {
      counts.set(valor, (counts.get(valor) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

function contarRangosEspesor(collections: Collection[]): FilterOption[] {
  return RANGOS_ESPESOR.map((rango) => ({
    value: rango.label,
    count: collections.filter((c) => espesorEnRango(c.espesor, rango.label)).length,
  }))
}

interface CollectionsFiltersProps {
  collections: Collection[]
  search: string
  onSearchChange: (value: string) => void
  activeFilters: ActiveFilters
  onToggle: (categoria: keyof ActiveFilters, valor: string) => void
  onClear: () => void
}

export default function CollectionsFilters({
  collections,
  search,
  onSearchChange,
  activeFilters,
  onToggle,
  onClear,
}: CollectionsFiltersProps) {
  const hasActiveFilters =
    search.trim() !== '' || Object.values(activeFilters).some((arr) => arr.length > 0)

  const secciones: Array<{ titulo: string; categoria: keyof ActiveFilters; opciones: FilterOption[] }> = [
    { titulo: 'Material', categoria: 'material', opciones: contarMateriales(collections) },
    { titulo: 'Tipo', categoria: 'tipo', opciones: contarValoresArray(collections, 'tipo') },
    { titulo: 'Formato', categoria: 'formatos', opciones: contarValoresArray(collections, 'formatos') },
    { titulo: 'Acabado', categoria: 'acabados', opciones: contarValoresArray(collections, 'acabados') },
    { titulo: 'Espesor', categoria: 'espesor', opciones: contarRangosEspesor(collections) },
    { titulo: 'Estilo', categoria: 'estilo', opciones: contarValoresUnicos(collections, 'estilo') },
    { titulo: 'Color', categoria: 'colores', opciones: contarValoresArray(collections, 'colores') },
  ]

  return (
    <div className="collections-filters">
      <div className="collections-filters-search">
        <label htmlFor="buscar-serie">Buscar serie</label>
        <input
          id="buscar-serie"
          type="text"
          placeholder="Nombre de la serie..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {secciones.map((seccion) => (
        <div className="collections-filters-section" key={seccion.categoria}>
          <h3>{seccion.titulo}</h3>
          <div className="collections-filters-options">
            {seccion.opciones.map((opcion) => (
              <label key={opcion.value} className="collections-filters-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters[seccion.categoria].includes(opcion.value)}
                  onChange={() => onToggle(seccion.categoria, opcion.value)}
                />
                <span>{opcion.value}</span>
                <span className="collections-filters-count">({opcion.count})</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {hasActiveFilters && (
        <button type="button" className="secondary collections-filters-clear" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
