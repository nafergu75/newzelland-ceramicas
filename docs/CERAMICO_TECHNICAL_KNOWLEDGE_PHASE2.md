# CERAMICO - PHASE 2: ENRIQUECIMIENTO TECNICO

**Fecha:** 31 Julio 2026  
**Estado:** IMPLEMENTADO  
**Modulo:** `ceramico-ai.js` + `ceramicoKnowledge.js`

---

## Resumen de Cambios

Se ha enriquecido Ceramico con **conocimiento tecnico profundo sobre ceramica, azulejos y porcelanico**. El chatbot ahora puede responder preguntas tecnicas complejas sobre:

- Diferencias entre pasta roja, pasta blanca y porcelanico
- Recomendaciones de productos segun ubicacion (interior/exterior, baño, cocina, terraza, piscina, fachada, comercio)
- Conceptos tecnicos (absorcion de agua, resistencia, espesor, helada)
- Pautas de instalacion (doble encolado, adhesivos, tiempos de secado)
- Errores comunes a evitar

---

## Archivos Modificados / Creados

### 1. `api/ceramicoKnowledge.js` (NUEVO)

Modulo de conocimiento tecnico estructurado con:

- **Tipos de productos**: Pasta Roja, Pasta Blanca, Porcelanico (Tecnico / Esmaltado), Otros
- **Caracteristicas tecnicas**: Absorcion agua, resistencia mecanica, espesor, helada
- **Recomendaciones por ubicacion**: Baño, Cocina, Terraza, Piscina, Fachada, Comercio, etc.
- **Guia de instalacion**: Preparacion, doble encolado, adhesivos, tiempos secado, rejuntado
- **Criterios de seleccion**: Por presupuesto, por ubicacion, por uso
- **FAQ**: Respuestas a preguntas frecuentes
- **Contexto para Claude**: Resumen ejecutivo para el system prompt

**Utilizacion:** El archivo sera consultado por Claude internamente si es necesario en futuras expansiones. Actualmente, el conocimiento esta embebido en el system prompt de `ceramico-ai.js`.

### 2. `api/ceramico-ai.js` (ACTUALIZADO)

**Cambios principales:**

1. **Import del modulo de conocimiento:**
   ```javascript
   const CERAMIC_KNOWLEDGE = require('./ceramicoKnowledge');
   ```

2. **Enriquecimiento del system prompt:**
   - Ampliado de ~100 lineas a ~140 lineas
   - Agregada seccion `CONOCIMIENTO TECNICO CERAMICO (integrado en tus respuestas)`
   - Incluye:
     - Tipos de productos (con caracteristicas clave)
     - Diferencia clave sobre absorcion de agua
     - Recomendaciones por ubicacion
     - Pautas de instalacion
     - Errores comunes

3. **Sin cambios en arquitectura:**
   - Mantiene todas las funciones existentes (`ceramicoAnswer`, `buildCompactCatalog`, etc.)
   - No afecta el calculo de precios ni transporte
   - El contrato JSON del endpoint sigue siendo identico

---

## Capabilidades Nuevas de Ceramico

Ahora Ceramico puede responder (con tecnica y precision):

### Preguntas sobre Tipos de Productos

**Ejemplo:** "¿Cual es la diferencia entre pasta roja y pasta blanca?"

**Respuesta (esperada):**
```
La pasta roja es mas porosa (absorbe 6-10% de agua), economica y ideal solo para interiores.
La pasta blanca es menos porosa (3-6%), mejor que roja y tiene excelente relacion calidad-precio.

Para baños y cocinas, pasta blanca es casi siempre la mejor opcion.
```

### Preguntas sobre Ubicacion Adecuada

**Ejemplo:** "¿Puedo poner pasta blanca en la terraza?"

**Respuesta (esperada):**
```
Pasta blanca en exterior NO es recomendable sin proteccion extra.

El porcelanico es la opcion correcta: absorcion minima, resistencia a helada garantizada.
Si el presupuesto es critico, minimo usar gres esmaltado apto para exterior, pero porcelanico es lo seguro.
```

### Preguntas sobre Instalacion

**Ejemplo:** "¿Como se instala el porcelanico? ¿Que adhesivo necesito?"

