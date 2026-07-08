import { useState } from 'react'
import '../styles/components.css'

interface ContactFormData {
  name: string
  email: string
  phone: string
  company: string
  message: string
}

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => Promise<void>
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        localStorage.setItem('contact_form', JSON.stringify(formData))
      }
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', company: '', message: '' })
      setTimeout(() => setSuccess(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Nombre *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
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
        <label htmlFor="phone">Teléfono</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="company">Empresa</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Mensaje *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

      {success && (
        <div className="success-message">
          ✓ Mensaje enviado correctamente. Te contactaremos pronto.
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Enviando...' : 'Enviar Mensaje'}
      </button>
    </form>
  )
}
