const { pool } = require('../db');
const { embed, cosineSimilarity } = require('./embeddings');

let cache = null; // [{ tipo, referencia, texto, embedding }]
let cacheLoadedAt = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min: catálogo cambia poco, evita ida a BD en cada mensaje

async function cargarCache() {
  const fresca = cacheLoadedAt && Date.now() - cacheLoadedAt < CACHE_TTL_MS;
  if (cache && fresca) return cache;

  const result = await pool.query('SELECT tipo, referencia, texto, embedding FROM catalog_embeddings');
  cache = result.rows.map((row) => ({
    tipo: row.tipo,
    referencia: row.referencia,
    texto: row.texto,
    embedding: row.embedding,
  }));
  cacheLoadedAt = Date.now();

  if (cache.length === 0) {
    console.warn('[rag] catalog_embeddings está vacía — ejecuta "npm run build-embeddings" antes de usar el bot.');
  }
  return cache;
}

/**
 * Busca los K elementos del catálogo/proyectos más relevantes para la
 * pregunta del usuario. A este volumen (~90-200 items), comparar contra
 * todo en memoria es instantáneo — no hace falta un índice aproximado.
 */
async function buscarRelevantes(pregunta, k = 5, { tipo } = {}) {
  const items = await cargarCache();
  if (items.length === 0) return [];

  const [vectorPregunta] = await embed([pregunta], 'query');

  const candidatos = tipo ? items.filter((i) => i.tipo === tipo) : items;
  return candidatos
    .map((item) => ({ ...item, score: cosineSimilarity(vectorPregunta, item.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

module.exports = { buscarRelevantes };
