import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

interface Project {
  id: number
  titulo: string
  slug: string
  descripcion_corta?: string
  tipo_espacio: string
  ubicacion_ciudad?: string
  ubicacion_pais?: string
  colecciones_usadas: string[]
  imagen_portada?: string
  destacado: boolean
  ano_ejecucion?: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()

  const tipoEspacio = searchParams.get('tipo_espacio') || ''
  const collection = searchParams.get('collection') || ''
  const pais = searchParams.get('pais') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const tiposEspacio = ['vivienda', 'hotel', 'restaurante', 'comercio', 'oficina', 'otros']
  const colecciones = ['alpina', 'aneto', 'estelas', 'menhires']

  useEffect(() => {
    fetchProjects()
  }, [tipoEspacio, collection, pais, page])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (tipoEspacio) params.append('tipo_espacio', tipoEspacio)
      if (collection) params.append('collection', collection)
      if (pais) params.append('pais', pais)
      params.append('page', page.toString())
      params.append('pageSize', '12')

      const response = await axios.get(`/api/projects?${params.toString()}`)
      setProjects(response.data.data)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTipoEspacioChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('tipo_espacio', value)
    } else {
      newParams.delete('tipo_espacio')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleCollectionChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('collection', value)
    } else {
      newParams.delete('collection')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handlePaisChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('pais', value)
    } else {
      newParams.delete('pais')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <HeroSection
          title="Proyectos"
          subtitle="Descubre cómo nuestras cerámicas dan vida a espacios únicos"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            {/* Filtros */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-3xl)',
              padding: 'var(--spacing-2xl)',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Tipo de espacio
                </label>
                <select
                  value={tipoEspacio}
                  onChange={(e) => handleTipoEspacioChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.375rem',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">Todos</option>
                  {tiposEspacio.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Colección
                </label>
                <select
                  value={collection}
                  onChange={(e) => handleCollectionChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.375rem',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">Todas</option>
                  {colecciones.map((col) => (
                    <option key={col} value={col}>
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  País
                </label>
                <input
                  type="text"
                  value={pais}
                  onChange={(e) => handlePaisChange(e.target.value)}
                  placeholder="Ej. España"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.375rem',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            {/* Grid de proyectos */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                <p>Cargando proyectos...</p>
              </div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                <p>No se encontraron proyectos con estos filtros.</p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 'var(--spacing-2xl)',
                  marginBottom: 'var(--spacing-3xl)'
                }}>
                  {projects.map((project) => (
                    <a
                      key={project.id}
                      href={`/proyectos/${project.slug}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Imagen */}
                      <div style={{
                        aspectRatio: '3/2',
                        overflow: 'hidden',
                        backgroundColor: '#f0f0f0'
                      }}>
                        {project.imagen_portada ? (
                          <img
                            src={project.imagen_portada}
                            alt={project.titulo}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#e0e0e0',
                            color: '#999'
                          }}>
                            Sin imagen
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div style={{ padding: 'var(--spacing-lg)' }}>
                        {project.destacado && (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#fbbf24',
                            color: '#78350f',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem'
                          }}>
                            Destacado
                          </span>
                        )}
                        <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', lineHeight: 1.4 }}>
                          {project.titulo}
                        </h3>
                        <p style={{
                          margin: '0.5rem 0',
                          fontSize: '0.9rem',
                          color: '#666'
                        }}>
                          {project.tipo_espacio.charAt(0).toUpperCase() + project.tipo_espacio.slice(1)}
                          {project.ubicacion_ciudad && ` • ${project.ubicacion_ciudad}`}
                          {project.ubicacion_pais && `, ${project.ubicacion_pais}`}
                        </p>
                        {project.descripcion_corta && (
                          <p style={{
                            margin: '0.75rem 0',
                            fontSize: '0.9rem',
                            color: '#555',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {project.descripcion_corta}
                          </p>
                        )}
                        {project.colecciones_usadas && project.colecciones_usadas.length > 0 && (
                          <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {project.colecciones_usadas.map((col) => (
                              <span
                                key={col}
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#f3f4f6',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.8rem',
                                  color: '#666'
                                }}
                              >
                                {col}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>

                {/* Paginación */}
                {total > 12 && (
                  <div style={{ textAlign: 'center', marginTop: 'var(--spacing-3xl)' }}>
                    <button
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams)
                        newParams.set('page', (page - 1).toString())
                        setSearchParams(newParams)
                      }}
                      disabled={page === 1}
                      style={{
                        padding: '0.75rem 1.5rem',
                        marginRight: '1rem',
                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                        opacity: page === 1 ? 0.5 : 1
                      }}
                    >
                      Anterior
                    </button>
                    <span style={{ margin: '0 1rem', fontSize: '0.95rem' }}>
                      Página {page}
                    </span>
                    <button
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams)
                        newParams.set('page', (page + 1).toString())
                        setSearchParams(newParams)
                      }}
                      disabled={page * 12 >= total}
                      style={{
                        padding: '0.75rem 1.5rem',
                        marginLeft: '1rem',
                        cursor: page * 12 >= total ? 'not-allowed' : 'pointer',
                        opacity: page * 12 >= total ? 0.5 : 1
                      }}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
