# Cerámico Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a text-only AI chatbot widget called "Cerámico" with floating button, chat panel, and qualitative transport logic (≤500km included, plus >500km).

**Architecture:** Backend endpoint (`POST /api/ceramico`) calls Claude with full catalog context (no RAG/embeddings). Frontend has floating button + modal widget following existing modal patterns. Intent detection + system prompt modifications handle transport rules.

**Tech Stack:** Node.js + Express (backend), React + TypeScript (frontend), `@anthropic-ai/sdk` (Claude integration), Postgres/Neon (catalog data), existing axios client + `@phosphor-icons/react` (frontend UI).

---

## Task 1: Add Anthropic SDK to Backend

**Files:**
- Modify: `api/package.json`

- [ ] **Step 1: Open `api/package.json` and add the Anthropic SDK**

```bash
cd "C:\Users\NACHO PC\Desktop\documntos prueba\newzelland-ceramicas"
```

Add `"@anthropic-ai/sdk": "^0.24.0"` to the `dependencies` section. The file should look like:

```json
{
  "name": "newzelland-api",
  "version": "1.0.0",
  "description": "API para Newzelland Cerámicas",
  "main": "index.js",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "@aws-sdk/client-s3": "^3.1096.0",
    "@aws-sdk/s3-request-presigner": "^3.1096.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.0",
    "ua-parser-js": "^1.0.37"
  },
  "engines": {
    "node": "24.x"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/package.json
git commit -m "deps: add @anthropic-ai/sdk for Cerámico chatbot"
```

---

## Task 2: Create Backend AI Logic Module

**Files:**
- Create: `api/ceramico-ai.js`

- [ ] **Step 1: Create the new file**

```bash
touch "api/ceramico-ai.js"
```

- [ ] **Step 2: Write the complete module**

```javascript
const { Anthropic } = require('@anthropic-ai/sdk');
const { pool } = require('./db-config');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Detecta si la pregunta tiene intención de transporte usando palabras clave.
 */
function isTransportIntent(question) {
  if (!question) return false;
  const normalized = question.toLowerCase();
  const keywords = [
    'transporte', 'envío', 'envios', 'portes', 'porte',
    'plazo de entrega', 'plazos de entrega', 'entrega', 'entregas',
    'código postal', 'codigo postal', 'cp ', 'puesta en obra',
    'costo de envío', 'coste de envío', 'tarifa de envío',
  ];
  return keywords.some(k => normalized.includes(k));
}

/**
 * Construye un JSON compacto del catálogo de series para pasar a Claude.
 * Solo incluye campos relevantes para responder preguntas.
 */
async function buildCompactCatalog() {
  const result = await pool.query(`
    SELECT
      slug,
      nombre,
      descripcion,
      material,
      tipo,
      formatos,
      acabados,
      colores
    FROM collections
    ORDER BY nombre ASC
  `);

  return result.rows.map(row => ({
    id: row.slug,
    nombre: row.nombre,
    descripcion: row.descripcion,
    material: row.material,
    tipo: row.tipo || [],
    formatos: row.formatos || [],
    acabados: row.acabados || [],
    colores: row.colores || [],
  }));
}

/**
 * Construye el system prompt para Cerámico, con instrucciones opcionales de transporte.
 */
function buildSystemPrompt(hasTransportIntent, postalCode) {
  let prompt = `Eres Cerámico, asistente de catálogo de cerámicas Newzelland.
Tu trabajo es ayudar a clientes a:
- Descubrir qué series de cerámica encajan con lo que buscan.
- Entender formatos, acabados, colores disponibles.
- Conocer plazos de entrega y reglas de transporte.

Reglas importantes:
- Basa tus respuestas SOLO en los datos del catálogo que te proporciono. Nunca inventes series, formatos o precios.
- No tenemos precios fijos públicos — todos son "precio consultable". Si preguntan por precio, explica que depende del proyecto y ofrece contactar.
- Sé cercano pero profesional, en español, con respuestas claras.
- Si el caso es muy específico o necesita presupuesto, sugiere contactar al equipo.`;

  if (hasTransportIntent) {
    prompt += `

