// ============================================
// BACKEND API - NEWZELAND CERÁMICAS
// Vercel Serverless Function Handler
// ============================================

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const { Readable } = require('stream');
const { UAParser } = require('ua-parser-js');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crmService = require('./services/crmService');
const emailTemplates = require('./services/emailTemplates');

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();

// ============================================
// CATÁLOGO: URLs reales de las fichas/PDFs.
// Este fichero SOLO existe en api/, nunca se empaqueta en el
// bundle del frontend, así que el navegador nunca ve las URLs reales.
// Cada ficha tiene { url, provider: 'r2'|'cloudinary', key? } — `key` solo
// existe para las de R2 (ruta del objeto dentro del bucket).
//
// El repo de GitHub es público, así que este fichero está en .gitignore
// (exponerlo permitiría descargar catálogos sin login ni tracking, que es
// justo lo que existe para evitar). En local se lee del disco; en Vercel
// se lee de la variable de entorno CATALOG_FICHAS_JSON (el mismo JSON como
// string). Si no está disponible por ninguna vía, el catálogo queda vacío
// y /api/catalogs/download responde 404 en vez de tirar abajo toda la API.
// ============================================

function loadCatalogFichas() {
  try {
    return require('./data/catalog-fichas.json');
  } catch (error) {
    if (process.env.CATALOG_FICHAS_JSON) {
      try {
        return JSON.parse(process.env.CATALOG_FICHAS_JSON);
      } catch (parseError) {
        console.error('CATALOG_FICHAS_JSON no es JSON válido:', parseError.message);
        return {};
      }
    }
    console.warn('catalog-fichas.json no encontrado y CATALOG_FICHAS_JSON no configurada — las descargas de catálogo devolverán 404.');
    return {};
  }
}

const catalogFichas = loadCatalogFichas();
const catalogoData = require('../frontend/src/data/catalogo.json');
const catalogNombreBySlug = Object.fromEntries(
  catalogoData.series.map((s) => [s.id, s.nombre])
);

// ============================================
// R2: cliente S3-compatible para firmar URLs de descarga.
// Solo se activa si las 4 variables de entorno están presentes; si faltan
// (dev local sin credenciales, o mientras el bucket sigue siendo público),
// el endpoint de descarga usa la URL pública guardada en catalog-fichas.json
// como hace hoy — no rompe nada mientras se completa la migración a bucket
// privado en Cloudflare.
// ============================================

const r2Configured = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_BUCKET &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
);

const r2Client = r2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

if (!r2Configured) {
  console.warn('R2 no configurado (faltan variables de entorno) — las descargas de R2 usan la URL pública actual como fallback.');
}

// Expiración corta: la URL firmada se genera y se usa en la misma petición
// (nunca llega al navegador), así que 60s es de sobra sin ser innecesariamente
// larga si por lo que sea quedara en algún log intermedio.
const R2_SIGNED_URL_TTL_SECONDS = 60;

async function getSignedCatalogUrl(key) {
  const command = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key });
  return getSignedUrl(r2Client, command, { expiresIn: R2_SIGNED_URL_TTL_SECONDS });
}

// ============================================
// DATABASE CONNECTION
// ============================================

// Config en api/db-config.js: acepta DATABASE_URL (producción) o las
// variables sueltas DB_HOST/DB_NAME/... (desarrollo local).
const { buildPoolConfig } = require('./db-config');

const pool = new Pool(buildPoolConfig());

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

async function ensureCatalogDownloadsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS catalog_downloads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        email VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(255),
        catalog_slug VARCHAR(100) NOT NULL,
        catalog_nombre VARCHAR(255),
        tipo VARCHAR(20) NOT NULL,
        ip VARCHAR(64),
        origen VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_catalog_downloads_user ON catalog_downloads(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_catalog_downloads_slug ON catalog_downloads(catalog_slug);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_catalog_downloads_created ON catalog_downloads(created_at);`);
  } catch (error) {
    console.error('Error creando tabla catalog_downloads:', error.message);
  }
}

// Ampliación de tracking (dispositivo, UTM, geo aproximada). Columnas
// nullable añadidas vía ALTER TABLE IF NOT EXISTS, idempotente igual que
// ensureCatalogDownloadsTable — no hace falta sistema de migraciones aparte.
async function ensureCatalogDownloadsTrackingColumns() {
  try {
    await pool.query(`
      ALTER TABLE catalog_downloads
        ADD COLUMN IF NOT EXISTS user_agent TEXT,
        ADD COLUMN IF NOT EXISTS device_type VARCHAR(20),
        ADD COLUMN IF NOT EXISTS browser_name VARCHAR(50),
        ADD COLUMN IF NOT EXISTS browser_version VARCHAR(20),
        ADD COLUMN IF NOT EXISTS os_name VARCHAR(50),
        ADD COLUMN IF NOT EXISTS os_version VARCHAR(20),
        ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
        ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
        ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
        ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255),
        ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255),
        ADD COLUMN IF NOT EXISTS country VARCHAR(100),
        ADD COLUMN IF NOT EXISTS city VARCHAR(100),
        ADD COLUMN IF NOT EXISTS referer VARCHAR(500);
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_catalog_downloads_device ON catalog_downloads(device_type);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_catalog_downloads_utm_source ON catalog_downloads(utm_source);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_catalog_downloads_country ON catalog_downloads(country);`);
  } catch (error) {
    console.error('Error ampliando columnas de tracking en catalog_downloads:', error.message);
  }
}

// IP truncada antes de guardar (último octeto en IPv4, últimos grupos en
// IPv6) — suficiente para geo aproximada, reduce el carácter de dato
// personal de la IP guardada. Pedido explícitamente en el punto 8 (privacidad).
function anonymizeIp(ip) {
  if (!ip) return null;
  const clean = ip.replace('::ffff:', '').trim();
  if (clean.includes(':')) {
    // Soporta direcciones comprimidas ("::1", "2001:db8::1") sin expandirlas
    // por completo: se queda solo con los grupos explícitos antes de "::"
    // (o de toda la dirección si no hay compresión), máximo 3.
    const head = clean.split('::')[0];
    const groups = head ? head.split(':').filter(Boolean) : [];
    return groups.slice(0, 3).join(':') + '::';
  }
  const octets = clean.split('.');
  if (octets.length === 4) {
    octets[3] = '0';
    return octets.join('.');
  }
  return clean;
}

// Mismo contexto (IP anonimizada, dispositivo/navegador, geo, UTM) que ya
// se capturaba solo para /api/catalogs/download — extraído aquí porque los
// tres formularios de leads (contacts, quote_requests, partners) lo
// necesitan igual, y no tenía sentido triplicar el bloque.
function captureRequestContext(req) {
  const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || null;
  const ua = new UAParser(req.headers['user-agent'] || '').getResult();

  return {
    ip: anonymizeIp(rawIp),
    userAgent: req.headers['user-agent'] || null,
    deviceType: ua.device.type || 'desktop',
    browserName: ua.browser.name || null,
    browserVersion: ua.browser.version || null,
    osName: ua.os.name || null,
    osVersion: ua.os.version || null,
    country: req.headers['x-vercel-ip-country'] || null,
    city: req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null,
    utmSource: req.body.utm_source || req.query.utm_source || null,
    utmMedium: req.body.utm_medium || req.query.utm_medium || null,
    utmCampaign: req.body.utm_campaign || req.query.utm_campaign || null,
  };
}

async function ensureLeadsTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        nombre_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefono VARCHAR(50),
        asunto VARCHAR(255),
        mensaje TEXT NOT NULL,
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(255),
        country VARCHAR(100),
        ip_anonima VARCHAR(64),
        user_agent TEXT,
        device_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        nombre_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        tipo_proyecto VARCHAR(100),
        tipo_espacio TEXT,
        descripcion TEXT NOT NULL,
        archivos_url TEXT,
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(255),
        country VARCHAR(100),
        ip_anonima VARCHAR(64),
        user_agent TEXT,
        device_type VARCHAR(50),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        nombre_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        empresa VARCHAR(255),
        tipo_profesional VARCHAR(100),
        web_portfolio VARCHAR(500),
        ciudad VARCHAR(255),
        pais VARCHAR(255),
        descripcion TEXT,
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(255),
        country VARCHAR(100),
        ip_anonima VARCHAR(64),
        user_agent TEXT,
        device_type VARCHAR(50),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        estado VARCHAR(50) DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_partners_estado ON partners(estado);`);
  } catch (error) {
    console.error('Error creando tablas de leads (contacts/quote_requests/partners):', error.message);
  }
}

