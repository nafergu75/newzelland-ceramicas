# Fase 3: Ejemplos de Conversaciones con Datos Reales

Documentación de cómo Cerámico ahora responde usando datos verificados de la base de datos.

---

## Ejemplo 1: Verificar Disponibilidad de Formato

**Usuario:** "¿Hay Bosco en 60x120?"

**Proceso interno:**
1. Claude detecta pregunta sobre disponibilidad
2. Invoca herramienta: `check_product_availability({ series: "Bosco", format: "60x120" })`
3. Backend consulta BD: `SELECT formatos FROM collections WHERE nombre = 'BOSCO'`
4. BD devuelve: `{ available: true, availableFormats: ["30x60", "60x120", "75x150"] }`
5. Claude redacta respuesta usando datos reales

**Respuesta de Cerámico:**
```
Sí, Bosco está disponible en 60x120. 

También tenemos estos formatos de la serie:
- 30x60
- 60x120 
- 75x150

¿Necesitas información sobre acabados o precio?
```

**Datos consultados:** BD de PostgreSQL (tabla `collections`)  
**Garantía:** 100% verificado, no inventado

---

## Ejemplo 2: Solicitar Precio Real

**Usuario:** "¿Cuánto cuesta Alpina 30x60 para 20 metros cuadrados?"

**Proceso interno:**
1. Claude identifica cálculo de precio
2. Invoca: `calculate_price({ series: "Alpina", format: "30x60", squareMeters: 20 })`
3. Backend:
   - Busca en `tarifa-productos.json`
   - Encuentra: `precio_venta_m2: 17.32€`, `metros_por_caja: 1.62`
   - Calcula: `cajas = ceil(20 / 1.62) = 13 cajas`
   - Total: `13 × 28.06€ = 364.78€`
4. Claude redacta presentación profesional

**Respuesta de Cerámico:**
```
Para 20 m² de Alpina en formato 30x60 necesitas:

📦 13 cajas
💶 Precio total: 364,78€ (IVA incluido)

Detalles:
- Precio por metro cuadrado: 17,32€
- Metros por caja: 1,62 m²
- Precio por caja: 28,06€

✓ Este precio incluye transporte hasta 500 km desde nuestra fábrica en Onda (Castellón).

¿Quieres coordinar con otros acabados o tienes preguntas sobre instalación?
```

**Fuentes de datos:**
- `tarifa-productos.json` (precios oficiales)
- Cálculos verificados en backend

---

## Ejemplo 3: Producto No Disponible

**Usuario:** "¿Hay Bosco en 200x200?"

**Proceso interno:**
1. Claude invoca: `check_product_availability({ series: "Bosco", format: "200x200" })`
2. Backend verifica en BD
3. BD devuelve: 
   ```json
   {
     "available": false,
     "series": "Bosco",
     "format": "200x200",
     "availableFormats": ["30x60", "60x120", "75x150"],
     "message": "El formato '200x200' no está disponible..."
   }
   ```
4. Claude reconoce indisponibilidad y sugiere alternativas

**Respuesta de Cerámico:**
```
El formato 200x200 no está disponible en la serie Bosco.

En Bosco tenemos estos formatos disponibles:
- 30x60
- 60x120 (el más popular de la serie)
- 75x150 (gran formato, efecto continuidad)

Si buscas algo más grande, 75x150 es excelente para salones y espacios abiertos.
¿Te interesa presupuesto para este formato?
```

**Garantía:** No se inventó disponibilidad. Datos verificados en BD.

---

## Ejemplo 4: Serie Inexistente

**Usuario:** "¿Qué precio tiene Inexistente en 60x120?"

**Proceso interno:**
1. Claude invoca: `check_product_availability({ series: "Inexistente", format: "60x120" })`
2. BD no encuentra la serie
3. Devuelve: 
   ```json
   {
     "available": false,
     "series": "Inexistente",
     "message": "La serie 'Inexistente' no existe en nuestro catálogo."
   }
   ```
4. Claude responde sin inventar datos

**Respuesta de Cerámico:**
```
No tenemos una serie llamada "Inexistente" en nuestro catálogo.

Quizás te refieres a una de estas series similares:
- Bosco
- Alpina
- Ardesia C3
- Atlas

¿De cuál te gustaría conocer precios y características?
```

