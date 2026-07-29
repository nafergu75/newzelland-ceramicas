const { pool } = require('../db');
const { embed } = require('./embeddings');
const config = require('../config');

// Único origen real del catálogo público. Se consulta por HTTP a la propia
// API (GET /api/catalog) en vez de leer frontend/src/data/catalogo.json
// directamente del disco: este servicio se despliega en un host aparte
// (Railway/Render/VPS), no comparte sistema de ficheros con el frontend,
// y así no depende de qué directorio raíz use el build de turno.
async function obtenerCatalogo() {
  const response = await fetch(`${config.frontendUrl.replace(/\/$/, '')}/api/catalog`);
  if (!response.ok) {
    throw new Error(`No se pudo obtener el catálogo (GET /api/catalog respondió ${response.status})`);
  }
  return response.json();
}

function textoSerie(serie) {
  return [
    `Serie ${serie.nombre} (${serie.id}).`,
    serie.descripcion,
    `Material: ${serie.material}.`,
    `Formatos: ${(serie.formatos || []).join(', ')}.`,
    `Acabados: ${(serie.acabados || []).join(', ')}.`,
    `Tipo de uso: ${(serie.tipo || []).join(', ')}.`,
    `Colores disponibles: ${[...new Set(serie.colores || [])].join(', ')}.`,
  ].filter(Boolean).join(' ');
}

function textoProyecto(proyecto) {
  return [
    `Proyecto: ${proyecto.titulo}.`,
    `Tipo de espacio: ${proyecto.tipo_espacio}${proyecto.subtipo_espacio ? ' (' + proyecto.subtipo_espacio + ')' : ''}.`,
    proyecto.ubicacion_ciudad || proyecto.ubicacion_pais
      ? `Ubicación: ${[proyecto.ubicacion_ciudad, proyecto.ubicacion_pais].filter(Boolean).join(', ')}.`
      : '',
    proyecto.descripcion_corta || '',
    proyecto.colecciones_usadas && proyecto.colecciones_usadas.length
      ? `Colecciones usadas: ${proyecto.colecciones_usadas.join(', ')}.`
      : '',
  ].filter(Boolean).join(' ');
}

/**
 * (Re)genera el índice de embeddings completo. Pensado para ejecutarse:
 * - manualmente tras cambios en catalogo.json (npm run build-embeddings),
 * - o periódicamente (ej. cron diario) para recoger proyectos nuevos.
 * No corre en cada arranque del bot — sería lento y innecesario si nada
 * cambió desde la última vez.
 */
async function reconstruirIndice() {
  const items = [];

  const catalogoData = await obtenerCatalogo();
  for (const serie of catalogoData.series) {
    items.push({ tipo: 'serie', referencia: serie.id, texto: textoSerie(serie) });
  }

  const proyectosResult = await pool.query(
    `SELECT slug, titulo, tipo_espacio, subtipo_espacio, ubicacion_ciudad, ubicacion_pais,
            descripcion_corta, colecciones_usadas
     FROM projects WHERE estado = 'publicado'`
  );
  for (const proyecto of proyectosResult.rows) {
    items.push({ tipo: 'proyecto', referencia: proyecto.slug, texto: textoProyecto(proyecto) });
  }

  console.log(`[rag] Generando embeddings para ${items.length} elementos (${catalogoData.series.length} series, ${proyectosResult.rows.length} proyectos)...`);

  // Voyage acepta batch; se trocea de 100 en 100 por margen de seguridad
  // frente al límite de la API, no porque haga falta a este volumen.
  const BATCH = 100;
  for (let i = 0; i < items.length; i += BATCH) {
    const lote = items.slice(i, i + BATCH);
    const vectores = await embed(lote.map((item) => item.texto), 'document');

    for (let j = 0; j < lote.length; j++) {
      await pool.query(
        `INSERT INTO catalog_embeddings (tipo, referencia, texto, embedding, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (tipo, referencia)
         DO UPDATE SET texto = $3, embedding = $4, updated_at = NOW()`,
        [lote[j].tipo, lote[j].referencia, lote[j].texto, JSON.stringify(vectores[j])]
      );
    }
  }

  console.log('[rag] Índice reconstruido correctamente.');
}

module.exports = { reconstruirIndice };
