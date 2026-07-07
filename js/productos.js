// ============================================
// PÁGINA DE PRODUCTOS CON TARIFA INTEGRADA
// ============================================

let catalogo = {};
let tarifa = [];
let mapeoTarifa = [];  // Mapeo: formato + serie → nombres del catálogo
let filtrosActivos = {};

async function loadCatalogo() {
    try {
        const [catalogoResp, tarifaResp, mapeoResp] = await Promise.all([
            fetch('data/catalogo.json'),
            fetch('data/tarifa-productos.json'),
            fetch('data/mapeo-extraido.json')
        ]);
        catalogo = await catalogoResp.json();
        const tarifaData = await tarifaResp.json();
        tarifa = tarifaData.productos || [];

        try {
            const mapeoData = await mapeoResp.json();
            mapeoTarifa = mapeoData.mapeos || [];
            console.log(`Mapeo cargado: ${mapeoTarifa.length} series`);
        } catch (e) {
            console.warn('Mapeo no encontrado, usando búsqueda directa');
            mapeoTarifa = [];
        }

        console.log(`Catálogo: ${catalogo.series.length} series, Tarifa: ${tarifa.length} productos`);
        renderFilters();
        aplicarSerieDesdeURL();
        renderProducts();
    } catch (error) {
        console.error('Error cargando catálogo o tarifa:', error);
        document.getElementById('products-container').innerHTML = '<p>Error cargando productos</p>';
    }
}

/**
 * Normaliza un nombre para búsqueda (sin acentos, minúsculas, sin espacios extras)
 */
function normalizarNombre(nombre) {
    if (!nombre) return '';
    return nombre
        .toLowerCase()
        .trim()
        .replace(/á|à|ä|â/g, 'a')
        .replace(/é|è|ë|ê/g, 'e')
        .replace(/í|ì|ï|î/g, 'i')
        .replace(/ó|ò|ö|ô/g, 'o')
        .replace(/ú|ù|ü|û/g, 'u')
        .replace(/\s+/g, ' ');  // Espacios simples
}

/**
 * Obtiene la serie de tarifa correspondiente a un catálogo
 * Busca en el mapeo extraído del Excel
 * @param {string} serieCatalogo - Nombre de serie del catálogo (ej: "Blancos", "Carrara")
 * @param {string} formatoCatalogo - Formato del catálogo (ej: "20x60", "30x60")
 * @returns {object} {formato, serie} de la tarifa, o null
 */
function obtenerSerieTarifa(serieCatalogo, formatoCatalogo) {
    if (!mapeoTarifa || mapeoTarifa.length === 0) return null;

    const serieNorm = normalizarNombre(serieCatalogo);
    const formatoNorm = (formatoCatalogo || '').toUpperCase().replace(/\s+/g, '').replace(/,/g, '');

    // Busca en el mapeo: ¿cuál serie de tarifa menciona esta serie del catálogo?
    for (let mapeo of mapeoTarifa) {
        const nombresNorm = normalizarNombre(mapeo.nombres_catalogo || '');

        // Si los nombres están vacíos, saltalo
        if (!serieNorm || !nombresNorm) continue;

        // Busca coincidencia: palabra completa o con espacios/puntuación
        // Ejemplo: "blancos" en "blancos - irati - haina"
        const palabrasNombres = nombresNorm.split(/[\s,/-]+/).filter(p => p);
        const palabraSerie = serieNorm.split(/[\s,/-]+/)[0];  // Primera palabra

        const encontrado = palabrasNombres.some(palabra =>
            palabra === serieNorm ||
            palabra === palabraSerie ||
            serieNorm.includes(palabra)
        );

        if (encontrado) {
            // Verifica que el formato sea compatible
            const formatoMapeoNorm = (mapeo.formato || '').toUpperCase().replace(/\s+/g, '').replace(/,/g, '');
            if (!formatoMapeoNorm || formatoMapeoNorm === formatoNorm || formatoMapeoNorm === '?') {
                return {
                    formato: mapeo.formato,
                    serie: mapeo.serie
                };
            }
        }
    }

    return null;
}

