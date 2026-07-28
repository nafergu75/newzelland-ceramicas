// Script de una sola ejecución: separa las URLs reales de los PDFs (fichas)
// del JSON que se sirve al cliente. Las URLs reales quedan SOLO en
// api/data/catalog-fichas.json (nunca se empaqueta en el bundle del frontend).
// El JSON del frontend conserva únicamente booleans (¿existe ficha o no?).
const fs = require('fs');
const path = require('path');

const catalogoPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'catalogo.json');
const fichasOutPath = path.join(__dirname, '..', 'api', 'data', 'catalog-fichas.json');

const data = JSON.parse(fs.readFileSync(catalogoPath, 'utf8'));

const fichasServerSide = {};

data.series = data.series.map((s) => {
  fichasServerSide[s.id] = {
    tecnica: s.fichas?.tecnica || null,
    catalogo: s.fichas?.catalogo || null,
  };

  return {
    ...s,
    fichas: {
      tecnica: !!s.fichas?.tecnica,
      catalogo: !!s.fichas?.catalogo,
    },
  };
});

fs.mkdirSync(path.dirname(fichasOutPath), { recursive: true });
fs.writeFileSync(fichasOutPath, JSON.stringify(fichasServerSide, null, 2));
fs.writeFileSync(catalogoPath, JSON.stringify(data, null, 2));

console.log(`OK: ${data.series.length} series procesadas.`);
console.log(`Client (booleans): ${catalogoPath}`);
console.log(`Server (URLs reales): ${fichasOutPath}`);
