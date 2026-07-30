# Cerámico — Chatbot IA Fase 1

## ¿Qué es Cerámico?

Cerámico es un asistente de IA integrado en la web de Newzelland Cerámicas como un widget de chat flotante. Responde preguntas sobre:
- **Series y catálogo:** formatos, acabados, colores, materiales.
- **Transporte y entregas:** explica la regla de ≤500 km y plus >500 km según código postal.
- **Presupuestos:** orienta al cliente y sugiere contactar para solicitar oferta.

## Alcance de Fase 1

- **Solo texto**, sin generación de imágenes.
- Chatbot integrado como widget (botón flotante + panel modal).
- Responde basándose en datos reales de la BD, sin invención.
- Regla de transporte **cualitativa**: explica conceptos, no calcula importes exactos todavía.

## Cómo Activar/Desactivar

### Backend

En `api/` o en las variables de entorno de Vercel Production, establece:

```
CERAMICO_ENABLED=true   # para activar
CERAMICO_ENABLED=false  # para desactivar (defecto)
```

Si está desactivado, la llamada a `POST /api/ceramico` devuelve `503 Service Unavailable`.

### Frontend

En `frontend/` o en las variables de entorno de Vercel, establece:

```
VITE_CERAMICO_ENABLED=true   # para activar
VITE_CERAMICO_ENABLED=false  # para desactivar (defecto)
```

Si está desactivado, el botón flotante no se renderiza.

## Ejemplo de Uso

### Cliente ve el widget
1. El usuario ve un botón circular en la esquina inferior derecha de la pantalla.
2. Hace clic → se abre un panel de chat.
3. Escribe una pregunta: *"¿Qué formatos tiene la serie Alpina?"*
4. Cerámico responde usando datos del catálogo de la BD.

### Cliente pregunta por transporte
1. Usuario: *"¿Cuál es el costo de envío a mi código postal?"*
2. Cerámico detecta la palabra clave `envío`.
3. Responde explicando la regla:
   - *"El presupuesto incluye transporte hasta 500 km desde Onda."*
   - *"¿Cuál es tu código postal? Para distancias mayores a 500 km aplicamos un plus según la zona."*
4. Si el usuario da su código postal, Cerámico lo menciona en la respuesta.

## Arquitectura Técnica

### Backend: Endpoint `POST /api/ceramico`

**Ruta:** `POST /api/ceramico`

**Payload:**
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

- `question` (requerido): pregunta del usuario.
- `context.currentSeriesSlug` (opcional): slug de la serie si está en una ficha de detalle.
- `context.page` (opcional): ruta actual (`/collections`, `/account/pedidos`, etc.).
- `context.postalCode` (opcional): código postal del cliente.

**Respuesta:**
```json
{
  "answer": "Alpina está disponible en los siguientes formatos: 23x120, 30x60...",
  "postalCode": "12003"
}
```

### Pipeline IA (`api/ceramico-ai.js`)

Módulo que:
1. **Lee el catálogo** desde la tabla `collections` de Neon.
2. **Detecta intención de transporte** usando palabras clave.
3. **Construye el system prompt** de Claude con reglas de transporte si aplica.
4. **Llama a Claude** (`@anthropic-ai/sdk`) con el catálogo compacto como contexto.
5. **Devuelve respuesta en texto**.

No usa RAG ni embeddings en esta fase — el catálogo entero (~50KB compacto) viaja como contexto en cada petición.

### Frontend: Widget

**Componentes:**
- `CeramicoButton.tsx`: botón flotante circular, anclado a `bottom: 24px; right: 24px; z-index: 50`.
- `CeramicoWidget.tsx`: panel modal que sigue el patrón de `FormatSelectorModal`:
  - Overlay oscurecido clickable.
  - Panel con cabecera, historial de mensajes, input, botón de envío.
  - Campo opcional de código postal.
  - Prompts sugeridos al inicio.
  - Estados de carga ("Cerámico está pensando…") y error.

## Regla de Transporte (Cualitativa, Fase 1)

### Enunciado
- Los **presupuestos incluyen transporte** para destinos hasta **500 km** desde Onda (Castellón).
- Para distancias mayores, se aplica un **plus** según código postal.

### Implementación
- Cuando la pregunta tiene palabras clave de transporte (`transporte`, `envío`, `portes`, `código postal`, etc.), Cerámico:
  - Explica la regla en términos cualitativos.
  - Si hay código postal: lo menciona ("Para tu CP XXXXX…").
  - Si no hay: lo pide ("¿Cuál es tu código postal?").
- **Nunca** inventa un importe exacto del plus.

### Ejemplo de respuesta
> "El presupuesto que te preparemos incluye transporte para destinos hasta 500 km desde nuestra fábrica en Onda. Para tu código postal (12003), si la distancia supera ese radio, se aplicaría un plus de transporte que concretaremos en la oferta."

## Instalación y Despliegue

### Variables de Entorno Necesarias

**Backend (Vercel Production):**
- `ANTHROPIC_API_KEY`: tu clave de API de Anthropic (con créditos).
- `CERAMICO_ENABLED=true` (si quieres activar el chatbot).

**Frontend (Vercel):**
- `VITE_CERAMICO_ENABLED=true` (si quieres que se muestre el botón).

### Instalación Local

```bash
cd api
npm install  # instala @anthropic-ai/sdk y dependencias

cd ../frontend
npm install  # React, TypeScript, etc.

# Configura .env locales:
# api/.env → CERAMICO_ENABLED=true
# frontend/.env → VITE_CERAMICO_ENABLED=true

# Ejecuta desarrollo
npm run dev  # desde frontend/
# Backend se prueba con curl o desde servicios/api.ts
```

## Troubleshooting

### "POST /api/ceramico devuelve 503"
- Verifica que `CERAMICO_ENABLED=true` en Vercel Production.
- Comprueba que `ANTHROPIC_API_KEY` está configurada.

### "El botón no aparece en la web"
- Verifica que `VITE_CERAMICO_ENABLED=true` en Vercel.
- Recarga la página después de cambiar la variable.

### "Cerámico responde con errores de Claude"
- Comprueba que `ANTHROPIC_API_KEY` es válida y tiene créditos.
- Revisa los logs de Vercel (`vercel logs`).
- Asegúrate de que la tabla `collections` existe y tiene datos en Neon.

## Puntos de Extensión Futura

### Fase 2a: Cálculo numérico de transporte
- Crear tabla `transport_zones` con código postal → distancia/factor.
- Implementar función `calculateTransportSurcharge(postalCode)`.
- Devolver `transportSurcharge` numérico desde `/api/ceramico`.

### Fase 2b: Mockups visuales
- Integrar generador de imágenes (Adobe Firefly, DALL-E, etc.).
- Nuevo endpoint `POST /api/ceramico/mockup`.
- Componente en el widget para mostrar imágenes.

## Contacto y Mantenimiento

Si necesitas:
- Cambiar el tono o instrucciones de Cerámico: edita `api/ceramico-ai.js` (función `buildSystemPrompt`).
- Ajustar la UI del widget: edita `frontend/src/components/CeramicoWidget.tsx`.
- Agregar más palabras clave de transporte: actualiza `isTransportIntent` en `api/ceramico-ai.js`.

---

**Última actualización:** 2026-07-30
**Versión:** 1.0 (Fase 1 — Texto)
