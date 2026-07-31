# Fase 3: Guía de Testing y Validación

Instrucciones para verificar que la integración de BD en Cerámico funciona correctamente.

---

## Quick Start: Validación en 5 minutos

### 1. Verificar que productData.js está instalado

```bash
# En api/
ls -la data/productData.js
# Debe existir y tener ~300 líneas
```

### 2. Verificar que ceramico-ai.js importa productData

```bash
grep -n "require.*productData\|checkFormatAvailability" api/ceramico-ai.js
# Debe mostrar:
# - Import de productData
# - CHECK_AVAILABILITY_TOOL definida
```

### 3. Iniciar servidor y hacer prueba rápida

```bash
npm start
```

**Probar con curl:**

```bash
curl -X POST http://localhost:3001/api/ceramico \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Hay Bosco en 60x120?",
    "context": {
      "conversationHistory": [],
      "postalCode": "28001"
    }
  }'
```

**Resultado esperado:**
- Respuesta de Cerámico mencionando Bosco y 60x120
- NO hay error de database
- NO hay "Error: productData not found"

---

## Testing Detallado: Suite de Validación

### Test 1: Verificar disponibilidad de formato (Caso positivo)

**Endpoint:** `POST /api/ceramico`

**Payload:**
```json
{
  "question": "¿Hay Bosco en formato 60x120?",
  "context": {
    "conversationHistory": [],
    "postalCode": "28001"
  }
}
```

**Paso a paso:**
1. ✓ Endpoint recibe pregunta
2. ✓ `ceramicoAnswer()` construye system prompt
3. ✓ Claude invoca `check_product_availability`
4. ✓ Backend ejecuta `checkFormatAvailability(pool, { series: 'Bosco', format: '60x120' })`
5. ✓ Consulta BD: `SELECT formatos FROM collections WHERE nombre = 'BOSCO'`
6. ✓ BD devuelve array con formatos
7. ✓ Función valida si '60x120' está en array
8. ✓ Devuelve `{ available: true, ... }`
9. ✓ Claude redacta respuesta usando datos reales

**Validación:**
```javascript
// Inspeccionar logs en servidor
// Debe mostrar:
// "Claude solicito check_product_availability con: { series: 'Bosco', format: '60x120' }"
// NO debe haber errores SQL
```

**Respuesta esperada:**
- Contiene "Bosco"
- Contiene "60x120"
- Contiene "disponible" o similar
- NO contiene "error"

---

### Test 2: Verificar disponibilidad (Caso negativo - formato no existe)

**Payload:**
```json
{
  "question": "¿Hay Bosco en 200x200?",
  "context": { "conversationHistory": [], "postalCode": "28001" }
}
```

**Esperado:**
- Respuesta dice que NO está disponible
- Lista formatos disponibles reales (30x60, 60x120, 75x150 - según BD)
- NO inventa formatos
- Sugiere alternativas

**Validación en BD:**
```sql
SELECT nombre, formatos FROM collections WHERE LOWER(nombre) = 'bosco';
-- Verificar que 200x200 NO está en el array
-- Verificar que sí están 30x60, 60x120, 75x150 (o los reales)
```

---

### Test 3: Precio real desde tarifa

**Payload:**
```json
{
  "question": "¿Cuánto cuesta Alpina 30x60 para 15 metros cuadrados?",
  "context": { "conversationHistory": [], "postalCode": "28001" }
}
```

**Esperado:**
- Claude invoca `calculate_price({ series: 'Alpina', format: '30x60', squareMeters: 15 })`
- Backend busca en `tarifa-productos.json`
- Calcula precio total real
- Respuesta contiene:
  - Número de cajas
  - Precio total en euros
  - Precio por m²
  - Nota sobre transporte

**Validación manual:**
```javascript
// En terminal Node.js:
const { calculatePrice } = require('./api/price-calculator');
const result = calculatePrice({
  series: 'Alpina',
  format: '30x60',
  squareMeters: 15
});
console.log(result);
// Debe contener: pricePerM2, baseTotal, boxes, etc.
// NO debe tener "error"
```

---

### Test 4: Serie inexistente

**Payload:**
```json
{
  "question": "¿Qué formatos tiene NoExisteSerie?",
  "context": { "conversationHistory": [], "postalCode": "28001" }
}
```

