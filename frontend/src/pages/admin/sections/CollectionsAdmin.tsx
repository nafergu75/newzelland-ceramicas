import { useEffect, useState } from 'react'
import { adminService, AdminCollectionRow } from '../../../services/adminService'

interface FormState {
  slug: string
  nombre: string
  descripcion: string
  imagen_portada: string
  material: string
  tipo: string
  formatos: string
  acabados: string
  colores: string
  acabado_corte: string
  espesor: string
  estilo: string
  especificaciones_verificadas: boolean
}

const FORM_VACIO: FormState = {
  slug: '',
  nombre: '',
  descripcion: '',
  imagen_portada: '',
  material: '',
  tipo: '',
  formatos: '',
  acabados: '',
  colores: '',
  acabado_corte: 'Rectificado',
  espesor: '10',
  estilo: 'Moderno',
  especificaciones_verificadas: false,
}

function filaAFormulario(fila: AdminCollectionRow): FormState {
  return {
    slug: fila.slug,
    nombre: fila.nombre,
    descripcion: fila.descripcion || '',
    imagen_portada: fila.imagen_portada || '',
    material: fila.material || '',
    tipo: (fila.tipo || []).join(', '),
    formatos: (fila.formatos || []).join(', '),
    acabados: (fila.acabados || []).join(', '),
    colores: (fila.colores || []).join(', '),
    acabado_corte: fila.acabado_corte,
    espesor: String(fila.espesor),
    estilo: fila.estilo,
    especificaciones_verificadas: fila.especificaciones_verificadas,
  }
}

function formularioAPayload(form: FormState) {
  return {
    slug: form.slug.trim(),
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    imagen_portada: form.imagen_portada.trim() || null,
    material: form.material.trim() || null,
    tipo: form.tipo.split(',').map((v) => v.trim()).filter(Boolean),
    formatos: form.formatos.split(',').map((v) => v.trim()).filter(Boolean),
    acabados: form.acabados.split(',').map((v) => v.trim()).filter(Boolean),
    colores: form.colores.split(',').map((v) => v.trim()).filter(Boolean),
    acabado_corte: form.acabado_corte.trim() || 'Rectificado',
    espesor: parseFloat(form.espesor) || 10,
    estilo: form.estilo.trim() || 'Moderno',
    especificaciones_verificadas: form.especificaciones_verificadas,
  }
}

export default function CollectionsAdmin() {
  const [collections, setCollections] = useState<AdminCollectionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_VACIO)
  const [saving, setSaving] = useState(false)

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAdminCollections()
      setCollections(data.collections)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleNuevo = () => {
    setEditingId(null)
    setForm(FORM_VACIO)
    setShowForm(true)
  }

  const handleEditar = (fila: AdminCollectionRow) => {
    setEditingId(fila.id)
    setForm(filaAFormulario(fila))
    setShowForm(true)
  }

  const handleGuardar = async () => {
    try {
      setSaving(true)
      const payload = formularioAPayload(form)
      if (editingId) {
        await adminService.actualizarCollection(editingId, payload)
      } else {
        await adminService.crearCollection(payload)
      }
      setShowForm(false)
      await cargar()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar esta colección?')) return
    try {
      await adminService.eliminarCollection(id)
      await cargar()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return <p>Cargando colecciones...</p>
  if (error) return <p style={{ color: '#c62828' }}>Error: {error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Colecciones ({collections.length})</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => adminService.exportarCollectionsCsv()}
            style={{ padding: '8px 16px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
          >
            Exportar CSV
          </button>
          <button
            onClick={handleNuevo}
            style={{ padding: '8px 16px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            + Nueva colección
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Editar colección' : 'Nueva colección'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Slug
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={!!editingId} style={{ width: '100%' }} />
            </label>
            <label>
              Nombre
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Material
              <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Tipo (separado por comas)
              <input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Pavimento, Revestimiento" style={{ width: '100%' }} />
            </label>
            <label>
              Formatos (separado por comas)
              <input value={form.formatos} onChange={(e) => setForm({ ...form, formatos: e.target.value })} placeholder="30x60, 60x60" style={{ width: '100%' }} />
            </label>
            <label>
              Acabados (separado por comas)
              <input value={form.acabados} onChange={(e) => setForm({ ...form, acabados: e.target.value })} placeholder="Mate, Brillo" style={{ width: '100%' }} />
            </label>
            <label>
              Colores (separado por comas)
              <input value={form.colores} onChange={(e) => setForm({ ...form, colores: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Imagen de portada (URL)
              <input value={form.imagen_portada} onChange={(e) => setForm({ ...form, imagen_portada: e.target.value })} style={{ width: '100%' }} />
              {!form.imagen_portada.trim() && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8a6416' }}>
                  Sin URL: la ficha mostrará el icono genérico por defecto. Pega aquí la foto real cuando la tengas.
                </p>
              )}
            </label>
            <label>
              Acabado de corte
              <input value={form.acabado_corte} onChange={(e) => setForm({ ...form, acabado_corte: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Espesor (mm)
              <input type="number" value={form.espesor} onChange={(e) => setForm({ ...form, espesor: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label>
              Estilo
              <input value={form.estilo} onChange={(e) => setForm({ ...form, estilo: e.target.value })} style={{ width: '100%' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={form.especificaciones_verificadas}
                onChange={(e) => setForm({ ...form, especificaciones_verificadas: e.target.checked })}
              />
              Especificaciones verificadas
            </label>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button onClick={handleGuardar} disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Material</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Estilo</th>
            <th style={{ textAlign: 'center', padding: '12px' }}>Verificado</th>
            <th style={{ textAlign: 'right', padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '12px' }}>
                {c.nombre}
                {!c.imagen_portada && (
                  <span
                    style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: '#fff3cd',
                      color: '#8a6416',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                    title="Esta colección no tiene foto real: usa el icono genérico por defecto"
                  >
                    Sin foto real
                  </span>
                )}
              </td>
              <td style={{ padding: '12px' }}>{c.material}</td>
              <td style={{ padding: '12px' }}>{c.estilo}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{c.especificaciones_verificadas ? '✓' : '—'}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button onClick={() => handleEditar(c)} style={{ marginRight: '8px', padding: '6px 12px', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => handleEliminar(c.id)} style={{ padding: '6px 12px', color: '#c62828', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
