// ============================================
// PÁGINA DE DESCARGAS
// ============================================

let catalogo = {};

async function loadCatalogo() {
    try {
        const response = await fetch('data/catalogo.json');
        catalogo = await response.json();
        renderFamilias();
    } catch (error) {
        console.error('Error cargando catálogo:', error);
    }
}

function renderFamilias() {
    const grid = document.getElementById('familias-grid');
    if (!grid) return;

    grid.innerHTML = catalogo.series.map(familia => `
        <div class="familia-card" id="familia-${familia.id}">
            <img src="${familia.imagen}" alt="${familia.nombre}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 1rem;">
            <div class="familia-info">
                <h3 style="margin-top: 0;">${familia.nombre}</h3>
                <p><strong>Formatos:</strong> ${familia.formatos.join(', ')}</p>
                <p><strong>Acabados:</strong> ${familia.acabados.join(', ')}</p>
                <p><strong>Material:</strong> ${familia.material}</p>
            </div>
            <div style="margin-top: 1rem;">
                ${familia.fichas.tecnica ? `
                    <a href="${familia.fichas.tecnica}" class="btn btn-download" download style="display: block; margin-bottom: 0.5rem;">
                        ⬇️ Ficha Técnica
                    </a>
                ` : ''}
                ${familia.fichas.instalacion ? `
                    <a href="${familia.fichas.instalacion}" class="btn btn-download" download style="display: block;">
                        ⬇️ Instalación
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function filterFamilias() {
    const searchText = document.getElementById('search-familia').value.toLowerCase();
    const cards = document.querySelectorAll('.familia-card');

    cards.forEach(card => {
        const titulo = card.querySelector('h3').textContent.toLowerCase();
        if (titulo.includes(searchText)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Cargar catálogo
document.addEventListener('DOMContentLoaded', loadCatalogo);
