/**
 * ÚNICA fuente de verdad del cálculo de totales en el frontend.
 * Réplica exacta de backend/src/services/shippingService.ts —
 * si se cambia una constante aquí, debe cambiarse también allí.
 *
 * El desglose y el carrito consumen SIEMPRE esta función sobre el
 * estado actual del carrito; nunca se cachea un resumen anterior.
 */

/** Línea de carrito: una serie + formato concretos, comprados por cajas. */
export interface CartItem {
  id: string;             // id de tarifa (formato-serie-N), única por línea
  serieId: string;        // id de la Serie en el catálogo (para enlazar a la ficha)
  serieNombre: string;
  formato: string;
  metrosPorCaja: number;
  precioVentaCaja: number;
  precioVentaM2: number;
  cajas: number;
}

export interface CheckoutSummary {
  itemsTotal: number;        // Subtotal de productos
  taxAmount: number;         // IVA 21%
  shippingBase: number;      // Envío base fijo
  distanceSurcharge: number; // Recargo por distancia (importe ya calculado)
  shippingTotal: number;     // shippingBase + distanceSurcharge
  grandTotal: number;        // itemsTotal + taxAmount + shippingTotal
  totalCajas: number;
  totalMetros: number;
}

const BASE_SHIPPING = 15.0;
const SURCHARGE_PER_M2 = 3.0;   // Interno: nunca mostrar la fórmula en UI
const VAT_RATE = 0.21;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function getCheckoutSummary(items: CartItem[]): CheckoutSummary {
  if (!items || items.length === 0) {
    return {
      itemsTotal: 0,
      taxAmount: 0,
      shippingBase: 0,
      distanceSurcharge: 0,
      shippingTotal: 0,
      grandTotal: 0,
      totalCajas: 0,
      totalMetros: 0,
    };
  }

  const itemsTotal = round2(
    items.reduce((sum, item) => sum + item.precioVentaCaja * item.cajas, 0)
  );
  const taxAmount = round2(itemsTotal * VAT_RATE);

  const totalMetros = round2(
    items.reduce((sum, item) => sum + item.cajas * item.metrosPorCaja, 0)
  );
  const distanceSurcharge = round2(totalMetros * SURCHARGE_PER_M2);
  const shippingTotal = round2(BASE_SHIPPING + distanceSurcharge);
  const totalCajas = items.reduce((sum, item) => sum + item.cajas, 0);

  return {
    itemsTotal,
    taxAmount,
    shippingBase: BASE_SHIPPING,
    distanceSurcharge,
    shippingTotal,
    grandTotal: round2(itemsTotal + taxAmount + shippingTotal),
    totalCajas,
    totalMetros,
  };
}
