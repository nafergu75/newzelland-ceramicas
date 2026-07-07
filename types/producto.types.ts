/**
 * Tipos TypeScript para productos de tarifa y carrito
 * Fuente: TARIFA COSTE ENERO 2024.xls
 */

/**
 * Producto de la tarifa de precios
 * Contiene todos los datos necesarios para vender por cajas
 */
export interface ProductoTarifa {
  /** ID único del producto (formato-serie-index) */
  id: string;

  /** Tamaño del formato: "60x60", "30x90", "100x100", etc. */
  formato: string;

  /** Nombre de la serie/colección: "ATLAS", "CALACATA", "BASES", etc. */
  serie: string;

  /** Descripción: colores, acabados disponibles para este formato+serie */
  descripcion?: string;

  /** Metros cuadrados por caja (columna E / PICKING de la tarifa) */
  metros_por_caja: number;

  /** Precio de coste por caja en euros (columna F / PALETS de la tarifa) */
  precio_coste_caja: number;

  /** Precio de venta por caja (PVP) en euros
   * Calculado: (precio_coste_caja * 1.25 + 4) * 1.21
   */
  precio_venta_caja: number;

  /** Margen bruto en euros por caja */
  margen_euros: number;

  /** Margen en porcentaje respecto al coste */
  margen_porcentaje: number;
}

/**
 * Item dentro del carrito de compra
 * Representa una línea: producto + cantidad en cajas
 */
export interface ItemCarrito {
  /** ID del producto (referencia a ProductoTarifa.id) */
  id: string;

  /** Formato del producto */
  formato: string;

  /** Serie del producto */
  serie: string;

  /** Descripción para mostrar al usuario */
  descripcion: string;

  /** Metros cuadrados por caja (copiado de tarifa) */
  metros_por_caja: number;

  /** Precio de venta por caja (copiado de tarifa) */
  precio_venta_caja: number;

  /** Cantidad en cajas seleccionada por el usuario */
  cajas: number;
}

/**
 * Línea de detalle en un pedido procesado
 * Incluye cálculos de metros y precios
 */
export interface LineaPedido {
  formato: string;
  serie: string;
  cajas: number;
  metros_totales: number;
  precio_unitario: number;
  subtotal: number;
}

/**
 * Resumen de totales del carrito
 */
export interface ResumenCarrito {
  total_cajas: number;
  total_metros: number;
  total_precio: number;
}

/**
 * Estructura completa de un pedido exportado
 * Lista para enviar a procesar pago o guardar en BD
 */
export interface Pedido {
  fecha: string; // ISO 8601
  items: LineaPedido[];
  resumen: {
    total_cajas: number;
    total_metros: number;
    total_precio: number;
  };
}

/**
 * Función para calcular el PVP a partir del coste
 * Fórmula: (coste * 1.25 + 4) * 1.21
 *
 * @param costeEnEuros - Precio de coste por caja (columna F de tarifa)
 * @returns Precio de venta (PVP) redondeado a 2 decimales
 */
export function calcularPVP(costeEnEuros: number): number {
  const precioBase = costeEnEuros * 1.25;
  const precioBaseMas4 = precioBase + 4;
  const pvpConIVA = precioBaseMas4 * 1.21;
  return Math.round(pvpConIVA * 100) / 100;
}

/**
 * Función para calcular metros totales
 *
 * @param item - Item del carrito
 * @returns Metros totales = cajas * metros_por_caja
 */
export function calcularMetrosTotales(item: ItemCarrito): number {
  return item.cajas * item.metros_por_caja;
}

/**
 * Función para calcular subtotal de un item
 *
 * @param item - Item del carrito
 * @returns Subtotal = cajas * precio_venta_caja
 */
export function calcularSubtotal(item: ItemCarrito): number {
  return item.cajas * item.precio_venta_caja;
}

// ============================================================
// EJEMPLOS DE USO
// ============================================================

/**
 * Ejemplo 1: Crear un producto de tarifa
 */
export const ejemploAtlas60x60: ProductoTarifa = {
  id: "60x60-ATLAS-1",
  formato: "60x60",
  serie: "ATLAS",
  descripcion: "Versátil y moderna - COLORES VARIOS",
  metros_por_caja: 5.4,
  precio_coste_caja: 11.25,
  precio_venta_caja: 21.98,
  margen_euros: 10.73,
  margen_porcentaje: 95.4,
};

/**
 * Ejemplo 2: Agregar un producto al carrito
 */
export const ejemploCarritoAtlas: ItemCarrito = {
  id: "60x60-ATLAS-1",
  formato: "60x60",
  serie: "ATLAS",
  descripcion: "Versátil y moderna",
  metros_por_caja: 5.4,
  precio_venta_caja: 21.98,
  cajas: 3,
};

/**
 * Ejemplo 3: Calcular metros y precios
 */
export const ejemploCalculos = {
  item: ejemploCarritoAtlas,
  metros_totales: calcularMetrosTotales(ejemploCarritoAtlas), // 16.2
  subtotal: calcularSubtotal(ejemploCarritoAtlas), // 65.94
};

/**
 * Ejemplo 4: Carrito con múltiples items
 */
export const ejemploCarritoCompleto: ItemCarrito[] = [
  {
    id: "60x60-ATLAS-1",
    formato: "60x60",
    serie: "ATLAS",
    descripcion: "Versátil y moderna",
    metros_por_caja: 5.4,
    precio_venta_caja: 21.98,
    cajas: 2,
  },
  {
    id: "30x60-BASES-2",
    formato: "30x60",
    serie: "BASES",
    descripcion: "Colores blancos",
    metros_por_caja: 5.4,
    precio_venta_caja: 15.98,
    cajas: 1,
  },
];

/**
 * Ejemplo 5: Resumen del carrito
 */
export const ejemploResumen: ResumenCarrito = {
  total_cajas: 3, // 2 + 1
  total_metros: 16.2 + 5.4, // 21.6
  total_precio: (2 * 21.98) + (1 * 15.98), // 59.94
};

/**
 * Ejemplo 6: Fórmula PVP en acción
 */
export const ejemploCalculoPVP = {
  coste_original: 12.15,
  paso1_margen_25: 12.15 * 1.25, // 15.1875
  paso2_suma_4: 15.1875 + 4, // 19.1875
  paso3_iva_21: 19.1875 * 1.21, // 23.22725
  pvp_final: calcularPVP(12.15), // 23.23 (redondeado)
};