**Nota de seguridad:** La IA nunca intentará inventar precios o características para productos inexistentes.

---

## Ejemplo 5: Preguntas Técnicas + Datos Reales

**Usuario:** "¿Qué porcelánico me recomiendas para un baño?"

**Proceso interno:**
1. Claude accede a `buildCompactCatalog(pool)` que obtiene TODAS las series
2. Consulta los datos técnicos desde BD: material, tipo, acabados, colores
3. Aplica lógica de recomendación según ubicación + conocimiento técnico
4. Si el usuario pregunta precio, invoca `calculate_price()`

**Respuesta de Cerámico:**
```
Para un baño, lo ideal es un porcelánico esmaltado con acabado antideslizante.

De nuestro catálogo, te recomiendo estas series porcelánicas:
- **Bosco** (disponible en acabados mate y pulido)
- **Alpina** (excelente relación calidad-precio)
- **Atlas** (gran variedad de colores)

¿Qué te atrae más: colores clásicos, mármol o piedra?

Una vez que elijas, puedo:
1. Mostrarte todos los formatos y acabados disponibles
2. Calcular el precio exacto para tu espacio
3. Asesorarte sobre instalación y juntas
```

**Características:**
- Datos técnicos verificados en BD ✓
- Recomendaciones basadas en conocimiento cerámico ✓
- Precio real disponible bajo demanda ✓

---

## Ejemplo 6: Comparación de Series

**Usuario:** "¿Cuál es la diferencia entre Bosco y Alpina? ¿Precios?"

**Proceso interno:**
1. Claude accede a BD para obtener características de ambas
2. Compara: material, tipo, acabados, precios
3. Invoca `calculate_price()` para ambas series si el usuario pide presupuesto

**Respuesta de Cerámico:**
```
Excelente pregunta. Aquí van las diferencias principales:

📊 BOSCO vs ALPINA

                Bosco           Alpina
Material:       Porcelánico     Porcelánico
Acabados:       Mate, Pulido    Mate, Pulido, Satinado
Formatos:       30x60, 60x120   30x60, 45x45, 60x120
Colores:        5 opciones      8 opciones
Precio/m²:      21.10€          17.32€ (más económica)

💡 Resumen:
- **Bosco**: Premium, acabados refinados, presencia más moderna
- **Alpina**: Excelente relación calidad-precio, más variedad de colores

Para 20 m² en 60x120:
- Bosco: ~305€
- Alpina: ~346€

¿Cuál se ajusta mejor a tu presupuesto y estética?
```

**Datos utilizados:**
- BD: características de ambas series
- `calculate_price()`: precios reales para comparación

---

## Ejemplo 7: Consulta Compleja (Asesoramiento + Precio)

**Usuario:** "Tengo un salón de 35 m² y quiero algo moderno. ¿Qué serie me recomiendas y cuánto me costaría en 75x150?"

**Proceso interno:**
1. Claude lee la intención: asesoramiento + cálculo de presupuesto
2. Accede a BD para series con gran formato disponible
3. Identifica que Bosco y Alpina tienen 75x150
4. Invoca 2 cálculos:
   - `calculate_price({ series: "Bosco", format: "75x150", squareMeters: 35 })`
   - `calculate_price({ series: "Alpina", format: "75x150", squareMeters: 35 })`
5. Redacta asesoramiento completo

**Respuesta de Cerámico:**
```
Para un salón moderno de 35 m², el formato 75x150 es perfecto: da sensación 
de amplitud y continuidad visual.

Te recomiendo estas opciones con presupuesto:

🏆 BOSCO 75x150 (Recomendado)
- Aspecto: Moderno y elegante
- Acabados: Mate (calurosidad) o Pulido (luz)
- Coste para 35 m²: ~524€ (cajas necesarias: 18)
- Stock: ✓ Disponible

💰 ALPINA 75x150 (Mejor precio)
- Aspecto: Moderno, 8 colores disponibles
- Acabados: Mate o Satinado
- Coste para 35 m²: ~468€ (cajas necesarias: 19)
- Stock: ✓ Disponible

Ambos precios incluyen transporte.

¿Quieres que profundice en los acabados o tienes dudas sobre instalación?
```

