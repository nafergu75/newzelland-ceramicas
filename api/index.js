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

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();

// ============================================
// DATABASE CONNECTION
// ============================================

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

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

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, apellidos, empresa, email, telefono, password, terminos, privacidad, newsletter } = req.body;

    // Validación
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
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, empresa, accepts_marketing, email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id, email, name`,
      [
        `${nombre} ${apellidos}`,
        email,
        hashedPassword,
        telefono,
        empresa || null,
        newsletter || false
      ]
    );

    const user = result.rows[0];

    console.log(`✅ Usuario registrado: ${email}`);

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

    res.json(result.rows[0]);
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

    res.json({
      totalFacturado: parseFloat(summary.total_facturado),
      totalPedidos: parseInt(summary.total_pedidos),
      pedidosEsteAño: parseInt(summary.pedidos_este_año),
      enviosPendientes: parseInt(summary.envios_pendientes),
      miembroDesde: summary.miembro_desde?.toISOString() || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en account/summary:', error);
    res.status(500).json({ error: 'Error al obtener resumen de cuenta' });
  }
});

app.get('/api/account/pedidos', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page || 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, created_at as fecha, status as estado, total
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      pedidos: result.rows.map(row => ({
        id: row.id,
        fecha: row.fecha?.toISOString(),
        estado: row.estado,
        total: parseFloat(row.total),
        items: 1
      })),
      total: result.rows.length,
      pagina: page,
      por_pagina: limit
    });
  } catch (error) {
    console.error('Error en account/pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.get('/api/account/perfil', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT id, name, email, phone, empresa FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const [nombre, ...apellidos] = user.name.split(' ');

    res.json({
      id: user.id,
      nombre: nombre,
      apellidos: apellidos.join(' '),
      email: user.email,
      telefono: user.phone || '',
      empresa: user.empresa || ''
    });
  } catch (error) {
    console.error('Error en account/perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
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
      'GET /api/account/perfil',
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
// EXPORT FOR VERCEL
// ============================================

module.exports = app;
