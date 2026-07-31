const fs = require('fs');
const path = require('path');

const TARIFA_PATH = path.join(
  __dirname,
  '..',
  'frontend',
  'src',
  'data',
  'tarifa-productos.json'
);

let tarifaCache = null;

function loadTarifa() {
  if (!tarifaCache) {
    const raw = fs.readFileSync(TARIFA_PATH, 'utf-8');
    tarifaCache = JSON.parse(raw).productos || [];
  }
  return tarifaCache;
}

function normalize(value) {
  return (value || '').toString().trim().toUpperCase();
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function findTarifaEntries(series) {
  const tarifa = loadTarifa();
  const target = normalize(series);
  return tarifa.filter((entry) => normalize(entry.serie) === target);
}

// Calcula el precio real a partir de la tarifa oficial (misma fuente que usa la web pública).
// El transporte se mantiene cualitativo en Fase 1: no hay tabla de recargo por distancia real.
function calculatePrice({ series, format, squareMeters }) {
  if (!series) {
    return { error: 'Falta el nombre de la serie para calcular el precio.' };
  }
  if (!squareMeters || squareMeters <= 0) {
    return { error: 'Faltan los metros cuadrados para calcular el precio.' };
  }

  const entries = findTarifaEntries(series);
  if (entries.length === 0) {
    return {
      error: `No hay tarifa disponible para la serie "${series}". Puede que su precio sea solo a consulta.`,
    };
  }

  let entry = entries[0];
  if (entries.length > 1) {
    const target = normalize(format);
    const match = target
      ? entries.find((e) => normalize(e.formato) === target)
      : null;

    if (match) {
      entry = match;
    } else {
      return {
        needsClarification: true,
        availableFormats: entries.map((e) => e.formato),
        message: `La serie "${series}" tiene varios formatos: ${entries
          .map((e) => e.formato)
          .join(', ')}. ¿Cuál necesitas?`,
      };
    }
  }

  const boxes = Math.ceil(squareMeters / entry.metros_por_caja);
  const realSquareMeters = round2(boxes * entry.metros_por_caja);
  const baseTotal = round2(boxes * entry.precio_venta_caja);

  return {
    series: entry.serie,
    format: entry.formato,
    squareMetersRequested: squareMeters,
    boxes,
    m2PerBox: entry.metros_por_caja,
    realSquareMeters,
    pricePerM2: entry.precio_venta_m2,
    pricePerBox: entry.precio_venta_caja,
    baseTotal,
    currency: 'EUR',
    priceIncludesVAT: true,
    transportNote:
      'El precio incluye transporte hasta 500 km desde la fabrica en Onda (Castellon). Para distancias mayores puede aplicar un plus segun destino, a confirmar aparte.',
  };
}

module.exports = { calculatePrice, findTarifaEntries };
