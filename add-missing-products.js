const XLSX = require('xlsx');
const fs = require('fs');

const excelPath = "C:\\Users\\NACHO PC\\Desktop\\catalogo_ceramicas_CON PRECIOS.xlsx";
const packingData = JSON.parse(fs.readFileSync('./data/packing.json', 'utf8'));

// Mapa de formatos a m² por caja
const metrosPorFormato = {};
packingData.categorias.forEach(cat => {
  cat.items.forEach(item => {
    const fmt = (item.formatNormalized || item.format).toLowerCase().replace(/×/g, 'x').replace(/\s/g, '');
    if (!metrosPorFormato[fmt] || item.box.m2 > metrosPorFormato[fmt]) {
      metrosPorFormato[fmt] = item.box.m2;
    }
  });
});

// Lee Excel
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Mapeos: catálogo -> Excel
const mapeos = [
  { catalogo: "Brandon", excel: "Brando", formato: "60x120" },
  { catalogo: "Garden", excel: "Garden", formato: "30x60" },
  { catalogo: "Garden", excel: "Garden", formato: "45x45" },
  { catalogo: "New calacatta", excel: "Calacatta Gold", formato: "100x100" },
  { catalogo: "Pietra serena", excel: "Pietra", formato: "60x60" },
  { catalogo: "Travertino caliza brillo", excel: "Caliza Brillo", formato: "60x60" }
];

console.log("Buscando datos en Excel para productos faltantes...\n");

const productosAgregados = [];

for (const mapeo of mapeos) {
  // Encuentra la fila en Excel
  const filaExcel = data.find((row, idx) => {
    if (idx < 1) return false;
    const serie = (row[1] || '').toString().trim();
    return serie === mapeo.excel;
  });

  if (filaExcel) {
    const precioM2 = filaExcel[8];  // Col I
    const pvpM2 = filaExcel[9];     // Col J
    const formatoNorm = mapeo.formato.toLowerCase().replace(/×/g, 'x');
    const metrosCaja = metrosPorFormato[formatoNorm];

    if (metrosCaja && precioM2 && pvpM2) {
      const precioM2Num = parseFloat(String(precioM2).replace(',', '.'));
      const pvpM2Num = parseFloat(String(pvpM2).replace(',', '.'));

      if (precioM2Num > 0 && pvpM2Num > 0) {
        const costoCaja = precioM2Num * metrosCaja;
        const pvpCaja = pvpM2Num * metrosCaja;

        const producto = {
          id: `${mapeo.formato}-${mapeo.catalogo.replace(/\s+/g, '-')}-faltante`,
          formato: mapeo.formato,
          serie: mapeo.catalogo,
          metros_por_caja: Math.round(metrosCaja * 100) / 100,
          precio_coste_m2: Math.round(precioM2Num * 100) / 100,
          precio_venta_m2: Math.round(pvpM2Num * 100) / 100,
          precio_coste_caja: Math.round(costoCaja * 100) / 100,
          precio_venta_caja: Math.round(pvpCaja * 100) / 100,
          margen_euros: Math.round((pvpCaja - costoCaja) * 100) / 100,
          margen_porcentaje: Math.round(((pvpCaja - costoCaja) / costoCaja) * 100 * 10) / 10
        };

        productosAgregados.push(producto);
        console.log(`✓ ${mapeo.catalogo} (${mapeo.formato}): €${pvpM2Num}/m²`);
      }
    }
  }
}

console.log(`\n✓ Agregados: ${productosAgregados.length} productos`);
console.log("\nNecesitarás ejecutar extract-with-packing.js nuevamente para regenerar la tarifa con estos productos.");
