const dotenv = require('dotenv');
dotenv.config();

// Igual que api/index.js: si falta algo crítico, fallar rápido y claro en
// vez de arrancar a medias y descubrirlo en el primer mensaje de WhatsApp.
const REQUIRED = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'ANTHROPIC_API_KEY'];
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
  process.exit(1);
}

if (!process.env.VOYAGE_API_KEY) {
  console.warn('VOYAGE_API_KEY no configurada — el RAG no podrá generar/consultar embeddings (búsqueda de catálogo degradada).');
}

module.exports = {
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
  },
  voyage: {
    apiKey: process.env.VOYAGE_API_KEY,
    model: process.env.VOYAGE_MODEL || 'voyage-3-lite',
  },
  crm: {
    enabled: process.env.CRM_ENABLED === 'true',
    provider: process.env.CRM_PROVIDER || 'brevo',
  },
  frontendUrl: process.env.FRONTEND_URL || 'https://newzelland-ceramicas.vercel.app',
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL || null,
  whatsappSessionPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth',
};
