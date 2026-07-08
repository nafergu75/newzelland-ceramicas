/**
 * Servicio de cálculo de envío
 * Centraliza la lógica de envío para evitar duplicidades y descuadres
 */

interface ShippingCalculation {
  baseShipping: number;      // Envío base fijo (ej: 15€)
  distanceSurcharge: number; // Recargo por distancia (€ por m²)
  totalShipping: number;     // Total = baseShipping + distanceSurcharge
}

// Constantes de envío
const SHIPPING_CONFIG = {
  BASE_SHIPPING: 15.0,           // Envío base fijo
  SURCHARGE_PER_M2: 3.0,         // 3€ por m² (interno, no mostrar al usuario)
  ITEMS_M2_PER_UNIT: 1.2,        // Aproximación m² por unidad de producto
};

/**
 * Calcula el desglose de envío a partir de los items
 * @param items - Items del carrito con cantidad
 * @returns {ShippingCalculation} Desglose detallado de envío
 *
 * Fórmula interna:
 * - m2_totales = suma(cantidad * 1.2 m² por unidad)
 * - distanceSurcharge = m2_totales * 3€/m²
 * - totalShipping = BASE_SHIPPING + distanceSurcharge
 */
export function calculateShipping(items: Array<{ quantity: number }>): ShippingCalculation {
  if (!items || items.length === 0) {
    return {
      baseShipping: SHIPPING_CONFIG.BASE_SHIPPING,
      distanceSurcharge: 0,
      totalShipping: SHIPPING_CONFIG.BASE_SHIPPING,
    };
  }

  // Calcular m² totales (interno)
  const totalM2 = items.reduce((sum, item) => {
    return sum + (item.quantity * SHIPPING_CONFIG.ITEMS_M2_PER_UNIT);
  }, 0);

  // Calcular recargo por distancia (sin mostrar la fórmula al usuario)
  const distanceSurcharge = Math.round(totalM2 * SHIPPING_CONFIG.SURCHARGE_PER_M2 * 100) / 100;

  return {
    baseShipping: SHIPPING_CONFIG.BASE_SHIPPING,
    distanceSurcharge,
    totalShipping: SHIPPING_CONFIG.BASE_SHIPPING + distanceSurcharge,
  };
}

/**
 * Valida que el cálculo de envío sea consistente
 * (para detectar descuadres entre frontend y backend)
 */
export function validateShippingCalculation(shipping: ShippingCalculation): boolean {
  const { baseShipping, distanceSurcharge, totalShipping } = shipping;

  // Verificar que el total sea la suma correcta
  const expectedTotal = Math.round((baseShipping + distanceSurcharge) * 100) / 100;
  return Math.abs(totalShipping - expectedTotal) < 0.01; // Tolerancia de redondeo
}
