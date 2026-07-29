// Extrae las URLs reales de imagen por color desde practikaceramica.com
// (mismo proveedor/Cloudinary que ya usa nuestro catálogo — no es scraping
// de un tercero ajeno, ver docs/superpowers/specs/2026-07-29-colores-design.md).
//
// Método: un GET normal a /productos/{slug} basta — las URLs de R2 públicas
// (pub-*.r2.dev) ya aparecen en el HTML/payload de la página, sin falta de
// clicar cada color en el navegador.
//
// Ejecutar: node scripts/extract-practika-colors.js
// Salida: scripts/data/practika-colors-por-serie.json

const fs = require('fs');
const path = require('path');

const practikaData = require('./data/practika-catalog-raw.json').products;
const catalogo = require('../frontend/src/data/catalogo.json').series;
const ourIds = new Set(catalogo.map((s) => s.id));

const R2_IMAGE_REGEX = /https:\/\/pub-[a-z0-9]+\.r2\.dev\/series\/[a-z0-9-]+\/colores\/[a-z0-9-]+\/regular\/[a-z0-9-]+\.jpg/g;

function colorSlugFromUrl(url) {
  // .../regular/blanco-mate-678dd30d-25ce-4aeb-b9d1-bcae347782eb.jpg -> "blanco-mate"
  const filename = url.split('/').pop().replace('.jpg', '');
  // El UUID siempre son 5 grupos hex separados por guiones al final; se quita.
  return filename.replace(/-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, '');
}

function emparejarColor(nombresReales, slugExtraido) {
  const normalizado = slugExtraido.replace(/-/g, ' ').toUpperCase();
  return nombresReales.find((n) => n.toUpperCase() === normalizado) || null;
}

async function procesarSerie(serie) {
  const url = `https://www.practikaceramica.com/productos/${serie.slug}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return { slug: serie.slug, error: `HTTP ${res.status}` };
    const html = await res.text();
    const urls = [...new Set(html.match(R2_IMAGE_REGEX) || [])];

    const nombresReales = [...new Set(serie.colors)];
    const colores = urls.map((imgUrl) => {
      const slugExtraido = colorSlugFromUrl(imgUrl);
      return {
        nombre: emparejarColor(nombresReales, slugExtraido) || slugExtraido.toUpperCase(),
        slug: slugExtraido,
        imagen: imgUrl,
      };
    });

    return { slug: serie.slug, nombre: serie.name, colores };
  } catch (error) {
    return { slug: serie.slug, error: error.message };
  }
}

async function main() {
  const matched = practikaData.filter((p) => ourIds.has(p.slug));
  console.log(`Procesando ${matched.length} series...`);

  const resultados = [];
  // Secuencial con pequeña pausa: cortesía con el servidor de Practika, no
  // hace falta velocidad aquí (se ejecuta una vez, no en cada request de usuario).
  for (const serie of matched) {
    const resultado = await procesarSerie(serie);
    resultados.push(resultado);
    const numColores = resultado.colores ? resultado.colores.length : 0;
    console.log(`${serie.slug}: ${numColores} imagen(es) de color encontradas${resultado.error ? ' — ERROR: ' + resultado.error : ''}`);
    await new Promise((r) => setTimeout(r, 150));
  }

  const outPath = path.join(__dirname, 'data', 'practika-colors-por-serie.json');
  fs.writeFileSync(outPath, JSON.stringify(resultados, null, 2), 'utf8');

  const conFotos = resultados.filter((r) => r.colores && r.colores.length > 0);
  console.log(`\nCompletado: ${conFotos.length} de ${matched.length} series con fotos por color extraídas.`);
  console.log(`Guardado en ${outPath}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
