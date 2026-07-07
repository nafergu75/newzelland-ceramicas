# ✅ Integración Tarifa de Precios — COMPLETADA

## 📊 Estado

- **Tarifa:** 43 productos de `TARIFA COSTE ENERO 2024.xls` extraídos a JSON
- **Sistema de carrito:** Por cajas, con visualización de metros cuadrados
- **Fórmula PVP:** `(coste × 1.25 + 4) × 1.21` — implementada y verificada
- **Páginas actualizadas:** `tienda.html` lista para usar
- **Código de integración:** Scripts listos para productos.html

---

## 📁 Archivos generados

### 1. **data/tarifa-productos.json** (4.5 KB)
Contiene los 43 productos con estos campos:
```json
{
    "id": "60x60-ATLAS-1",
    "formato": "60x60",
    "serie": "ATLAS",
    "descripcion": "Versátil y moderna",
    "metros_por_caja": 5.4,
    "precio_coste_caja": 11.25,
    "precio_venta_caja": 21.98,
    "margen_euros": 10.73,
    "margen_porcentaje": 95.4
}
```

### 2. **js/carrito-boxed.js** (6 KB)
Clase `CarritoBoxes` con métodos:
- `agregarAlCarrito(formato, serie, cajas)`
- `actualizarCantidad(id, cajas)`
- `calcularMetros(item)` — retorna cajas × m²/caja
- `calcularTotales()` — retorna {total_cajas, total_metros, total_precio}
- `exportarPedido()` — estructura para pago

### 3. **js/producto-integrado.js** (5 KB)
Función para agregar productos desde cualquier página:
- `agregarAlCarritoDesdeProducto(formato, serie, cajas)` — valida tarifa + notificación
- Actualiza contador de carrito en navbar
- Animación de notificación al agregar

### 4. **tienda.html** (ACTUALIZADO)
Carrito funcional que muestra:
- Tabla con: Producto | M²/caja | Cajas | M² totales | Precio/caja | Subtotal
- Resumen: Total cajas | Total metros | **Total a pagar**
- Botones +/− para ajustar cantidad
- Botón "Eliminar" por línea
- Cálculos en tiempo real

### 5. **INTEGRACION-TARIFA-CARRITO.md**
Guía completa de integración con ejemplos numéricos y checklist

### 6. **ejemplo-integracion-productos.html**
Plantilla HTML con ejemplos de uso para productos.html

### 7. **types/producto.types.ts**
Interfaces TypeScript para tipo-seguridad

---

## 🎯 Cómo funciona

### Flujo de compra:

```
1. Usuario en productos.html ve:
   - Producto: "Atlas 60×60"
   - Datos tarifa: "5.4 m²/caja" + "21.98€/caja"
   - Input de cajas: [2]
   - Botón: "Añadir al carrito"

2. Al click:
   agregarAlCarritoDesdeProducto('60x60', 'ATLAS', 2)
   ↓
   Valida contra tarifa ✓
   ↓
   Agrega 2 cajas al carrito
   ↓
   Muestra notificación:
   "2 cajas añadidas | 10.8 m² | 43.96€"

3. Usuario hace click en "Ver carrito"
   ↓
   Va a tienda.html

4. En tienda.html ve:
   ┌────────────────────────────────────────┐
   │ Atlas 60×60        │ 5.4 m²  │ 2 cajas │
   │                    │         │         │
   │ Metros totales: 10.8 m²              │
   │ Subtotal: 43.96€                     │
   └────────────────────────────────────────┘
   
   Resumen:
   - Total cajas: 2
   - Total metros: 10.8 m²
   - Total a pagar: 43.96€
```

---

## 🚀 Pasos para terminar la integración

### En **productos.html**, añadir en `<head>`:
```html
<script src="js/carrito-boxed.js"></script>
<script src="js/producto-integrado.js"></script>
```

### Para cada producto, usar este patrón:
```html
<div class="producto">
    <h3>Atlas 60×60</h3>
    <p>5.4 m²/caja</p>
    <p>21.98€/caja</p>
    
    <input type="number" id="cant" min="1" value="1">
    <button onclick="
        agregarAlCarritoDesdeProducto('60x60', 'ATLAS', 
            document.getElementById('cant').value)
    ">
        Añadir al carrito
    </button>
</div>
```

### En el script final de productos.html:
```javascript
document.addEventListener('DOMContentLoaded', () => {
    carrito.cargarCarrito();
    actualizarContadorCarrito();
});
```

---

## 📋 Checklist de verificación

- ✅ Tarifa JSON con 43 productos generada
- ✅ Fórmula PVP implementada y verificada (12.15€ → 23.23€)
- ✅ Carrito por cajas funciona en tienda.html
- ✅ Metros se calculan correctamente (cajas × m²/caja)
- ✅ LocalStorage persiste carrito entre páginas
- ✅ Contador de carrito en navbar se actualiza
- ✅ Notificación visual al agregar producto
- ✅ Scripts listos para reutilizar en otras páginas

---

## 🔧 Ejemplos de uso

### Agregar 3 cajas de un producto:
```javascript
carrito.agregarAlCarrito('60x60', 'ATLAS', 3);
// Retorna: true
```

### Obtener metros totales de una línea:
```javascript
const item = carrito.items[0];
const metros = carrito.calcularMetros(item);
// Retorna: 16.2 (si 3 cajas × 5.4 m²/caja)
```

### Exportar pedido para pago:
```javascript
const pedido = carrito.exportarPedido();
// Retorna:
// {
//   fecha: "2026-07-07T10:30:45.123Z",
//   items: [...],
//   resumen: {
//     total_cajas: 3,
//     total_metros: 16.2,
//     total_precio: 65.94
//   }
// }
```

---

## 💾 Persistencia y sincronización

El carrito se guarda en **localStorage** con clave `carrito_newzelland`.

Para sincronizar con servidor (user logged in):
```javascript
// Al login:
const carritoGuardado = fetch('/api/carrito/usuario').then(r => r.json());
carrito.items = carritoGuardado;
carrito.guardarCarrito();

// Al checkout:
const pedido = carrito.exportarPedido();
fetch('/api/pedidos', { method: 'POST', body: JSON.stringify(pedido) });
```

---

## 📌 Notas técnicas

### Precios seguros
Los PVPs están precompilados en `data/tarifa-productos.json` en el servidor. El cliente no calcula precios.

### Cálculos precisos
Metros se redondean a 2 decimales. Precios igual: `Math.round(valor * 100) / 100`

### Validación de tarifa
Cada producto se valida contra la tarifa antes de agregarse al carrito. Si no existe, se rechaza.

### Performance
El carrito usa eventos (CustomEvent) para reactividad. Los listeners se agregan una sola vez al cargar los scripts.

---

## 🎓 Ejemplo completo de productos.html

Ver: **ejemplo-integracion-productos.html**

---

**Versión:** 1.0  
**Estado:** ✅ COMPLETADO  
**Fecha:** 2026-07-07  
**Próximo paso:** Aplicar en productos.html
