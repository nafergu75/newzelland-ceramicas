# Refactorización: Checkout y Disponibilidad de Productos

## Problemas Identificados y Solucionados

### 1️⃣ PROBLEMA: Desglose de Envío Inconsistente

#### Errores en el código anterior:
```typescript
// ❌ ANTES: orderService.ts líneas 8, 23-26, 153
const PROVINCES_WITH_SURCHARGE = 21;  // línea 8
const SURCHARGE_PER_M2 = 3;          // línea 8

// Lógica confusa y duplicada
const shippingSurcharge = Math.ceil(items.reduce((sum, item) => {
  const m2 = (item.quantity || 1) * 1.2;
  return sum + m2;
}, 0) / PROVINCES_WITH_M2) * SURCHARGE_PER_M2;

// Constante duplicada al final del archivo
const PROVINCES_WITH_M2 = 21;  // línea 153
```

**Problemas:**
- Constante duplicada (`PROVINCES_WITH_SURCHARGE` vs `PROVINCES_WITH_M2`)
- Cálculo confuso: mezcla metros cuadrados con número de provincias
- No hay separación entre envío base y recargo por distancia
- Fórmula "3€ por metro" aparecía literalmente en interfaz (CartPage línea 93)
- Posibles descuadres entre frontend y backend

#### CartPage.tsx anterior:
```typescript
// ❌ ANTES: CartPage línea 93
<h3 style={{ marginTop: '20px' }}>Total: €{total.toFixed(2)}</h3>
// No había desglose de envío, solo mostraba subtotal
```

---

### 2️⃣ PROBLEMA: Disponibilidad de Productos Confusa

#### Errores en el código anterior:
```typescript
// ❌ ANTES: Product interface no tenía campos de disponibilidad
export interface Product {
  id: string;
  name: string;
  // ... falta: stock, isActive, replenishable, requiresConsultation
}

// CartPage no validaba si el producto estaba disponible
// No había componente para mostrar estado de disponibilidad
```

**Problemas:**
- Ningún campo para controlar disponibilidad
- No diferenciaba entre: en stock, sin stock replenible, requiere consulta, no disponible
- Usuarios no sabían si podían comprar o no
- Mensajes genéricos y confusos

---

## ✅ SOLUCIONES IMPLEMENTADAS

### SOLUCIÓN 1: Servicio Centralizado de Envío

**Archivo nuevo:** `backend/src/services/shippingService.ts`

```typescript
// ✅ DESPUÉS: Lógica centralizada y consistente
interface ShippingCalculation {
  baseShipping: number;      // Envío base fijo
  distanceSurcharge: number; // Recargo por distancia
  totalShipping: number;     // Total = base + recargo
}

export function calculateShipping(items: Array<{ quantity: number }>): ShippingCalculation {
  // Constantes centralizadas
  const BASE_SHIPPING = 15.0;           // Envío base fijo
  const SURCHARGE_PER_M2 = 3.0;         // INTERNO: no mostrar al usuario
  const ITEMS_M2_PER_UNIT = 1.2;
  
  // Cálculo transparente
  const totalM2 = items.reduce((sum, item) => {
    return sum + (item.quantity * ITEMS_M2_PER_UNIT);
  }, 0);

  const distanceSurcharge = Math.round(totalM2 * SURCHARGE_PER_M2 * 100) / 100;

  return {
    baseShipping: BASE_SHIPPING,
    distanceSurcharge,
    totalShipping: BASE_SHIPPING + distanceSurcharge,
  };
}
```

**Ventajas:**
- ✅ Una única fuente de verdad
- ✅ Fórmula separada de la UI (interna)
- ✅ Función de validación para detectar descuadres
- ✅ Reutilizable en backend y frontend

---

### SOLUCIÓN 2: Modelo Product Actualizado

**Archivos:**
- `backend/src/models/types.ts` (interface Product)
- `frontend/src/data/products.ts` (interface Product + datos)

