/**
 * ÚNICA fuente de verdad del cálculo de totales en el frontend.
 * Réplica exacta de backend/src/services/shippingService.ts —
 * si se cambia una constante aquí, debe cambiarse también allí.
 *
 * El desglose y el carrito consumen SIEMPRE esta función sobre el
 * estado actual del carrito; nunca se cachea un resumen anterior.
 */

/** Línea de carrito: una serie + formato concretos, comprados por cajas.
 *  ESTRUCTURA DE PRECIOS:
 *  - precioVentaCajaBruto: precio mostrado en catálogo (con IVA 21% incluido)
 *  - precioVentaCaja: precio neto (bruto / 1.21) — usado en cálculos
 *  El IVA ya está desglosado en tarifa.ts al crear la línea;
 *  NO se vuelve a calcular en checkout.
 */
export interface CartItem {
  id: string;                    // id de tarifa (formato-serie-N), única por línea
  serieId: string;               // id de la Serie en el catálogo
  serieNombre: string;
  formato: string;
  metrosPorCaja: number;
  precioVentaCaja: number;       // Precio NETO (sin IVA)
  precioVentaCajaBruto: number;  // Precio mostrado (con IVA 21%)
  precioVentaM2: number;         // Por m² (neto)
  cajas: number;
}

export interface CheckoutSummary {
  itemsNeto: number;           // Subtotal sin IVA
  taxAmount: number;           // IVA 21% (calculado sobre neto)
  itemsTotal: number;          // itemsNeto + taxAmount
  shippingBase: number;        // Envío base incluido (25 € por defecto)
  distanceSurcharge: number;   // Recargo por distancia > 500km: 5€/m² (importe ya calculado)
  shippingTotal: number;       // shippingBase + distanceSurcharge
  grandTotal: number;          // itemsTotal + shippingTotal
  totalCajas: number;
  totalMetros: number;
  postalCode: string | null;   // CP ingresado por el cliente (para debug)
  isLongDistance: boolean;     // true si > 500km desde Onda
}

const BASE_SHIPPING = 25.0;                // Envío base: 25€ (incluido en precio para destinos <= 500km)
const DISTANCE_THRESHOLD_KM = 500;         // Umbral de distancia desde Onda
const SURCHARGE_PER_M2 = 5.0;              // Recargo: 5€/m² para destinos > 500km
const VAT_RATE = 0.21;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Estima la distancia desde Onda (46300, Castellón) basada en código postal español.
 * Usa una aproximación simplificada por provincias.
 * Para códigos no encontrados, asume > 500km (recargo aplicado).
 */
function estimateDistanceFromOnda(postalCode: string | null): number {
  if (!postalCode) return 0; // Sin CP, sin recargo (dentro de 500km por defecto)

  const cp = postalCode.trim().slice(0, 2); // Primeros 2 dígitos (provincia)

  // Distancia aproximada (en km) desde Onda por provincia
  const provinceDistances: Record<string, number> = {
    '03': 180,  // Alicante
    '04': 450,  // Almería
    '05': 250,  // Ávila
    '06': 650,  // Badajoz
    '07': 350,  // Baleares
    '08': 500,  // Barcelona
    '09': 350,  // Burgos
    '10': 550,  // Cáceres
    '11': 700,  // Cádiz
    '12': 50,   // Castellón (aquí está Onda)
    '13': 400,  // Ciudad Real
    '14': 650,  // Córdoba
    '15': 900,  // A Coruña
    '16': 550,  // Cuenca
    '17': 380,  // Girona
    '18': 600,  // Granada
    '19': 550,  // Guadalajara
    '20': 450,  // Guipúzcoa
    '21': 750,  // Huelva
    '22': 400,  // Huesca
    '23': 700,  // Jaén
    '24': 500,  // León
    '25': 350,  // Lleida
    '26': 200,  // La Rioja
    '27': 950,  // Lugo
    '28': 320,  // Madrid
    '29': 700,  // Málaga
    '30': 180,  // Murcia
    '31': 320,  // Navarra
    '32': 900,  // Ourense
    '33': 700,  // Asturias
    '34': 450,  // Palencia
    '35': 1200, // Las Palmas
    '36': 900,  // Pontevedra
    '37': 400,  // Salamanca
    '38': 1200, // Tenerife
    '39': 600,  // Santander
    '40': 450,  // Segovia
    '41': 650,  // Sevilla
    '42': 380,  // Soria
    '43': 200,  // Tarragona
    '44': 450,  // Teruel
    '45': 380,  // Toledo
    '46': 50,   // Valencia (Onda)
    '47': 420,  // Valladolid
    '48': 450,  // Vizcaya
    '49': 400,  // Zamora
    '50': 300,  // Zaragoza
  };

  return provinceDistances[cp] ?? 501; // Si no encuentra, asume > 500km
}

export function getCheckoutSummary(items: CartItem[], postalCode: string | null = null): CheckoutSummary {
  if (!items || items.length === 0) {
    return {
      itemsNeto: 0,
      taxAmount: 0,
      itemsTotal: 0,
      shippingBase: 0,
      distanceSurcharge: 0,
      shippingTotal: 0,
      grandTotal: 0,
      totalCajas: 0,
      totalMetros: 0,
      postalCode: postalCode ?? null,
      isLongDistance: false,
    };
  }

  // Suma de precios NETOS (sin IVA, que ya está desglosado en tarifa)
  const itemsNeto = round2(
    items.reduce((sum, item) => sum + item.precioVentaCaja * item.cajas, 0)
  );

  // IVA: se calcula sobre el neto (no es suma de IVA de items individuales)
  const taxAmount = round2(itemsNeto * VAT_RATE);

  // Total de items (neto + IVA)
  const itemsTotal = round2(itemsNeto + taxAmount);

  // Metros totales
  const totalMetros = round2(
    items.reduce((sum, item) => sum + item.cajas * item.metrosPorCaja, 0)
  );

  // Distancia y recargo
  const distanceKm = estimateDistanceFromOnda(postalCode);
  const isLongDistance = distanceKm > DISTANCE_THRESHOLD_KM;
  const distanceSurcharge = isLongDistance ? round2(totalMetros * SURCHARGE_PER_M2) : 0;

  // Total de envío (base + recargo condicional)
  const shippingTotal = round2(BASE_SHIPPING + distanceSurcharge);

  // Total cajas
  const totalCajas = items.reduce((sum, item) => sum + item.cajas, 0);

  return {
    itemsNeto,
    taxAmount,
    itemsTotal,
    shippingBase: BASE_SHIPPING,
    distanceSurcharge,
    shippingTotal,
    grandTotal: round2(itemsTotal + shippingTotal),
    totalCajas,
    totalMetros,
    postalCode: postalCode ?? null,
    isLongDistance,
  };
}