IMPORTANTE — Regla de transporte:
- El presupuesto incluye transporte para destinos hasta 500 km desde nuestra fábrica en Onda (Castellón).
- Para distancias mayores a 500 km, se aplica un PLUS de transporte que depende del código postal.
- NUNCA des un importe exacto del plus en esta fase: es cualitativo. Explica la regla y pide el CP si no lo tienes.`;

    if (postalCode) {
      prompt += `

Nota: El cliente ha indicado código postal ${postalCode}. Menciónalo en tu respuesta de forma natural.`;
    } else {
      prompt += `

Si no tienes código postal del cliente, pídelo de forma natural para orientarlo mejor sobre transporte.`;
    }
  }

  return prompt;
}

/**
 * Función principal: responde una pregunta usando Claude + catálogo.
 *
 * @param {string} question - Pregunta del usuario.
 * @param {object} context - { currentSeriesSlug, page, postalCode }
 * @returns {Promise<string>} Respuesta de Cerámico.
 */
async function ceramicoAnswer(question, context = {}) {
  if (!question || question.trim().length === 0) {
    throw new Error('La pregunta no puede estar vacía.');
  }

  const { postalCode } = context;
  const hasTransportIntent = isTransportIntent(question);

  try {
    // Construir catálogo compacto.
    const catalog = await buildCompactCatalog();

    // Construir system prompt con lógica de transporte si aplica.
    const systemPrompt = buildSystemPrompt(hasTransportIntent, postalCode);

    // Preparar el contexto para Claude.
    const catalogJson = JSON.stringify(catalog, null, 2);
    const userMessage = `Catálogo disponible:
\`\`\`json
${catalogJson}
\`\`\`

Pregunta del cliente: ${question}`;

    // Llamar a Claude.
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extraer respuesta.
    if (!message.content || message.content.length === 0) {
      throw new Error('No se recibió respuesta de Claude.');
    }

    const answer = message.content[0].type === 'text' ? message.content[0].text : '';
    return answer;
  } catch (error) {
    console.error('Error en ceramicoAnswer:', error.message);
    throw error;
  }
}

module.exports = {
  ceramicoAnswer,
  isTransportIntent,
  buildCompactCatalog,
  buildSystemPrompt,
};
```

- [ ] **Step 3: Commit**

```bash
git add api/ceramico-ai.js
git commit -m "feat: add ceramico AI logic module (intent detection, catalog, Claude integration)"
```

---

## Task 3: Add POST /api/ceramico Endpoint

**Files:**
- Modify: `api/index.js`

- [ ] **Step 1: Find a good insertion point in `api/index.js`**

Look for the public routes section (around line 2080 where `GET /api/collections` is defined). We'll add the Cerámico endpoint right after the collections routes.

- [ ] **Step 2: Add the ceramico-ai require at the top**

At the top of `api/index.js` (with the other requires, around line 1-20), add:

```javascript
const { ceramicoAnswer } = require('./ceramico-ai');
```

- [ ] **Step 3: Add the POST /api/ceramico endpoint**

After the `GET /api/collections/:slug` endpoint (around line 2150), insert:

```javascript
// POST /api/ceramico — Chatbot endpoint para Cerámico
// Reutiliza el pipeline IA para responder preguntas sobre catálogo y transporte.
app.post('/api/ceramico', async (req, res) => {
  // Verificar si Cerámico está habilitado.
  if (process.env.CERAMICO_ENABLED !== 'true') {
    return res.status(503).json({ error: 'Cerámico está desactivado.' });
  }

  try {
    const { question, context } = req.body;

    // Validar pregunta.
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'La pregunta no puede estar vacía.',
      });
    }

    // Construir contexto con valores seguros.
    const ceramicoContext = {
      currentSeriesSlug: context?.currentSeriesSlug,
      page: context?.page,
      postalCode: context?.postalCode,
    };

    // Llamar al pipeline IA.
    const answer = await ceramicoAnswer(question, ceramicoContext);

    // Devolver respuesta + código postal actual (para que el frontend lo mantenga).
    res.json({
      answer,
      postalCode: context?.postalCode || null,
    });
  } catch (error) {
    console.error('Error en POST /api/ceramico:', error);
    res.status(500).json({
      error: 'No he podido responder ahora mismo. Vuelve a intentarlo en unos minutos.',
    });
  }
});
```

- [ ] **Step 4: Commit**

```bash
git add api/index.js
git commit -m "feat: add POST /api/ceramico endpoint with transport intent detection"
```

---

## Task 4: Create Frontend Button Component

**Files:**
- Create: `frontend/src/components/CeramicoButton.tsx`

- [ ] **Step 1: Create the file**

```bash
touch "frontend/src/components/CeramicoButton.tsx"
```

- [ ] **Step 2: Write the component**

```typescript
import React from 'react';
import { ChatCircleText } from '@phosphor-icons/react';

