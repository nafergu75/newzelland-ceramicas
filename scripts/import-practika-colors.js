// Importa los colores reales extraídos de Practika (scripts/extract-practika-colors.js)
// a la tabla `collections`: actualiza `colores` (nombres, para el filtro) y
// `colores_fotos` (nombre+imagen, para el selector/galería de la ficha).
//
// Idempotente: se puede re-ejecutar tras volver a correr extract-practika-colors.js
// sin duplicar nada (siempre sobrescribe con el estado actual del fichero).
//
// Ejecutar (necesita pg/dotenv, que solo están en api/node_modules):
//   NODE_PATH=api/node_modules node scripts/import-practika-colors.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const datos = require('./data/practika-colors-por-serie.json');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Una misma serie puede repetir el mismo nombre de color en varios formatos
// (ej. CARRARA en 20x60 y en 60x120) — nos quedamos con la primera imagen
// encontrada por nombre, no necesitamos una foto por combinación formato+color.
function dedupPorNombre(colores) {
  const vistos = new Map();
  for (const c of colores) {
    if (!vistos.has(c.nombre)) vistos.set(c.nombre, c);
  }
  return Array.from(vistos.values());
}

async function importar() {
  let actualizadas = 0;
  let sinCambios = 0;

  for (const serie of datos) {
    if (!serie.colores || serie.colores.length === 0) {
      sinCambios++;
      continue;
    }

    const coloresUnicos = dedupPorNombre(serie.colores);
    const nombresColores = coloresUnicos.map((c) => c.nombre);
    const coloresFotos = coloresUnicos.map((c, i) => ({
      nombre: c.nombre,
      slug: c.slug,
      imagen: c.imagen,
      orden: i,
    }));

    const result = await pool.query(
      `UPDATE collections SET colores = $1, colores_fotos = $2, updated_at = NOW() WHERE slug = $3 RETURNING id`,
      [nombresColores, JSON.stringify(coloresFotos), serie.slug]
    );

    if (result.rows.length > 0) {
      actualizadas++;
    } else {
      console.log(`Serie "${serie.slug}" no existe en collections, se omite.`);
    }
  }

  console.log(`\nImportación completada: ${actualizadas} series actualizadas con colores reales, ${sinCambios} sin fotos de color en el origen.`);
  await pool.end();
}

importar().catch((error) => {
  console.error('Error en la importación:', error);
  process.exit(1);
});
