const { SYSTEM_PROMPT } = require('./systemPrompt');
const { TOOL_DEFINITIONS, ejecutarHerramienta } = require('./tools');

const providers = {
  anthropic: require('./providers/anthropicProvider'),
  // openai: require('./providers/openaiProvider'), // GPT-4 — mismo contrato generarRespuesta(...)
};

const AI_PROVIDER = process.env.AI_PROVIDER || 'anthropic';

function getProvider() {
  const provider = providers[AI_PROVIDER];
  if (!provider) throw new Error(`AI_PROVIDER desconocido: "${AI_PROVIDER}"`);
  return provider;
}

/**
 * Punto de entrada único del módulo de IA. Convierte el historial guardado
 * en BD al formato de mensajes del proveedor, resuelve las tools, y
 * devuelve el texto final para responder por WhatsApp.
 */
async function responder(historialMensajes, mensajeNuevo, conversationId) {
  const messages = [
    ...historialMensajes.map((m) => ({ role: m.rol === 'assistant' ? 'assistant' : 'user', content: m.contenido })),
    { role: 'user', content: mensajeNuevo },
  ];

  return getProvider().generarRespuesta(
    SYSTEM_PROMPT,
    messages,
    TOOL_DEFINITIONS,
    (nombre, input) => ejecutarHerramienta(nombre, input, { conversationId })
  );
}

module.exports = { responder };
