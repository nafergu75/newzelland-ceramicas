// Ejecutar UNA VEZ (usa `pg`/`dotenv`, que solo están instalados en
// api/node_modules — scripts/ no tiene node_modules propio):
//   NODE_PATH=api/node_modules node scripts/migrate-catalog-to-collections.js
// Idempotente: ON CONFLICT (slug) DO NOTHING — si se re-ejecuta no pisa
// ediciones ya hechas desde el admin.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const catalogo = require('../frontend/src/data/catalogo.json');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrar() {
  let insertadas = 0;
  let omitidas = 0;

  for (const serie of catalogo.series) {
    const result = await pool.query(
      `INSERT INTO collections (
        slug, nombre, descripcion, imagen_portada, material, tipo, formatos,
        acabados, colores, precio_consultable
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id`,
      [
        serie.id,
        serie.nombre,
        serie.descripcion,
        serie.imagen,
        serie.material,
        serie.tipo,
        serie.formatos,
        serie.acabados,
        serie.colores,
        serie.precio_consultable,
      ]
    );
    if (result.rows.length > 0) {
      insertadas++;
    } else {
      omitidas++;
    }
  }

  console.log(`Migración completada: ${insertadas} insertadas, ${omitidas} ya existían (omitidas).`);
  await pool.end();
}

migrar().catch((error) => {
  console.error('Error en la migración:', error);
  process.exit(1);
});