// Encadenadas: las columnas nuevas solo se añaden una vez la tabla existe
// (en una BD nueva, CREATE TABLE y ALTER TABLE en paralelo tendrían carrera).
ensureCatalogDownloadsTable().then(() => ensureCatalogDownloadsTrackingColumns());
ensureLeadsTables();

async function ensureProjectsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        descripcion_corta VARCHAR(500),
        descripcion TEXT NOT NULL,
        tipo_espacio VARCHAR(100) NOT NULL,
        subtipo_espacio VARCHAR(100),
        ubicacion_ciudad VARCHAR(255),
        ubicacion_pais VARCHAR(255),
        ano_ejecucion INTEGER,
        colecciones_usadas JSONB,
        imagenes JSONB,
        imagen_portada VARCHAR(500),
        destacado BOOLEAN DEFAULT FALSE,
        orden INTEGER DEFAULT 0,
        estado VARCHAR(50) DEFAULT 'publicado',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_estado ON projects(estado);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_tipo_espacio ON projects(tipo_espacio);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_pais ON projects(ubicacion_pais);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_destacado ON projects(destacado);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_projects_orden ON projects(orden);`);
  } catch (error) {
    console.error('Error creando tabla projects:', error.message);
  }
}

ensureProjectsTable();

// ============================================
// COLLECTIONS: catálogo de series, migrado desde catalogo.json.
// tipo/formatos/acabados/colores se guardan como array porque ya lo son en
// el dato real (una serie puede ser Pavimento Y Revestimiento a la vez) —
// forzarlos a un solo valor perdería esa información.
// acabado_corte/espesor/estilo no tienen dato real disponible: se crean
// con un valor genérico y `especificaciones_verificadas` marca que faltan
// por revisar desde el admin.
// ============================================

async function ensureCollectionsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_portada VARCHAR(500),
        material VARCHAR(100),
        tipo TEXT[],
        formatos TEXT[],
        acabados TEXT[],
        colores TEXT[],
        precio_consultable BOOLEAN DEFAULT TRUE,
        acabado_corte VARCHAR(100) DEFAULT 'Rectificado',
        espesor DECIMAL(5,2) DEFAULT 10.0,
        estilo VARCHAR(100) DEFAULT 'Moderno',
        especificaciones_verificadas BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_material ON collections(material);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_estilo ON collections(estilo);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);`);

    // colores ya existía (solo nombres, para el filtro). colores_fotos añade
    // la imagen real por color (extraída de Practika — mismo proveedor que
    // ya usa todo el catálogo). JSONB en vez de tabla aparte: sigue el mismo
    // patrón que projects.imagenes — una lista pequeña que vive con su
    // colección, no necesita CRUD ni relaciones propias.
    await pool.query(`ALTER TABLE collections ADD COLUMN IF NOT EXISTS colores_fotos JSONB DEFAULT '[]';`);
  } catch (error) {
    console.error('Error creando tabla collections:', error.message);
  }
}

ensureCollectionsTable();

// ============================================
// MI CUENTA: pedidos/envíos/tickets/perfil.
// `orders` ya existía (id, user_id, status, total, created_at, updated_at)
// pero sin nada de lo que espera el frontend (items, dirección, tracking) —
// se amplía aquí en vez de crear tablas paralelas. `support_tickets` y
// `support_ticket_messages` son nuevas.
// ============================================

async function ensureAccountTables() {
  try {
    await pool.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS direccion JSONB,
        ADD COLUMN IF NOT EXISTS estado_envio VARCHAR(50),
        ADD COLUMN IF NOT EXISTS codigo_seguimiento VARCHAR(100),
        ADD COLUMN IF NOT EXISTS transportista VARCHAR(100),
        ADD COLUMN IF NOT EXISTS enlace_tracking VARCHAR(500);
    `);

    // Dirección de perfil: no existía ninguna columna de dirección en
    // `users` (ver el bug de "perfil bloqueado" — el frontend la esperaba
    // y el backend nunca la tuvo). Se añade para que PATCH /account/perfil
    // pueda guardarla de verdad, en vez de seguir mostrando "Sin especificar".
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS direccion JSONB;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        asunto VARCHAR(255) NOT NULL,
        categoria VARCHAR(50) NOT NULL DEFAULT 'otro',
        estado VARCHAR(20) NOT NULL DEFAULT 'abierto',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_ticket_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        remitente VARCHAR(20) NOT NULL,
        contenido TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket ON support_ticket_messages(ticket_id, created_at);`);
  } catch (error) {
    console.error('Error preparando tablas de "mi cuenta":', error.message);
  }
}

ensureAccountTables();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// AUTH MIDDLEWARE
// ============================================

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Requiere authMiddleware antes en la cadena (usa req.user.role, no vuelve a leer el token)
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, apellidos, empresa, email, telefono, password, terminos, privacidad, newsletter } = req.body;

    // Validación. Registro deliberadamente ligero: solo nombre/email/password
    // son obligatorios (más términos y privacidad) — apellidos/teléfono/empresa
    // quedan opcionales para bajar la fricción de registro.
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre, email y contraseña son obligatorios'
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

    // Verificar email duplicado
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'Este correo ya está registrado'
      });
    }

    // Hash contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    // `nombre` ya es el nombre completo (el formulario dejó de pedir
    // apellidos por separado); si llegara de un cliente antiguo con
    // apellidos sueltos, se concatenan igual por compatibilidad.
    const nombreCompleto = apellidos ? `${nombre} ${apellidos}` : nombre;

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, empresa, accepts_marketing, email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id, email, name`,
      [
        nombreCompleto,
        email,
        hashedPassword,
        telefono || null,
        empresa || null,
        newsletter || false
      ]
    );

    const user = result.rows[0];

    console.log(`✅ Usuario registrado: ${email}`);

    // CRM: sincronizar contacto + email de bienvenida. No se espera a que
    // termine antes de responder al cliente (se hace fire-and-forget con
    // captura de errores dentro de crmService), pero sí se hace antes de
    // devolver la respuesta para evitar que Vercel congele la función antes
    // de que la petición HTTP a Brevo llegue a salir.
    const tagsRegistro = ['registro_web'];
    if (empresa) tagsRegistro.push('profesional');
    await crmService.createOrUpdateContact({
      email,
      nombre: nombreCompleto,
      telefono: telefono || undefined,
      tipoCliente: empresa ? 'profesional' : 'particular',
      tags: tagsRegistro,
    });
    const emailBienvenida = emailTemplates.bienvenida(nombreCompleto);
    await crmService.sendTransactionalEmail({
      to: email,
      toName: nombreCompleto,
      subject: emailBienvenida.subject,
      html: emailBienvenida.html,
    });

    res.status(201).json({
      success: true,
      userId: user.id,
      message: 'Registro exitoso. Bienvenido!'
    });

  } catch (error) {
    console.error('Error en register:', error);
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

    // Buscar usuario
    const result = await pool.query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log(`✅ Login exitoso: ${email}`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      message: error.message
    });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // authService.getCurrentUser() espera { user: {...} }, igual que /auth/login
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ACCOUNT ROUTES
// ============================================

app.get('/api/account/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Obtener resumen de pedidos
    const result = await pool.query(
      `SELECT
        COALESCE(COUNT(*), 0) as total_pedidos,
        COALESCE(SUM(total), 0) as total_facturado,
        COALESCE(COUNT(CASE WHEN EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()) THEN 1 END), 0) as pedidos_este_año,
        COALESCE(COUNT(CASE WHEN status != 'entregado' THEN 1 END), 0) as envios_pendientes,
        MIN(created_at) as miembro_desde
       FROM orders
       WHERE user_id = $1`,
      [userId]
    );

    const summary = result.rows[0];

    // Asegurar fecha válida para miembro_desde
    let miembroDesde = new Date().toISOString();
    if (summary.miembro_desde && typeof summary.miembro_desde === 'object') {
      miembroDesde = summary.miembro_desde.toISOString();
    }

    res.json({
      totalFacturado: parseFloat(summary.total_facturado),
      totalPedidos: parseInt(summary.total_pedidos),
      pedidosEsteAño: parseInt(summary.pedidos_este_año),
      enviosPendientes: parseInt(summary.envios_pendientes),
      miembroDesde: miembroDesde,
      emailVerificado: true,
      contraseñaRobusta: true
    });
  } catch (error) {
    console.error('Error en account/summary:', error);
    res.status(500).json({ error: 'Error al obtener resumen de cuenta' });
  }
});

// Formatea una fila de `orders` al shape `Pedido` que espera el frontend
// (frontend/src/types/account.ts). `direccion` siempre se devuelve como
// objeto (nunca null): OrderDetail.tsx accede a pedido.direccion.calle sin
// optional chaining, y ya hubo un crash de este tipo con el perfil.
function serializarPedido(row) {
  return {
    id: String(row.id),
    numero: `PED-${String(row.id).padStart(6, '0')}`,
    fecha: row.created_at?.toISOString(),
    estado: row.status,
    total: parseFloat(row.total),
    items: row.items || [],
    direccion: row.direccion || { calle: '', ciudad: '', codigoPostal: '', pais: '' },
    estadoEnvio: row.estado_envio || undefined,
    codigoSeguimiento: row.codigo_seguimiento || undefined,
  };
}

app.get('/api/account/pedidos', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, created_at, status, total, items, direccion, estado_envio, codigo_seguimiento
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    const countResult = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      pedidos: result.rows.map(serializarPedido),
      total,
      paginas: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error('Error en account/pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.get('/api/account/pedidos/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT id, created_at, status, total, items, direccion, estado_envio, codigo_seguimiento
       FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(serializarPedido(result.rows[0]));
  } catch (error) {
    console.error('Error en account/pedidos/:id:', error);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
});

// "Envíos" es una vista derivada de `orders`, no una tabla propia: solo se
// consideran envío los pedidos que ya tienen datos de seguimiento (no todos
// los pedidos han llegado a esa fase). `timeline` se deja vacío — no existe
// ningún registro de eventos de tracking en la BD todavía, y el componente
// ShippingStatus.tsx no llega a renderizarlo hoy.
function serializarEnvio(row) {
  return {
    id: String(row.id),
    numeroPedido: `PED-${String(row.id).padStart(6, '0')}`,
    estado: row.estado_envio,
    transportista: row.transportista || 'Sin asignar',
    codigoSeguimiento: row.codigo_seguimiento || '',
    enlaceTracking: row.enlace_tracking || undefined,
    timeline: [],
  };
}

app.get('/api/account/envios', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, estado_envio, transportista, codigo_seguimiento, enlace_tracking
       FROM orders
       WHERE user_id = $1 AND estado_envio IS NOT NULL
       ORDER BY updated_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows.map(serializarEnvio));
  } catch (error) {
    console.error('Error en account/envios:', error);
    res.status(500).json({ error: 'Error al obtener envíos' });
  }
});

app.get('/api/account/envios/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, estado_envio, transportista, codigo_seguimiento, enlace_tracking
       FROM orders
       WHERE id = $1 AND user_id = $2 AND estado_envio IS NOT NULL`,
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }
    res.json(serializarEnvio(result.rows[0]));
  } catch (error) {
    console.error('Error en account/envios/:id:', error);
    res.status(500).json({ error: 'Error al obtener el envío' });
  }
});

