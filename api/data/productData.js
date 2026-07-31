const fs = require('fs');
const path = require('path');

/**
 * Módulo de acceso a datos de productos para Cerámico (Fase 3)
 * Proporciona funciones para consultar:
 * - Disponibilidad de productos
 * - Precios en tiempo real (desde tarifa-productos.json)
 * - Plazos de entrega estimados
 * - Información técnica de series
 */

// Cache de la tarifa para evitar lecturas de disco repetidas
let tarifaCache = null;

/**
 * Carga la tarifa de precios desde el archivo JSON
 * @returns {Array} Lista de productos con precios
 */
function loadTarifa() {
  if (!tarifaCache) {
    try {
      const tarifaPath = path.join(
        __dirname,
        '..',
        '..',
        'frontend',
        'src',
        'data',
        'tarifa-productos.json'
      );
      const raw = fs.readFileSync(tarifaPath, 'utf-8');
      tarifaCache = JSON.parse(raw).productos || [];
    } catch (error) {
      console.error('Error loading tarifa-productos.json:', error.message);
      tarifaCache = [];
    }
  }
  return tarifaCache;
}

/**
 * Normaliza strings para comparaciones insensibles a caso
 * @param {string} value - Valor a normalizar
 * @returns {string} Valor normalizado (mayúsculas, sin espacios extras)
 */
function normalize(value) {
  return (value || '').toString().trim().toUpperCase();
}

/**
 * Obtiene información de un producto específico (serie + formato + acabado)
 * Consulta la BD para verificar disponibilidad y combina con datos de precio
 *
 * @param {Pool} pool - Pool de conexión a PostgreSQL
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.series - Nombre de la serie (ej: "Bosco")
 * @param {string} params.format - Formato (ej: "60x120")
 * @param {string} params.finish - Acabado (ej: "mate")
 * @returns {Promise<Object|null>} Objeto con info de disponibilidad o null si no existe
 */
async function getProductInfo(pool, { series, format, finish }) {
  try {
    if (!series) {
      return null;
    }

    // Consultar la serie en la tabla collections
    const seriesResult = await pool.query(
      `SELECT slug, nombre, formatos, acabados, material, tipo
       FROM collections
       WHERE UPPER(nombre) = $1 OR UPPER(slug) = $1
       LIMIT 1`,
      [normalize(series)]
    );

    if (seriesResult.rows.length === 0) {
      return null;
    }

    const seriesRow = seriesResult.rows[0];
    const formatsArray = seriesRow.formatos || [];
    const finishesArray = seriesRow.acabados || [];

    // Verificar si el formato existe en la serie
    const normalizedFormat = normalize(format);
    const formatExists = formatsArray.some((f) => normalize(f) === normalizedFormat);

    if (format && !formatExists) {
      return null;
    }

    // Verificar si el acabado existe en la serie
    const normalizedFinish = normalize(finish);
    const finishExists = finishesArray.some((f) => normalize(f) === normalizedFinish);

    if (finish && !finishExists) {
      return null;
    }

    // Buscar el precio en la tarifa
    const tarifa = loadTarifa();
    const priceEntry = tarifa.find(
      (entry) =>
        normalize(entry.serie) === normalize(seriesRow.nombre) &&
        (!format || normalize(entry.formato) === normalizedFormat)
    );

    const pricePerM2 = priceEntry ? priceEntry.precio_venta_m2 : null;
    const pricePerBox = priceEntry ? priceEntry.precio_venta_caja : null;
    const m2PerBox = priceEntry ? priceEntry.metros_por_caja : null;

    return {
      available: true,
      series: seriesRow.nombre,
      slug: seriesRow.slug,
      format: format || (formatsArray.length > 0 ? formatsArray[0] : null),
      finish: finish || (finishesArray.length > 0 ? finishesArray[0] : null),
      material: seriesRow.material,
      type: seriesRow.tipo,
      pricePerM2: pricePerM2,
      pricePerBox: pricePerBox,
      m2PerBox: m2PerBox,
      currency: 'EUR',
      deliveryDays: 7, // Plazo por defecto: 7 días
      availableFormats: formatsArray,
      availableFinishes: finishesArray,
      priceIncludesVAT: true,
      notes: 'El transporte hasta 500 km está incluido. Para distancias mayores, consulta al equipo comercial.',
    };
  } catch (error) {
    console.error('Error in getProductInfo:', error);
    return null;
  }
}

/**
 * Obtiene todos los productos disponibles en catálogo (para búsquedas generales)
 * Retorna una lista compacta para contexto de IA
 *
 * @param {Pool} pool - Pool de conexión a PostgreSQL
 * @returns {Promise<Array>} Lista de productos con información básica
 */
async function getAvailableProducts(pool) {
  try {
    const result = await pool.query(
      `SELECT slug, nombre, formatos, colores, material, tipo, acabados
       FROM collections
       ORDER BY nombre`
    );

    return result.rows.map((row) => ({
      slug: row.slug,
      name: row.nombre,
      formats: row.formatos || [],
      colors: row.colores || [],
      material: row.material,
      type: row.tipo,
      finishes: row.acabados || [],
    }));
  } catch (error) {
    console.error('Error in getAvailableProducts:', error);
    return [];
  }
}