```typescript
// ✅ DESPUÉS: Campos de disponibilidad
export interface Product {
  // ... campos existentes ...

  // Disponibilidad
  stock: number;                  // Cantidad en stock
  isActive: boolean;              // Producto activo/disponible
  replenishable: boolean;         // Se puede reponer
  requiresConsultation: boolean;  // Requiere consultar
}
```

**Ejemplo de uso:**
```typescript
{
  id: 'atlas-001',
  name: 'Atlas Beige Natural',
  price: 45.00,
  // ...
  stock: 50,                      // 50 unidades disponibles
  isActive: true,                 // Producto activo
  replenishable: true,            // Si se agota, se repone
  requiresConsultation: false,    // No requiere consulta
}
```

---

### SOLUCIÓN 3: Componente ProductAvailability

**Archivo nuevo:** `frontend/src/components/ProductAvailability.tsx`

Muestra el estado correcto según la lógica de disponibilidad:

```
┌─────────────────────────────────────────────────────┐
│ Estado 1: En stock (stock > 0)                      │
│ → Botón verde "🛒 Añadir al carrito"               │
│ → Mensaje: "X unidades disponibles"                │
├─────────────────────────────────────────────────────┤
│ Estado 2: Sin stock pero replenible (stock = 0)    │
│ → Botón azul "🔔 Avisarme cuando esté disponible"  │
│ → Mensaje: "⏳ Actualmente sin stock"              │
├─────────────────────────────────────────────────────┤
│ Estado 3: Requiere consulta                        │
│ → Botón naranja "📞 Consultar disponibilidad"      │
│ → Mensaje: "📋 Este artículo requiere consultar"   │
├─────────────────────────────────────────────────────┤
│ Estado 4: No disponible (inactivo)                 │
│ → Botón gris deshabilitado                         │
│ → Mensaje: "❌ Producto no disponible"             │
└─────────────────────────────────────────────────────┘
```

---

### SOLUCIÓN 4: Componente ShippingBreakdown

**Archivo nuevo:** `frontend/src/components/ShippingBreakdown.tsx`

Muestra desglose limpio sin revelar la fórmula interna:

```
┌─────────────────────────────────────────────────────┐
│          Desglose de Envío                          │
├─────────────────────────────────────────────────────┤
│ Envío base:              €15,00                     │
│ Recargo por distancia:   €6,00                      │
│ Total envío:             €21,00                     │
├─────────────────────────────────────────────────────┤
│ El recargo por distancia se calcula según el        │
│ volumen de tu pedido.                               │
└─────────────────────────────────────────────────────┘
```

**Lo que muestra:**
- ✅ Envío base (fijo)
- ✅ Recargo por distancia (calculado)
- ✅ Total envío (suma clara)

**Lo que NO muestra:**
- ❌ Fórmula "3€ por m²"
- ❌ Cálculo de metros cuadrados
- ❌ Referencia a constantes técnicas

---

### SOLUCIÓN 5: CartPage Mejorado

**Archivo:** `frontend/src/pages/CartPage.tsx`

```typescript
// ✅ DESPUÉS: CartPage refactorizado
useEffect(() => {
  // Calcular subtotal
  const newSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Usar función centralizada de envío
  const shippingCalc = calculateShipping(cart);
  
  // Calcular impuesto (21%)
  const taxAmount = Math.round(newSubtotal * 0.21 * 100) / 100;
  
  // Total final consistente
  const newTotal = newSubtotal + taxAmount + shippingCalc.totalShipping;
}, []);
```

**Desglose mostrado al usuario:**
```
Subtotal:              €100,00
IVA (21%):             €21,00

Desglose de Envío
├─ Envío base:        €15,00
├─ Recargo distancia: €6,00
└─ Total envío:       €21,00

TOTAL FINAL:          €148,00
```

---

### SOLUCIÓN 6: OrderService Actualizado

**Archivo:** `backend/src/services/orderService.ts`

