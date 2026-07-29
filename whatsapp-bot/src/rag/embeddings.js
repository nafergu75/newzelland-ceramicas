const config = require('../config');

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';

/**
 * Genera embeddings para uno o varios textos. Voyage AI acepta batch (hasta
 * 128 textos por llamada) — se usa así en el indexador para no hacer una
 * llamada por serie.
 * @param {string[]} textos
 * @param {'document'|'query'} inputType - Voyage optimiza el embedding según
 *   si es contenido a indexar ('document') o una pregunta de búsqueda
 *   ('query'); mejora la relevancia del retrieval sin coste extra.
 * @returns {Promise<number[][]>}
 */
async function embed(textos, inputType = 'document') {
  if (!config.voyage.apiKey) {
    throw new Error('VOYAGE_API_KEY no configurada');
  }

  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.voyage.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: textos,
      model: config.voyage.model,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Voyage AI respondió ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.data.map((d) => d.embedding);
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { embed, cosineSimilarity };