**Respuesta (esperada):**
```
Para porcelanico, usa DOBLE ENCOLADO (obligatorio para formatos >60x120):

1. Aplica adhesivo en soporte con llana dentada
2. Aplica capa fina en trasera de baldosa con llana lisa
3. Presiona con rotacion para evitar burbujas

Adhesivo recomendado: C2TE S1 (flexible, alto rendimiento).
```

### Preguntas sobre Tiempos de Secado

**Ejemplo:** "¿Cuanto tiempo esperar antes de rejuntar?"

**Respuesta (esperada):**
```
Adhesivo: MINIMO 24 horas (mejor 48-72h en porcelanico o clima frio/humedo).
Lechada: 24-48h antes de pisarlo, 72h si hay cargas pesadas.

Regla de oro: CUANDO DUDES, ESPERA MAS DIAS. Humedad alta o frio retrasan mucho el secado.
```

### Preguntas sobre Seleccion segun Caso de Uso

**Ejemplo:** "¿Que tipo de suelo me recomiendas para un comercio con mucho transito?"

**Respuesta (esperada):**
```
PORCELANICO TECNICO con PEI minimo 3-4.

Razon: resistencia maxima al desgarre, durabilidad garantizada 10+ anos.

Especificaciones:
- Absorcion <0.5% (facilidad de limpieza)
- PEI 3-4 (resistencia a rayado/transito)
- Color neutro (disimula suciedad)
- Formatos estandar (facilita reposicion si hay danos)
```

---

## PLAN DE PRUEBAS

### Prerequisitos

Asegura que en **local** tengas:

```bash
# Backend
export CERAMICO_ENABLED=true
export ANTHROPIC_API_KEY=<tu-clave-valida>

# Frontend (.env.local)
VITE_CERAMICO_ENABLED=true
```

### Casos de Prueba Recomendados

#### Test 1: Diferencias de Materiales
```
Pregunta: "¿Cual es la diferencia entre pasta roja y pasta blanca?"

Validar:
- Ceramico explica absorcion de agua
- Menciona que pasta blanca es mejor
- Recomienda pasta blanca para interiores
```

#### Test 2: Recomendacion Exterior
```
Pregunta: "¿Puedo poner pasta blanca en la terraza?"

Validar:
- Claramente dice NO (sin proteccion)
- Recomienda porcelanico
- Explica por que (resistencia a helada, absorcion nula)
```

#### Test 3: Instalacion Porcelanico
```
Pregunta: "¿Necesito doble encolado para porcelanico?"

Validar:
- Dice SI (recomendado, especialmente >60x120)
- Describe el proceso paso a paso
- Recomienda adhesivo C2TE S1
- Explica beneficios (contacto total, evita burbujas)
```

#### Test 4: Tiempos de Secado
```
Pregunta: "¿Cuanto tiempo esperar antes de rejuntar?"

Validar:
- Menciona 24h minimo (mejor 48-72h)
- Advierte que humedad/frio retrasan
- Regla de oro: cuando dudes, espera mas
```

#### Test 5: Seleccion Presupuesto Bajo
```
Pregunta: "Tengo presupuesto bajo para el interior. ¿Que material me recomiendas?"

Validar:
- Sugiere pasta roja como opcion economica
- Aclara que es solo para interiores
- Menciona que pasta blanca es mejor si presupuesto permite
```

#### Test 6: Caso Piscina
```
Pregunta: "Voy a revestir una piscina. ¿Que producto debo usar?"

Validar:
- Dice PORCELANICO TECNICO ANTIDESLIZANTE
- Menciona absorcion <0.1%
- Recomienda doble encolado con C2TE S1
- Advierte sobre resistencia a cloro
```

#### Test 7: Comercio Alto Transito
```
Pregunta: "Tengo una tienda y necesito suelo resistente. ¿Que me recomiendas?"

Validar:
- Sugiere Porcelanico Tecnico PEI 3-4
- Explica que PEI mide resistencia al desgarre
- Menciona durabilidad 10+ anos
- Recomienda color neutro para disimular suciedad
```

#### Test 8: Mantenimiento Historia de Conversacion
```
Conversacion:
1. Usuario: "¿Cual es la diferencia entre pasta roja y blanca?"
2. Ceramico: [explica diferencias]
3. Usuario: "¿Como se instala la que recomiendas?"

Validar:
- Ceramico NO pregunta de nuevo cual es el material
- Entiende que se refiere a pasta blanca (del contexto)
- Responde sobre instalacion de pasta blanca
```