// ============================================
// MI CUENTA: TICKETS DE SOPORTE
// ============================================

async function serializarTicket(row) {
  const ultimoMensaje = await pool.query(
    `SELECT created_at FROM support_ticket_messages WHERE ticket_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [row.id]
  );
  return {
    id: String(row.id),
    numero: `TCK-${String(row.id).padStart(6, '0')}`,
    asunto: row.asunto,
    estado: row.estado,
    categoria: row.categoria,
    fechaCreacion: row.created_at.toISOString(),
    ultimaRespuesta: (ultimoMensaje.rows[0]?.created_at || row.updated_at).toISOString(),
    // No hay tracking de "leído" implementado todavía — se devuelve 0 en
    // vez de inventar un número, para no mostrar un dato falso en el badge.
    respuestasNoLeidas: 0,
  };
}

app.get('/api/account/tickets', authMiddleware, async (req, res) => {
  try {
    const { estado } = req.query;
    const params = [req.user.userId];
    let where = 'WHERE user_id = $1';
    if (estado) {
      params.push(estado);
      where += ` AND estado = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT id, asunto, categoria, estado, created_at, updated_at FROM support_tickets ${where} ORDER BY updated_at DESC`,
      params
    );
    res.json(await Promise.all(result.rows.map(serializarTicket)));
  } catch (error) {
    console.error('Error en account/tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

app.post('/api/account/tickets', authMiddleware, async (req, res) => {
  try {
    const { asunto, descripcion, categoria } = req.body;
    if (!asunto || !descripcion) {
      return res.status(400).json({ error: 'Datos incompletos', message: 'Asunto y descripción son obligatorios' });
    }

    const ticketResult = await pool.query(
      `INSERT INTO support_tickets (user_id, asunto, categoria, estado) VALUES ($1, $2, $3, 'abierto') RETURNING *`,
      [req.user.userId, asunto, categoria || 'otro']
    );
    const ticket = ticketResult.rows[0];

    await pool.query(
      `INSERT INTO support_ticket_messages (ticket_id, remitente, contenido) VALUES ($1, 'cliente', $2)`,
      [ticket.id, descripcion]
    );

    res.status(201).json(await serializarTicket(ticket));
  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({ error: 'Error al crear el ticket' });
  }
});

app.get('/api/account/tickets/:id', authMiddleware, async (req, res) => {
  try {
    const ticketResult = await pool.query(
      `SELECT id, asunto, categoria, estado, created_at, updated_at FROM support_tickets WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const mensajesResult = await pool.query(
      `SELECT id, remitente, contenido, created_at FROM support_ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({
      ticket: await serializarTicket(ticketResult.rows[0]),
      mensajes: mensajesResult.rows.map((m) => ({
        id: String(m.id),
        remitente: m.remitente,
        contenido: m.contenido,
        fecha: m.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error en account/tickets/:id:', error);
    res.status(500).json({ error: 'Error al obtener la conversación' });
  }
});

app.post('/api/account/tickets/:id/mensajes', authMiddleware, async (req, res) => {
  try {
    const { mensaje } = req.body;
    if (!mensaje) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    const ticketResult = await pool.query(
      'SELECT id FROM support_tickets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    await pool.query(
      `INSERT INTO support_ticket_messages (ticket_id, remitente, contenido) VALUES ($1, 'cliente', $2)`,
      [req.params.id, mensaje]
    );
    // Un mensaje nuevo del cliente reabre el hilo de cara al equipo de
    // soporte si estaba resuelto/cerrado — no tiene sentido dejarlo
    // marcado como resuelto cuando el cliente acaba de volver a escribir.
    await pool.query(
      `UPDATE support_tickets SET estado = CASE WHEN estado IN ('resuelto', 'cerrado') THEN 'en_progreso' ELSE estado END, updated_at = NOW() WHERE id = $1`,
      [req.params.id]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error respondiendo ticket:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

// ============================================
// MI CUENTA: PERFIL
// ============================================

function serializarPerfil(user) {
  const [nombre, ...apellidos] = user.name.split(' ');
  return {
    id: user.id,
    nombre,
    apellidos: apellidos.join(' '),
    email: user.email,
    telefono: user.phone || '',
    empresa: user.empresa || '',
    direccion: user.direccion || undefined,
  };
}

app.get('/api/account/perfil', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT id, name, email, phone, empresa, direccion FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(serializarPerfil(result.rows[0]));
  } catch (error) {
    console.error('Error en account/perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

app.patch('/api/account/perfil', authMiddleware, async (req, res) => {
  try {
    const { nombre, apellidos, telefono, empresa, direccion } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const nombreCompleto = apellidos ? `${nombre} ${apellidos}` : nombre;

    const result = await pool.query(
      `UPDATE users SET
        name = $1,
        phone = COALESCE($2, phone),
        empresa = COALESCE($3, empresa),
        direccion = COALESCE($4, direccion),
        updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, empresa, direccion`,
      [nombreCompleto, telefono || null, empresa || null, direccion ? JSON.stringify(direccion) : null, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(serializarPerfil(result.rows[0]));
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

// ============================================
// CATALOG DOWNLOAD ROUTES
// ============================================

// Requiere sesión. La URL real del fichero nunca sale de este endpoint:
// se hace streaming del PDF, no una redirección a la URL de origen.
app.get('/api/catalogs/download', authMiddleware, async (req, res) => {
  try {
    const { slug, tipo } = req.query;

    if (!slug || !tipo || !['catalogo', 'tecnica'].includes(tipo)) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        message: 'Falta slug o tipo (catalogo|tecnica)'
      });
    }

    const ficha = catalogFichas[slug]?.[tipo];
    if (!ficha?.url) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'No existe ese fichero para esta colección'
      });
    }

    const userResult = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const user = userResult.rows[0];

    const origen = req.query.origen || req.get('referer') || null;
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || null;
    const ip = anonymizeIp(rawIp);

    // Dispositivo/navegador: se parsea en backend, no en frontend, para no
    // depender de dos fuentes que puedan discrepar.
    const ua = new UAParser(req.headers['user-agent'] || '').getResult();
    const deviceType = ua.device.type || 'desktop'; // ua-parser-js deja 'type' vacío cuando es desktop
    const browserName = ua.browser.name || null;
    const browserVersion = ua.browser.version || null;
    const osName = ua.os.name || null;
    const osVersion = ua.os.version || null;

    // Geo aproximada: cabeceras que Vercel inyecta automáticamente en cada
    // request (sin coste, sin llamada externa, sin dependencia de geo-IP).
    // En local (node api/index.js) no existen y quedan NULL.
    const country = req.headers['x-vercel-ip-country'] || null;
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null;

    // UTM y referer de campaña: los manda el frontend (capturados al
    // aterrizar en la web y reutilizados en descargas posteriores desde
    // localStorage), no se leen de esta request porque casi nunca la URL
    // de la propia descarga lleva UTMs.
    const { utm_source, utm_medium, utm_campaign, utm_content, utm_term, referer } = req.query;

    // Contadas ANTES de insertar la de ahora: si es 0, esta es su primera
    // descarga (dispara el email post-descarga más abajo, una sola vez).
    const previas = await pool.query(
      'SELECT COUNT(*)::int AS total, ARRAY_AGG(DISTINCT catalog_slug) AS slugs FROM catalog_downloads WHERE email = $1',
      [user.email]
    );
    const esPrimeraDescarga = previas.rows[0].total === 0;
    const coleccionesDescargadas = Array.from(new Set([...(previas.rows[0].slugs || []), slug]));

    // Se registra ANTES de servir el fichero: si el fetch de origen falla,
    // igualmente queremos constancia de que el usuario solicitó la descarga.
    await pool.query(
      `INSERT INTO catalog_downloads (
         user_id, email, nombre_completo, catalog_slug, catalog_nombre, tipo, ip, origen,
         user_agent, device_type, browser_name, browser_version, os_name, os_version,
         utm_source, utm_medium, utm_campaign, utm_content, utm_term, country, city, referer, created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())`,
      [
        user.id, user.email, user.name, slug, catalogNombreBySlug[slug] || slug, tipo, ip, origen,
        req.headers['user-agent'] || null, deviceType, browserName, browserVersion, osName, osVersion,
        utm_source || null, utm_medium || null, utm_campaign || null, utm_content || null, utm_term || null,
        country, city, referer || null
      ]
    );

    // CRM: siempre se sincroniza el contacto (tag + colecciones descargadas
    // como atributo), pero el email de "gracias por descargar" solo se
    // envía en la primera descarga de cada usuario para no saturar.
    await crmService.createOrUpdateContact({
      email: user.email,
      nombre: user.name,
      pais: country || undefined,
      tags: ['descarga_catalogo'],
      extraAttributes: {
        COLECCIONES_DESCARGADAS: coleccionesDescargadas.join(','),
        ULTIMA_DESCARGA: new Date().toISOString(),
      },
    });
    if (esPrimeraDescarga) {
      const emailPostDescarga = emailTemplates.postDescarga(user.name);
      await crmService.sendTransactionalEmail({
        to: user.email,
        toName: user.name,
        subject: emailPostDescarga.subject,
        html: emailPostDescarga.html,
      });
    }

    // Si es de R2 y hay credenciales configuradas, se pide con URL firmada
    // de corta expiración (nunca sale del servidor); si no, se usa la URL
    // pública tal cual (fallback mientras el bucket siga siendo público o
    // para las fichas que están en Cloudinary, fuera del alcance de esta
    // migración a R2 privado).
    const fetchUrl = ficha.provider === 'r2' && r2Configured
      ? await getSignedCatalogUrl(ficha.key)
      : ficha.url;

    const fileResponse = await fetch(fetchUrl);
    if (!fileResponse.ok || !fileResponse.body) {
      // Se loguea la URL pública de referencia, nunca la firmada (no tiene
      // sentido dejar una URL con firma válida, aunque sea de 60s, en logs).
      console.error(`Error descargando fichero origen (${ficha.url}): ${fileResponse.status}`);
      return res.status(502).json({
        error: 'Error al obtener el fichero',
        message: 'No se pudo descargar el catálogo. Inténtalo de nuevo en unos minutos.'
      });
    }

    const extension = path.extname(new URL(ficha.url).pathname) || '.pdf';
    const filename = `newzeland-${slug}-${tipo}${extension}`;

    res.setHeader('Content-Type', fileResponse.headers.get('content-type') || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    Readable.fromWeb(fileResponse.body).pipe(res);
  } catch (error) {
    console.error('Error en catalogs/download:', error);
    res.status(500).json({ error: 'Error al procesar la descarga', message: error.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

function toCsv(rows, columns) {
  const escape = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const header = columns.map((c) => c.label).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(','));
  return [header, ...lines].join('\n');
}

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    const whereClause = search ? 'WHERE u.name ILIKE $1 OR u.email ILIKE $1' : '';
    const params = search ? [search] : [];

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.empresa, u.role, u.email_verified, u.created_at,
              COUNT(cd.id) AS downloads_count
       FROM users u
       LEFT JOIN catalog_downloads cd ON cd.user_id = u.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );

    res.json({
      usuarios: result.rows.map((u) => ({
        id: u.id,
        nombre: u.name,
        email: u.email,
        telefono: u.phone,
        empresa: u.empresa,
        role: u.role,
        emailVerificado: u.email_verified,
        fechaAlta: u.created_at,
        descargasCount: parseInt(u.downloads_count)
      })),
      total: parseInt(countResult.rows[0].count),
      pagina: page,
      porPagina: limit
    });
  } catch (error) {
    console.error('Error en admin/users:', error);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

app.get('/api/admin/users/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.empresa, u.role, u.email_verified, u.created_at,
              COUNT(cd.id) AS downloads_count
       FROM users u
       LEFT JOIN catalog_downloads cd ON cd.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    const csv = toCsv(result.rows, [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'empresa', label: 'Empresa' },
      { key: 'role', label: 'Rol' },
      { key: 'email_verified', label: 'Email verificado' },
      { key: 'downloads_count', label: 'Descargas' },
      { key: 'created_at', label: 'Fecha alta' }
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="usuarios-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en admin/users/export:', error);
    res.status(500).json({ error: 'Error al exportar usuarios' });
  }
});

function buildCatalogDownloadsFilter(query) {
  const conditions = [];
  const params = [];

  if (query.userId) {
    params.push(query.userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (query.slug) {
    params.push(query.slug);
    conditions.push(`catalog_slug = $${params.length}`);
  }
  if (query.dateFrom) {
    params.push(query.dateFrom);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (query.dateTo) {
    params.push(query.dateTo);
    conditions.push(`created_at <= $${params.length}::date + INTERVAL '1 day'`);
  }
  if (query.deviceType) {
    params.push(query.deviceType);
    conditions.push(`device_type = $${params.length}`);
  }
  if (query.utmSource) {
    params.push(query.utmSource);
    conditions.push(`utm_source = $${params.length}`);
  }
  if (query.country) {
    params.push(query.country);
    conditions.push(`country = $${params.length}`);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

app.get('/api/admin/catalog-downloads', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const { where, params } = buildCatalogDownloadsFilter(req.query);

    const result = await pool.query(
      `SELECT id, user_id, email, nombre_completo, catalog_slug, catalog_nombre, tipo, ip, origen,
              device_type, browser_name, browser_version, os_name, os_version,
              utm_source, utm_medium, utm_campaign, utm_content, utm_term, country, city, referer, created_at
       FROM catalog_downloads
       ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM catalog_downloads ${where}`,
      params
    );

    res.json({
      descargas: result.rows,
      total: parseInt(countResult.rows[0].count),
      pagina: page,
      porPagina: limit
    });
  } catch (error) {
    console.error('Error en admin/catalog-downloads:', error);
    res.status(500).json({ error: 'Error al listar descargas' });
  }
});

app.get('/api/admin/catalog-downloads/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { where, params } = buildCatalogDownloadsFilter(req.query);

    const result = await pool.query(
      `SELECT id, user_id, email, nombre_completo, catalog_slug, catalog_nombre, tipo, ip, origen,
              user_agent, device_type, browser_name, browser_version, os_name, os_version,
              utm_source, utm_medium, utm_campaign, utm_content, utm_term, country, city, referer, created_at
       FROM catalog_downloads
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    const csv = toCsv(result.rows, [
      { key: 'id', label: 'ID' },
      { key: 'user_id', label: 'User ID' },
      { key: 'email', label: 'Email' },
      { key: 'nombre_completo', label: 'Nombre' },
      { key: 'catalog_slug', label: 'Colección (slug)' },
      { key: 'catalog_nombre', label: 'Colección' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'device_type', label: 'Dispositivo' },
      { key: 'browser_name', label: 'Navegador' },
      { key: 'browser_version', label: 'Versión navegador' },
      { key: 'os_name', label: 'SO' },
      { key: 'os_version', label: 'Versión SO' },
      { key: 'utm_source', label: 'UTM Source' },
      { key: 'utm_medium', label: 'UTM Medium' },
      { key: 'utm_campaign', label: 'UTM Campaign' },
      { key: 'utm_content', label: 'UTM Content' },
      { key: 'utm_term', label: 'UTM Term' },
      { key: 'country', label: 'País' },
      { key: 'city', label: 'Ciudad' },
      { key: 'referer', label: 'Referer' },
      { key: 'ip', label: 'IP (anonimizada)' },
      { key: 'origen', label: 'Origen' },
      { key: 'user_agent', label: 'User-Agent' },
      { key: 'created_at', label: 'Fecha' }
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="descargas-catalogo-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en admin/catalog-downloads/export:', error);
    res.status(500).json({ error: 'Error al exportar descargas' });
  }
});

// ============================================
// LEADS: FORMULARIOS DE NEGOCIO (CONTACTO, PRESUPUESTO, PARTNERS)
// ============================================

// POST /api/contacts – Formulario de contacto general
app.post('/api/contacts', async (req, res) => {
  try {
    const { nombre_completo, email, telefono, asunto, mensaje } = req.body;

    // Validación
    if (!nombre_completo || !email || !mensaje) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre, email y mensaje son obligatorios'
      });
    }

    const context = captureRequestContext(req);

    await pool.query(
      `INSERT INTO contacts (nombre_completo, email, telefono, asunto, mensaje, utm_source, utm_medium, utm_campaign, country, ip_anonima, user_agent, device_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [nombre_completo, email, telefono || null, asunto || null, mensaje, context.utmSource, context.utmMedium, context.utmCampaign, context.country, context.ip, context.userAgent, context.deviceType]
    );

    await crmService.createOrUpdateContact({
      email,
      nombre: nombre_completo,
      telefono: telefono || undefined,
      pais: context.country || undefined,
      tags: ['lead_contacto'],
      extraAttributes: asunto ? { ULTIMO_ASUNTO_CONTACTO: asunto } : {},
    });

    res.json({
      success: true,
      message: 'Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos pronto.'
    });
  } catch (error) {
    console.error('Error en POST /api/contacts:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

// POST /api/quote-requests – Solicitud de presupuesto
app.post('/api/quote-requests', async (req, res) => {
  try {
    const { nombre_completo, email, telefono, tipo_proyecto, tipo_espacio, descripcion, archivos_url } = req.body;

    // Validación
    if (!nombre_completo || !email || !telefono || !descripcion) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre, email, teléfono y descripción son obligatorios'
      });
    }

    const context = captureRequestContext(req);
    const userId = req.user?.id || null; // Si está logueado, guardar user_id

    await pool.query(
      `INSERT INTO quote_requests (nombre_completo, email, telefono, tipo_proyecto, tipo_espacio, descripcion, archivos_url, utm_source, utm_medium, utm_campaign, country, ip_anonima, user_agent, device_type, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [nombre_completo, email, telefono, tipo_proyecto || null, tipo_espacio || null, descripcion, archivos_url || null, context.utmSource, context.utmMedium, context.utmCampaign, context.country, context.ip, context.userAgent, context.deviceType, userId]
    );

    await crmService.createOrUpdateContact({
      email,
      nombre: nombre_completo,
      telefono,
      pais: context.country || undefined,
      tags: ['lead_presupuesto'],
      extraAttributes: {
        ...(tipo_proyecto ? { TIPO_PROYECTO: tipo_proyecto } : {}),
        ...(tipo_espacio ? { TIPO_ESPACIO: tipo_espacio } : {}),
      },
    });
    const emailPresupuesto = emailTemplates.presupuestoRecibido(nombre_completo);
    await crmService.sendTransactionalEmail({
      to: email,
      toName: nombre_completo,
      subject: emailPresupuesto.subject,
      html: emailPresupuesto.html,
    });

    res.json({
      success: true,
      message: 'Gracias por tu solicitud. Hemos recibido tu proyecto y te contactaremos para revisar detalles y enviarte un presupuesto.'
    });
  } catch (error) {
    console.error('Error en POST /api/quote-requests:', error);
    res.status(500).json({ error: 'Error al enviar la solicitud' });
  }
});

