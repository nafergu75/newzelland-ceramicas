# CERAMICO PHASE 2 - QUICK START

**Enriquecimiento Tecnico Implementado**  
Fecha: 31 Julio 2026

---

## Lo Que Se Ha Hecho

Se ha expandido **Ceramico** con conocimiento tecnico profundo sobre ceramica, azulejos y porcelanico.

### Archivos Modificados/Creados

```
api/ceramicoKnowledge.js          (NUEVO - 24KB)   Base de conocimiento estructurada
api/ceramico-ai.js                (ACTUALIZADO)     System prompt enriquecido
docs/CERAMICO_TECHNICAL_KNOWLEDGE_PHASE2.md  (NUEVO) Documentacion completa
docs/CERAMICO_EXAMPLES.md          (NUEVO)         Ejemplos de interacciones
```

---

## Cambios Tecnico-Clave

### 1. `ceramicoKnowledge.js` (Nuevo Modulo)

Contiene estructurado:

- **Tipos de productos**: Pasta Roja, Pasta Blanca, Porcelanico (Tecnico/Esmaltado)
- **Caracteristicas tecnicas**: Absorcion agua, resistencia, espesor, helada
- **Recomendaciones por ubicacion**: Baño, Cocina, Terraza, Piscina, Fachada, Comercio
- **Guia de instalacion**: Doble encolado, adhesivos, tiempos secado, rejuntado
- **FAQ**: Respuestas a preguntas frecuentes

**Uso:** Disponible para expansiones futuras. Actualmente embebido en system prompt.

### 2. `ceramico-ai.js` (Actualizado)

Cambios:

```javascript
// NUEVO: Import del modulo de conocimiento
const CERAMIC_KNOWLEDGE = require('./ceramicoKnowledge');

// ACTUALIZADO: buildSystemPrompt() ahora incluye seccion
// "CONOCIMIENTO TECNICO CERAMICO" con:
// - Tipos de productos
// - Diferencia clave sobre absorcion
// - Recomendaciones por ubicacion
// - Pautas de instalacion
// - Errores comunes
```

**Ventajas:**

- Sin cambios en arquitectura existente
- Contrato JSON identico (sin breaking changes)
- Funciones de precio/transporte no afectadas
- Totalmente backward-compatible

---

## Capacidades Nuevas

Ceramico ahora responde a preguntas como:

### Sobre Materiales
- "¿Cual es la diferencia entre pasta roja y blanca?"
- "¿Que tipo de baldosa debo usar para el baño?"
- "¿Es apto porcelanico para exteriores?"

### Sobre Ubicacion
- "¿Puedo poner pasta blanca en terraza?"
- "¿Que producto para una piscina?"
- "¿Que tipo de suelo para un comercio con mucho transito?"

### Sobre Instalacion
- "¿Como se instala porcelanico?"
- "¿Necesito doble encolado?"
- "¿Que adhesivo usar?"
- "¿Cuanto tiempo esperar antes de rejuntar?"

### Combinadas
- Recomendacion + Precio (usa calculate_price automaticamente)
- Tecnica + Ubicacion (ej. "¿Como instalo pasta blanca en baño?")

---

## Verificacion Rapida (5 minutos)

### Paso 1: Verificar Setup

```bash
cd "/c/Users/NACHO PC/Desktop/documntos prueba/newzelland-ceramicas"

# Verificar que archivos existen
ls -la api/ceramico-ai.js api/ceramicoKnowledge.js

# Verificar que ceramico-ai.js importa el modulo
grep "require.*ceramicoKnowledge" api/ceramico-ai.js
```

Esperado: Sin errores, archivos existen.

### Paso 2: Variables de Entorno

```bash
# Verificar que estan configuradas
echo $CERAMICO_ENABLED
echo $ANTHROPIC_API_KEY
echo $VITE_CERAMICO_ENABLED
```

Esperado: `true` (o `true`) + API key valida.

### Paso 3: Iniciar Backend

```bash
cd api
npm install  # si no esta hecho
npm start
```

Esperado: "Server running on port 3001" (o el puerto configurado)

