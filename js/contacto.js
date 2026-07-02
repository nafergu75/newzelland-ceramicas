// ============================================
// PÁGINA DE CONTACTO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleContactForm);
    }
});

function handleContactForm(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    if (!name || !email || !subject || !message) {
        showMessage('Por favor completa todos los campos requeridos', 'error');
        return;
    }

    // Guardar mensaje en localStorage (en producción, enviarlo a servidor)
    const messages = JSON.parse(localStorage.getItem('contact-messages') || '[]');
    messages.push({
        id: Date.now(),
        nombre: name,
        email: email,
        telefono: phone,
        asunto: subject,
        mensaje: message,
        fecha: new Date().toISOString()
    });
    localStorage.setItem('contact-messages', JSON.stringify(messages));

    // Mostrar confirmación
    showMessage('¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.', 'success');

    // Limpiar formulario
    document.getElementById('contact-form').reset();

    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
        document.getElementById('form-message').style.display = 'none';
    }, 5000);
}

function showMessage(text, type) {
    const msgEl = document.getElementById('form-message');
    msgEl.textContent = text;
    msgEl.className = type;
    msgEl.style.display = 'block';
}