#### Test 9: Integracion con Catalogo y Precios
```
Pregunta: "¿Cual es el precio de 10 m2 de Bosco en formato 60x120?"

Validar:
- Ceramico NO inventa precio
- Usa herramienta calculate_price
- Devuelve precio correcto con desglose (cajas, total, transporte)
- Combina informacion tecnica + precio
```

#### Test 10: Sensibilidad a Preguntas Tecnicas Avanzadas
```
Pregunta: "¿Que absorcion tiene el porcelanico de Newzelland?"

Validar:
- Ceramico da respuesta general (porcelanico <0.5%)
- Ofrece revisar ficha tecnica del catalogo para especifico
- NO inventa datos que no sabe
```

---

## Notas Tecnicas

### Integracion en System Prompt

El conocimiento tecnico se pasa como parte del `systemPrompt` que se envia a Claude. Ventajas:

- No requiere llamadas adicionales a DB
- Token-eficiente (contexto fijo)
- Claude tiene acceso instantaneo
- Facil de actualizar (solo editar `buildSystemPrompt`)

### Futuras Mejoras (Opcional)

Si en el futuro quieres expandir mas:

1. **Consultas dinamicas a ceramicoKnowledge.js:**
   - Por ej., si el usuario pregunta "absorcion del porcelanico", extraer de CERAMIC_KNOWLEDGE.technicalConcepts
   - Util si tienes muchos datos y quieres ser muy selectivo

2. **FAQ integrada en base de datos:**
   - Guardar FAQ localmente y consultar antes de llamar a Claude
   - Ahorra tokens en preguntas repetitivas

3. **Fichas tecnicas de series:**
   - Crear tabla `series_technical_specs` en BD
   - Pasar datos especificos de cada serie al context

4. **Videos/imagenes de instalacion:**
   - Referenciables en respuestas (links a docs)

Pero por ahora, la implementacion actual es sencilla, mantenible y efectiva.

---

## Modelos Usados

- **Backend**: Claude Haiku 4.5 (claude-haiku-4-5-20251001)
- **Razon**: Menor latencia, coste, suficiente para asistencia tecnica

Si necesitas mas razonamiento complejo, considera cambiar a Sonnet en futuro:
```javascript
model: 'claude-sonnet-4-20250514',
```

---

## Variables de Entorno (Sin Cambios)

```bash
# Backend (.env)
CERAMICO_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-v4-xxxxx

# Frontend (.env.local)
VITE_CERAMICO_ENABLED=true
```

No requiere nuevas variables.

---

## Contrato API (Sin Cambios)

Endpoint sigue siendo: `POST /api/ceramico`

Request:
```json
{
  "question": "¿Cual es la diferencia entre pasta roja y blanca?",
  "context": {
    "conversationHistory": [...],
    "postalCode": "28001"
  }
}
```

Response:
```json
{
  "ok": true,
  "response": "La pasta roja es mas porosa..."
}
```

Identico a Phase 1. **Sin breaking changes.**

---

## Verificacion Final

1. Inicia el backend: `npm start` en `/api`
2. Inicia el frontend: `npm run dev` en `/`
3. Abre el chat de Ceramico (botón flotante)
4. Haz las preguntas del plan de pruebas
5. Comprueba que:
   - Responde sobre tecnica ceramica (no solo catalogo)
   - Recomienda segun ubicacion
   - Explica bien instalacion
   - Mantiene coherencia conversacional
   - Sigue usando calculate_price para presupuestos

---

## Archivos Clave para Referencia

- **Conocimiento tecnico:** `/api/ceramicoKnowledge.js`
- **Chatbot IA:** `/api/ceramico-ai.js`
- **Endpoint server:** `/api/index.js` (endpoint POST /api/ceramico)
- **Frontend widget:** `/src/components/CeramicoWidget.tsx`
- **Botón flotante:** `/src/components/CeramicoButton.tsx`

---

## Soporte / Preguntas

Si tienes dudas sobre el conocimiento tecnico integrado:
- Revisar `CERAMIC_KNOWLEDGE` en `/api/ceramicoKnowledge.js`
- Consultar las secciones de FAQ y recomendaciones por ubicacion
- Actualizar el system prompt segun necesidades futuras

---

**FIN DE DOCUMENTO**
