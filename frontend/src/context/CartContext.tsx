import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { CartItem } from '../utils/checkoutSummary'

/**
 * Estado global del carrito. ÚNICA fuente de verdad para todos los
 * componentes (catálogo, carrito, desglose, header).
 *
 * localStorage solo se usa como persistencia: se lee al inicializar y se
 * escribe en cada cambio. Ningún componente debe leer localStorage
 * directamente ni guardarse una copia propia del carrito.
 */

interface CartContextValue {
  cart: CartItem[]
  cartCount: number
  addBoxes: (product: Omit<CartItem, 'cajas'>, cajas: number) => void
  updateCajas: (id: string, cajas: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'cart'

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(readStoredCart)

  // Persistir cada cambio
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  // Sincronizar si otra pestaña modifica el carrito
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCart(readStoredCart())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** Añade cajas de una serie+formato. Si ya está en el carrito, suma cajas (no duplica línea). */
  const addBoxes = (product: Omit<CartItem, 'cajas'>, cajas: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cajas: item.cajas + cajas } : item
        )
      }
      return [...prev, { ...product, cajas }]
    })
  }

  const updateCajas = (id: string, cajas: number) => {
    setCart((prev) =>
      cajas <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, cajas } : item))
    )
  }

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((sum, item) => sum + item.cajas, 0)

  return (
    <CartContext.Provider value={{ cart, cartCount, addBoxes, updateCajas, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
