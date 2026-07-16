import { useMemo } from 'react'
import { useCart } from '../context/CartContext'
import { getCheckoutSummary, CheckoutSummary } from '../utils/checkoutSummary'

/**
 * Devuelve el desglose SIEMPRE derivado del estado actual del carrito.
 *
 * No guarda copia propia: cualquier cambio de cantidades, altas o bajas en
 * el carrito re-renderiza a los consumidores con los totales recalculados.
 *
 * @param postalCode - Código postal del cliente (para calcular recargo de transporte)
 */
export function useCheckoutSummary(postalCode: string | null = null): CheckoutSummary {
  const { cart } = useCart()
  return useMemo(() => getCheckoutSummary(cart, postalCode), [cart, postalCode])
}
