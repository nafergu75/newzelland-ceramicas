# Integración Tarifa de Precios + Carrito por Cajas

## Resumen ejecutivo

Este documento describe cómo integrar la tarifa de coste (`TARIFA COSTE ENERO 2024.xls`) con el carrito de la web de Newzeland Cerámicas, implementando:

1. **Cálculo automático de PVP** a partir del coste
2. **Venta por cajas** como unidad de compra
3. **Visualización de metros cuadrados** para transparencia

---

## 1. Fórmula de cálculo del PVP

### Pseudocódigo

```javascript
coste_caja = valor_columna_F_tarifa

precio_base = coste_caja * 1.25  // Margen 25%
precio_base_mas_4 = precio_base + 4  // Suma fija 4€
precio_venta_caja = precio_base_mas_4 * 1.21  // IVA 21%
```

### Ejemplo numérico

```
Coste (columna F): 12.15 €/caja

1. precio_base = 12.15 * 1.25 = 15.1875
2. precio_base_mas_4 = 15.1875 + 4 = 19.1875
3. precio_venta_caja = 19.1875 * 1.21 = 23.22725 → redondeo: 23.23 €/caja
```

### Implementación JavaScript

```javascript
function calcularPVP(costeEnEuros) {
    const precioBase = costeEnEuros * 1.25;
    const precioBaseMas4 = precioBase + 4;
    const pvpConIVA = precioBaseMas4 * 1.21;
    return Math.round(pvpConIVA * 100) / 100;  // Redondeo a 2 decimales
}

// Test
console.log(calcularPVP(12.15));  // 23.23
console.log(calcularPVP(7.15));   // 15.65
```

---

## 2. Estructura de datos del producto

### JSON Schema

```json
{
    "id": "60x60-ATLAS-34",
    "formato": "60x60",
    "serie": "ATLAS",
    "descripcion": "Versátil y moderna - COLORES VARIOS",
    "metros_por_caja": 5.4,
    "precio_coste_caja": 11.25,
    "precio_venta_caja": 21.98,
    "margen_euros": 10.73,
    "margen_porcentaje": 95.4
}
```

### TypeScript Interface

```typescript
interface ProductoTarifa {
    id: string;                    // Identificador único
    formato: string;               // Tamaño: "60x60", "30x90", etc.
    serie: string;                 // Nombre comercial: "ATLAS", "CALACATA", etc.
    descripcion?: string;          // Colores y acabados disponibles
    metros_por_caja: number;       // Dato de la columna E (PICKING)
    precio_coste_caja: number;     // Dato de la columna F (PALETS)
    precio_venta_caja: number;     // Calculado: (coste * 1.25 + 4) * 1.21
    margen_euros: number;          // Ganancia unitaria
    margen_porcentaje: number;     // Margen en %
}
```

---

## 3. Archivos de implementación

### 3.1 Tarifa JSON

**Ruta:** `data/tarifa-productos.json`

Contiene todos los 43 productos extraídos de la tarifa XLS, con PVPs precalculados.

```bash
# Generado automáticamente desde:
TARIFA COSTE ENERO 2024.xls
→ Columnas: B=formato, C=serie, D=descripcion, E=metros_m2, F=coste
→ JSON con fórmula PVP aplicada
```

### 3.2 Clase CarritoBoxes

**Ruta:** `js/carrito-boxed.js`

Gestiona el carrito con métodos:

```javascript
carrito.agregarAlCarrito(formato, serie, cajas)
carrito.actualizarCantidad(id, cajas)
carrito.eliminarDelCarrito(id)
carrito.calcularMetros(item)           // metros_totales = cajas * m²/caja
carrito.calcularSubtotal(item)         // subtotal = cajas * pvp
carrito.calcularTotales()              // {total_cajas, total_metros, total_precio}
carrito.exportarPedido()               // Estructura lista para procesar pago
```

Persiste en **localStorage** bajo la clave `carrito_newzelland`.

### 3.3 Propuesta HTML del carrito

**Ruta:** `carrito-propuesta.html` (demo)

Muestra:
- Tabla de items con **cajas**, **metros por caja**, **metros totales**
- Subtotal por línea
- Resumen con **total de metros de todo el pedido**
- Botones +/− para ajustar cantidad

---

## 4. Integración con la web actual

### 4.1 En páginas de producto (productos.html, etc.)

Actualmente mostramos productos sin precio. Cambio propuesto:

```html
<!-- ACTUAL -->
<div class="producto">
    <h3>Atlas 60x60</h3>
    <p>5.4 m² por caja</p>
    <!-- Sin precio -->
</div>

<!-- NUEVO -->
<div class="producto">
    <h3>Atlas 60x60</h3>
    <p>5.4 m² por caja</p>
    <p class="precio">23.98 €/caja</p>
    <input type="number" min="1" value="1" id="cantidad">
    <button onclick="agregarAlCarrito('60x60', 'ATLAS', 1)">Añadir al carrito</button>
</div>
```

