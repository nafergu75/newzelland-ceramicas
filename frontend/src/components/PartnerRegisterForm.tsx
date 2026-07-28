import { useState } from 'react'
import axios from 'axios'
import '../styles/components.css'

interface PartnerRegisterFormData {
  nombre_completo: string
  email: string
  telefono: string
  empresa?: string
  tipo_profesional?: string
  web_portfolio?: string
  ciudad?: string
  pais?: string
  descripcion?: string
  privacy_accepted: boolean
}

export default function PartnerRegisterForm() {
  const [formData, setFormData] = useState<PartnerRegisterFormData>({
    nombre_completo: '',
    email: '',
    telefono: '',
    empresa: '',
    tipo_profesional: '',
    web_portfolio: '',
    ciudad: '',
    pais: '',
    descripcion: '',
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

    if (!formData.nombre_completo || !formData.email || !formData.telefono) {
      setError('Nombre, email y teléfono son obligatorios')
      return
    }
    if (!formData.privacy_accepted) {
      setError('Debes aceptar la política de privacidad')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/partners', {
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono,
        empresa: formData.empresa || null,
        tipo_profesional: formData.tipo_profesional || null,
        web_portfolio: formData.web_portfolio || null,
        ciudad: formData.ciudad || null,
        pais: formData.pais || null,
        descripcion: formData.descripcion || null,
      })
      setSuccess(true)
      setFormData({
        nombre_completo: '',
        email: '',
        telefono: '',
        empresa: '',
        tipo_profesional: '',
        web_portfolio: '',
        ciudad: '',
        pais: '',
        descripcion: '',
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
        <label htmlFor="empresa">Empresa / Estudio</label>
        <input
          type="text"
          id="empresa"
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tipo_profesional">Tipo de profesional</label>
        <select
          id="tipo_profesional"
          name="tipo_profesional"
          value={formData.tipo_profesional}
          onChange={handleChange}
        >
          <option value="">Selecciona un tipo...</option>
          <option value="Interiorista">Interiorista</option>
          <option value="Arquitecto">Arquitecto</option>
          <option value="Instalador">Instalador</option>
          <option value="Decorador">Decorador</option>
          <option value="Distribuidor">Distribuidor</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="web_portfolio">Web / Portfolio</label>
        <input
          type="url"
          id="web_portfolio"
          name="web_portfolio"
          placeholder="https://ejemplo.com"
          value={formData.web_portfolio}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="ciudad">Ciudad</label>
        <input
          type="text"
          id="ciudad"
          name="ciudad"
          value={formData.ciudad}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="pais">País</label>
        <input
          type="text"
          id="pais"
          name="pais"
          value={formData.pais}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Breve descripción de tu actividad</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Cuéntanos sobre tu experiencia y especialización"
          rows={4}
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
          ✓ Solicitud enviada correctamente. Revisaremos tus datos y nos pondremos en contacto.
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