// POST /api/partners – Registro de profesionales
app.post('/api/partners', async (req, res) => {
  try {
    const { nombre_completo, email, telefono, empresa, tipo_profesional, web_portfolio, ciudad, pais, descripcion } = req.body;

    // Validación
    if (!nombre_completo || !email || !telefono) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre, email y teléfono son obligatorios'
      });
    }

    const context = captureRequestContext(req);
    const userId = req.user?.id || null;

    await pool.query(
      `INSERT INTO partners (nombre_completo, email, telefono, empresa, tipo_profesional, web_portfolio, ciudad, pais, descripcion, utm_source, utm_medium, utm_campaign, country, ip_anonima, user_agent, device_type, user_id, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [nombre_completo, email, telefono, empresa || null, tipo_profesional || null, web_portfolio || null, ciudad || null, pais || null, descripcion || null, context.utmSource, context.utmMedium, context.utmCampaign, context.country, context.ip, context.userAgent, context.deviceType, userId, 'pendiente']
    );

    await crmService.createOrUpdateContact({
      email,
      nombre: nombre_completo,
      telefono,
      pais: pais || context.country || undefined,
      tipoCliente: 'profesional',
      tags: ['partner_pendiente'],
      extraAttributes: {
        ...(empresa ? { EMPRESA: empresa } : {}),
        ...(tipo_profesional ? { TIPO_PROFESIONAL: tipo_profesional } : {}),
      },
    });

    res.json({
      success: true,
      message: 'Gracias por tu solicitud de registro como profesional. Revisaremos tus datos y te contactaremos para confirmar tu condición de partner.'
    });
  } catch (error) {
    console.error('Error en POST /api/partners:', error);
    res.status(500).json({ error: 'Error al enviar la solicitud' });
  }
});

// ============================================
// ADMIN: GESTIÓN DE LEADS (CONTACTOS, PRESUPUESTOS, PARTNERS)
// ============================================

// GET /api/admin/contacts – Listar contactos
app.get('/api/admin/contacts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, search = '', date_from, date_to, asunto, country } = req.query;
    const pageSize = 20;
    const offset = (parseInt(page) - 1) * pageSize;

    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      where += ` AND (nombre_completo ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (asunto) {
      where += ` AND asunto ILIKE $${paramIndex}`;
      params.push(`%${asunto}%`);
      paramIndex++;
    }
    if (country) {
      where += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND created_at <= $${paramIndex}`;
      params.push(`${date_to}T23:59:59`);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT id, nombre_completo, email, telefono, asunto, mensaje, country, created_at
       FROM contacts
       ${where}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM contacts ${where}`, params);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      data: result.rows,
      total,
      page: parseInt(page),
      pageSize,
      pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Error en GET /api/admin/contacts:', error);
    res.status(500).json({ error: 'Error al listar contactos' });
  }
});

