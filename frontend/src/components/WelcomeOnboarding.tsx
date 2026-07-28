import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileArrowDown, MagnifyingGlass, ChatCircleText } from '@phosphor-icons/react'
import { consumeJustRegistered } from '../utils/onboarding'

// Banner de bienvenida que se muestra una única vez, justo tras registrarse,
// en la primera página (mi-cuenta o descargas) que el usuario visite.
export default function WelcomeOnboarding() {
  const [nombre, setNombre] = useState<string | null>(null)

  useEffect(() => {
    const data = consumeJustRegistered()
    if (data) setNombre(data.nombre)
  }, [])

  if (!nombre) return null

  return (
    <div style={{
      backgroundColor: '#e8f5e9',
      border: '1px solid #c8e6c9',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '30px',
    }}>
      <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#1a1a1a' }}>
        Bienvenido/a, {nombre.split(' ')[0]}
      </h2>
      <p style={{ margin: '0 0 18px 0', color: '#555', fontSize: '14px' }}>
        Ya puedes descargar los catálogos de todas nuestras colecciones y acceder a documentación técnica actualizada.
      </p>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <Link to="/downloads" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#2e7d32', fontWeight: '600', textDecoration: 'none' }}>
          <FileArrowDown size={16} weight="bold" /> Descargar catálogos
        </Link>
        <Link to="/collections" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#2e7d32', fontWeight: '600', textDecoration: 'none' }}>
          <MagnifyingGlass size={16} weight="bold" /> Explorar colecciones
        </Link>
        <Link to="/contact" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#2e7d32', fontWeight: '600', textDecoration: 'none' }}>
          <ChatCircleText size={16} weight="bold" /> Solicitar presupuesto
        </Link>
      </div>
    </div>
  )
}
