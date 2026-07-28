// ============================================
// BACKEND API - NEWZELAND CERÁMICAS
// Vercel Serverless Function
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /checkout - Procesar pago con Stripe
app.post('/checkout', async (req, res) => {
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

// POST /whatsapp - Webhook de WhatsApp
app.post('/whatsapp', async (req, res) => {
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

// GET /products - Catálogo de productos (cache)
app.get('/products', (req, res) => {
    // Servir catálogo.json (se puede cachear en BD)
    res.json({
        message: 'Endpoint disponible. Catálogo se sirve desde frontend/data/catalogo.json',
        endpoint: '/data/catalogo.json'
    });
});

// GET /orders/:id - Obtener estado de pedido
app.get('/orders/:id', async (req, res) => {
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

// POST /contact - Guardar mensaje de contacto
app.post('/contact', async (req, res) => {
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

// POST /admin/facturas/extraer-ia - Proxy a Conta API (invoice extractor)
app.post('/admin/facturas/extraer-ia', async (req, res) => {
    try {
        const { archivoBase64, nombre, mimeType } = req.body;

        if (!archivoBase64 || !nombre) {
            return res.status(400).json({ error: 'Archivo y nombre requeridos' });
        }

        const CONTA_API_URL = process.env.CONTA_API_URL || 'http://localhost:3005';
        const CONTA_API_TOKEN = process.env.CONTA_API_TOKEN;
        const CONTA_COMPANY_ID = process.env.CONTA_COMPANY_ID || '1';

        if (!CONTA_API_TOKEN) {
            return res.status(500).json({ error: 'CONTA_API_TOKEN no configurado' });
        }

        // Enviar archivo a Conta API
        const response = await fetch(`${CONTA_API_URL}/companies/${CONTA_COMPANY_ID}/invoice-extractor/extract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONTA_API_TOKEN}`,
            },
            body: JSON.stringify({
                fileData: archivoBase64,
                mimeType: mimeType || 'application/pdf',
                fileName: nombre,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[extraer-ia] Conta API error:', errorData);
            return res.status(response.status).json({
                error: 'Error en extractor IA',
                details: errorData.error || 'Sin detalles',
            });
        }

        const data = await response.json();

        // Devolver el nuevo schema de InvoiceExtraction
        res.json({
            success: true,
            data: data, // El schema nuevo ya viene de Conta API
        });

    } catch (error) {
        console.error('[extraer-ia] Error:', error);
        res.status(500).json({
            error: 'Error procesando extractor IA',
            message: error instanceof Error ? error.message : 'Desconocido',
        });
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
