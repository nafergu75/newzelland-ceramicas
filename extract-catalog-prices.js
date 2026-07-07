const XLSX = require('xlsx');
const path = require('path');

const excelPath = "C:\\Users\\NACHO PC\\Desktop\\catalogo_ceramicas_CON PRECIOS.xlsx";
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('Extrayendo de catalogo_ceramicas_CON PRECIOS.xlsx\n');
console.log('SERIE | FORMATO | METROS | COSTE | PVP\n');

const productos = [];

// Comienza desde fila 2 (índice 1), fila 1 es encabezado
for (let r = 1; r < Math.min(data.length, 500); r++) {
  const row = data[r];
  if (!row || !row[1]) continue;  // Salta filas vacías

  const familia = row[0];          // Col A: Familia
  const serie = row[1];            // Col B: Serie
  const formatoRaw = row[2];       // Col C: Formato (cm)
  const acabado = row[3];          // Col D: Acabado
  const coste = row[8];            // Col I: Coste
  const pvp = row[9];              // Col J: PVP

  // Solo procesa si tiene serie, formato, coste y pvp
  if (!serie || !formatoRaw || !coste || !pvp) continue;

  try {
    // Limpia formato: "100x100" -> "100x100" (quita " cm" si existe)
    const formato = String(formatoRaw).trim().replace(/\s*(cm)?$/i, '').replace(/\s+/g, '');

    // Convierte a números
    const costoNum = parseFloat(String(coste).replace(',', '.'));
    const pvpNum = parseFloat(String(pvp).replace(',', '.'));

    // Calcula metros por caja (aproximado, lo ideal sería tener esta columna)
    // Por ahora usamos una fórmula simple basada en formato
    const metros = calcularMetros(formato);

    if (metros > 0 && costoNum > 0 && pvpNum > 0) {
      console.log(`${serie} | ${formato} | ${metros} | ${costoNum} | ${pvpNum}`);

      productos.push({
        id: `${formato}-${serie.replace(/\s+/g, '-')}-${productos.length + 1}`,
        formato: formato,
        serie: serie.trim(),
        metros_por_caja: Math.round(metros * 100) / 100,
        precio_coste_caja: Math.round(costoNum * 100) / 100,
        precio_venta_caja: Math.round(pvpNum * 100) / 100,
        margen_euros: Math.round((pvpNum - costoNum) * 100) / 100,
        margen_porcentaje: Math.round(((pvpNum - costoNum) / costoNum) * 100 * 10) / 10
      });
    }
  } catch (e) {
    // Ignorar errores
  }
}

console.log(`\n✓ Total extraído: ${productos.length} productos\n`);

// Guarda en JSON
const fs = require('fs');
const outputPath = path.join(__dirname, 'data', 'tarifa-productos.json');
fs.writeFileSync(outputPath, JSON.stringify({ productos }, null, 2), 'utf8');

console.log(`✓ Guardado en data/tarifa-productos.json`);
console.log(`\nPrimeros 5 productos:`);
productos.slice(0, 5).forEach(p => {
  console.log(`  ${p.serie} (${p.formato}) - €${p.precio_venta_caja}`);
});

/**
 * Estima metros por caja según formato
 * Formato: "100x100" -> m² = (100*100) / 10000
 */
function calcularMetros(formato) {
  const parts = formato.split('x');
  if (parts.length !== 2) return 1.5; // Default

  try {
    const a = parseFloat(parts[0]);
    const b = parseFloat(parts[1]);
    if (a > 0 && b > 0) {
      const m2 = (a * b) / 10000;
      // Típicamente 1 caja = 10 piezas
      return Math.round(m2 * 10 * 100) / 100;
    }
  } catch (e) {}

  return 1.5;
}
