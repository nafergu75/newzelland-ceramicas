const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Lee packing.json para obtener m² por caja según formato
const packingData = JSON.parse(fs.readFileSync('./data/packing.json', 'utf8'));

// Construye mapa: formato normalizado -> m² por caja
const metrosPorFormato = {};
packingData.categorias.forEach(cat => {
  cat.items.forEach(item => {
    const fmt = (item.formatNormalized || item.format).toLowerCase().replace(/×/g, 'x').replace(/\s/g, '');
    if (!metrosPorFormato[fmt] || item.box.m2 > metrosPorFormato[fmt]) {
      metrosPorFormato[fmt] = item.box.m2;
    }
  });
});

console.log('Formatos en packing.json:');
Object.keys(metrosPorFormato).slice(0, 10).forEach(fmt => {
  console.log(`  ${fmt}: ${metrosPorFormato[fmt]} m²`);
});

// Lee Excel con precios
const excelPath = "C:\\Users\\NACHO PC\\Desktop\\catalogo_ceramicas_CON PRECIOS.xlsx";
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('\nExtrayendo productos con precios por m²...\n');

const productos = new Map(); // Evita duplicados

for (let r = 1; r < Math.min(data.length, 500); r++) {
  const row = data[r];
  if (!row || !row[1]) continue; // Salta vacías

  const serie = (row[1] || '').toString().trim();
  const formatoRaw = (row[2] || '').toString().trim();
  const precioM2 = row[8];  // Col I: COSTE (€/m²)
  const pvpM2 = row[9];     // Col J: PVP (€/m²)

  if (!serie || !formatoRaw || precioM2 === undefined || pvpM2 === undefined) continue;

  try {
    // Normaliza formato: "100x100" o "100×100" -> "100x100"
    const formatoNorm = formatoRaw.toLowerCase().replace(/×/g, 'x').replace(/\s/g, '');

    // Busca metros por caja en packing
    const metrosCaja = metrosPorFormato[formatoNorm];
    if (!metrosCaja) {
      console.log(`⚠ Sin packing para ${formatoRaw} (${formatoNorm})`);
      continue;
    }

    const precioM2Num = parseFloat(String(precioM2).replace(',', '.'));
    const pvpM2Num = parseFloat(String(pvpM2).replace(',', '.'));

    if (precioM2Num <= 0 || pvpM2Num <= 0) continue;

    // Calcula precios por caja
    const costoCaja = precioM2Num * metrosCaja;
    const pvpCaja = pvpM2Num * metrosCaja;

    // Clave única: formato + serie
    const key = `${formatoRaw}|${serie}`;
    if (!productos.has(key)) {
      productos.set(key, {
        id: `${formatoRaw}-${serie.replace(/\s+/g, '-')}-${productos.size + 1}`,
        formato: formatoRaw,
        serie: serie.trim(),
        metros_por_caja: Math.round(metrosCaja * 100) / 100,
        precio_coste_caja: Math.round(costoCaja * 100) / 100,
        precio_venta_caja: Math.round(pvpCaja * 100) / 100,
        margen_euros: Math.round((pvpCaja - costoCaja) * 100) / 100,
        margen_porcentaje: Math.round(((pvpCaja - costoCaja) / costoCaja) * 100 * 10) / 10
      });
    }
  } catch (e) {
    // Ignorar
  }
}

const productosArray = Array.from(productos.values());
console.log(`✓ Total extraído: ${productosArray.length} productos\n`);

// Muestra primeros 10
console.log('Primeros 10 productos:');
productosArray.slice(0, 10).forEach(p => {
  console.log(`  ${p.serie.padEnd(20)} (${p.formato}) - €${p.precio_venta_caja}/caja`);
});

// Guarda JSON
const outputPath = path.join(__dirname, 'data', 'tarifa-productos.json');
fs.writeFileSync(outputPath, JSON.stringify({ productos: productosArray }, null, 2), 'utf8');
console.log(`\n✓ Guardado en data/tarifa-productos.json`);
