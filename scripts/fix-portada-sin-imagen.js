// Arregla `imagen_portada` para series que quedaron con un placeholder SVG
// (nunca recibieron foto real en la migración desde catalogo.json), usando
// la primera foto de color ya extraída de Practika y guardada en
// `colores_fotos` (ver scripts/import-practika-colors.js). Solo toca series
// donde ya existe una foto real de color con la que sustituir el placeholder
// — no inventa nada para series sin match confirmado (ver README de esta
// tarea: bigas / new-calacatta / stahl-c3 quedan fuera, requieren decisión
// manual porque no hay match seguro en el catálogo de Practika).
//
// CÓMO USAR (necesita pg/dotenv, que solo están en api/node_modules):
//
//   Contra la BD local (lee .env, comportamiento por defecto):
//     NODE_PATH=api/node_modules node scripts/fix-portada-sin-imagen.js
//
//   Contra la BD de producción (sin escribir la credencial en ningún fichero):
//     DATABASE_URL='postgres://user:pass@host:5432/db?sslmode=require' \
//       NODE_PATH=api/node_modules node scripts/fix-portada-sin-imagen.js
//
// DATABASE_URL tiene prioridad sobre las DB_* del .env. Es idempotente: se
// puede re-ejecutar sin efectos secundarios. No commitees nunca un .env con
// la cadena de producción (.gitignore ya cubre .env*).

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { buildPoolConfig, describeTarget } = require('../api/db-config');

const pool = new Pool(buildPoolConfig());

const SLUGS = ['bosco', 'jaca', 'legend', 'polaris'];

async function main() {
  console.log(`Conectando a: ${describeTarget()}`);

  for (const slug of SLUGS) {
    const { rows } = await pool.query(
      `SELECT slug, colores_fotos FROM collections WHERE slug = $1`,
      [slug]
    );
    if (rows.length === 0) {
      console.log(`[${slug}] no encontrada en collections, se omite`);
      continue;
    }
    const fotos = rows[0].colores_fotos || [];
    if (fotos.length === 0) {
      console.log(`[${slug}] sin colores_fotos, se omite`);
      continue;
    }
    const nuevaPortada = fotos[0].imagen;
    await pool.query(
      `UPDATE collections SET imagen_portada = $1, updated_at = NOW() WHERE slug = $2`,
      [nuevaPortada, slug]
    );
    console.log(`[${slug}] imagen_portada actualizada -> ${nuevaPortada}`);
  }
  await pool.end();
}

main();
