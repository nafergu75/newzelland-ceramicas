// ============================================
// BACKEND API - NEWZELLAND CERÁMICAS
// Vercel Serverless Function
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: '.env.local' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /api/checkout - Procesar pago con Stripe
app.post('/api/checkout', async (req, res) => {
    try {
        const { items, email, total, paymentMethod } = req.body;

        if (!items || !email || !total) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        // Aquí iría integración real con Stripe/PayPal
        // Por ahora, simular respuesta exitosa
        const orderId = `ORD-${Date.now()}`;

        // En producción: guardar en BD, procesar pago, enviar email
        console.log(`Orden creada: ${orderId} - Cliente: ${email}`);

        res.json({
            success: true,
            orderId: orderId,
            message: 'Orden procesada. Te enviaremos confirmación por email.'
        });

    } catch (error) {
        console.error('Error en checkout:', error);
        res.status(500).json({ error: 'Error procesando pago' });
    }
});

// POST /api/whatsapp - Webhook de WhatsApp
app.post('/api/whatsapp', async (req, res) => {
    try {
        const message = req.body;

        // Verificar token
        const token = req.headers['authorization'];
        if (token !== `Bearer ${process.env.WHATSAPP_TOKEN}`) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        // Procesar mensaje entrante
        const fromNumber = message.from;
        const messageText = message.text;

        console.log(`Mensaje de WhatsApp de ${fromNumber}: ${messageText}`);

        // Aquí iría lógica de bot:
        // - Reconocer intención (info producto, pedido, etc)
        // - Responder con datos del catálogo
        // - Guardar datos de cliente y pedido

        res.json({ ok: true });

    } catch (error) {
        console.error('Error en WhatsApp webhook:', error);
        res.status(500).json({ error: 'Error procesando mensaje' });
    }
});

// GET /api/products - Catálogo de productos (cache)
app.get('/api/products', (req, res) => {
    // Servir catálogo.json (se puede cachear en BD)
    res.json({
        message: 'Endpoint disponible. Catálogo se sirve desde frontend/data/catalogo.json',
        endpoint: '/data/catalogo.json'
    });
});

// GET /api/orders/:id - Obtener estado de pedido
app.get('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        // En producción: consultar BD
        res.json({
            orderId: orderId,
            status: 'processing',
            message: 'Consulta tu pedido en tu email'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo pedido' });
    }
});

// POST /api/contact - Guardar mensaje de contacto
app.post('/api/contact', async (req, res) => {
    try {
        const { nombre, email, asunto, mensaje } = req.body;

        if (!nombre || !email || !asunto || !mensaje) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        // En producción: guardar en BD y enviar email
        console.log(`Mensaje de contacto de ${email}: ${asunto}`);

        res.json({
            success: true,
            message: 'Mensaje recibido. Te contactaremos pronto.'
        });

    } catch (error) {
        console.error('Error guardando contacto:', error);
        res.status(500).json({ error: 'Error enviando mensaje' });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3000;

// Para desarrollo local
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
        console.log(`📍 http://localhost:${PORT}/api/health`);
    });
}

// Para Vercel
module.exports = app;