**Esperado:**
- Claude invoca `check_product_availability({ series: 'NoExisteSerie' })`
- Backend consulta BD: `SELECT * FROM collections WHERE nombre = 'NOEXISTESERIE'`
- BD no devuelve resultados
- Función devuelve `{ available: false, message: "No existe..." }`
- Claude responde: "Esta serie no existe"
- Claude puede sugerir series que sí existen

**No debe pasar:**
- ❌ Inventar formatos para serie inexistente
- ❌ Crash de la aplicación
- ❌ Error SQL en logs

---

### Test 5: Conversación multiturno con historial

**Payload (turno 1):**
```json
{
  "question": "¿Qué recomiendan para un baño?",
  "context": {
    "conversationHistory": [],
    "postalCode": "28001"
  }
}
```

**Guardar respuesta de Cerámico en `response1`**

**Payload (turno 2):**
```json
{
  "question": "¿Precio de Bosco en 60x120 para 8 m²?",
  "context": {
    "conversationHistory": [
      {
        "role": "user",
        "content": "¿Qué recomiendan para un baño?"
      },
      {
        "role": "assistant",
        "content": "<response1 de arriba>"
      }
    ],
    "postalCode": "28001"
  }
}
```

**Esperado:**
- Claude usa el historial para contexto
- Calcula precio de Bosco sin pedir aclaraciones adicionales
- Respuesta es coherente con la conversación anterior

---

### Test 6: Manejo de errores - BD caída

**Simulación: Pausar servicio de BD**

```bash
# En otra terminal, if using docker:
docker pause <postgres-container-name>
```

**Payload:**
```json
{
  "question": "¿Hay Bosco disponible?",
  "context": { "conversationHistory": [], "postalCode": "28001" }
}
```

**Esperado:**
- Logs muestran: `Error in checkFormatAvailability: connect ECONNREFUSED`
- Respuesta de Claude: "Estoy teniendo problemas para acceder..."
- NO hay crash de servidor
- NO hay datos inventados

**Reanudar BD:**
```bash
docker unpause <postgres-container-name>
```

---

### Test 7: Comparar datos BD vs Tarifa

**Verificar que los precios en `tarifa-productos.json` coinciden con las series en BD:**

```bash
# 1. Listar todas las series en BD:
psql -d newzelland_prod -c "SELECT DISTINCT nombre FROM collections ORDER BY nombre;"

# 2. Listar todas las series en tarifa:
node -e "const t = require('./frontend/src/data/tarifa-productos.json'); console.log([...new Set(t.productos.map(p => p.serie))].sort());"

# Resultado: Ambas listas deben tener las mismas series (mayúsculas pueden diferir)
```

**Si hay discrepancia:**
- Actualizar `tarifa-productos.json` si se añadió serie nueva en BD
- Actualizar BD si se eliminó serie de tarifa

---

## Validación de Logs

### Logs esperados en POST /api/ceramico

**Request normal:**
```
Llamando a Claude con pregunta: ¿Hay Bosco en 60x120? - historial: 0 mensajes
Claude solicito check_product_availability con: { series: 'Bosco', format: '60x120' }
Respuesta de Claude recibida
```

**Request con error:**
```
Llamando a Claude con pregunta: ... - historial: X mensajes
Error in checkFormatAvailability: connect ECONNREFUSED
Error checking availability: connect ECONNREFUSED
Respuesta de Claude recibida (sin datos, con error message)
```

**Request con precio:**
```
Llamando a Claude con pregunta: ¿Precio de Bosco...? - historial: 0 mensajes
Claude solicito calculate_price con: { series: 'Bosco', format: '60x120', squareMeters: 15 }
Respuesta de Claude recibida
```

---

## Validación de Consultas SQL

### Verificar que productData.js ejecuta queries correctas

**Habilitar SQL logging (en db-config.js):**

```javascript
pool.on('query', (query) => {
  console.log('[SQL]', query.text);
});
```

**Consultas esperadas al llamar `check_product_availability`:**

```sql
SELECT nombre, formatos FROM collections WHERE UPPER(nombre) = 'BOSCO' OR UPPER(slug) = 'BOSCO' LIMIT 1
```

**Respuesta esperada:**
```
{
  nombre: 'Bosco',
  formatos: ['30x60', '60x120', '75x150']
}
```

---

## Checklist de Validación Completa

