# Cerámico — Chatbot IA Fase 1 (Texto + Transporte)

## Objetivo

Implementar un asistente de chat llamado **Cerámico** que ayude a usuarios a:
- Descubrir series, formatos, acabados y colores del catálogo.
- Entender la regla de transporte: precios/presupuestos incluyen envío hasta **≤500 km** desde Onda (Castellón); distancias mayores aplican un plus según código postal.
- Toda la respuesta se basa en datos reales de la BD, sin invención.

## Alcance de Fase 1

- **Solo texto**, sin generación de imágenes ni mockups visuales (Fase 2).
- Chatbot integrado como widget (botón flotante + panel) en la web.
- Endpoint backend `POST /api/ceramico` reutilizando el pipeline IA existente.
- Regla de transporte explicada de forma **cualitativa** (no numérica): describe el concepto, pide código postal si es necesario, pero no calcula importes exactos.
- Activable/desactivable con flags de entorno.

## Arquitectura Técnica

### Backend: Endpoint `/api/ceramico`

**Ubicación:** `api/index.js`

**Método:** `POST /api/ceramico`

**Entrada:**
```json
{
  "question": "¿qué formatos tiene Alpina?",
  "context": {
    "currentSeriesSlug": "alpina",
    "page": "/collections/alpina",
    "postalCode": "12003"
  }
}
```
- `question`: obligatorio, pregunta del usuario.
- `context.currentSeriesSlug`, `context.page`, `context.postalCode`: opcionales.

**Salida:**
```json
{
  "answer": "Alpina está disponible en los siguientes formatos...",
  "postalCode": "12003"
}
```

**Lógica:**
1. Lee todas las series desde la BD (tabla `collections`, 90 filas).
2. Construye un JSON compacto del catálogo (solo campos útiles: nombre, formatos, colores, material, tipo, acabados).
3. Detecta intención de transporte usando palabras clave (`transporte`, `envío`, `portes`, `plazo de entrega`, `código postal`, etc.).
4. Llama a Claude (`@anthropic-ai/sdk`) con:
   - Un **system prompt** base que define el rol y tono de Cerámico.
   - Si hay intención de transporte: instrucción reforzada sobre la regla de ≤500 km y plus >500 km.
   - Si hay `postalCode`: lo incluye en el contexto para que Claude lo mencione.
   - El catálogo compacto.
   - La pregunta del usuario.
5. Devuelve la respuesta de Claude + el `postalCode` actual (para que el frontend lo mantenga en el campo).

**Manejo de errores:**
- Si `CERAMICO_ENABLED !== 'true'`: devuelve 503 "Cerámico está desactivado".
- Si falla la IA o la red: devuelve 500 con "No he podido responder ahora. Vuelve a intentarlo."
- No expone stack traces ni detalles técnicos al usuario final.

### Pipeline IA (reutilización simplificada)

**Módulo:** `api/ceramico-ai.js`

**Responsabilidades:**
- Función `ceramicoAnswer(question, context)` que:
  - Recibe pregunta y contexto.
  - Construye el system prompt (base + instrucciones de transporte si procede).
  - Llama a Claude.
  - Devuelve texto.
- Función auxiliar `isTransportIntent(question)` que detecta palabras clave de transporte.
- Función `buildCompactCatalog()` que lee la BD y retorna series con solo los datos necesarios.

**No usa RAG:** el catálogo entero viaja como contexto en cada petición (90 series en JSON compacto = ~50-100KB, fácil para Claude). Esto evita depender de Voyage AI y de la tabla `catalog_embeddings` que no existe en producción.

### Frontend: Widget

**Componentes:**

**`CeramicoButton.tsx`**
- Botón circular flotante en la esquina inferior derecha.
- Icono: `ChatCircleText` de `@phosphor-icons/react`.
- `position: fixed; bottom: 24px; right: 24px; z-index: 50`.
- Tooltip: "Cerámico · Pregunta sobre el catálogo y el transporte".
- Montado en `App.tsx` solo si `import.meta.env.VITE_CERAMICO_ENABLED === 'true'`.

**`CeramicoWidget.tsx`**
- Modal/overlay con patrón de `FormatSelectorModal`:
  - Overlay oscurecido, clickable para cerrar.
  - Contenedor principal con `role="dialog"`, `aria-modal="true"`.
  - Cierre: botón X, click fuera, Escape.
