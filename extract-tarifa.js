const XLSX = require('xlsx');
const path = require('path');

// Lee el Excel
const excelPath = "C:\\Users\\NACHO PC\\Desktop\\TARIFA COSTE ENERO 2024.xls";
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];

// Convierte a array de objetos
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('Leyendo Excel: Columnas B(Formato), D(Serie Catálogo), E(Metros), F(Coste)\n');
console.log('Fila | Formato | Serie Catálogo | Metros | Coste');
console.log('=' * 70);

const productos = [];
let formatoActual = '';

// Procesa desde fila 11 (índice 10)
for (let r = 10; r < Math.min(data.length, 150); r++) {
  const colB = data[r]?.[1];  // Columna B (índice 1)
  const colD = data[r]?.[3];  // Columna D (índice 3)
  const colE = data[r]?.[4];  // Columna E (índice 4)
  const colF = data[r]?.[5];  // Columna F (índice 5)

  // Si D está vacío, termina
  if (!colD) break;

  // Actualiza formato si existe
  if (colB && colB.toString().trim()) {
    formatoActual = colB.toString().trim();
  }

  // Procesa si tiene datos
  if (colD && colE && colF && formatoActual) {
    try {
      const metros = parseFloat(String(colE).replace(',', '.'));
      const coste = parseFloat(String(colF).replace(',', '.'));

      if (metros > 0 && coste > 0) {
        const pvp = (coste * 1.25 + 4) * 1.21;

        // Divide las series por guiones o barras
        const seriesRaw = colD.toString().split(/[-/]/).map(s => s.trim()).filter(s => s);

        seriesRaw.forEach((serieCatalogo, idx) => {
          // Normaliza: "BLANCO BRILLO" -> "Blancos", "IRATI" -> "Irati", etc.
          let serieNormalizado = serieCatalogo;

          // Si empieza con "DECOR.", es decorado
          if (serieNormalizado.includes('DECOR')) {
            serieNormalizado = 'Decorado';
          }
          // Si es "BLANCO" con variante, es Blancos
          else if (serieNormalizado.includes('BLANCO')) {
            serieNormalizado = 'Blancos';
          }
          // Si contiene "BRILLO", "MATE", "RELIEVE", es un acabado, usa la base
          else if (serieNormalizado.match(/BRILLO|MATE|RELIEVE/i)) {
            serieNormalizado = 'Varios'; // Fallback
          }
          // Capitaliza primera letra
          else {
            serieNormalizado = serieNormalizado.charAt(0).toUpperCase() +
                              serieNormalizado.slice(1).toLowerCase();
          }

          console.log(`${r + 1}.${idx} | ${formatoActual} | ${serieNormalizado} (${serieCatalogo}) | ${metros} | ${coste}`);

          productos.push({
            id: `${formatoActual}-${serieNormalizado}-${productos.length + 1}`,
            formato: formatoActual,
            serie: serieNormalizado,
            serie_original: serieCatalogo,
            metros_por_caja: Math.round(metros * 100) / 100,
            precio_coste_caja: Math.round(coste * 100) / 100,
            precio_venta_caja: Math.round(pvp * 100) / 100,
            margen_euros: Math.round((pvp - coste) * 100) / 100,
            margen_porcentaje: Math.round(((pvp - coste) / coste) * 100 * 10) / 10
          });
        });
      }
    } catch (e) {
      console.error(`Error fila ${r + 1}:`, e.message);
    }
  }
}

console.log(`\n✓ Total extraído: ${productos.length} productos\n`);

// Muestra primeros 5
console.log('Primeros 5 productos:');
productos.slice(0, 5).forEach(p => {
  console.log(`  ${p.formato} | ${p.serie} | ${p.metros_por_caja} m² | €${p.precio_coste_caja} coste | €${p.precio_venta_caja} venta`);
});

// Guarda en JSON
const fs = require('fs');
const outputPath = path.join(__dirname, 'data', 'tarifa-productos.json');
fs.writeFileSync(outputPath, JSON.stringify({ productos }, null, 2), 'utf8');

console.log(`\n✓ Guardado en data/tarifa-productos.json`);
