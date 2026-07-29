const { Pool } = require('pg');
const config = require('./config');

// Mismo Postgres que api/index.js — este servicio solo añade sus propias
// tablas (whatsapp_*), no toca ni depende de las tablas del backend web.
const pool = new Pool(config.db);

pool.on('error', (err) => {
  console.error('Error de conexión a la base de datos:', err.message);
});

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_conversations (
      id SERIAL PRIMARY KEY,
      wa_id VARCHAR(50) NOT NULL UNIQUE,
      nombre_contacto VARCHAR(255),
      estado VARCHAR(20) NOT NULL DEFAULT 'bot',
      motivo_handoff VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  // estado: 'bot' (responde la IA) | 'esperando_humano' (bot en silencio,
  // pendiente de que un agente humano tome el relevo) | 'cerrada'
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_wa_conversations_estado ON whatsapp_conversations(estado);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
      rol VARCHAR(20) NOT NULL,
      contenido TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  // rol: 'user' | 'assistant' | 'system' (notas internas, ej. "handoff activado")
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_wa_messages_conversation ON whatsapp_messages(conversation_id, created_at);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS catalog_embeddings (
      id SERIAL PRIMARY KEY,
      tipo VARCHAR(20) NOT NULL,
      referencia VARCHAR(255) NOT NULL,
      texto TEXT NOT NULL,
      embedding JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(tipo, referencia)
    );
  `);
  // tipo: 'serie' (catalogo.json) | 'proyecto' (tabla projects).
  // Catálogo pequeño (~90 series): embeddings como JSONB + similitud coseno
  // en memoria es más que suficiente, no hace falta pgvector ni un servicio
  // de vectores aparte.

  console.log('[whatsapp-bot] Tablas verificadas: whatsapp_conversations, whatsapp_messages, catalog_embeddings');
}

module.exports = { pool, ensureTables };
