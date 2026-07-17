// ============================================
// BACKEND API - NEWZELAND CERÁMICAS
// Vercel Serverless Function Handler
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

// Debug middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// Rutas de auth básicas (para Vercel)
// En producción, estos endpoint deben conectar a PostgreSQL
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, apellidos, empresa, email, telefono, password, terminos, privacidad, newsletter } = req.body;

        // Validación básica
        if (!nombre || !apellidos || !email || !telefono || !password) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Todos los campos requeridos deben ser completados'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: 'Contraseña debe tener al menos 8 caracteres',
                message: 'Contraseña debe tener al menos 8 caracteres'
            });
        }

        if (!terminos || !privacidad) {
            return res.status(400).json({
                error: 'Debes aceptar términos y privacidad',
                message: 'Debes aceptar términos y privacidad'
            });
        }

        // Aquí iría: guardar en BD, hashear contraseña, enviar email
        console.log(`[AUTH] Registro solicitado: ${email}`);

        // Por ahora, simular éxito (EN PRODUCCIÓN: conectar a BD PostgreSQL)
        res.status(201).json({
            success: true,
            userId: `user_${Date.now()}`,
            message: 'Registro exitoso. Revisa tu email para confirmar.'
        });

    } catch (error) {
        console.error('[AUTH] Error en register:', error);
        res.status(500).json({
            error: 'Error al registrar',
            message: error.message
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña requeridos',
                message: 'Email y contraseña requeridos'
            });
        }

        // Aquí iría: verificar en BD, comparar contraseña hasheada
        console.log(`[AUTH] Login solicitado: ${email}`);

        // Por ahora, simular éxito (EN PRODUCCIÓN: conectar a BD PostgreSQL)
        res.json({
            token: `token_${Date.now()}`,
            user: {
                id: `user_${Date.now()}`,
                name: 'Usuario',
                email: email,
                role: 'customer'
            }
        });

    } catch (error) {
        console.error('[AUTH] Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión',
            message: error.message
        });
    }
});

app.get('/api/auth/me', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    res.json({
        id: 'user_123',
        name: 'Usuario',
        email: 'usuario@example.com',
        role: 'customer'
    });
});

// ============================================
// RUTAS DE CUENTA
// ============================================

app.get('/api/account/summary', (req, res) => {
    try {
        // Mock data - en producción vendría de BD
        res.json({
            totalFacturado: 2500.50,
            totalPedidos: 5,
            pedidosEsteAño: 2,
            enviosPendientes: 1,
            miembroDesde: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener resumen de cuenta' });
    }
});

app.get('/api/account/pedidos', (req, res) => {
    try {
        const page = req.query.page || 1;
        // Mock data - en producción vendría de BD
        res.json({
            pedidos: [
                {
                    id: `ORD-${Date.now()}`,
                    fecha: new Date().toISOString(),
                    estado: 'entregado',
                    total: 500.00,
                    items: 3,
                    referencia: 'REF-001'
                }
            ],
            total: 1,
            pagina: page,
            por_pagina: 10
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

app.get('/api/account/pedido/:id', (req, res) => {
    try {
        const { id } = req.params;
        // Mock data - en producción vendría de BD
        res.json({
            id: id,
            fecha: new Date().toISOString(),
            estado: 'entregado',
            total: 500.00,
            items: [
                { nombre: 'Cerámica', cantidad: 2, precio: 250.00 }
            ],
            direccion: { calle: 'Calle Principal', ciudad: 'Valencia', cp: '46001' }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
});

app.get('/api/account/perfil', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        // Mock data - en producción vendría de BD
        res.json({
            id: 'user_123',
            nombre: 'Ignacio',
            apellidos: 'Ferrer',
            email: 'ignacio@ifeval.es',
            telefono: '+34 699 083 535',
            empresa: 'ifeval inversiones s.l.',
            direccionFacturacion: { calle: '', ciudad: '', cp: '' },
            direccionEnvio: { calle: '', ciudad: '', cp: '' }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

app.get('/api/account/envios', (req, res) => {
    try {
        // Mock data - en producción vendría de BD
        res.json({
            envios: [
                {
                    id: 'ENV-001',
                    pedidoId: 'ORD-001',
                    estado: 'en-camino',
                    transportista: 'MRW',
                    numeroSeguimiento: '12345678',
                    fechaEnvio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    fechaEntrega: null
                }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener envios' });
    }
});

// ============================================
// RUTAS - Con /api prefix (como llegan de Vercel)
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
// ROOT ENDPOINT
// ============================================
app.get('/api', (req, res) => {
    res.json({
        message: 'Newzelland Cerámicas API',
        version: '1.0.0',
        endpoints: [
            'GET /api/health - Health check',
            'POST /api/checkout - Procesar pago',
            'GET /api/products - Catálogo de productos',
            'GET /api/orders/:id - Estado del pedido',
            'POST /api/contact - Formulario de contacto'
        ]
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Newzelland Cerámicas API',
        version: '1.0.0',
        endpoints: [
            'GET /api/health - Health check',
            'POST /api/checkout - Procesar pago',
            'GET /api/products - Catálogo de productos',
            'GET /api/orders/:id - Estado del pedido',
            'POST /api/contact - Formulario de contacto'
        ]
    });
});

// ============================================
// FALLBACK - 404 handler
// ============================================
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method
    });
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

// Export handler for Vercel serverless
module.exports = app;