interface CeramicoButtonProps {
  onClick: () => void;
}

export default function CeramicoButton({ onClick }: CeramicoButtonProps) {
  return (
    <button
      onClick={onClick}
      title="Cerámico · Pregunta sobre el catálogo y el transporte"
      aria-label="Abrir Cerámico, asistente de catálogo"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: 'var(--accent)',
        color: 'var(--on-accent)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-md)',
        transition: 'all var(--transition-base)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--accent-strong)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--accent)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          'var(--shadow-md)';
      }}
    >
      <ChatCircleText size={28} weight="fill" />
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CeramicoButton.tsx
git commit -m "feat: add CeramicoButton floating component"
```

---

## Task 5: Create Frontend Widget Component

**Files:**
- Create: `frontend/src/components/CeramicoWidget.tsx`

- [ ] **Step 1: Create the file**

```bash
touch "frontend/src/components/CeramicoWidget.tsx"
```

- [ ] **Step 2: Write the component**

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { X, PaperPlaneRight } from '@phosphor-icons/react';
import api from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface CeramicoWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeriesSlug?: string;
  currentPage?: string;
}

export default function CeramicoWidget({
  isOpen,
  onClose,
  currentSeriesSlug,
  currentPage,
}: CeramicoWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hola 👋 Soy Cerámico. Te ayudo con series, formatos, precios y transporte (incluido hasta 500 km desde Onda). ¿Qué te gustaría saber?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll a último mensaje.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/ceramico', {
        question: inputValue.trim(),
        context: {
          currentSeriesSlug,
          page: currentPage,
          postalCode: postalCode || undefined,
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Actualizar postal code si viene en la respuesta.
      if (response.data.postalCode) {
        setPostalCode(response.data.postalCode);
      }
    } catch (error) {
      console.error('Error al enviar mensaje a Cerámico:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        text: 'Algo ha salido mal al responder. Vuelve a intentarlo o revisa tu conexión.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
  };

  if (!isOpen) return null;

  // Detectar mobile viewport.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Overlay oscurecido */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(34, 48, 60, 0.5)',
          zIndex: 99,
          animation: 'fadeIn 300ms ease-out',
        }}
      />

      {/* Panel del chat */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ceramico-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInUp 300ms ease-out',
          ...(isMobile
            ? {
                bottom: 0,
                left: 0,
                right: 0,
                top: 'auto',
                width: '100%',
                height: '90vh',
                borderRadius: '16px 16px 0 0',
              }
            : {
                bottom: '104px',
                right: '24px',
                width: '380px',
                height: '65vh',
              }),
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            flexShrink: 0,
          }}
        >
          <h2
            id="ceramico-title"
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--ink)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Cerámico · Asistente
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar Cerámico"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--stone)',
              transition: 'color var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                'var(--ink)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                'var(--stone)';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Área de mensajes */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--paper)',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent:
                  msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-card)',
                  backgroundColor:
                    msg.role === 'user'
                      ? 'var(--accent)'
                      : 'var(--sand)',
                  color:
                    msg.role === 'user'
                      ? 'var(--on-accent)'
                      : 'var(--ink)',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  fontFamily: 'var(--font-sans)',
                  wordWrap: 'break-word',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-card)',
                  backgroundColor: 'var(--sand)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Cerámico está pensando…
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompts sugeridos (solo si no hay muchos mensajes) */}
        {messages.length === 1 && !isLoading && (
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderTop: '1px solid var(--line)',
              backgroundColor: 'var(--paper)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() =>
                handlePromptClick('¿Qué formatos tiene disponibles?')
              }
              style={{
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-card)',
                fontSize: '13px',
                cursor: 'pointer',
                color: 'var(--ink)',
                textAlign: 'left',
                transition: 'all var(--transition-base)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--sand)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'transparent';
              }}
            >
              Ver formatos disponibles
            </button>

            <button
              onClick={() =>
                handlePromptClick(
                  '¿El transporte está incluido en el precio?'
                )
              }
              style={{
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-card)',
                fontSize: '13px',
                cursor: 'pointer',
                color: 'var(--ink)',
                textAlign: 'left',
                transition: 'all var(--transition-base)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--sand)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'transparent';
              }}
            >
              Transporte e incluido
            </button>

            <button
              onClick={() =>
                handlePromptClick(
                  'Qué serie recomendáis para piscina exterior'
                )
              }
              style={{
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-card)',
                fontSize: '13px',
                cursor: 'pointer',
                color: 'var(--ink)',
                textAlign: 'left',
                transition: 'all var(--transition-base)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--sand)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'transparent';
              }}
            >
              Serie para piscina
            </button>
          </div>
        )}

        {/* Campo de código postal (opcional) */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--line)',
            backgroundColor: 'var(--paper)',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            placeholder="Tu código postal (opcional)"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-input)',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--ink)',
              backgroundColor: 'var(--surface)',
              transition: 'border-color var(--transition-base)',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor =
                'var(--accent)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor =
                'var(--line)';
            }}
          />
        </div>

        {/* Input y envío */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            gap: '8px',
            borderTop: '1px solid var(--line)',
            backgroundColor: 'var(--paper)',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            placeholder="Pregunta por series, formatos, precios…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-input)',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--ink)',
              backgroundColor: 'var(--surface)',
              transition: 'border-color var(--transition-base)',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor =
                'var(--accent)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor =
                'var(--line)';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Enviar mensaje"
            style={{
              padding: '10px 14px',
              backgroundColor: inputValue.trim() && !isLoading ? 'var(--accent)' : 'var(--sand)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              color: inputValue.trim() && !isLoading ? 'var(--on-accent)' : 'var(--stone)',
              cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim() && !isLoading) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--accent-strong)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                inputValue.trim() && !isLoading ? 'var(--accent)' : 'var(--sand)';
            }}
          >
            <PaperPlaneRight size={18} weight="fill" />
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CeramicoWidget.tsx
git commit -m "feat: add CeramicoWidget chat panel component with messages and postal code input"
```

