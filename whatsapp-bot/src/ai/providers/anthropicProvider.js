const Anthropic = require('@anthropic-ai/sdk');
const config = require('../../config');

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

/**
 * Ejecuta una conversación con Claude hasta que produzca una respuesta de
 * texto final, resolviendo cualquier tool_use que pida por el camino.
 * @param {string} systemPrompt
 * @param {Array<{role: 'user'|'assistant', content: any}>} messages
 * @param {Array} toolDefinitions
 * @param {(name: string, input: any) => Promise<string>} ejecutarHerramienta
 * @returns {Promise<string>} la respuesta final de texto para el usuario
 */
async function generarRespuesta(systemPrompt, messages, toolDefinitions, ejecutarHerramienta) {
  const historial = [...messages];
  // Límite de vueltas del bucle de herramientas: evita que un bug (o un
  // modelo confundido) encadene llamadas indefinidamente en una sola
  // respuesta — 5 es más que de sobra para cualquier flujo real aquí.
  const MAX_TOOL_ROUNDS = 5;

  for (let ronda = 0; ronda < MAX_TOOL_ROUNDS; ronda++) {
    const response = await client.messages.create({
      model: config.anthropic.model,
      max_tokens: 1024,
      system: systemPrompt,
      tools: toolDefinitions,
      messages: historial,
    });

    const bloquesTexto = response.content.filter((b) => b.type === 'text');
    const bloquesHerramienta = response.content.filter((b) => b.type === 'tool_use');

    if (response.stop_reason !== 'tool_use' || bloquesHerramienta.length === 0) {
      return bloquesTexto.map((b) => b.text).join('\n').trim();
    }

    historial.push({ role: 'assistant', content: response.content });

    const resultadosHerramientas = await Promise.all(
      bloquesHerramienta.map(async (bloque) => ({
        type: 'tool_result',
        tool_use_id: bloque.id,
        content: await ejecutarHerramienta(bloque.name, bloque.input),
      }))
    );

    historial.push({ role: 'user', content: resultadosHerramientas });
  }

  return 'Disculpa, he tenido un problema procesando tu mensaje. ¿Puedes reformularlo o prefieres que te ponga en contacto con una persona del equipo?';
}

module.exports = { generarRespuesta };