/**
 * Busca un producto en la tarifa por formato y nombre de serie
 * @param {string} formato - Ej: "10x10", "20x60", "30X60"
 * @param {string} serieNombre - Ej: "AZULEJO", "BASES", "METRO BISEL"
 * @returns {object} Producto de tarifa con precio y m²/caja, o null
 */
function buscarEnTarifa(formato, serieNombre) {
    if (!tarifa || tarifa.length === 0) return null;

    // Normaliza: formato y serie sin espacios extras, mayúsculas
    const formatoNorm = formato.toUpperCase().trim().replace(/\s+/g, '');
    const serieNorm = serieNombre.toUpperCase().trim();

    // Busca coincidencia exacta: formato + serie
    return tarifa.find(p =>
        p.formato.toUpperCase().replace(/\s+/g, '') === formatoNorm &&
        p.serie.toUpperCase() === serieNorm
    );
}

function renderFilters() {
    // Series
    const seriesDiv = document.getElementById('filter-series');
    if (seriesDiv) {
        seriesDiv.innerHTML = catalogo.series.map(s => `
            <label>
                <input type="checkbox" value="${s.id}" onchange="applyFilters()">
                ${s.nombre}
            </label>
        `).join('');
    }

    // Formatos
    const formatosDiv = document.getElementById('filter-formatos');
    if (formatosDiv) {
        formatosDiv.innerHTML = catalogo.formatos_disponibles.map(f => `
            <label>
                <input type="checkbox" value="${f}" onchange="applyFilters()">
                ${f}
            </label>
        `).join('');
    }

    // Acabados
    const acabadosDiv = document.getElementById('filter-acabados');
    if (acabadosDiv) {
        acabadosDiv.innerHTML = catalogo.acabados_disponibles.map(a => `
            <label>
                <input type="checkbox" value="${a}" onchange="applyFilters()">
                ${a}
            </label>
        `).join('');
    }

    // Tipos
    const tiposDiv = document.getElementById('filter-tipos');
    if (tiposDiv) {
        tiposDiv.innerHTML = catalogo.tipos_producto.map(t => `
            <label>
                <input type="checkbox" value="${t}" onchange="applyFilters()">
                ${t}
            </label>
        `).join('');
    }
}

// Si la URL trae ?serie=slug (enlaces del menú y la portada), pre-marca ese filtro
function aplicarSerieDesdeURL() {
    const serie = new URLSearchParams(window.location.search).get('serie');
    if (!serie) return;
    const checkbox = document.querySelector(`#filter-series input[value="${serie}"]`);
    if (checkbox) {
        checkbox.checked = true;
        filtrosActivos.series = [serie];
    }
}