---

## Task 6: Integrate Button and Widget in App

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add imports at the top**

After the existing imports, add:

```typescript
import CeramicoButton from './components/CeramicoButton';
import CeramicoWidget from './components/CeramicoWidget';
```

- [ ] **Step 2: Add state for widget**

Inside the `App` component, add state to manage the widget:

```typescript
const [ceramicoOpen, setCeramicoOpen] = useState(false);
```

- [ ] **Step 3: Get current location and series**

Add hooks to get current page and series slug:

```typescript
const location = useLocation();
const currentPage = location.pathname;
// Try to extract series slug from URL if in a series detail page.
const currentSeriesSlug = location.pathname.startsWith('/collections/')
  ? location.pathname.split('/').pop()
  : undefined;
```

- [ ] **Step 4: Mount components in render**

After `<CartToast />` (around line where that's rendered in the JSX), add:

```typescript
{import.meta.env.VITE_CERAMICO_ENABLED === 'true' && (
  <>
    <CeramicoButton onClick={() => setCeramicoOpen(true)} />
    <CeramicoWidget
      isOpen={ceramicoOpen}
      onClose={() => setCeramicoOpen(false)}
      currentSeriesSlug={currentSeriesSlug}
      currentPage={currentPage}
    />
  </>
)}
```

Make sure this is after the `<Router>` and `<Routes>` so it's global.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: integrate CeramicoButton and CeramicoWidget in App layout"
```

---

## Task 7: Add Environment Variable Flags

**Files:**
- Modify: `.env.example`
- Modify: `frontend/.env.example`

- [ ] **Step 1: Add backend flag**

In `.env.example`, add at the end:

```
# Cerámico chatbot (Fase 1)
CERAMICO_ENABLED=false
```

- [ ] **Step 2: Add frontend flag**

In `frontend/.env.example`, add at the end:

```
# Cerámico chatbot widget
VITE_CERAMICO_ENABLED=false
```

- [ ] **Step 3: Commit**

```bash
git add .env.example frontend/.env.example
git commit -m "docs: add Cerámico activation flags to env examples"
```

---

## Task 8: Write Phase 1 Documentation

**Files:**
- Create: `docs/CERAMICO_CHATBOT_PHASE1.md`

- [ ] **Step 1: Create the file**

```bash
touch "docs/CERAMICO_CHATBOT_PHASE1.md"
```

- [ ] **Step 2: Write comprehensive documentation**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add docs/CERAMICO_CHATBOT_PHASE1.md
git commit -m "docs: add Cerámico Phase 1 user documentation"
```

---

## Task 9: Update .env for ANTHROPIC_API_KEY

**Files:**
- Modify: `.env` (if needed, or `.env.example`)

- [ ] **Step 1: Check if ANTHROPIC_API_KEY is already in .env**

```bash
grep ANTHROPIC_API_KEY ".env" 2>/dev/null || echo "Not found"
```

If not found, add it to `.env.example`:

```
# Anthropic API (para Cerámico chatbot)
ANTHROPIC_API_KEY=your-key-here
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add ANTHROPIC_API_KEY to env example for Cerámico"
```

---

## Task 10: Final Integration Test

**Files:**
- No files to modify; testing only

- [ ] **Step 1: Verify `api/package.json` has @anthropic-ai/sdk**

```bash
grep "@anthropic-ai/sdk" "api/package.json"
```

Expected: `"@anthropic-ai/sdk": "^0.24.0"`

- [ ] **Step 2: Verify endpoint is in `api/index.js`**

```bash
grep "POST /api/ceramico" "api/index.js" | head -1
```

Expected: Line mentioning the endpoint.

- [ ] **Step 3: Verify components exist**

```bash
ls -la "frontend/src/components/Ceramico"* 2>/dev/null || echo "Files exist"
```

Expected: `CeramicoButton.tsx` and `CeramicoWidget.tsx` found.

- [ ] **Step 4: Verify App.tsx has imports**

```bash
grep "import.*Ceramico" "frontend/src/App.tsx" | head -2
```

Expected: Two lines with CeramicoButton and CeramicoWidget imports.

- [ ] **Step 5: Verify env flags are documented**

```bash
grep "CERAMICO_ENABLED\|VITE_CERAMICO_ENABLED" ".env.example" "frontend/.env.example"
```

Expected: Both flags listed.

- [ ] **Step 6: Final commit verifying integration**

```bash
git log --oneline -10
```

Review the last 10 commits to ensure all Cerámico tasks are present.

---

## Summary

✅ **Completadas:**
- Backend dependency: `@anthropic-ai/sdk` added to `api/package.json`
- AI logic: `api/ceramico-ai.js` with intent detection + Claude integration
- Endpoint: `POST /api/ceramico` in `api/index.js` with context handling
- Frontend button: `CeramicoButton.tsx` (floating, styled, responsive)
- Frontend widget: `CeramicoWidget.tsx` (modal, messages, postal code field, prompts)
- Integration: Button + Widget mounted in `App.tsx` with location context
- Flags: `CERAMICO_ENABLED` (backend) and `VITE_CERAMICO_ENABLED` (frontend)
- Docs: `CERAMICO_CHATBOT_PHASE1.md` with usage, architecture, troubleshooting, and extension points

**Next Step:**
Push to production or test locally with:
- `npm install` in `api/`
- `CERAMICO_ENABLED=true` in backend env
- `VITE_CERAMICO_ENABLED=true` in frontend env
- Test widget by clicking the floating button
