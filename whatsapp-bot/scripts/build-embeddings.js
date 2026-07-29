// Ejecutar manualmente: npm run build-embeddings
// Regenera el índice RAG completo (catalogo.json + tabla projects).
// No corre automáticamente en cada arranque del bot — solo cuando cambia
// el catálogo o se publican proyectos nuevos.

const { ensureTables, pool } = require('../src/db');
const { reconstruirIndice } = require('../src/rag/indexer');

async function main() {
  await ensureTables();
  await reconstruirIndice();
  await pool.end();
}

main().catch((error) => {
  console.error('Error reconstruyendo el índice:', error);
  process.exit(1);
});
