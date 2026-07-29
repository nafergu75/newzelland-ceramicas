import { useParams, Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FilePdf, WhatsappLogo, Sliders } from '@phosphor-icons/react'
import Footer from '../components/Footer'
import SeriesCard from '../components/SeriesCard'
import AddToCartBox from '../components/AddToCartBox'
import ImageWithFallback from '../components/ImageWithFallback'
import CollectionsFilters, {
  ActiveFilters,
  EMPTY_FILTERS,
  espesorEnRango,
  materialesDe,
  ExpandedFamilies,
  ALL_EXPANDED,
  ALL_COLLAPSED,
  cargarFamiliasExpandidas,
  guardarFamiliasExpandidas,
} from '../components/CollectionsFilters'
import FilterDrawer from '../components/FilterDrawer'
import ColorSelector from '../components/ColorSelector'
import { series, getSerieById } from '../data/catalog'
import { getCollections, getCollection } from '../services/collectionsService'
import type { Collection, CollectionDetail, ColorFoto } from '../types/collections'
import { useCatalogDownload } from '../hooks/useCatalogDownload'

export default function CollectionsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedFamilies, setExpandedFamilies] = useState<ExpandedFamilies>(cargarFamiliasExpandidas)
  const [collectionDetail, setCollectionDetail] = useState<CollectionDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [selectedColor, setSelectedColor] = useState<ColorFoto | null>(null)
  const { handleDownload, downloadingKey, downloadError } = useCatalogDownload()

  // Las fichas técnica/catálogo (PDF) siguen siendo un sistema aparte
  // (R2 firmado + tracking de descarga, ver api/index.js) que no vive en la
  // tabla `collections` — se sigue leyendo del JSON estático solo para ese dato.
  const serieFichas = slug ? getSerieById(slug) : undefined

  useEffect(() => {
    if (slug) return // vista detalle: no hace falta cargar el listado
    let cancelado = false
    getCollections()
      .then((data) => {
        if (!cancelado) setCollections(data)
      })
      .catch((error) => console.error('Error cargando colecciones:', error))
      .finally(() => {
        if (!cancelado) setLoadingCollections(false)
      })
    return () => {
      cancelado = true
    }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    let cancelado = false
    setLoadingDetail(true)
    setSelectedColor(null)
    getCollection(slug)
      .then((data) => {
        if (!cancelado) setCollectionDetail(data)
      })
      .catch(() => {
        if (!cancelado) setCollectionDetail(null)
      })
      .finally(() => {
        if (!cancelado) setLoadingDetail(false)
      })
    return () => {
      cancelado = true
    }
  }, [slug])

  useEffect(() => {
    guardarFamiliasExpandidas(expandedFamilies)
  }, [expandedFamilies])

  const handleToggleFamily = (categoria: keyof ActiveFilters) => {
    setExpandedFamilies((prev) => ({ ...prev, [categoria]: !prev[categoria] }))
  }

  const handleExpandAll = () => setExpandedFamilies(ALL_EXPANDED)
  const handleCollapseAll = () => setExpandedFamilies(ALL_COLLAPSED)

  const handleToggleFilter = (categoria: keyof ActiveFilters, valor: string) => {
    setActiveFilters((prev) => {
      const actual = prev[categoria]
      const actualizado = actual.includes(valor)
        ? actual.filter((v) => v !== valor)
        : [...actual, valor]
      return { ...prev, [categoria]: actualizado }
    })
  }

  const handleClearFilters = () => {
    setActiveFilters(EMPTY_FILTERS)
    setSearch('')
  }

  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (!c.nombre.toLowerCase().includes(q) && !c.material.toLowerCase().includes(q)) {
          return false
        }
      }
      if (activeFilters.material.length > 0 && !activeFilters.material.some((m) => materialesDe(c).includes(m))) {
        return false
      }
      if (activeFilters.tipo.length > 0 && !activeFilters.tipo.some((t) => c.tipo.includes(t))) {
        return false
      }
      if (activeFilters.formatos.length > 0 && !activeFilters.formatos.some((f) => c.formatos.includes(f))) {
        return false
      }
      if (activeFilters.acabados.length > 0 && !activeFilters.acabados.some((a) => c.acabados.includes(a))) {
        return false
      }
      if (activeFilters.espesor.length > 0 && !activeFilters.espesor.some((rango) => espesorEnRango(c.espesor, rango))) {
        return false
      }
      if (activeFilters.estilo.length > 0 && !activeFilters.estilo.includes(c.estilo)) {
        return false
      }
      if (activeFilters.colores.length > 0 && !activeFilters.colores.some((col) => c.colores.includes(col))) {
        return false
      }
      return true
    })
  }, [collections, search, activeFilters])

  // --- Vista detalle de una serie (ficha de producto) ---
  if (slug) {
    if (loadingDetail) {
      return (
        <div style={{ padding: 'var(--space-24) var(--space-6)', textAlign: 'center' }}>
          <p>Cargando serie...</p>
        </div>
      )
    }

    if (!collectionDetail) {
      return (
        <div style={{ padding: 'var(--space-24) var(--space-6)', textAlign: 'center' }}>
          <h1>Serie no encontrada</h1>
          <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Volver a Colecciones
          </Link>
        </div>
      )
    }

    const whatsappText = encodeURIComponent(
      `Hola, me interesa la serie ${collectionDetail.nombre} (${collectionDetail.formatos.join(', ')}). ¿Podéis prepararme un presupuesto?`
    )

    const related = series
      .filter((s) => s.id !== collectionDetail.id && s.material.split(',')[0] === collectionDetail.material.split(',')[0])
      .slice(0, 3)

    const imagenPrincipal = selectedColor?.imagen || collectionDetail.imagen

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1 }}>
          <div className="serie-detail">
            <div className="serie-detail-media animate-fade-in-up">
              <ImageWithFallback
                src={imagenPrincipal}
                alt={`Serie ${collectionDetail.nombre}${selectedColor ? ' en ' + selectedColor.nombre : ' en ambiente'}`}
              />
            </div>

            <div className="serie-detail-info">
              <Link
                to="/collections"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}
              >
                <ArrowLeft size={14} /> Colecciones
              </Link>

              <h1>{collectionDetail.nombre}</h1>
              <p className="serie-meta">
                {collectionDetail.material} · {collectionDetail.tipo.join(' y ')}
              </p>
              <p>{collectionDetail.descripcion}</p>

              <div className="spec-groups">
                <div className="spec-group">
                  <h3>Formatos y acabados</h3>
                  <p>{collectionDetail.formatos.join(', ')} cm</p>
                  <p>{collectionDetail.acabados.join(', ')}</p>
                </div>
                <div className="spec-group">
                  <h3>Colores</h3>
                  <p>{collectionDetail.colores.join(', ')}</p>
                </div>
              </div>

              <ColorSelector
                colores={collectionDetail.colores_fotos}
                selected={selectedColor}
                onSelect={setSelectedColor}
              />

              <AddToCartBox serie={collectionDetail} />

              <div className="serie-actions">
                <a
                  href={`https://wa.me/34123456789?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <WhatsappLogo size={18} weight="regular" />
                  Solicitar presupuesto
                </a>
                {serieFichas?.fichas.tecnica && (
                  <button
                    className="secondary"
                    onClick={() => handleDownload(collectionDetail.id, 'tecnica', collectionDetail.nombre)}
                    disabled={downloadingKey === `${collectionDetail.id}-tecnica`}
                  >
                    <FilePdf size={18} weight="regular" />
                    {downloadingKey === `${collectionDetail.id}-tecnica` ? 'Descargando…' : 'Ficha técnica'}
                  </button>
                )}
                {serieFichas?.fichas.catalogo && (
                  <button
                    className="secondary"
                    onClick={() => handleDownload(collectionDetail.id, 'catalogo', collectionDetail.nombre)}
                    disabled={downloadingKey === `${collectionDetail.id}-catalogo`}
                  >
                    <FilePdf size={18} weight="regular" />
                    {downloadingKey === `${collectionDetail.id}-catalogo` ? 'Descargando…' : 'Catálogo'}
                  </button>
                )}
              </div>
              {downloadError && (
                <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: 'var(--space-3)' }}>
                  {downloadError}
                </p>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="container">
                <h2 style={{ marginBottom: 'var(--space-8)' }}>Series del mismo material</h2>
                <div className="grid grid-cols-3">
                  {related.map((s) => (
                    <SeriesCard key={s.id} serie={s} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    )
  }

  // --- Vista listado con sidebar de filtros ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <section className="hero-section plain">
          <div className="hero-content">
            <h1>Colecciones</h1>
            <p>{collections.length || series.length} series de cerámica y porcelánico. Filtra por material, tipo, formato y más.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <button
              type="button"
              className="secondary collections-mobile-filter-btn"
              onClick={() => setDrawerOpen(true)}
            >
              <Sliders size={16} weight="bold" />
              Filtros
            </button>

            <div className="collections-layout">
              <aside className="collections-layout-sidebar">
                <CollectionsFilters
                  collections={collections}
                  search={search}
                  onSearchChange={setSearch}
                  activeFilters={activeFilters}
                  onToggle={handleToggleFilter}
                  onClear={handleClearFilters}
                  expandedFamilies={expandedFamilies}
                  onToggleFamily={handleToggleFamily}
                  onExpandAll={handleExpandAll}
                  onCollapseAll={handleCollapseAll}
                />
              </aside>

              <FilterDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <CollectionsFilters
                  collections={collections}
                  search={search}
                  onSearchChange={setSearch}
                  activeFilters={activeFilters}
                  onToggle={handleToggleFilter}
                  onClear={handleClearFilters}
                  expandedFamilies={expandedFamilies}
                  onToggleFamily={handleToggleFamily}
                  onExpandAll={handleExpandAll}
                  onCollapseAll={handleCollapseAll}
                />
              </FilterDrawer>

              <div className="collections-layout-main">
                {loadingCollections ? (
                  <p>Cargando colecciones...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3">
                      {filteredCollections.map((c) => (
                        <SeriesCard key={c.id} serie={c} />
                      ))}
                    </div>

                    {filteredCollections.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                        <p>No hay resultados para tu búsqueda.</p>
                        <button className="secondary" onClick={handleClearFilters}>
                          Limpiar filtros
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
