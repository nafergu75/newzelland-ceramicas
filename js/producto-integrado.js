/**
 * Integración de productos con tarifa en todas las páginas
 * Permite agregar productos al carrito desde producto.html
 */

/**
 * Agregador de productos al carrito con validación de tarifa
 * @param {string} formato - Tamaño (ej: "60x60")
 * @param {string} serie - Serie (ej: "ATLAS")
 * @param {number} cajas - Cantidad de cajas
 */
function agregarAlCarritoDesdeProducto(formato, serie, cajas = 1) {
    // Espera a que carrito esté listo
    if (typeof carrito === 'undefined') {
        console.error('Carrito no cargado');
        alert('Error: El carrito no está disponible. Por favor recarga la página.');
        return false;
    }

    // Valida cantidad
    cajas = parseInt(cajas) || 1;
    if (cajas < 1) cajas = 1;

    // Intenta agregar
    const ok = carrito.agregarAlCarrito(formato, serie, cajas);

    if (ok) {
        // Éxito: muestra notificación
        mostrarNotificacionCarrito(formato, serie, cajas);
        return true;
    } else {
        // Fallo: producto no en tarifa
        console.error(`Producto no encontrado en tarifa: ${formato} ${serie}`);
        alert(`Lo sentimos, el formato "${formato}" de la serie "${serie}" no está disponible en este momento.`);
        return false;
    }
}

/**
 * Muestra notificación de éxito al agregar al carrito
 * @param {string} formato
 * @param {string} serie
 * @param {number} cajas
 */
function mostrarNotificacionCarrito(formato, serie, cajas) {
    const producto = carrito.buscarProducto(formato, serie);
    if (!producto) return;

    const metros = cajas * producto.metros_por_caja;
    const precio = cajas * producto.precio_venta_caja;

    // Crea notificación visual
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #26374a;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;

    notif.innerHTML = `
        <div style="margin-bottom: 0.5rem; font-weight: 600;">
            ${cajas} caja${cajas > 1 ? 's' : ''} añadida${cajas > 1 ? 's' : ''}
        </div>
        <div style="font-size: 0.9rem; opacity: 0.9;">
            ${formato} | ${serie}<br>
            ${metros.toFixed(2)} m² | ${precio.toFixed(2)}€
        </div>
        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
            <a href="tienda.html" style="background: #ece4d4; color: #26374a; padding: 0.4rem 0.8rem; border-radius: 4px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">Ver carrito</a>
            <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 1rem;">×</button>
        </div>
    `;

    document.body.appendChild(notif);

    // Auto-elimina después de 5 segundos
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
}

/**
 * Actualiza el contador de productos en el carrito
 * Se ejecuta automáticamente cuando el carrito cambia
 */
function actualizarContadorCarrito() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;

    const totalCajas = carrito.items.reduce((sum, item) => sum + item.cajas, 0);
    countEl.textContent = totalCajas;
}

// Escucha cambios en el carrito para actualizar contador
if (typeof window !== 'undefined') {
    window.addEventListener('carritoActualizado', actualizarContadorCarrito);
}

// Animaciones CSS para notificación
if (document.head) {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(450px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(450px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
