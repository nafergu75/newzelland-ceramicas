const XLSX = require('xlsx');
const path = require('path');

// Lee el Excel con precios
const excelPath = "C:\Users\NACHO PC\Desktop\catalogo_ceramicas_CON PRECIOS.xlsx";
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];

// Convierte a array
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

console.log('Leyendo catalogo_ceramicas_CON PRECIOS.xlsx\n');
console.log('Primeras 10 filas para ver estructura:');
for (let r = 0; r < Math.min(10, data.length); r++) {
  console.log(`Fila ${r}: ${data[r].slice(0, 5).join(' | ')}`);
}

// Detecta encabezado y comienza a extraer
let headerRow = 0;
let colFormato = -1, colSerie = -1, colMetros = -1, colCoste = -1;

for (let r = 0; r < Math.min(10, data.length); r++) {
  const row = data[r];
  const rowStr = row.join('|').toLowerCase();
  
  if (rowStr.includes('formato') || rowStr.includes('serie') || rowStr.includes('precio')) {
    headerRow = r;
    console.log(`\n✓ Encabezado encontrado en fila ${r}`);
    
    // Detecta columnas
    for (let c = 0; c < row.length; c++) {
      const cell = (row[c] || '').toString().toLowerCase();
      if (cell.includes('formato')) colFormato = c;
      if (cell.includes('serie') || cell.includes('nombre')) colSerie = c;
      if (cell.includes('metro') || cell.includes('m²')) colMetros = c;
      if (cell.includes('coste') || cell.includes('precio') || cell.includes('pvp')) colCoste = c;
    }
    console.log(`  Formato:${colFormato}, Serie:${colSerie}, Metros:${colMetros}, Coste:${colCoste}`);
    break;
  }
}

