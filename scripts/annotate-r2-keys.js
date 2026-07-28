// Script de una sola ejecución: añade `provider` ('r2' | 'cloudinary') y,
// para las de R2, `key` (la ruta del objeto dentro del bucket, necesaria
// para firmar la URL) a cada ficha de api/data/catalog-fichas.json.
// No toca las URLs originales (se conservan en `url` como referencia/fallback).
const fs = require('fs');
const path = require('path');

const fichasPath = path.join(__dirname, '..', 'api', 'data', 'catalog-fichas.json');
const raw = JSON.parse(fs.readFileSync(fichasPath, 'utf8'));

function annotate(url) {
  if (!url) return null;
  if (url.includes('.r2.dev') || url.includes('.r2.cloudflarestorage.com')) {
    const key = new URL(url).pathname.replace(/^\//, '');
    return { url, provider: 'r2', key };
  }
  if (url.includes('cloudinary.com')) {
    return { url, provider: 'cloudinary' };
  }
  return { url, provider: 'unknown' };
}

const annotated = {};
let r2Count = 0;
let cloudinaryCount = 0;

Object.entries(raw).forEach(([slug, fichas]) => {
  annotated[slug] = {
    tecnica: annotate(fichas.tecnica),
    catalogo: annotate(fichas.catalogo),
  };
  ['tecnica', 'catalogo'].forEach((t) => {
    const f = annotated[slug][t];
    if (f?.provider === 'r2') r2Count++;
    if (f?.provider === 'cloudinary') cloudinaryCount++;
  });
});

fs.writeFileSync(fichasPath, JSON.stringify(annotated, null, 2));
console.log(`OK. R2: ${r2Count}, Cloudinary: ${cloudinaryCount}`);
