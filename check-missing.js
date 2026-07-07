const XLSX = require('xlsx');

const excelPath = "C:\\Users\\NACHO PC\\Desktop\\catalogo_ceramicas_CON PRECIOS.xlsx";
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Productos faltantes
const faltantes = [
  "Aneto", "Berna", "Brandon", "Ceppo di gre", "Cober",
  "Diamond", "Enjoy", "Fresno", "Garden", "Melissa",
  "Morella", "New calacatta", "Pietra serena", "Shadow",
  "Sonora", "Taracea", "Timber", "Travertino caliza brillo", "Walter light grey"
];

console.log("Buscando productos en Excel...\n");

const enExcel = [];
const noEnExcel = [];

for (const producto of faltantes) {
  const encontrado = data.find((row, idx) => {
    if (idx < 1) return false;
    const serie = (row[1] || '').toString().toLowerCase().trim();
    const productoNorm = producto.toLowerCase().trim();
    return serie.includes(productoNorm) || productoNorm.includes(serie.substring(0, 5));
  });

  if (encontrado) {
    enExcel.push({name: producto, excelName: encontrado[1], acabado: encontrado[3]});
    console.log(`✓ ${producto} -> ${encontrado[1]} (${encontrado[3]})`);
  } else {
    noEnExcel.push(producto);
    console.log(`✗ ${producto}`);
  }
}

console.log(`\n==============================`);
console.log(`En Excel: ${enExcel.length}`);
console.log(`NO en Excel: ${noEnExcel.length}`);
if (noEnExcel.length > 0) {
  console.log(`\nNo están en Excel:`);
  noEnExcel.forEach(p => console.log(`  - ${p}`));
}