### Paso 4: Iniciar Frontend

```bash
cd . # o dir del frontend
npm run dev
```

Esperado: "Local: http://localhost:5173" (o similar)

### Paso 5: Probar Chat

1. Abre http://localhost:5173 en navegador
2. Haz clic en boton flotante "Ceramico" (bottom-right)
3. Escribe: "¿Cual es la diferencia entre pasta roja y blanca?"
4. Espera respuesta

Esperado: Ceramico explica absorcion de agua, diferencias, y recomienda segun use case.

---

## Casos de Prueba Recomendados (10 minutos)

```
Test 1: "¿Cual es la diferencia entre pasta roja y blanca?"
Test 2: "¿Puedo poner pasta blanca en la terraza?"
Test 3: "¿Como se instala porcelanico?"
Test 4: "¿Cuanto tiempo esperar antes de rejuntar?"
Test 5: "Que tipo de suelo para un comercio con alto transito?"
```

Ver `docs/CERAMICO_EXAMPLES.md` para respuestas esperadas detalladas.

---

## Verificar No-Breaking-Changes

El endpoint `/api/ceramico` sigue siendo:

```bash
# Request
curl -X POST http://localhost:3001/api/ceramico \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Cual es la diferencia entre pasta roja y blanca?",
    "context": { "conversationHistory": [], "postalCode": "28001" }
  }'

# Response
{
  "ok": true,
  "response": "La pasta roja es mas porosa... [respuesta tecnica sobre ceramica]"
}
```

---

## Ficheros Principales

```
/api/
  ceramico-ai.js                      Logica IA (actualizado)
  ceramicoKnowledge.js                Base de conocimiento (nuevo)
  index.js                            Endpoint /api/ceramico
  price-calculator.js                 Calculo de precios (sin cambios)
  
/src/components/
  CeramicoButton.tsx                  Boton flotante
  CeramicoWidget.tsx                  Panel de chat

/docs/
  CERAMICO_TECHNICAL_KNOWLEDGE_PHASE2.md    Documentacion completa
  CERAMICO_EXAMPLES.md                      Ejemplos de interacciones
  CERAMICO_CHATBOT_PHASE1.md                (ya existia)
```

---

## Siguiente: Pruebas en Profundidad

Para pruebas mas exhaustivas, consultar:

- `docs/CERAMICO_TECHNICAL_KNOWLEDGE_PHASE2.md` → Seccion "PLAN DE PRUEBAS" (10 tests detallados)
- `docs/CERAMICO_EXAMPLES.md` → Ejemplos reales de interacciones esperadas

---

## Notas Importantes

1. **No hay breaking changes**: API contrato identico a Phase 1
2. **Totalmente backward-compatible**: Funciona con codigo existente
3. **Sin nuevas dependencias**: Solo require() de ceramicoKnowledge.js
4. **Sin nuevas variables de entorno**: Mismo setup que antes
5. **Mejora gradual**: Si quieres expandir, ya tienes estructura en `ceramicoKnowledge.js`

---

## Si Algo Falla

1. **Ceramico no responde**: Verificar que `ANTHROPIC_API_KEY` es valida
2. **Respuestas genericas**: Verificar que `buildSystemPrompt()` se llama con contexto
3. **Errores de import**: Verificar que `ceramicoKnowledge.js` esta en `/api/` (mismo dir que `ceramico-ai.js`)
4. **Precios no funcionan**: `calculate_price` no cambio, deberia funcionar como antes

---

## Soporte Rapido

**Archivo de conocimiento:** `/api/ceramicoKnowledge.js`  
**Logica de IA:** `/api/ceramico-ai.js` (lineas 73-144 = system prompt enriquecido)  
**Documentacion:** `/docs/CERAMICO_TECHNICAL_KNOWLEDGE_PHASE2.md`  
**Ejemplos:** `/docs/CERAMICO_EXAMPLES.md`

---

**FIN DE QUICK START**

Para detalles, ver `/docs/CERAMICO_TECHNICAL_KNOWLEDGE_PHASE2.md`