// GET /api/admin/contacts/export – Exportar contactos a CSV
app.get('/api/admin/contacts/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { date_from, date_to, asunto, country } = req.query;

    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (asunto) {
      where += ` AND asunto ILIKE $${paramIndex}`;
      params.push(`%${asunto}%`);
      paramIndex++;
    }
    if (country) {
      where += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND created_at <= $${paramIndex}`;
      params.push(`${date_to}T23:59:59`);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT nombre_completo, email, telefono, asunto, mensaje, country, device_type, created_at
       FROM contacts
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    const csv = toCsv(result.rows, [
      { key: 'nombre_completo', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'asunto', label: 'Asunto' },
      { key: 'mensaje', label: 'Mensaje' },
      { key: 'country', label: 'País' },
      { key: 'device_type', label: 'Dispositivo' },
      { key: 'created_at', label: 'Fecha' }
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="contactos-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en GET /api/admin/contacts/export:', error);
    res.status(500).json({ error: 'Error al exportar contactos' });
  }
});

// GET /api/admin/quote-requests – Listar solicitudes de presupuesto
app.get('/api/admin/quote-requests', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, search = '', date_from, date_to, tipo_proyecto, country } = req.query;
    const pageSize = 20;
    const offset = (parseInt(page) - 1) * pageSize;

    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      where += ` AND (nombre_completo ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (tipo_proyecto) {
      where += ` AND tipo_proyecto ILIKE $${paramIndex}`;
      params.push(`%${tipo_proyecto}%`);
      paramIndex++;
    }
    if (country) {
      where += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND created_at <= $${paramIndex}`;
      params.push(`${date_to}T23:59:59`);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT id, nombre_completo, email, telefono, tipo_proyecto, tipo_espacio, descripcion, country, created_at
       FROM quote_requests
       ${where}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM quote_requests ${where}`, params);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      data: result.rows,
      total,
      page: parseInt(page),
      pageSize,
      pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Error en GET /api/admin/quote-requests:', error);
    res.status(500).json({ error: 'Error al listar solicitudes' });
  }
});

