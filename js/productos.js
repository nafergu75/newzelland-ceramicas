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
            fetch('./data/catalogo.json?v=3'),
            fetch('./data/tarifa-productos.json?v=3'),
            fetch('./data/mapeo-extraido.json?v=3')
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
 * Obtiene la serie para búsqueda en tarifa
 * Normaliza sufijos como "c3", "C3", etc.
 * @param {string} serieCatalogo - Nombre de serie del catálogo (ej: "Bali c3", "Land Kaster C3")
 * @param {string} formatoCatalogo - Formato del catálogo (ej: "20x60", "30x60")
 * @returns {object} {formato, serie} para búsqueda, o null
 */
function obtenerSerieTarifa(serieCatalogo, formatoCatalogo) {
    if (!serieCatalogo) return null;

    // Quita sufijos comunes: " c3", " C3", " C2", etc.
    const serieNorm = serieCatalogo.trim()
        .replace(/\s+c\d+$/i, '')    // " c3", " C2", etc.
        .replace(/\s+rec$/i, '')      // " REC"
        .replace(/\s+prc\.?$/i, '')   // " PRC", " PRC."
        .trim();

    return {
        formato: formatoCatalogo,
        serie: serieNorm
    };
}

/**
 * Busca un producto en la tarifa por formato y nombre de serie del catálogo
 * @param {string} formato - Ej: "10x10", "20x60", "30x60"
 * @param {string} serieNombre - Nombre del catálogo (sin sufijos c3/REC/etc), ej: "Bali", "Irati"
 * @returns {object} Producto de tarifa con precio y m²/caja, o null
 */
function buscarEnTarifa(formato, serieNombre) {
    if (!tarifa || tarifa.length === 0) return null;

    const formatoNorm = normalizarFormato(formato);
    const serieNormUpper = normalizarSerie(serieNombre);

    // Candidatos con el mismo formato
    const candidatos = tarifa.filter(p => normalizarFormato(p.formato) === formatoNorm);
    if (candidatos.length === 0) return null;

    // 1. Match exacto de serie normalizada
    let producto = candidatos.find(p => normalizarSerie(p.serie) === serieNormUpper);
    if (producto) return producto;

    // 2. Nombres compuestos: "Silos c3/cotto provenzal" -> prueba cada parte
    const partes = serieNombre.split('/').map(s => normalizarSerie(s)).filter(s => s);
    for (const parte of partes) {
        producto = candidatos.find(p => normalizarSerie(p.serie) === parte);
        if (producto) return producto;
    }

    // 3. Prefijo: "Travertino caliza brillo" empieza por serie tarifa "Travertino"
    producto = candidatos.find(p => {
        const st = normalizarSerie(p.serie);
        return st.length >= 4 && (serieNormUpper.startsWith(st + ' ') || st.startsWith(serieNormUpper + ' '));
    });

    return producto || null;
}

/**
 * Normaliza un nombre de serie: mayúsculas, sin acentos, sin sufijos c2/c3
 * "Ardesia c3" -> "ARDESIA" | "Land Kaster C3" -> "LAND KASTER" | "Urbión" -> "URBION"
 */
function normalizarSerie(serie) {
    return (serie || '').trim()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')  // Quita acentos
        .toUpperCase()
        .replace(/\s+C\d+$/, '')   // Quita sufijo " C3", " C2", etc.
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Normaliza un formato a "ANCHOxALTO" sin espacios, comas ni sufijos (REC, PRC, etc.)
 * "30X60 REC" -> "30X60" | "33,3x33,3 PRC." -> "333X333" | "60x120" -> "60X120"
 */
function normalizarFormato(formato) {
    const s = (formato || '').toUpperCase()
        .trim()
        .replace(/\s+/g, '')   // Quita espacios
        .replace(/,/g, '');    // Quita comas
    // Conserva solo las dimensiones "NNNxNNN" del principio (quita REC, PRC, etc.)
    const m = s.match(/^\d+X\d+/);
    return m ? m[0] : s;
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

        // Obtiene la serie normalizada (sin sufijos como "c3", "REC", etc.)
        let seriesTarifa = obtenerSerieTarifa(p.nombre, formato);
        let dataTarifa = null;

        // Busca con la serie normalizada
        if (seriesTarifa) {
            dataTarifa = buscarEnTarifa(seriesTarifa.formato, seriesTarifa.serie);
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
                    <div style="font-weight: 600; color: #26374a;">${(dataTarifa.precio_venta_m2 || dataTarifa.precio_venta_caja / dataTarifa.metros_por_caja).toFixed(2)}€/m²</div>
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
