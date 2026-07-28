import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Footer from '../components/Footer'

interface ProjectImage {
  url: string
  alt?: string
  orden?: number
}

interface Project {
  id: number
  titulo: string
  slug: string
  descripcion: string
  tipo_espacio: string
  subtipo_espacio?: string
  ubicacion_ciudad?: string
  ubicacion_pais?: string
  ano_ejecucion?: number
  colecciones_usadas: string[]
  imagenes: ProjectImage[]
  imagen_portada?: string
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    fetchProject()
  }, [slug])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/projects/${slug}`)
      setProject(response.data)
      setSelectedImageIndex(0)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Cargando proyecto...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Proyecto no encontrado</p>
        </main>
        <Footer />
      </div>
    )
  }

  const images = project.imagenes && Array.isArray(project.imagenes) ? project.imagenes : []
  const selectedImage = images[selectedImageIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        {/* Imagen principal */}
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#f0f0f0',
          overflow: 'hidden'
        }}>
          <img
            src={project.imagen_portada || selectedImage?.url || ''}
            alt={project.titulo}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Contenido */}
        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-3xl)',
              marginBottom: 'var(--spacing-3xl)'
            }}>
              {/* Información del proyecto */}
              <div>
                <h1 style={{ margin: '0 0 1rem 0' }}>{project.titulo}</h1>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
                  {project.tipo_espacio.charAt(0).toUpperCase() + project.tipo_espacio.slice(1)}
                  {project.subtipo_espacio && ` • ${project.subtipo_espacio}`}
                </p>
                {(project.ubicacion_ciudad || project.ubicacion_pais) && (
                  <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>
                    <strong>Ubicación:</strong>{' '}
                    {project.ubicacion_ciudad && `${project.ubicacion_ciudad}`}
                    {project.ubicacion_pais && `, ${project.ubicacion_pais}`}
                  </p>
                )}
                {project.ano_ejecucion && (
                  <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
                    <strong>Año:</strong> {project.ano_ejecucion}
                  </p>
                )}

                <div style={{ marginBottom: '2rem', lineHeight: '1.8', color: '#555' }}>
                  {project.descripcion.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} style={{ marginBottom: '1rem' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Colecciones */}
                {project.colecciones_usadas && project.colecciones_usadas.length > 0 && (
                  <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                    <h3 style={{ marginTop: 0 }}>Colecciones utilizadas</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {project.colecciones_usadas.map((collection) => (
                        <Link
                          key={collection}
                          to={`/collections/${collection}`}
                          style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '0.375rem',
                            textDecoration: 'none',
                            color: '#1f2937',
                            fontWeight: 500,
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e7eb'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                          }}
                        >
                          {collection.charAt(0).toUpperCase() + collection.slice(1)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div style={{
                  marginTop: '2rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <Link
                    to="/presupuesto"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#1f2937',
                      color: 'white',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#111827'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937'
                    }}
                  >
                    Solicitar presupuesto
                  </Link>
                  <Link
                    to="/contact"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'white',
                      color: '#1f2937',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1f2937'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db'
                    }}
                  >
                    Contactar
                  </Link>
                </div>
              </div>

              {/* Galería */}
              <div>
                {images.length > 0 && (
                  <>
                    <div style={{
                      width: '100%',
                      aspectRatio: '4/3',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}>
                      <img
                        src={selectedImage?.url || project.imagen_portada || ''}
                        alt={selectedImage?.alt || project.titulo}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    {/* Miniaturas */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem'
                    }}>
                      {images.map((image, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          style={{
                            aspectRatio: '1',
                            padding: 0,
                            border: selectedImageIndex === idx ? '3px solid #1f2937' : '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            backgroundColor: '#f0f0f0'
                          }}
                        >
                          <img
                            src={image.url}
                            alt={image.alt || `Imagen ${idx + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bloque de recomendación */}
            <div style={{
              padding: 'var(--spacing-2xl)',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <h3 style={{ marginTop: 0 }}>¿Te gusta este proyecto?</h3>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Cuéntanos el tuyo y te ayudaremos a hacerlo realidad.
              </p>
              <Link
                to="/presupuesto"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                Solicitar presupuesto
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