- Layout responsive:
  - Desktop: ancho 380px, altura 65% de ventana, anclado abajo-derecha.
  - Móvil: ocupa ~90% de pantalla, scroll si hay muchos mensajes.
- Contenido interno:
  - **Cabecera:** "Cerámico · Asistente de catálogo".
  - **Mensaje inicial:** explicación de qué puede hacer (series, formatos, transporte, etc.).
  - **3-4 prompts sugeridos:**
    - "Ver formatos de [serie actual]" (si hay `currentSeriesSlug`).
    - "¿Transporte incluido hasta dónde?"
    - "Qué serie para piscina exterior."
  - **Campo de código postal:** input texto donde usuario introduce su CP, persiste en el widget.
  - **Historial de mensajes:** usuario vs Cerámico.
  - **Input + envío:** caja de texto + botón, llama a `POST /api/ceramico`.
  - **Estados de carga/error:**
    - "Cerámico está pensando…"
    - "Algo ha salido mal. Vuelve a intentarlo."

**Integración:**
- Contexto React (`CeramicoProvider`) o estado en `App.tsx` para gestionar "widget abierto".
- El botón abre el widget; el widget se cierra con click fuera, Escape, o botón X.
- El widget sabe en qué página/serie estamos (via `useLocation()`, `props`, etc.) y lo pasa como `context` a la API.

## Regla de Transporte (Cualitativa, Fase 1)

**Enunciado:**
- Los presupuestos que preparamos **incluyen transporte hasta 500 km** desde nuestra fábrica en Onda (Castellón).
- Para distancias mayores (>500 km), se aplica un **plus de transporte** que depende del código postal del cliente.

**Implementación en Fase 1 (sin cálculo numérico):**
- Cuando la pregunta tiene intención de transporte (palabras clave detectadas):
  - Cerámico explica la regla en términos cualitativos.
  - Si hay `postalCode`, lo menciona: *"Para tu código postal XXXXX se aplicaría la regla de plus si superas los 500 km; lo concretaremos en la oferta."*
  - Si no hay `postalCode`, lo pide de forma natural.
- **Nunca** inventa un importe exacto del plus.
- Documentado el punto de extensión:
  - Función futura `calculateTransportSurcharge(postalCode)`.
  - Tabla de zonas/referencias de distancia.

## Flags de Activación

**Backend (`api/index.js`):**
- `process.env.CERAMICO_ENABLED`
  - `'true'` → endpoint activo.
  - Otro valor → devuelve 503.

**Frontend (`frontend/src/components/App.tsx`):**
- `import.meta.env.VITE_CERAMICO_ENABLED`
  - `'true'` → monta `CeramicoButton`.
  - Otro valor → no renderiza nada.

## Restricciones

- ❌ No modificar el comportamiento del `whatsapp-bot` existente.
- ❌ No generar imágenes ni mockups (Fase 2).
- ❌ No inventar precios de plus de transporte: solo descripción cualitativa.
- ❌ No usar RAG con embeddings en esta fase (simplifica con catálogo en prompt).
- ✅ Mantener coherencia visual con UI actual (tipografía, colores, sombras).
- ✅ Funciona bien en móvil (scroll, cierre, no solapamientos).
- ✅ Ningún dato de catálogo hardcodeado; siempre de la BD.

## Puntos de Extensión Futura

### Fase 2a: Cálculo numérico de transporte
- Crear tabla `transport_zones` (código postal / referencia → distancia aproximada / factor de coste).
- Implementar `calculateTransportSurcharge(postalCode)`.
- Conectar en el endpoint `/api/ceramico` para devolver también `transportSurcharge` numérico.

### Fase 2b: Mockups visuales
- Integración con generador de imágenes (Adobe Firefly, DALL-E, etc.).
- Nuevo endpoint `POST /api/ceramico/mockup`.
- Componente en el widget para mostrar imágenes generadas.

## Documentación Necesaria

**Archivo:** `docs/CERAMICO_CHATBOT_PHASE1.md`

Debe incluir:
- Qué es Cerámico y qué puede hacer en esta fase.
- Cómo activar/desactivar con flags de entorno.
- Ejemplo de payload de `/api/ceramico`.
- Explicación de la regla de transporte cualitativa.
- Cómo se estructura el contexto (página, serie, código postal).
- Puntos de gancho para Fase 2.
