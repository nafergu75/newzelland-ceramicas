// ============================================
// PÁGINA PACKING LIST — datos reales Practika
// ============================================

let dataPacking = null;
let filtroCategoria = 'todos';

async function loadPacking() {
    try {
        const response = await fetch('data/packing.json');
        dataPacking = await response.json();
        renderFiltrosCategoria();
        renderPacking();
    } catch (error) {
        console.error('Error cargando packing:', error);
        const cont = document.getElementById('packing-container');
        if (cont) cont.innerHTML = '<p>Error cargando los datos de embalaje. Inténtalo de nuevo.</p>';
    }
}

function renderFiltrosCategoria() {
    const cont = document.getElementById('filtros-categoria');
    if (!cont) return;

    const botones = [{ id: 'todos', nombre: 'Todas' }, ...dataPacking.categorias];
    cont.innerHTML = botones.map(c => `
        <button class="filtro-material-btn ${c.id === filtroCategoria ? 'activo' : ''}"
                onclick="setFiltroCategoria('${c.id}')">
            ${c.nombre}
        </button>
    `).join('');
}

function setFiltroCategoria(id) {
    filtroCategoria = id;
    renderFiltrosCategoria();
    renderPacking();
}

function renderPacking() {
    const cont = document.getElementById('packing-container');
    if (!cont) return;

    const busqueda = (document.getElementById('search-formato')?.value || '')
        .toLowerCase().replace(/\s/g, '').replace(/,/g, '.');

    let categorias = dataPacking.categorias;
    if (filtroCategoria !== 'todos') {
        categorias = categorias.filter(c => c.id === filtroCategoria);
    }

    const bloques = categorias.map(cat => {
        let items = cat.items;
        if (busqueda) {
            items = items.filter(it =>
                it.formatNormalized.toLowerCase().replace(/,/g, '.').includes(busqueda));
        }
        if (items.length === 0) return '';

        const fmt = n => String(n).replace('.', ',');
        return `
        <section class="downloads-section">
            <h2>${cat.nombre} <span style="font-size: 0.9rem; color: #999; font-weight: 400;">(${cat.codigo})</span></h2>
            <div style="overflow-x: auto;">
                <table class="packing-table">
                    <thead>
                        <tr>
                            <th rowspan="2" class="col-formato">Formato</th>
                            <th rowspan="2" class="col-variante">Variante</th>
                            <th colspan="3" class="grupo sep">📦 Caja</th>
                            <th colspan="3" class="grupo sep">🚛 Palet</th>
                        </tr>
                        <tr>
                            <th class="sep">Piezas</th><th>m²</th><th>Kg</th>
                            <th class="sep">Cajas</th><th>m²</th><th>Kg</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(it => `
                        <tr>
                            <td class="col-formato"><strong>${it.format}</strong></td>
                            <td class="col-variante">${it.variant || '—'}</td>
                            <td class="sep">${fmt(it.box.pieces)}</td>
                            <td>${fmt(it.box.m2)}</td>
                            <td>${fmt(it.box.kg)}</td>
                            <td class="sep">${fmt(it.pallet.boxes)}</td>
                            <td>${fmt(it.pallet.m2)}</td>
                            <td>${fmt(it.pallet.kg)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </section>`;
    }).filter(Boolean);

    cont.innerHTML = bloques.length > 0
        ? bloques.join('')
        : '<p style="text-align: center; color: #999; padding: 3rem 0;">No hay formatos que coincidan con la búsqueda</p>';
}

document.addEventListener('DOMContentLoaded', loadPacking);
