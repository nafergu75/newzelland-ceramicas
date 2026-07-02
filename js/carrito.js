// ============================================
// GESTIÓN DEL CARRITO (localStorage)
// ============================================

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(nombre, precio, formato) {
    const cart = getCart();
    const product = {
        id: Date.now(),
        nombre: nombre,
        formato: formato,
        precio: precio,
        cantidad: 1
    };
    cart.push(product);
    saveCart(cart);
    alert(`${nombre} (${formato}) añadido al carrito`);
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    renderCart();
}

function updateCartItem(id, cantidad) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.cantidad = Math.max(1, parseInt(cantidad));
        saveCart(cart);
        renderCart();
    }
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cart = getCart();

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<tr class="empty-cart"><td colspan="5">Tu carrito está vacío</td></tr>';
        updateTotals();
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <tr>
            <td>
                <strong>${item.nombre}</strong><br>
                <small>${item.formato}</small>
            </td>
            <td>€${item.precio.toFixed(2)}</td>
            <td>
                <input type="number" min="1" value="${item.cantidad}"
                       onchange="updateCartItem(${item.id}, this.value)" style="width: 50px;">
            </td>
            <td>€${(item.precio * item.cantidad).toFixed(2)}</td>
            <td>
                <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:red; cursor:pointer;">✕</button>
            </td>
        </tr>
    `).join('');

    updateTotals();
}

function updateTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = '€' + subtotal.toFixed(2);
    if (totalEl) totalEl.textContent = '€' + subtotal.toFixed(2);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.cantidad, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => el.textContent = count);
}

// Al cargar la página de tienda, renderizar el carrito
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCart);
} else {
    renderCart();
}
