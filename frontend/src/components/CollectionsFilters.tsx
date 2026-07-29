import { CaretDown } from '@phosphor-icons/react'
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

// Qué familias están expandidas. Vive en el padre (CollectionsPage), no
// dentro de este componente: se renderiza dos veces a la vez (sidebar +
// drawer móvil) y si el estado fuera interno, expandir "Formato" en el
// drawer no se reflejaría en el sidebar — quedarían desincronizados.
export type ExpandedFamilies = Record<keyof ActiveFilters, boolean>

const EXPANDED_STORAGE_KEY = 'collections-filtros-expandido'

export const ALL_EXPANDED: ExpandedFamilies = {
  material: true,
  tipo: true,
  formatos: true,
  acabados: true,
  espesor: true,
  estilo: true,
  colores: true,
}

export const ALL_COLLAPSED: ExpandedFamilies = {
  material: false,
  tipo: false,
  formatos: false,
  espesor: false,
  acabados: false,
  estilo: false,
  colores: false,
}

// Material y Tipo son los filtros más usados: abiertos por defecto en
// desktop. En móvil arrancan todos colapsados — es la pantalla pequeña la
// que más se beneficia de no scrollear cinco acordeones abiertos de golpe.
function familiasPorDefecto(): ExpandedFamilies {
  const esMovil = typeof window !== 'undefined' && window.innerWidth < 1024
  return esMovil ? ALL_COLLAPSED : { ...ALL_COLLAPSED, material: true, tipo: true }
}

export function cargarFamiliasExpandidas(): ExpandedFamilies {
  try {
    const guardado = localStorage.getItem(EXPANDED_STORAGE_KEY)
    if (guardado) return { ...familiasPorDefecto(), ...JSON.parse(guardado) }
  } catch {
    // localStorage no disponible o JSON corrupto: se ignora, se usa el default.
  }
  return familiasPorDefecto()
}

export function guardarFamiliasExpandidas(estado: ExpandedFamilies): void {
  try {
    localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify(estado))
  } catch {
    // Cuota de localStorage llena o modo privado: no es crítico, se ignora.
  }
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
  expandedFamilies: ExpandedFamilies
  onToggleFamily: (categoria: keyof ActiveFilters) => void
  onExpandAll: () => void
  onCollapseAll: () => void
}

export default function CollectionsFilters({
  collections,
  search,
  onSearchChange,
  activeFilters,
  onToggle,
  onClear,
  expandedFamilies,
  onToggleFamily,
  onExpandAll,
  onCollapseAll,
}: CollectionsFiltersProps) {
  const hasActiveFilters =
    search.trim() !== '' || Object.values(activeFilters).some((arr) => arr.length > 0)
  const todoExpandido = Object.values(expandedFamilies).every(Boolean)

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
      <div className="collections-filters-header">
        <h2>Filtros</h2>
        <button type="button" className="collections-filters-toggle-all" onClick={todoExpandido ? onCollapseAll : onExpandAll}>
          {todoExpandido ? 'Colapsar todo' : 'Expandir todo'}
        </button>
      </div>

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

      {secciones.map((seccion) => {
        const expandida = expandedFamilies[seccion.categoria]
        const activos = activeFilters[seccion.categoria].length
        return (
          <div className="collections-filters-section" key={seccion.categoria}>
            <button
              type="button"
              className="collections-filters-section-header"
              onClick={() => onToggleFamily(seccion.categoria)}
              aria-expanded={expandida}
            >
              <span className="collections-filters-section-title">
                {seccion.titulo}
                {activos > 0 && <span className="collections-filters-badge">{activos}</span>}
              </span>
              <CaretDown
                size={16}
                weight="bold"
                className={`collections-filters-chevron ${expandida ? 'is-expanded' : ''}`}
              />
            </button>

            <div className={`collections-filters-options-wrap ${expandida ? 'is-expanded' : ''}`}>
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
          </div>
        )
      })}

      {hasActiveFilters && (
        <button type="button" className="secondary collections-filters-clear" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
