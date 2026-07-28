import { useState } from 'react'
import axios from 'axios'
import '../styles/components.css'

interface QuoteRequestFormData {
  nombre_completo: string
  email: string
  telefono: string
  tipo_proyecto?: string
  tipo_espacio?: string
  descripcion: string
  archivos_url?: string
  privacy_accepted: boolean
}

export default function QuoteRequestForm() {
  const [formData, setFormData] = useState<QuoteRequestFormData>({
    nombre_completo: '',
    email: '',
    telefono: '',
    tipo_proyecto: '',
    tipo_espacio: '',
    descripcion: '',
    archivos_url: '',
    privacy_accepted: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre_completo || !formData.email || !formData.telefono || !formData.descripcion) {
      setError('Nombre, email, teléfono y descripción son obligatorios')
      return
    }
    if (!formData.privacy_accepted) {
      setError('Debes aceptar la política de privacidad')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/quote-requests', {
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono,
        tipo_proyecto: formData.tipo_proyecto || null,
        tipo_espacio: formData.tipo_espacio || null,
        descripcion: formData.descripcion,
        archivos_url: formData.archivos_url || null,
      })
      setSuccess(true)
      setFormData({
        nombre_completo: '',
        email: '',
        telefono: '',
        tipo_proyecto: '',
        tipo_espacio: '',
        descripcion: '',
        archivos_url: '',
        privacy_accepted: false,
      })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Error al enviar la solicitud' : 'Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="nombre_completo">Nombre completo *</label>
        <input
          type="text"
          id="nombre_completo"
          name="nombre_completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="telefono">Teléfono *</label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="tipo_proyecto">Tipo de proyecto</label>
        <select
          id="tipo_proyecto"
          name="tipo_proyecto"
          value={formData.tipo_proyecto}
          onChange={handleChange}
        >
          <option value="">Selecciona un tipo...</option>
          <option value="Particular">Particular</option>
          <option value="Interiorismo / Decoración">Interiorismo / Decoración</option>
          <option value="Arquitectura">Arquitectura</option>
          <option value="Instalación / Reforma">Instalación / Reforma</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tipo_espacio">Tipo de espacio</label>
        <select
          id="tipo_espacio"
          name="tipo_espacio"
          value={formData.tipo_espacio}
          onChange={handleChange}
        >
          <option value="">Selecciona un tipo...</option>
          <option value="Vivienda">Vivienda</option>
          <option value="Hotel">Hotel</option>
          <option value="Restaurante">Restaurante</option>
          <option value="Comercio">Comercio</option>
          <option value="Oficina">Oficina</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción del proyecto *</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Incluye: m² aproximados, zonas a revestir, materiales de interés, plazos, etc."
          required
          rows={6}
        />
      </div>

      <div className="form-group">
        <label htmlFor="archivos_url">Enlace a planos o imágenes (opcional)</label>
        <input
          type="text"
          id="archivos_url"
          name="archivos_url"
          placeholder="Enlace a Drive, Dropbox, WeTransfer, etc."
          value={formData.archivos_url}
          onChange={handleChange}
        />
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <input
          type="checkbox"
          id="privacy_accepted"
          name="privacy_accepted"
          checked={formData.privacy_accepted}
          onChange={handleChange}
        />
        <label htmlFor="privacy_accepted" style={{ margin: 0 }}>
          He leído y acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer">política de privacidad</a> *
        </label>
      </div>

      {success && (
        <div className="success-message">
          ✓ Solicitud enviada correctamente. Te contactaremos pronto.
        </div>
      )}

      {error && (
        <div className="error-message" style={{ color: '#dc2626', marginBottom: '1rem' }}>
          ✗ {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Enviando...' : 'Enviar Solicitud'}
      </button>
    </form>
  )
}
