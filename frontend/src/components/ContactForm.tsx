import { useState } from 'react'
import axios from 'axios'
import '../styles/components.css'

interface ContactFormData {
  nombre_completo: string
  email: string
  telefono?: string
  asunto?: string
  mensaje: string
  privacy_accepted: boolean
}

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => Promise<void>
  showAsunto?: boolean
}

export default function ContactForm({ onSubmit, showAsunto = true }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    nombre_completo: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
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

    // Validación
    if (!formData.nombre_completo || !formData.email || !formData.mensaje) {
      setError('Nombre, email y mensaje son obligatorios')
      return
    }
    if (!formData.privacy_accepted) {
      setError('Debes aceptar la política de privacidad')
      return
    }

    setLoading(true)
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        await axios.post('/api/contacts', {
          nombre_completo: formData.nombre_completo,
          email: formData.email,
          telefono: formData.telefono || null,
          asunto: formData.asunto || null,
          mensaje: formData.mensaje,
        })
      }
      setSuccess(true)
      setFormData({
        nombre_completo: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        privacy_accepted: false,
      })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Error al enviar el mensaje' : 'Error al enviar el mensaje')
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
        <label htmlFor="telefono">Teléfono</label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
        />
      </div>

      {showAsunto && (
        <div className="form-group">
          <label htmlFor="asunto">Asunto</label>
          <select
            id="asunto"
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
          >
            <option value="">Selecciona un asunto...</option>
            <option value="Información general">Información general</option>
            <option value="Soporte">Soporte</option>
            <option value="Colaboraciones">Colaboraciones</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="mensaje">Mensaje *</label>
        <textarea
          id="mensaje"
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          required
          rows={5}
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
          ✓ Mensaje enviado correctamente. Te contactaremos pronto.
        </div>
      )}

      {error && (
        <div className="error-message" style={{ color: '#dc2626', marginBottom: '1rem' }}>
          ✗ {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Enviando...' : 'Enviar Mensaje'}
      </button>
    </form>
  )
}