**Garantías:**
- Datos de disponibilidad: ✓ BD verificada
- Precios: ✓ Tarifa oficial
- Cálculos: ✓ Backend (no manual)
- Asesoramiento: ✓ Conocimiento técnico integrado

---

## Ejemplo 8: Manejo de Error (BD No Disponible)

**Usuario:** "¿Hay Bosco disponible?"

**Escenario:** La base de datos está caída o no responde.

**Proceso interno:**
1. Claude invoca: `check_product_availability(pool, { series: "Bosco" })`
2. Backend intenta `await pool.query(...)`
3. Catch del error: `console.error('Error verificando disponibilidad:', error)`
4. Devuelve: `{ available: false, error: 'Error verificando disponibilidad en BD' }`
5. Claude reconoce que no es un problema de producto, sino de acceso

**Respuesta de Cerámico:**
```
Estoy teniendo problemas para acceder a la disponibilidad en este momento.

Por favor:
1. Intenta tu pregunta de nuevo en unos segundos
2. O contacta directamente con nuestro equipo comercial

Disculpa las molestias. Estamos intentando resolver esto.
```

**Importante:** Claude NO intenta inventar datos cuando la BD falla. Avisa al usuario de forma clara.

---

## Ejemplo 9: Búsqueda Guiada (Guidance)

**Usuario:** "¿Qué cerámica me recomiendas?"

**Proceso interno:**
1. Claude reconoce que es una pregunta abierta que requiere guidance
2. Accede a `buildCompactCatalog(pool)` para conocer todo el catálogo
3. Aplica el PROCESO DE GUIDANCE del system prompt
4. Formulas preguntas secuenciales para entender necesidades

**Respuesta de Cerámico:**
```
¡Excelente! Te ayudaré a encontrar la cerámica perfecta.

Empecemos por lo básico:

1️⃣ ¿Es para SUELO o PARED (o ambos)?
   (Esto es importante porque no toda cerámica de pared es apta para suelo)

2️⃣ ¿INTERIOR o EXTERIOR?
   (Exterior requiere porcelánico antihielo obligatoriamente)

3️⃣ ¿QUÉ ESTANCIA?
   - Baño
   - Cocina
   - Salón/Dormitorio
   - Terraza/Piscina
   - Comercio

Una vez que me lo digas, te recomendaré series específicas con presupuesto.
```

**Notas:**
- El guidance NO inventa datos
- Cada respuesta usa datos reales de BD
- El flujo es idéntico a Fase 2, pero ahora respaldado por BD

---

## Cambio Conceptual: De "Conocimiento General" a "Datos Verificados"

### Antes (Fase 2):
```
"Tenemos Bosco, Alpina y muchas otras series.
El precio es de aproximadamente X euros."
```
→ El usuario nunca sabía si los datos eran exactos

### Ahora (Fase 3):
```
"Bosco está disponible en 30x60, 60x120, 75x150.
El precio exacto para 20 m² es 364,78€ (verificado en BD)."
```
→ El usuario confía en que los datos son 100% precisos

---

## Testing Manual: Lista de Verificación

Para probar que Fase 3 funciona correctamente:

- [ ] "¿Hay Bosco 60x120?" → Verifica BD, no inventa
- [ ] "¿Precio Alpina 30x60 para 10 m²?" → Calcula desde tarifa real
- [ ] "¿Bosco 200x200?" → Dice "No disponible", lista alternativas
- [ ] "¿Info de Serie Inexistente?" → Dice "No existe", sugiere series reales
- [ ] "¿Qué series tienen 75x150?" → Lista solo las que BD confirma
- [ ] "¿Precio de Bosco sin especificar formato?" → Pide aclaración antes de calcular
- [ ] Offline BD: Usuario pregunta → Cerámico dice "Tengo problemas de acceso"

---

## Conclusión

Con Fase 3, cada respuesta de Cerámico está respaldada por:
1. **BD real** (disponibilidad, formatos, acabados)
2. **Tarifa oficial** (precios exactos)
3. **Lógica de negocio verificada** (cálculos en backend)
4. **Conocimiento técnico** (asesoramiento experto)

**Resultado:** Un chatbot confiable que da respuestas precisas y verificables.
