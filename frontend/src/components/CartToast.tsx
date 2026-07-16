import { useEffect, useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import { useCart } from '../context/CartContext'
import '../styles/components.css'

const DURATION_MS = 3200

/**
 * Confirmación global de "añadido al carrito". Fija en viewport (no dentro
 * de la tarjeta que disparó la acción) para que sea visible en móvil sin
 * desplazarse, sin importar en qué punto de una grilla larga se pulsó.
 */
export default function CartToast() {
  const { lastAdded } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!lastAdded) return
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [lastAdded?.key])

  if (!lastAdded) return null

  const cajasLabel = lastAdded.cajas === 1 ? 'caja' : 'cajas'

  return (
    <div className={`cart-toast ${visible ? 'is-visible' : ''}`} role="status" aria-live="polite">
      <CheckCircle size={20} weight="fill" />
      <span>
        Has añadido {lastAdded.cajas} {cajasLabel} de {lastAdded.serieNombre} {lastAdded.formato}
        {' '}({lastAdded.metros} m²) al carrito
      </span>
    </div>
  )
}