Código JavaScript:

```javascript
function agregarAlCarrito(formato, serie, cajas) {
    const ok = carrito.agregarAlCarrito(formato, serie, cajas);
    if (ok) {
        alert(`Añadidas ${cajas} cajas a tu carrito`);
        // O redirigir a /tienda.html (página del carrito)
    } else {
        alert('Producto no encontrado en tarifa');
    }
}
```

### 4.2 Página del carrito (tienda.html o nueva /carrito.html)

Reemplazar o actualizar la lógica actual para que use:

```javascript
// En lugar de los valores hardcodeados o sin estructura
carrito.items.forEach(item => {
    // Renderizar fila con datos de tarifa
    const metros = carrito.calcularMetros(item);
    const subtotal = carrito.calcularSubtotal(item);
    console.log(`${item.formato}: ${item.cajas} cajas = ${metros} m² = ${subtotal}€`);
});
```

### 4.3 Mapeo de productos web → tarifa

**Problema:** La web actual tiene filas de productos sin enlace claro a la tarifa.

**Solución:** Crear tabla de mapeo en `data/mapeo-web-tarifa.json`:

```json
{
    "mapeos": [
        {
            "url_actual": "productos.html?serie=atlas",
            "tarifa_formato": "60x60",
            "tarifa_serie": "ATLAS"
        },
        {
            "url_actual": "productos.html?serie=calacata",
            "tarifa_formato": "60x120",
            "tarifa_serie": "BRILLO"
        }
    ]
}
```

O, más simple: cambiar URLs a:

```
productos.html?formato=60x60&serie=ATLAS
```

---

## 5. Cambios en el apartado de picking

El picking actual ya muestra **m² por caja**. El carrito usará exactamente ese mismo dato.

**Requisito:** Asegurar que la columna E de la tarifa (PICKING) es coherente con lo que se muestra en picking.html.

---

## 6. Ejemplo de producto completo

### Atlas 60×60 BRILLO

| Campo | Valor | Origen |
|-------|-------|--------|
| Formato | `60x60` | Tarifa col B |
| Serie | `ATLAS` | Tarifa col C |
| Descripción | `Versátil y moderna - COLORES VARIOS` | Tarifa col D |
| M²/caja | `5.4` | Tarifa col E (PICKING) |
| Coste/caja | `11.25 €` | Tarifa col F (PALETS) |
| **PVP/caja** | `21.98 €` | Fórmula: (11.25 × 1.25 + 4) × 1.21 |

### En el carrito

```
Usuario compra: 3 cajas de Atlas 60×60

Línea del carrito:
  Producto: Atlas 60×60 | BRILLO
  Cajas: 3
  M²/caja: 5.4
  M² totales: 16.2
  Precio/caja: 21.98 €
  Subtotal: 65.94 €

Resumen:
  Total de metros: 16.2 m²
  Total de cajas: 3
  Total a pagar: 65.94 €
```

---

## 7. Checklist de implementación

- [ ] Validar que `data/tarifa-productos.json` está cargada y accesible
- [ ] Incluir `js/carrito-boxed.js` en todas las páginas
- [ ] Actualizar `productos.html` para mostrar precios y botón "Añadir al carrito"
- [ ] Crear o actualizar página del carrito con template propuesto
- [ ] Integrar con Stripe/PayPal para procesar pagos
- [ ] Probar cálculo de metros en carrito vs. picking
- [ ] Cambiar URLs de productos si es necesario para formato=X&serie=Y
- [ ] Implementar email de confirmación con detalle de metros y cajas

---

## 8. Notas técnicas

### localStorage
El carrito persiste en el navegador. Para sincronizar con sesión de usuario:
```javascript
// Al login, cargar carrito del usuario desde servidor
// Al checkout, guardar carrito en BD
```

### Seguridad
Los precios PVP se **precompilan en JSON** al servidor, no se calculan en cliente. Evita manipulaciones.

### Escalabilidad
Si la tarifa crece, regenerar `data/tarifa-productos.json` ejecutando:
```bash
python extraer_tarifa.py
```

---

## 9. Archivos referencia

- `data/tarifa-productos.json` — 43 productos con PVPs
- `js/carrito-boxed.js` — Clase CarritoBoxes
- `carrito-propuesta.html` — Demo del carrito (eliminar labels DEMO después)
- `TARIFA COSTE ENERO 2024.xls` — Fuente de verdad (original)

---

**Versión:** 1.0  
**Fecha:** 2026-07-07  
**Responsable:** Sistema de carrito por cajas
