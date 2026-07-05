// ============================================
// PÁGINA DE DESCARGAS — datos reales Practika
// ============================================

let dataDescargas = null;
let filtroMaterial = 'todos';

async function loadDescargas() {
    try {
        const response = await fetch('data/descargas.json');
        dataDescargas = await response.json();
        renderGenerales();
        renderFiltrosMaterial();
        renderFamilias();
    } catch (error) {
        console.error('Error cargando descargas:', error);
        const grid = document.getElementById('familias-grid');
        if (grid) grid.innerHTML = '<p>Error cargando las descargas. Inténtalo de nuevo.</p>';
    }
}

function renderGenerales() {
    const grid = document.getElementById('generales-grid');
    if (!grid) return;

    grid.innerHTML = dataDescargas.generales.map(g => `
        <div class="download-card">
            <div class="card-header">
                <h3>${g.titulo}</h3>
                <span class="badge">PDF</span>
            </div>
            <a href="${g.archivo}" class="btn btn-download" target="_blank" rel="noopener">
                ⬇️ Descargar PDF
            </a>
        </div>
    `).join('');
}

function renderFiltrosMaterial() {
    const cont = document.getElementById('filtros-material');
    if (!cont) return;

    const materiales = new Set();
    dataDescargas.series.forEach(s => s.materiales.forEach(m => materiales.add(m)));

    const botones = ['todos', ...materiales];
    cont.innerHTML = botones.map(m => `
        <button class="filtro-material-btn ${m === filtroMaterial ? 'activo' : ''}" data-material="${m}"
                onclick="setFiltroMaterial('${m}')">
            ${m === 'todos' ? 'Todas' : m}
        </button>
    `).join('');
}

function setFiltroMaterial(m) {
    filtroMaterial = m;
    renderFiltrosMaterial();
    renderFamilias();
}

function renderFamilias() {
    const grid = document.getElementById('familias-grid');
    if (!grid) return;

    const busqueda = (document.getElementById('search-familia')?.value || '').toLowerCase();

    let series = dataDescargas.series;
    if (filtroMaterial !== 'todos') {
        series = series.filter(s => s.materiales.includes(filtroMaterial));
    }
    if (busqueda) {
        series = series.filter(s => s.nombre.toLowerCase().includes(busqueda));
    }

    const contador = document.getElementById('contador-series');
    if (contador) contador.textContent = `${series.length} series`;

    if (series.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay series que coincidan con la búsqueda</p>';
        return;
    }

    grid.innerHTML = series.map(familia => `
        <div class="familia-card" id="familia-${familia.slug}">
            ${familia.imagen ? `<img src="${familia.imagen}" alt="${familia.nombre}" loading="lazy" style="width: 100%; height: 160px; object-fit: cover; border-radius: 4px; margin-bottom: 1rem;">` : ''}
            <div class="familia-info">
                <h3 style="margin-top: 0;">${familia.nombre} ${familia.nuevo ? '<span class="badge">Novedad</span>' : ''}</h3>
                <p><strong>Material:</strong> ${familia.materiales.join(', ') || '—'}</p>
                <p><strong>Formatos:</strong> ${familia.formatos.join(', ') || '—'}</p>
                <p><strong>Acabados:</strong> ${familia.acabados.join(', ') || '—'}</p>
            </div>
            <div style="margin-top: 1rem;">
                ${familia.catalogos.map((url, i) => `
                    <a href="${url}" class="btn btn-download" target="_blank" rel="noopener" style="display: block; margin-bottom: 0.5rem;">
                        ⬇️ Catálogo${familia.catalogos.length > 1 ? ' ' + (i + 1) : ''}
                    </a>
                `).join('')}
                ${familia.panelesTecnicos.map((url, i) => `
                    <a href="${url}" class="btn btn-download" target="_blank" rel="noopener" style="display: block; margin-bottom: 0.5rem; background-color: #666;">
                        ⬇️ Panel técnico${familia.panelesTecnicos.length > 1 ? ' ' + (i + 1) : ''}
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function filterFamilias() {
    renderFamilias();
}

document.addEventListener('DOMContentLoaded', loadDescargas);