/**
 * Obtiene información detallada de una serie específica por slug
 * Incluye todos sus datos técnicos y precios disponibles
 *
 * @param {Pool} pool - Pool de conexión a PostgreSQL
 * @param {string} slug - Slug de la serie (ej: "bosco", "alpina")
 * @returns {Promise<Object|null>} Objeto con datos completos de la serie o null
 */
async function getSerieBySlug(pool, slug) {
  try {
    const result = await pool.query(
      `SELECT * FROM collections WHERE LOWER(slug) = $1 LIMIT 1`,
      [slug.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const serie = result.rows[0];
    const tarifa = loadTarifa();

    // Obtener todos los precios de esta serie
    const prices = tarifa.filter((entry) => normalize(entry.serie) === normalize(serie.nombre));

    return {
      slug: serie.slug,
      name: serie.nombre,
      description: serie.descripcion,
      material: serie.material,
      type: serie.tipo,
      formats: serie.formatos || [],
      finishes: serie.acabados || [],
      colors: serie.colores || [],
      prices: prices.map((p) => ({
        format: p.formato,
        pricePerM2: p.precio_venta_m2,
        pricePerBox: p.precio_venta_caja,
        m2PerBox: p.metros_por_caja,
      })),
      deliveryDays: 7,
      currency: 'EUR',
      coverImage: serie.imagen_portada,
    };
  } catch (error) {
    console.error('Error in getSerieBySlug:', error);
    return null;
  }
}

/**
 * Verifica disponibilidad de un formato específico en una serie
 * Útil para responder "¿hay 60x120 en Bosco?"
 *
 * @param {Pool} pool - Pool de conexión a PostgreSQL
 * @param {Object} params - Parámetros
 * @param {string} params.series - Nombre de la serie
 * @param {string} params.format - Formato a verificar (ej: "60x120")
 * @returns {Promise<Object>} Objeto con resultado de disponibilidad
 */
async function checkFormatAvailability(pool, { series, format }) {
  try {
    const result = await pool.query(
      `SELECT nombre, formatos FROM collections
       WHERE UPPER(nombre) = $1 OR UPPER(slug) = $1
       LIMIT 1`,
      [normalize(series)]
    );

    if (result.rows.length === 0) {
      return {
        available: false,
        series: series,
        format: format,
        message: `La serie "${series}" no existe en nuestro catálogo.`,
      };
    }

    const seriesRow = result.rows[0];
    const formatsArray = seriesRow.formatos || [];
    const normalizedFormat = normalize(format);

    const formatExists = formatsArray.some((f) => normalize(f) === normalizedFormat);

    return {
      available: formatExists,
      series: seriesRow.nombre,
      format: format,
      availableFormats: formatsArray,
      message: formatExists
        ? `Sí, el formato "${format}" está disponible en "${seriesRow.nombre}".`
        : `El formato "${format}" no está disponible en "${seriesRow.nombre}". Formatos disponibles: ${formatsArray.join(
            ', '
          )}.`,
    };
  } catch (error) {
    console.error('Error in checkFormatAvailability:', error);
    return {
      available: false,
      error: 'Error verificando disponibilidad',
    };
  }
}

/**
 * Obtiene el precio de una serie y formato específicos
 * Devuelve precio por m² y por caja
 *
 * @param {string} series - Nombre de la serie
 * @param {string} format - Formato (opcional, usa el primero si no se especifica)
 * @returns {Object|null} Objeto con precios o null si no existe
 */
function getPrice(series, format) {
  try {
    const tarifa = loadTarifa();
    const entries = tarifa.filter((entry) => normalize(entry.serie) === normalize(series));

    if (entries.length === 0) {
      return null;
    }

    let entry = entries[0];

    if (format && entries.length > 1) {
      const match = entries.find((e) => normalize(e.formato) === normalize(format));
      if (match) {
        entry = match;
      }
    }

    return {
      series: entry.serie,
      format: entry.formato,
      pricePerM2: entry.precio_venta_m2,
      pricePerBox: entry.precio_venta_caja,
      m2PerBox: entry.metros_por_caja,
      currency: 'EUR',
    };
  } catch (error) {
    console.error('Error in getPrice:', error);
    return null;
  }
}

/**
 * Obtiene una lista de todas las series con información básica
 * Útil para autocompletado y búsquedas
 *
 * @param {Pool} pool - Pool de conexión a PostgreSQL
 * @returns {Promise<Array>} Lista de series
 */
async function getAllSeries(pool) {
  try {
    const result = await pool.query(
      `SELECT slug, nombre, material FROM collections ORDER BY nombre`
    );

    return result.rows.map((row) => ({
      slug: row.slug,
      name: row.nombre,
      material: row.material,
    }));
  } catch (error) {
    console.error('Error in getAllSeries:', error);
    return [];
  }
}

module.exports = {
  getProductInfo,
  getAvailableProducts,
  getSerieBySlug,
  checkFormatAvailability,
  getPrice,
  getAllSeries,
  // Internos pero exportados para testing
  loadTarifa,
  normalize,
};