function applyFilters() {
    filtrosActivos = {
        series: Array.from(document.querySelectorAll('#filter-series input:checked')).map(el => el.value),
        formatos: Array.from(document.querySelectorAll('#filter-formatos input:checked')).map(el => el.value),
        acabados: Array.from(document.querySelectorAll('#filter-acabados input:checked')).map(el => el.value),
        tipos: Array.from(document.querySelectorAll('#filter-tipos input:checked')).map(el => el.value)
    };
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    let productos = catalogo.series;

    // Aplicar filtros
    if (filtrosActivos.series && filtrosActivos.series.length > 0) {
        productos = productos.filter(p => filtrosActivos.series.includes(p.id));
    }

    if (filtrosActivos.formatos && filtrosActivos.formatos.length > 0) {
        productos = productos.filter(p => p.formatos.some(f => filtrosActivos.formatos.includes(f)));
    }

    if (filtrosActivos.acabados && filtrosActivos.acabados.length > 0) {
        productos = productos.filter(p => p.acabados.some(a => filtrosActivos.acabados.includes(a)));
    }

    if (filtrosActivos.tipos && filtrosActivos.tipos.length > 0) {
        productos = productos.filter(p => p.tipo.some(t => filtrosActivos.tipos.includes(t)));
    }

    if (productos.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No se encontraron productos con los filtros seleccionados</p>';
        return;
    }

    container.innerHTML = productos.map(p => {
        const formato = p.formatos[0] || '';

        // Intenta encontrar la serie de tarifa correspondiente
        let seriesTarifa = obtenerSerieTarifa(p.nombre, formato);
        let dataTarifa = null;

        // Si encuentra mapeo, busca el producto en tarifa
        if (seriesTarifa) {
            dataTarifa = buscarEnTarifa(seriesTarifa.formato, seriesTarifa.serie);
        }

        // Si no encuentra por mapeo, intenta búsqueda directa (compatibilidad)
        if (!dataTarifa) {
            dataTarifa = buscarEnTarifa(formato, p.nombre);
        }

        if (!dataTarifa) {
            // Producto sin tarifa: mostrar opción de consulta
            return `
            <div class="product-card">
                <img src="${p.imagen}" alt="${p.nombre}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${p.nombre}</div>
                    <p class="product-desc">${p.descripcion}</p>
                    <div class="product-formats">
                        ${p.formatos.slice(0, 3).map(f => `<span class="format-badge">${f}</span>`).join('')}
                        ${p.formatos.length > 3 ? `<span class="format-badge">+${p.formatos.length - 3}</span>` : ''}
                    </div>
                    <div class="product-tarifa" style="background: #f5e5e0; padding: 0.75rem; border-radius: 4px; margin: 0.5rem 0; font-size: 0.9rem; color: #8a857b;">
                        Disponible bajo consulta
                    </div>
                    <div class="product-actions">
                        <button class="btn" style="background-color: #25d366;" onclick="window.location.href='contacto.html'">
                            Consultar
                        </button>
                        <a href="descargas.html#${p.id}" class="btn" style="background-color: #666;">
                            Ficha
                        </a>
                    </div>
                </div>
            </div>
            `;
        }

        // Producto con tarifa: mostrar precio y carrito
        return `
        <div class="product-card">
            <img src="${p.imagen}" alt="${p.nombre}" class="product-image">
            <div class="product-info">
                <div class="product-name">${p.nombre}</div>
                <p class="product-desc">${p.descripcion}</p>
                <div class="product-formats">
                    ${p.formatos.slice(0, 3).map(f => `<span class="format-badge">${f}</span>`).join('')}
                    ${p.formatos.length > 3 ? `<span class="format-badge">+${p.formatos.length - 3}</span>` : ''}
                </div>
                <div class="product-tarifa" style="background: #ece4d4; padding: 0.75rem; border-radius: 4px; margin: 0.5rem 0; font-size: 0.9rem;">
                    <div style="font-weight: 600; color: #26374a;">${dataTarifa.precio_venta_caja.toFixed(2)}€/caja</div>
                    <div style="font-size: 0.85rem; color: #8a857b;">${dataTarifa.metros_por_caja} m² por caja</div>
                </div>
                <div class="product-actions" style="gap: 0.5rem; display: flex; align-items: center;">
                    <input type="number" id="cant-${p.id}" min="1" value="1" style="width: 60px; padding: 0.4rem; border: 1px solid #d9d2c4; border-radius: 4px; text-align: center;">
                    <button class="btn" style="background-color: #26374a; flex: 1;" onclick="agregarAlCarritoDesdeProducto('${formato}', '${p.nombre}', document.getElementById('cant-${p.id}').value)">
                        Agregar
                    </button>
                    <a href="descargas.html#${p.id}" class="btn" style="background-color: #666;">
                        Ficha
                    </a>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function resetFilters() {
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => cb.checked = false);
    filtrosActivos = { series: [], formatos: [], acabados: [], tipos: [] };
    renderProducts();
}

// Cargar catálogo al iniciar
document.addEventListener('DOMContentLoaded', loadCatalogo);
