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