// GET /api/admin/quote-requests/export – Exportar presupuestos a CSV
app.get('/api/admin/quote-requests/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { date_from, date_to, tipo_proyecto, country } = req.query;

    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (tipo_proyecto) {
      where += ` AND tipo_proyecto ILIKE $${paramIndex}`;
      params.push(`%${tipo_proyecto}%`);
      paramIndex++;
    }
    if (country) {
      where += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND created_at <= $${paramIndex}`;
      params.push(`${date_to}T23:59:59`);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT nombre_completo, email, telefono, tipo_proyecto, tipo_espacio, descripcion, country, device_type, created_at
       FROM quote_requests
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    const csv = toCsv(result.rows, [
      { key: 'nombre_completo', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'tipo_proyecto', label: 'Tipo de Proyecto' },
      { key: 'tipo_espacio', label: 'Tipo de Espacio' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'country', label: 'País' },
      { key: 'device_type', label: 'Dispositivo' },
      { key: 'created_at', label: 'Fecha' }
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="presupuestos-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en GET /api/admin/quote-requests/export:', error);
    res.status(500).json({ error: 'Error al exportar presupuestos' });
  }
});

// GET /api/admin/partners – Listar profesionales
app.get('/api/admin/partners', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, search = '', date_from, date_to, tipo_profesional, estado, country } = req.query;
    const pageSize = 20;
    const offset = (parseInt(page) - 1) * pageSize;

    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      where += ` AND (nombre_completo ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (tipo_profesional) {
      where += ` AND tipo_profesional ILIKE $${paramIndex}`;
      params.push(`%${tipo_profesional}%`);
      paramIndex++;
    }
    if (estado) {
      where += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }
    if (country) {
      where += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND created_at <= $${paramIndex}`;
      params.push(`${date_to}T23:59:59`);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT id, nombre_completo, email, telefono, empresa, tipo_profesional, ciudad, pais, estado, created_at
       FROM partners
       ${where}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM partners ${where}`, params);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      data: result.rows,
      total,
      page: parseInt(page),
      pageSize,
      pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Error en GET /api/admin/partners:', error);
    res.status(500).json({ error: 'Error al listar profesionales' });
  }
});

// PUT /api/admin/partners/:id – Cambiar estado (pendiente/aprobado/rechazado).
// Añadido junto con la integración CRM (E3): es el disparador del flujo
// "partner aprobado" (tag + email), que no tenía ningún endpoint que lo
// pudiera producir hasta ahora.
app.put('/api/admin/partners/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;
    if (!['pendiente', 'aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido', message: 'Estado debe ser pendiente, aprobado o rechazado' });
    }

    const result = await pool.query(
      'UPDATE partners SET estado = $1 WHERE id = $2 RETURNING nombre_completo, email, estado',
      [estado, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profesional no encontrado' });
    }

    const partner = result.rows[0];

    if (estado === 'aprobado') {
      await crmService.createOrUpdateContact({
        email: partner.email,
        nombre: partner.nombre_completo,
        tipoCliente: 'profesional',
        tags: ['partner_aprobado'],
      });
      const emailAprobado = emailTemplates.partnerAprobado(partner.nombre_completo);
      await crmService.sendTransactionalEmail({
        to: partner.email,
        toName: partner.nombre_completo,
        subject: emailAprobado.subject,
        html: emailAprobado.html,
      });
    }

    res.json({ success: true, estado: partner.estado });
  } catch (error) {
    console.error('Error en PUT /api/admin/partners/:id:', error);
    res.status(500).json({ error: 'Error al actualizar el profesional' });
  }
});

// GET /api/admin/partners/export – Exportar profesionales a CSV
app.get('/api/admin/partners/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { date_from, date_to, tipo_profesional, estado, country } = req.query;

    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (tipo_profesional) {
      where += ` AND tipo_profesional ILIKE $${paramIndex}`;
      params.push(`%${tipo_profesional}%`);
      paramIndex++;
    }
    if (estado) {
      where += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }
    if (country) {
      where += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }
    if (date_from) {
      where += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      where += ` AND created_at <= $${paramIndex}`;
      params.push(`${date_to}T23:59:59`);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT nombre_completo, email, telefono, empresa, tipo_profesional, ciudad, pais, web_portfolio, estado, created_at
       FROM partners
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    const csv = toCsv(result.rows, [
      { key: 'nombre_completo', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'empresa', label: 'Empresa' },
      { key: 'tipo_profesional', label: 'Tipo de Profesional' },
      { key: 'ciudad', label: 'Ciudad' },
      { key: 'pais', label: 'País' },
      { key: 'web_portfolio', label: 'Web/Portfolio' },
      { key: 'estado', label: 'Estado' },
      { key: 'created_at', label: 'Fecha' }
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="profesionales-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en GET /api/admin/partners/export:', error);
    res.status(500).json({ error: 'Error al exportar profesionales' });
  }
});

// GET /api/catalog – Catálogo público (mismo dato que ya se bundlea en el
// frontend vía catalogo.json). Se expone también por HTTP para que
// servicios externos al monorepo (ej. whatsapp-bot/, desplegado aparte)
// puedan consultarlo sin necesitar acceso al sistema de ficheros del
// frontend — nunca incluye api/data/catalog-fichas.json (eso sigue privado).
app.get('/api/catalog', (req, res) => {
  res.json(catalogoData);
});

// GET /api/collections — catálogo migrado a BD. Sin filtros de query: las
// ~90 filas viajan completas en una respuesta y el filtrado vive en el
// cliente (ver docs/superpowers/specs/2026-07-29-filtros-collections-design.md).
// Alias de columnas (slug->id, imagen_portada->imagen) para que el
// resultado sea estructuralmente compatible con el tipo `Serie` que ya
// consumen SeriesCard/AddToCartBox — cero adaptador en el frontend.
app.get('/api/collections', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        slug AS id,
        nombre,
        descripcion,
        imagen_portada AS imagen,
        material,
        tipo,
        formatos,
        acabados,
        colores,
        precio_consultable,
        acabado_corte,
        espesor,
        estilo,
        especificaciones_verificadas
      FROM collections
      ORDER BY nombre ASC
    `);
    res.json({ collections: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error en GET /api/collections:', error);
    res.status(500).json({ error: 'Error obteniendo colecciones' });
  }
});

// GET /api/collections/:slug — ficha de detalle. Incluye colores_fotos
// (nombre+imagen por color), que la lista general no necesita y por eso
// no se manda ahí — evita inflar esa respuesta con ~85 series completas.
app.get('/api/collections/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        slug AS id,
        nombre,
        descripcion,
        imagen_portada AS imagen,
        material,
        tipo,
        formatos,
        acabados,
        colores,
        colores_fotos,
        precio_consultable,
        acabado_corte,
        espesor,
        estilo,
        especificaciones_verificadas
      FROM collections
      WHERE slug = $1`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en GET /api/collections/:slug:', error);
    res.status(500).json({ error: 'Error obteniendo la colección' });
  }
});

// ============================================
// ADMIN: CRUD DE COLLECTIONS
// ============================================

