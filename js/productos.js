// ============================================
// PÁGINA DE PRODUCTOS
// ============================================

let catalogo = {};
let filtrosActivos = {};

async function loadCatalogo() {
    try {
        const response = await fetch('data/catalogo.json');
        catalogo = await response.json();
        renderFilters();
        aplicarSerieDesdeURL();
        renderProducts();
    } catch (error) {
        console.error('Error cargando catálogo:', error);
        document.getElementById('products-container').innerHTML = '<p>Error cargando productos</p>';
    }
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

    container.innerHTML = productos.map(p => `
        <div class="product-card">
            <img src="${p.imagen}" alt="${p.nombre}" class="product-image">
            <div class="product-info">
                <div class="product-name">${p.nombre}</div>
                <p class="product-desc">${p.descripcion}</p>
                <div class="product-formats">
                    ${p.formatos.slice(0, 3).map(f => `<span class="format-badge">${f}</span>`).join('')}
                    ${p.formatos.length > 3 ? `<span class="format-badge">+${p.formatos.length - 3}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn" style="background-color: #25d366;" onclick="addToCart('${p.nombre}', 0, '${p.formatos[0] || 'Consultar'}')">
                        Solicitar
                    </button>
                    <a href="descargas.html#${p.id}" class="btn" style="background-color: #666;">
                        Ver ficha
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function resetFilters() {
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => cb.checked = false);
    filtrosActivos = { series: [], formatos: [], acabados: [], tipos: [] };
    renderProducts();
}

// Cargar catálogo al iniciar
document.addEventListener('DOMContentLoaded', loadCatalogo);