```typescript
// ✅ DESPUÉS: Usa servicio centralizado
import { calculateShipping, validateShippingCalculation } from './shippingService';

export async function createOrder(...) {
  const subtotal = items.reduce((sum, item) => sum + item.totalLine, 0);
  const taxAmount = Math.round(subtotal * 0.21 * 100) / 100;

  // Usar servicio centralizado (mismo que frontend)
  const shipping = calculateShipping(items);

  // Validar consistencia
  if (!validateShippingCalculation(shipping)) {
    throw new Error('Shipping calculation validation failed');
  }

  // Base de datos: guardar desglose separado
  const result = await query(
    `INSERT INTO orders (
      ..., base_shipping, distance_surcharge, total_shipping, ...
    ) VALUES (..., $10, $11, $12, ...)`,
    [..., shipping.baseShipping, shipping.distanceSurcharge, shipping.totalShipping, ...]
  );
}
```

**Cambios en BD:**
```sql
-- Antes: una columna confusa
ALTER TABLE orders ADD COLUMN shipping_surcharge NUMERIC;

-- Después: tres columnas claras
ALTER TABLE orders ADD COLUMN base_shipping NUMERIC;
ALTER TABLE orders ADD COLUMN distance_surcharge NUMERIC;
ALTER TABLE orders ADD COLUMN total_shipping NUMERIC;
```

---

## 📊 Comparativa: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Fuente de verdad envío** | Duplicada en múltiples lugares | Una única función `calculateShipping` |
| **Fórmula mostrada** | "3€ por metro" visible en UI | Fórmula interna, UI solo muestra desglose |
| **Descuadres** | Posibles entre frontend/backend | Detectados por `validateShippingCalculation` |
| **Disponibilidad** | Sin campos | 4 campos específicos (stock, isActive, replenishable, requiresConsultation) |
| **Mensajes producto** | Genéricos y confusos | Específicos según estado |
| **Componentes UI** | Inexistentes | `ProductAvailability` y `ShippingBreakdown` |
| **Desglose en carrito** | No hay | Claro y separado: base + recargo + impuestos |

---

## 🔧 Cómo Evitar Problemas Futuros

1. **Cálculos de precios**: Crear servicio centralizado
   ```typescript
   // ✅ Bien
   const pricing = calculatePricing(items);
   
   // ❌ Mal: duplicar en múltiples lugares
   const total = a + b + c;  // frontend
   const total = a + b + c;  // backend (pueden divergir)
   ```

2. **Estados de producto**: Usar campos específicos
   ```typescript
   // ✅ Bien
   if (product.stock > 0 && product.isActive) { /* comprar */ }
   
   // ❌ Mal: lógica implícita
   if (product.available) { /* ¿qué significa available? */ }
   ```

3. **Mostrar fórmulas**: Nunca revelar lógica interna
   ```typescript
   // ✅ Bien: usuario ve el resultado
   "Recargo por distancia: €6,00"
   
   // ❌ Mal: expone la fórmula
   "Recargo por distancia: 2m² × €3/m² = €6,00"
   ```

---

## ✅ Checklist de Verificación

- [ ] Frontend y backend usan la misma función `calculateShipping`
- [ ] CartPage muestra desglose correcto (base + recargo + impuestos)
- [ ] ProductAvailability muestra estado correcto según campos
- [ ] No hay referencias a fórmulas en la UI
- [ ] Base de datos tiene columnas separadas para desglose de envío
- [ ] Validación `validateShippingCalculation` detecta errores
- [ ] Prueba: carrito con múltiples items muestra totales consistentes
- [ ] Prueba: producto sin stock pero replenible muestra botón correcto

---

## 📝 Notas de Implementación

- Ambos componentes nuevos (`ProductAvailability` y `ShippingBreakdown`) están listos para usar en CatalogPage y CartPage
- La función `calculateShipping` puede moverse a un archivo de utilidades compartidas entre backend y frontend
- Las constantes de envío (BASE_SHIPPING, SURCHARGE_PER_M2) deben ser configurables (considerar pasar del backend al cliente)
- Campos de disponibilidad del producto deben inicializarse con valores por defecto en el backend