app.get('/api/admin/collections', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, slug, nombre, descripcion, imagen_portada, material, tipo,
             formatos, acabados, colores, precio_consultable, acabado_corte,
             espesor, estilo, especificaciones_verificadas, created_at, updated_at
      FROM collections
      ORDER BY nombre ASC
    `);
    res.json({ collections: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Error en GET /api/admin/collections:', error);
    res.status(500).json({ error: 'Error al listar colecciones' });
  }
});

app.post('/api/admin/collections', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      slug, nombre, descripcion, imagen_portada, material, tipo, formatos,
      acabados, colores, precio_consultable, acabado_corte, espesor, estilo,
      especificaciones_verificadas,
    } = req.body;

    if (!slug || !nombre) {
      return res.status(400).json({ error: 'Datos incompletos', message: 'slug y nombre son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO collections (
        slug, nombre, descripcion, imagen_portada, material, tipo, formatos,
        acabados, colores, precio_consultable, acabado_corte, espesor, estilo,
        especificaciones_verificadas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        slug, nombre, descripcion || null, imagen_portada || null, material || null,
        tipo || [], formatos || [], acabados || [], colores || [],
        precio_consultable !== undefined ? precio_consultable : true,
        acabado_corte || 'Rectificado', espesor || 10.0, estilo || 'Moderno',
        especificaciones_verificadas || false,
      ]
    );
    res.status(201).json({ success: true, collection: result.rows[0] });
  } catch (error) {
    console.error('Error en POST /api/admin/collections:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una colección con ese slug' });
    }
    res.status(500).json({ error: 'Error al crear la colección' });
  }
});

app.put('/api/admin/collections/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      nombre, descripcion, imagen_portada, material, tipo, formatos, acabados,
      colores, precio_consultable, acabado_corte, espesor, estilo,
      especificaciones_verificadas,
    } = req.body;

    const result = await pool.query(
      `UPDATE collections SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        imagen_portada = COALESCE($3, imagen_portada),
        material = COALESCE($4, material),
        tipo = COALESCE($5, tipo),
        formatos = COALESCE($6, formatos),
        acabados = COALESCE($7, acabados),
        colores = COALESCE($8, colores),
        precio_consultable = COALESCE($9, precio_consultable),
        acabado_corte = COALESCE($10, acabado_corte),
        espesor = COALESCE($11, espesor),
        estilo = COALESCE($12, estilo),
        especificaciones_verificadas = COALESCE($13, especificaciones_verificadas),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [
        nombre || null, descripcion || null, imagen_portada || null, material || null,
        tipo || null, formatos || null, acabados || null, colores || null,
        precio_consultable !== undefined ? precio_consultable : null,
        acabado_corte || null, espesor !== undefined ? espesor : null, estilo || null,
        especificaciones_verificadas !== undefined ? especificaciones_verificadas : null,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    res.json({ success: true, collection: result.rows[0] });
  } catch (error) {
    console.error('Error en PUT /api/admin/collections/:id:', error);
    res.status(500).json({ error: 'Error al actualizar la colección' });
  }
});

app.delete('/api/admin/collections/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM collections WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/admin/collections/:id:', error);
    res.status(500).json({ error: 'Error al eliminar la colección' });
  }
});

app.get('/api/admin/collections/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT slug, nombre, material, tipo, formatos, acabados, acabado_corte,
             espesor, estilo, especificaciones_verificadas, created_at
      FROM collections
      ORDER BY nombre ASC
    `);

    const csv = toCsv(
      result.rows.map((r) => ({
        ...r,
        tipo: (r.tipo || []).join(', '),
        formatos: (r.formatos || []).join(', '),
        acabados: (r.acabados || []).join(', '),
      })),
      [
        { key: 'slug', label: 'Slug' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'material', label: 'Material' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'formatos', label: 'Formatos' },
        { key: 'acabados', label: 'Acabados' },
        { key: 'acabado_corte', label: 'Acabado de corte' },
        { key: 'espesor', label: 'Espesor (mm)' },
        { key: 'estilo', label: 'Estilo' },
        { key: 'especificaciones_verificadas', label: 'Especificaciones verificadas' },
        { key: 'created_at', label: 'Creado' },
      ]
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="collections-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en GET /api/admin/collections/export:', error);
    res.status(500).json({ error: 'Error al exportar colecciones' });
  }
});

// ============================================
// PROJECTS / CASOS DE ÉXITO
// ============================================

// GET /api/projects – Listado público de proyectos
app.get('/api/projects', async (req, res) => {
  try {
    const { tipo_espacio, collection, pais, destacado, page = 1, pageSize = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let where = "WHERE estado = 'publicado'";
    const params = [];
    let paramIndex = 1;

    if (tipo_espacio) {
      where += ` AND tipo_espacio = $${paramIndex}`;
      params.push(tipo_espacio);
      paramIndex++;
    }
    if (collection) {
      where += ` AND colecciones_usadas @> $${paramIndex}`;
      params.push(JSON.stringify([collection]));
      paramIndex++;
    }
    if (pais) {
      where += ` AND ubicacion_pais = $${paramIndex}`;
      params.push(pais);
      paramIndex++;
    }
    if (destacado === 'true') {
      where += ` AND destacado = true`;
    }

    const result = await pool.query(
      `SELECT id, titulo, slug, descripcion_corta, tipo_espacio, ubicacion_ciudad, ubicacion_pais,
              colecciones_usadas, imagen_portada, destacado, ano_ejecucion
       FROM projects
       ${where}
       ORDER BY destacado DESC, orden ASC, created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(pageSize), offset]
    );

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM projects ${where}`, params);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      data: result.rows,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      pages: Math.ceil(total / parseInt(pageSize))
    });
  } catch (error) {
    console.error('Error en GET /api/projects:', error);
    res.status(500).json({ error: 'Error al listar proyectos' });
  }
});

// GET /api/projects/:slug – Detalle de un proyecto
app.get('/api/projects/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT * FROM projects WHERE slug = $1 AND estado = 'publicado'`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en GET /api/projects/:slug:', error);
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
});

// ============================================
// ADMIN: GESTIÓN DE PROYECTOS
// ============================================

// GET /api/admin/projects – Listado de proyectos (incluyendo borradores)
app.get('/api/admin/projects', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { estado, tipo_espacio, collection, pais, destacado, page = 1, pageSize = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (estado) {
      where += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }
    if (tipo_espacio) {
      where += ` AND tipo_espacio = $${paramIndex}`;
      params.push(tipo_espacio);
      paramIndex++;
    }
    if (collection) {
      where += ` AND colecciones_usadas @> $${paramIndex}`;
      params.push(JSON.stringify([collection]));
      paramIndex++;
    }
    if (pais) {
      where += ` AND ubicacion_pais = $${paramIndex}`;
      params.push(pais);
      paramIndex++;
    }
    if (destacado === 'true' || destacado === 'false') {
      where += ` AND destacado = $${paramIndex}`;
      params.push(destacado === 'true');
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT id, titulo, slug, tipo_espacio, ubicacion_ciudad, ubicacion_pais, colecciones_usadas,
              estado, destacado, orden, created_at, updated_at
       FROM projects
       ${where}
       ORDER BY orden ASC, created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(pageSize), offset]
    );

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM projects ${where}`, params);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      data: result.rows,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      pages: Math.ceil(total / parseInt(pageSize))
    });
  } catch (error) {
    console.error('Error en GET /api/admin/projects:', error);
    res.status(500).json({ error: 'Error al listar proyectos' });
  }
});

// POST /api/admin/projects – Crear nuevo proyecto
app.post('/api/admin/projects', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { titulo, slug, descripcion_corta, descripcion, tipo_espacio, subtipo_espacio,
            ubicacion_ciudad, ubicacion_pais, ano_ejecucion, colecciones_usadas,
            imagenes, imagen_portada, destacado, estado, orden } = req.body;

    if (!titulo || !slug || !descripcion || !tipo_espacio) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Título, slug, descripción y tipo de espacio son obligatorios'
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (titulo, slug, descripcion_corta, descripcion, tipo_espacio,
                             subtipo_espacio, ubicacion_ciudad, ubicacion_pais, ano_ejecucion,
                             colecciones_usadas, imagenes, imagen_portada, destacado, estado, orden)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [titulo, slug, descripcion_corta || null, descripcion, tipo_espacio, subtipo_espacio || null,
       ubicacion_ciudad || null, ubicacion_pais || null, ano_ejecucion || null,
       colecciones_usadas ? JSON.stringify(colecciones_usadas) : null,
       imagenes ? JSON.stringify(imagenes) : null,
       imagen_portada || null, destacado || false, estado || 'publicado', orden || 0]
    );

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El slug ya existe' });
    }
    console.error('Error en POST /api/admin/projects:', error);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
});

// PUT /api/admin/projects/:id – Actualizar proyecto
app.put('/api/admin/projects/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, slug, descripcion_corta, descripcion, tipo_espacio, subtipo_espacio,
            ubicacion_ciudad, ubicacion_pais, ano_ejecucion, colecciones_usadas,
            imagenes, imagen_portada, destacado, estado, orden } = req.body;

    const result = await pool.query(
      `UPDATE projects SET
        titulo = COALESCE($1, titulo),
        slug = COALESCE($2, slug),
        descripcion_corta = COALESCE($3, descripcion_corta),
        descripcion = COALESCE($4, descripcion),
        tipo_espacio = COALESCE($5, tipo_espacio),
        subtipo_espacio = COALESCE($6, subtipo_espacio),
        ubicacion_ciudad = COALESCE($7, ubicacion_ciudad),
        ubicacion_pais = COALESCE($8, ubicacion_pais),
        ano_ejecucion = COALESCE($9, ano_ejecucion),
        colecciones_usadas = COALESCE($10, colecciones_usadas),
        imagenes = COALESCE($11, imagenes),
        imagen_portada = COALESCE($12, imagen_portada),
        destacado = COALESCE($13, destacado),
        estado = COALESCE($14, estado),
        orden = COALESCE($15, orden),
        updated_at = NOW()
       WHERE id = $16
       RETURNING *`,
      [titulo || null, slug || null, descripcion_corta || null, descripcion || null,
       tipo_espacio || null, subtipo_espacio || null,
       ubicacion_ciudad || null, ubicacion_pais || null, ano_ejecucion || null,
       colecciones_usadas ? JSON.stringify(colecciones_usadas) : null,
       imagenes ? JSON.stringify(imagenes) : null,
       imagen_portada || null, destacado !== undefined ? destacado : null,
       estado || null, orden !== undefined ? orden : null, parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El slug ya existe' });
    }
    console.error('Error en PUT /api/admin/projects/:id:', error);
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
});

// DELETE /api/admin/projects/:id – Eliminar proyecto
app.delete('/api/admin/projects/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM projects WHERE id = $1 RETURNING id`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ success: true, message: 'Proyecto eliminado' });
  } catch (error) {
    console.error('Error en DELETE /api/admin/projects/:id:', error);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
});

