// Copia la tabla `collections` de la BD local a la de producción (Neon).
//
// Por qué esto y no re-ejecutar migrate-catalog-to-collections.js: ese script
// parte de frontend/src/data/catalogo.json, que es el dato ANTIGUO — trae los
// placeholders rotos y no tiene espesor / estilo / acabado_corte /
// colores_fotos. La tabla local ya está migrada, corregida y verificada
// (0 imágenes rotas), así que la fuente de verdad es la propia tabla local.
//
// CÓMO USAR:
//   DATABASE_URL='postgres://...neon.tech/neondb' \
//     NODE_PATH=api/node_modules node scripts/sync-collections-to-prod.js
//
//   Origen  = las DB_* del .env local (siempre).
//   Destino = DATABASE_URL (obligatoria: si falta, aborta en vez de
//             sobrescribir la BD local consigo misma).
//
// Idempotente: ON CONFLICT (slug) DO UPDATE, se puede re-ejecutar para
// re-sincronizar tras nuevos cambios en local.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { buildPoolConfig, describeTarget } = require('../api/db-config');

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
  console.error('Falta DATABASE_URL (la BD de destino). Abortado para no tocar la BD local.');
  process.exit(1);
}

// Mismo DDL que ensureCollectionsTable() en api/index.js. Se repite aquí
// porque el script debe poder crear la tabla en una BD virgen sin arrancar
// el API entero; si el esquema cambia allí, hay que reflejarlo aquí.
const DDL = `
  CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen_portada VARCHAR(500),
    material VARCHAR(100),
    tipo TEXT[],
    formatos TEXT[],
    acabados TEXT[],
    colores TEXT[],
    precio_consultable BOOLEAN DEFAULT TRUE,
    acabado_corte VARCHAR(100) DEFAULT 'Rectificado',
    espesor DECIMAL(5,2) DEFAULT 10.0,
    estilo VARCHAR(100) DEFAULT 'Moderno',
    especificaciones_verificadas BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`;

const origen = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const destino = new Pool(buildPoolConfig());

async function main() {
  console.log(`Origen : ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`);
  console.log(`Destino: ${describeTarget()}\n`);

  const { rows } = await origen.query(`
    SELECT slug, nombre, descripcion, imagen_portada, material, tipo, formatos,
           acabados, colores, precio_consultable, acabado_corte, espesor,
           estilo, especificaciones_verificadas, colores_fotos
    FROM collections ORDER BY slug
  `);
  console.log(`Leídas ${rows.length} colecciones de local.`);

  await destino.query(DDL);
  await destino.query(`CREATE INDEX IF NOT EXISTS idx_collections_material ON collections(material);`);
  await destino.query(`CREATE INDEX IF NOT EXISTS idx_collections_estilo ON collections(estilo);`);
  await destino.query(`CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);`);
  await destino.query(`ALTER TABLE collections ADD COLUMN IF NOT EXISTS colores_fotos JSONB DEFAULT '[]';`);
  console.log('Esquema asegurado en destino.');

  let insertadas = 0;
  let actualizadas = 0;

  for (const c of rows) {
    const res = await destino.query(
      `INSERT INTO collections (
         slug, nombre, descripcion, imagen_portada, material, tipo, formatos,
         acabados, colores, precio_consultable, acabado_corte, espesor,
         estilo, especificaciones_verificadas, colores_fotos
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (slug) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         descripcion = EXCLUDED.descripcion,
         imagen_portada = EXCLUDED.imagen_portada,
         material = EXCLUDED.material,
         tipo = EXCLUDED.tipo,
         formatos = EXCLUDED.formatos,
         acabados = EXCLUDED.acabados,
         colores = EXCLUDED.colores,
         precio_consultable = EXCLUDED.precio_consultable,
         acabado_corte = EXCLUDED.acabado_corte,
         espesor = EXCLUDED.espesor,
         estilo = EXCLUDED.estilo,
         especificaciones_verificadas = EXCLUDED.especificaciones_verificadas,
         colores_fotos = EXCLUDED.colores_fotos,
         updated_at = NOW()
       RETURNING (xmax = 0) AS insertada`,
      [
        c.slug, c.nombre, c.descripcion, c.imagen_portada, c.material, c.tipo,
        c.formatos, c.acabados, c.colores, c.precio_consultable, c.acabado_corte,
        c.espesor, c.estilo, c.especificaciones_verificadas,
        JSON.stringify(c.colores_fotos || []),
      ]
    );
    if (res.rows[0].insertada) insertadas++;
    else actualizadas++;
  }

  const total = await destino.query('SELECT COUNT(*) FROM collections');
  console.log(`\nSincronizado: ${insertadas} insertadas, ${actualizadas} actualizadas.`);
  console.log(`Total en destino: ${total.rows[0].count}`);

  await origen.end();
  await destino.end();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
