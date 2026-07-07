import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [province, setProvince] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, province })
      })
      if (response.ok) {
        alert('Registration successful! Check your email.')
        navigate('/login')
      }
    } catch (error) {
      console.error('Register error:', error)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ display: 'block', marginBottom: '10px', width: '100%' }} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', marginBottom: '10px', width: '100%' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', marginBottom: '10px', width: '100%' }} />
        <input type="text" placeholder="Province" value={province} onChange={(e) => setProvince(e.target.value)} required style={{ display: 'block', marginBottom: '10px', width: '100%' }} />
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