// GET /api/admin/projects/export – Exportar proyectos a CSV
app.get('/api/admin/projects/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { estado, tipo_espacio, pais } = req.query;

    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (estado) {
      where += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }
    if (tipo_espacio) {
      where += ` AND tipo_espacio = $${paramIndex}`;
      params.push(tipo_espacio);
      paramIndex++;
    }
    if (pais) {
      where += ` AND ubicacion_pais = $${paramIndex}`;
      params.push(pais);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT titulo, slug, tipo_espacio, subtipo_espacio, ubicacion_ciudad, ubicacion_pais,
              ano_ejecucion, estado, destacado, created_at, updated_at
       FROM projects
       ${where}
       ORDER BY orden ASC`,
      params
    );

    const csv = toCsv(result.rows, [
      { key: 'titulo', label: 'Título' },
      { key: 'slug', label: 'Slug' },
      { key: 'tipo_espacio', label: 'Tipo de Espacio' },
      { key: 'subtipo_espacio', label: 'Subtipo' },
      { key: 'ubicacion_ciudad', label: 'Ciudad' },
      { key: 'ubicacion_pais', label: 'País' },
      { key: 'ano_ejecucion', label: 'Año' },
      { key: 'estado', label: 'Estado' },
      { key: 'destacado', label: 'Destacado' },
      { key: 'created_at', label: 'Creado' },
      { key: 'updated_at', label: 'Actualizado' }
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="proyectos-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en GET /api/admin/projects/export:', error);
    res.status(500).json({ error: 'Error al exportar proyectos' });
  }
});

// ============================================
// CRM / EMAIL (E3) — vista agregada para el panel de admin.
// No existe una tabla "contactos unificados" propia: el modelo es
// conceptual y estas queries lo materializan al vuelo combinando
// users/contacts/quote_requests/partners/catalog_downloads por email.
// ============================================

app.get('/api/admin/crm/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalContactos = await pool.query(`
      SELECT COUNT(DISTINCT email) AS total FROM (
        SELECT email FROM users
        UNION SELECT email FROM contacts
        UNION SELECT email FROM quote_requests
        UNION SELECT email FROM partners
        UNION SELECT email FROM catalog_downloads
      ) AS todos
    `);

    const nuevosEsteMes = await pool.query(`
      SELECT COUNT(*)::int AS total FROM users WHERE created_at >= date_trunc('month', NOW())
    `);

    const porOrigen = await pool.query(`
      SELECT 'registro_web' AS origen, COUNT(*)::int AS total FROM users
      UNION ALL SELECT 'descarga_catalogo', COUNT(DISTINCT email)::int FROM catalog_downloads
      UNION ALL SELECT 'lead_contacto', COUNT(*)::int FROM contacts
      UNION ALL SELECT 'lead_presupuesto', COUNT(*)::int FROM quote_requests
      UNION ALL SELECT 'partner_pendiente', COUNT(*)::int FROM partners WHERE estado = 'pendiente'
      UNION ALL SELECT 'partner_aprobado', COUNT(*)::int FROM partners WHERE estado = 'aprobado'
    `);

    const topCampanias = await pool.query(`
      SELECT utm_campaign, COUNT(DISTINCT email)::int AS contactos
      FROM (
        SELECT utm_campaign, email FROM catalog_downloads WHERE utm_campaign IS NOT NULL
        UNION ALL SELECT utm_campaign, email FROM contacts WHERE utm_campaign IS NOT NULL
        UNION ALL SELECT utm_campaign, email FROM quote_requests WHERE utm_campaign IS NOT NULL
        UNION ALL SELECT utm_campaign, email FROM partners WHERE utm_campaign IS NOT NULL
      ) AS eventos
      GROUP BY utm_campaign
      ORDER BY contactos DESC
      LIMIT 5
    `);

    res.json({
      crmHabilitado: crmService.isEnabled(),
      totalContactos: parseInt(totalContactos.rows[0].total),
      nuevosEsteMes: nuevosEsteMes.rows[0].total,
      porOrigen: porOrigen.rows.reduce((acc, row) => ({ ...acc, [row.origen]: row.total }), {}),
      topCampanias: topCampanias.rows,
    });
  } catch (error) {
    console.error('Error en GET /api/admin/crm/stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de CRM' });
  }
});

app.get('/api/admin/crm/contacts/export', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT email, nombre, origen, tipo, pais, fecha
      FROM (
        SELECT email, name AS nombre, 'registro_web' AS origen,
               CASE WHEN empresa IS NOT NULL THEN 'profesional' ELSE 'particular' END AS tipo,
               NULL AS pais, created_at AS fecha FROM users
        UNION ALL
        SELECT email, nombre_completo, 'lead_contacto', 'particular', country, created_at FROM contacts
        UNION ALL
        SELECT email, nombre_completo, 'lead_presupuesto', 'particular', country, created_at FROM quote_requests
        UNION ALL
        SELECT email, nombre_completo, 'partner_' || estado, 'profesional', pais, created_at FROM partners
      ) AS contactos_unificados
      ORDER BY fecha DESC
    `);

    const csv = toCsv(result.rows, [
      { key: 'email', label: 'Email' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'origen', label: 'Origen' },
      { key: 'tipo', label: 'Tipo de cliente' },
      { key: 'pais', label: 'País' },
      { key: 'fecha', label: 'Fecha' },
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="crm-contactos-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv);
  } catch (error) {
    console.error('Error en GET /api/admin/crm/contacts/export:', error);
    res.status(500).json({ error: 'Error al exportar contactos de CRM' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Newzelland Cerámicas API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/account/summary',
      'GET /api/account/pedidos',
      'GET /api/account/pedidos/:id',
      'GET /api/account/envios',
      'GET /api/account/envios/:id',
      'GET /api/account/tickets',
      'POST /api/account/tickets',
      'GET /api/account/tickets/:id',
      'POST /api/account/tickets/:id/mensajes',
      'GET /api/account/perfil',
      'PATCH /api/account/perfil',
      'GET /api/catalogs/download',
      'GET /api/catalog',
      'GET /api/collections',
      'GET /api/collections/:slug',
      'GET /api/admin/collections',
      'POST /api/admin/collections',
      'PUT /api/admin/collections/:id',
      'DELETE /api/admin/collections/:id',
      'GET /api/admin/collections/export',
      'GET /api/projects',
      'GET /api/projects/:slug',
      'POST /api/contacts',
      'POST /api/quote-requests',
      'POST /api/partners',
      'GET /api/admin/users',
      'GET /api/admin/users/export',
      'GET /api/admin/catalog-downloads',
      'GET /api/admin/catalog-downloads/export',
      'GET /api/admin/contacts',
      'GET /api/admin/contacts/export',
      'GET /api/admin/quote-requests',
      'GET /api/admin/quote-requests/export',
      'GET /api/admin/partners',
      'GET /api/admin/partners/export',
      'PUT /api/admin/partners/:id',
      'GET /api/admin/projects',
      'POST /api/admin/projects',
      'PUT /api/admin/projects/:id',
      'DELETE /api/admin/projects/:id',
      'GET /api/admin/projects/export',
      'GET /api/admin/crm/stats',
      'GET /api/admin/crm/contacts/export',
      'GET /api/health'
    ]
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Newzelland Cerámicas API' });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// LOCAL DEV SERVER (no-op on Vercel, que importa el módulo sin ejecutarlo directamente)
// ============================================

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API local escuchando en http://localhost:${PORT}`);
  });
}

// ============================================
// EXPORT FOR VERCEL
// ============================================

module.exports = app;
