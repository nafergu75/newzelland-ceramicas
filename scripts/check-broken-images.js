// Diagnostica qué series de `collections` tienen `imagen_portada` rota
// (URL que no responde 200, fichero local inexistente) y cuáles están
// pendientes de foto real. Solo lee, no modifica nada.
//
// CÓMO USAR (necesita pg/dotenv, que solo están en api/node_modules):
//
//   Contra la BD local (lee .env, comportamiento por defecto):
//     NODE_PATH=api/node_modules node scripts/check-broken-images.js
//
//   Contra la BD de producción (sin escribir la credencial en ningún fichero):
//     DATABASE_URL='postgres://user:pass@host:5432/db?sslmode=require' \
//       NODE_PATH=api/node_modules node scripts/check-broken-images.js
//
// DATABASE_URL tiene prioridad sobre las DB_* del .env. No commitees nunca
// un .env con la cadena de producción (.gitignore ya cubre .env*).

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const { buildPoolConfig, describeTarget } = require('../api/db-config');

const pool = new Pool(buildPoolConfig());

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'frontend', 'public');

// `imagen_portada` NULL es intencional, no un fallo: ImageWithFallback
// pinta un SVG genérico. Se cuenta aparte para poder listar qué series
// siguen esperando foto real sin que aparezcan como "rotas".
async function comprobarUrl(url) {
  if (!url || !url.trim()) return { ok: false, sinFoto: true, motivo: 'SIN_FOTO_REAL' };

  // Ruta relativa: es un asset estático servido por Vite desde public/.
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith('data:')) return { ok: false, motivo: 'PLACEHOLDER_EMBEBIDO' };
    const rutaLocal = path.join(PUBLIC_DIR, url.replace(/^\//, ''));
    if (fs.existsSync(rutaLocal)) return { ok: true };
    return { ok: false, motivo: 'FICHERO_LOCAL_NO_EXISTE' };
  }

  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return { ok: true };
    return { ok: false, motivo: `HTTP_${res.status}` };
  } catch (e) {
    return { ok: false, motivo: e.message };
  }
}

async function main() {
  console.log(`Conectando a: ${describeTarget()}`);

  const { rows } = await pool.query(
    `SELECT id, nombre, slug, imagen_portada FROM collections ORDER BY nombre`
  );

  const rotas = [];
  const sinFoto = [];
  const ok = [];

  for (const row of rows) {
    const resultado = await comprobarUrl(row.imagen_portada);
    if (resultado.ok) {
      ok.push(row);
    } else if (resultado.sinFoto) {
      sinFoto.push({ ...row, motivo: resultado.motivo });
    } else {
      rotas.push({ ...row, motivo: resultado.motivo });
    }
  }

  console.log(`\n==========================================`);
  console.log(`Total series: ${rows.length}`);
  console.log(`Imagen OK: ${ok.length}`);
  console.log(`Sin foto real (placeholder): ${sinFoto.length}`);
  console.log(`Imagen ROTA: ${rotas.length}`);
  console.log(`==========================================\n`);

  if (rotas.length > 0) {
    console.log('Series con imagen_portada rota:');
    for (const s of rotas) {
      console.log(`  - [${s.slug}] ${s.nombre}: ${s.motivo} (${s.imagen_portada || '(vacio)'})`);
    }
  }

  if (sinFoto.length > 0) {
    console.log('\nSeries pendientes de foto real (muestran placeholder):');
    for (const s of sinFoto) console.log(`  - [${s.slug}] ${s.nombre}`);
  }

  fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });
  fs.writeFileSync(
    path.join(__dirname, 'output', 'broken-images.json'),
    JSON.stringify({ rotas, sinFoto }, null, 2)
  );
  console.log(`\nGuardado en scripts/output/broken-images.json`);

  await pool.end();
}

main();