- [ ] **Módulo cargado:** `productData.js` existe y se importa
- [ ] **Herramienta definida:** `CHECK_AVAILABILITY_TOOL` en ceramico-ai.js
- [ ] **System prompt actualizado:** Menciona "Fase 3" y acceso a datos reales
- [ ] **Test 1 (Disponibilidad OK):** Respuesta correcta para formato existente
- [ ] **Test 2 (Disponibilidad FAIL):** Rechaza formato inexistente
- [ ] **Test 3 (Precio real):** Calcula desde tarifa oficial
- [ ] **Test 4 (Serie inexistente):** Responde "no existe", no inventa
- [ ] **Test 5 (Historial):** Mantiene contexto de conversación
- [ ] **Test 6 (Error manejo):** BD caída → mensaje claro, sin crash
- [ ] **Test 7 (Consistencia):** Series BD = Series tarifa
- [ ] **Logs correctos:** Muestran invocación de herramientas
- [ ] **Queries SQL:** Se ejecutan sin errores
- [ ] **Endpoint `/api/ceramico`:** Sigue siendo POST y devuelve respuesta JSON
- [ ] **Compatibilidad:** No rompe features de Fase 2 (precios, asesoramiento, guidance)

---

## Pruebas de Carga (Opcional)

Si el proyecto crece y recibe muchos usuarios:

```bash
# Usar Apache Bench o similar
ab -n 100 -c 10 -p payload.json -T application/json http://localhost:3001/api/ceramico

# Monitorear:
# - Tiempo de respuesta promedio
# - Errores de conexión a BD
# - Cache de tarifa (debe ser rápido después de la primera llamada)
```

---

## Troubleshooting

### "Error: ENOENT: no such file or directory 'tarifa-productos.json'"

**Solución:**
```javascript
// En productData.js, verificar path:
const tarifaPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'tarifa-productos.json');
// Debe apuntar a: /project/frontend/src/data/tarifa-productos.json
```

### "Error: pool is undefined in ceramicoAnswer"

**Solución:**
- Verificar que `pool` se pasa correctamente en `api/index.js`
- Línea: `const answer = await ceramicoAnswer(question, ceramicoContext, pool);`
- El `pool` debe venir de `db-config.js`

### "TypeError: checkFormatAvailability is not a function"

**Solución:**
```javascript
// Verificar en ceramico-ai.js:
const {
  getProductInfo,
  checkFormatAvailability,  // ← Debe estar aquí
  getPrice,
} = require('./data/productData');
```

### "Claude invoca check_product_availability pero backend no responde"

**Solución:**
1. Verificar que la herramienta está en `tools` array:
   ```javascript
   tools: [PRICE_TOOL, CHECK_AVAILABILITY_TOOL]
   ```

2. Verificar que el handler está en el `if (response.stop_reason === 'tool_use')`:
   ```javascript
   } else if (toolUseBlock && toolUseBlock.name === 'check_product_availability') {
     // Manejar aquí
   }
   ```

### "BD conecta pero consulta devuelve array vacío"

**Solución:**
- Verificar que las series existen en BD:
  ```sql
  SELECT COUNT(*) FROM collections;
  -- Debe ser > 0
  ```

- Verificar nombres coinciden (case-insensitive):
  ```sql
  SELECT nombre FROM collections WHERE LOWER(nombre) = 'bosco';
  -- Debe devolver al menos una fila
  ```

---

## Entorno de Testing Recomendado

### Desarrollo local

- Node.js 16+
- PostgreSQL 12+ (o Neon/Supabase)
- `npm install` en `/api`
- `.env` con `ANTHROPIC_API_KEY` y conexión BD
- `npm start`

### Testing en staging

- BD staging (Neon/Vercel Postgres)
- Variables env de staging
- Ejecutar suite de tests
- Validar con conversaciones reales

### Producción

- BD productiva (Neon)
- Variables env de prod
- Monitorer logs
- Alertas si `checkFormatAvailability` falla

---

## Conclusión de Testing

La Fase 3 debe pasar todos los tests para garantizar:
1. ✓ Datos reales desde BD
2. ✓ Precios verificados desde tarifa
3. ✓ Sin datos inventados
4. ✓ Manejo correcto de errores
5. ✓ Compatibilidad 100% con Fase 2

Una vez validado, el sistema está listo para producción.
