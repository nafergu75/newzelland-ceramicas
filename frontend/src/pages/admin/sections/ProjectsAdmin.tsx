import { useState, useEffect } from 'react'
import axios from 'axios'

interface Project {
  id: number
  titulo: string
  slug: string
  tipo_espacio: string
  ubicacion_ciudad?: string
  ubicacion_pais?: string
  colecciones_usadas?: string[]
  estado: string
  destacado: boolean
  created_at: string
  updated_at: string
}

interface FormData {
  titulo: string
  slug: string
  descripcion_corta: string
  descripcion: string
  tipo_espacio: string
  subtipo_espacio: string
  ubicacion_ciudad: string
  ubicacion_pais: string
  ano_ejecucion: string
  colecciones_usadas: string[]
  imagenes: string
  imagen_portada: string
  destacado: boolean
  estado: string
  orden: string
}

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    slug: '',
    descripcion_corta: '',
    descripcion: '',
    tipo_espacio: 'vivienda',
    subtipo_espacio: '',
    ubicacion_ciudad: '',
    ubicacion_pais: '',
    ano_ejecucion: '',
    colecciones_usadas: [],
    imagenes: '',
    imagen_portada: '',
    destacado: false,
    estado: 'publicado',
    orden: '0'
  })

  const tiposEspacio = ['vivienda', 'hotel', 'restaurante', 'comercio', 'oficina', 'otros']
  const colecciones = ['alpina', 'aneto', 'estelas', 'menhires']

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/projects?pageSize=100')
      setProjects(response.data.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else if (name === 'colecciones_usadas') {
      const selected = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value)
      setFormData(prev => ({ ...prev, colecciones_usadas: selected }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let slug = e.target.value.toLowerCase().trim()
    slug = slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        ano_ejecucion: formData.ano_ejecucion ? parseInt(formData.ano_ejecucion) : null,
        orden: parseInt(formData.orden),
        imagenes: formData.imagenes ? formData.imagenes.split('\n').map(url => ({ url: url.trim() })).filter(i => i.url) : [],
        colecciones_usadas: formData.colecciones_usadas || []
      }

      if (editingId) {
        await axios.put(`/api/admin/projects/${editingId}`, payload)
      } else {
        await axios.post('/api/admin/projects', payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({
        titulo: '',
        slug: '',
        descripcion_corta: '',
        descripcion: '',
        tipo_espacio: 'vivienda',
        subtipo_espacio: '',
        ubicacion_ciudad: '',
        ubicacion_pais: '',
        ano_ejecucion: '',
        colecciones_usadas: [],
        imagenes: '',
        imagen_portada: '',
        destacado: false,
        estado: 'publicado',
        orden: '0'
      })
      fetchProjects()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error al guardar el proyecto')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return
    try {
      await axios.delete(`/api/admin/projects/${id}`)
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error al eliminar el proyecto')
    }
  }

  if (loading) return <div>Cargando proyectos...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Proyectos</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1f2937',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo proyecto'}
        </button>
      </div>

      {showForm && (
        <div style={{
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '1px solid #e5e7eb'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Título *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Tipo de espacio *
                </label>
                <select
                  name="tipo_espacio"
                  value={formData.tipo_espacio}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                >
                  {tiposEspacio.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Subtipo de espacio
                </label>
                <input
                  type="text"
                  name="subtipo_espacio"
                  value={formData.subtipo_espacio}
                  onChange={handleFormChange}
                  placeholder="Ej. salón, cocina, baño"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ubicacion_ciudad"
                  value={formData.ubicacion_ciudad}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  País
                </label>
                <input
                  type="text"
                  name="ubicacion_pais"
                  value={formData.ubicacion_pais}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Año de ejecución
                </label>
                <input
                  type="number"
                  name="ano_ejecucion"
                  value={formData.ano_ejecucion}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Orden
                </label>
                <input
                  type="number"
                  name="orden"
                  value={formData.orden}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Colecciones usadas
              </label>
              <select
                name="colecciones_usadas"
                multiple
                value={formData.colecciones_usadas}
                onChange={handleFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.375rem',
                  minHeight: '100px'
                }}
              >
                {colecciones.map(col => (
                  <option key={col} value={col}>
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </option>
                ))}
              </select>
              <small style={{ color: '#666' }}>Mantén Ctrl/Cmd presionado para seleccionar múltiples</small>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Descripción corta
              </label>
              <textarea
                name="descripcion_corta"
                value={formData.descripcion_corta}
                onChange={handleFormChange}
                rows={2}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Descripción completa *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleFormChange}
                rows={5}
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                URL Imagen portada
              </label>
              <input
                type="text"
                name="imagen_portada"
                value={formData.imagen_portada}
                onChange={handleFormChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                URLs de imágenes de galería (una por línea)
              </label>
              <textarea
                name="imagenes"
                value={formData.imagenes}
                onChange={handleFormChange}
                rows={4}
                placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem', fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem' }}
                >
                  <option value="publicado">Publicado</option>
                  <option value="borrador">Borrador</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleFormChange}
                  />
                  Destacado
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                {editingId ? 'Actualizar' : 'Crear'} proyecto
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de proyectos */}
      <div style={{
        overflowX: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.95rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Título</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Ubicación</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Destacado</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem' }}>{project.titulo}</td>
                <td style={{ padding: '1rem' }}>{project.tipo_espacio}</td>
                <td style={{ padding: '1rem' }}>
                  {project.ubicacion_ciudad && `${project.ubicacion_ciudad}`}
                  {project.ubicacion_pais && `, ${project.ubicacion_pais}`}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: project.estado === 'publicado' ? '#dcfce7' : '#fef3c7',
                    color: project.estado === 'publicado' ? '#166534' : '#92400e',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}>
                    {project.estado}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {project.destacado ? '✓' : '-'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => {
                      setEditingId(project.id)
                      setShowForm(true)
                      // Aquí iría la lógica para cargar los datos del proyecto en el formulario
                    }}
                    style={{
                      marginRight: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No hay proyectos aún. ¡Crea el primero!</p>
        </div>
      )}
    </div>
  )
}
