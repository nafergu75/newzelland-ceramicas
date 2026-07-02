// ============================================
// PÁGINA DE TIENDA
// ============================================

function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    document.getElementById('checkout-form').style.display = 'block';
    document.getElementById('checkout-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelCheckout() {
    document.getElementById('checkout-form').style.display = 'none';
}

function submitCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    const name = document.querySelector('.checkout-form input[type="text"]').value;
    const email = document.querySelector('.checkout-form input[type="email"]').value;
    const phone = document.querySelector('.checkout-form input[type="tel"]').value;
    const address = document.querySelector('.checkout-form textarea').value;

    if (!name || !email || !address) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    // Crear objeto pedido
    const order = {
        id: Date.now(),
        nombre: name,
        email: email,
        telefono: phone,
        direccion: address,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
        fecha: new Date().toISOString(),
        estado: 'pendiente'
    };

    // Guardar en localStorage (en producción, esto iría a servidor)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Limpiar carrito
    localStorage.setItem('cart', '[]');
    updateCartCount();

    // Mostrar confirmación
    alert(`¡Pedido confirmado!\n\nNúmero de pedido: ${order.id}\n\nNos pondremos en contacto pronto para confirmar detalles de envío y pago.`);

    // Redirigir a inicio
    window.location.href = 'index.html';
}
